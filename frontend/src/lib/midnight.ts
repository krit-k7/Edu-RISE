import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { ContractState } from '@midnight-ntwrk/compact-runtime';
import type { MidnightProvider, WalletProvider } from '@midnight-ntwrk/midnight-js-types';

// ---------------------------------------------------------------------------
// Hex helpers — never skip padStart
// ---------------------------------------------------------------------------
export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function fromHex(hex: string): Uint8Array {
  const normalized = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (normalized.length % 2 !== 0) throw new Error('Invalid hex string from wallet.');
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < normalized.length; i += 2) {
    bytes[i / 2] = parseInt(normalized.slice(i, i + 2), 16);
  }
  return bytes;
}

// ---------------------------------------------------------------------------
// Patched Public Data Provider
// Fixes the `offset: null` GraphQL bug on preprod/preview indexers.
// ---------------------------------------------------------------------------
export function createPatchedPublicDataProvider(queryUrl: string, subscriptionUrl: string) {
  const base = indexerPublicDataProvider(queryUrl, subscriptionUrl);

  async function queryLatest(query: string, address: string) {
    const res = await fetch(queryUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, variables: { address } }),
    });
    if (!res.ok) throw new Error(`Indexer HTTP error: ${res.status}`);
    const payload = await res.json();
    if (payload.errors?.length) throw new Error(payload.errors.map((e: any) => e.message).join('; '));
    return payload.data?.contractAction ?? null;
  }

  return {
    ...base,
    async queryContractState(contractAddress: string, config?: any) {
      if (config) return base.queryContractState(contractAddress, config);
      const action = await queryLatest(
        `query LATEST_CONTRACT_STATE($address: HexEncoded!) {
          contractAction(address: $address) { state }
        }`,
        contractAddress,
      );
      return action ? ContractState.deserialize(fromHex(action.state)) : null;
    },
  };
}

// ---------------------------------------------------------------------------
// Persistent Private State Provider
//
// FIX (review item 11): the old implementation kept private state and
// signing keys in a plain in-memory Map, so a page refresh silently wiped
// a user's local witness/key material. This is the same
// `@midnight-ntwrk/midnight-js-level-private-state-provider` package the
// Node.js scripts/tests already use for the server-side wallet — in the
// browser it transparently persists to IndexedDB instead of the
// filesystem, so state survives reloads.
// ---------------------------------------------------------------------------
export function createPrivateStateProvider(accountId: string) {
  return levelPrivateStateProvider({
    privateStateStoreName: 'edurise-private-state',
    // FIX (review item 11, partial): derive the storage password from the
    // connected wallet's own coin public key instead of a hardcoded global
    // constant, so the on-disk store is at least wallet-specific rather
    // than shared by every user of the app. `accountId` is public key
    // material, not a strong secret, so this is a floor, not a ceiling —
    // real hardening needs a password derived from something the wallet
    // signs (a real per-user secret), which requires confirming the exact
    // message-signing method on the connected wallet API before wiring it
    // in here.
    privateStoragePasswordProvider: () => `EduRISE-v1-${accountId}`,
    accountId,
  });
}

// ---------------------------------------------------------------------------
// Connected Session Type
// ---------------------------------------------------------------------------
export type ConnectedSession = {
  api: any;
  config: any;
  providers: {
    privateStateProvider: ReturnType<typeof createPrivateStateProvider>;
    publicDataProvider: ReturnType<typeof createPatchedPublicDataProvider>;
    zkConfigProvider: FetchZkConfigProvider;
    proofProvider: { proveTx: (unprovenTx: any, _config: any) => Promise<any> };
    walletProvider: WalletProvider;
    midnightProvider: MidnightProvider;
  };
  unshieldedAddress: string;
};

// ---------------------------------------------------------------------------
// Main session factory — call after wallet.connect()
// ---------------------------------------------------------------------------
export async function createConnectedSession(api: any): Promise<ConnectedSession> {
  // Fetch in parallel — never await sequentially
  const [config, unshieldedAddr, shieldedAddress] = await Promise.all([
    api.getConfiguration(),
    api.getUnshieldedAddress(),
    api.getShieldedAddresses(),
  ]);

  // Must be called before any SDK operations
  setNetworkId(config.networkId);

  // ZK assets are served from /managed relative to origin
  const zkConfigProvider = new FetchZkConfigProvider(
    new URL('/managed', window.location.origin).toString(),
    window.fetch.bind(window),
  );

  const provingProvider = await api.getProvingProvider(zkConfigProvider);

  // Use direct unprovenTx.prove() — do NOT use createProofProvider()
  const proofProvider = {
    async proveTx(unprovenTx: any, _config: any) {
      const { CostModel } = await import('@midnight-ntwrk/ledger-v8');
      return unprovenTx.prove(provingProvider, CostModel.initialCostModel());
    },
  };

  const walletProvider: WalletProvider = {
    getCoinPublicKey: () => shieldedAddress.shieldedCoinPublicKey,
    getEncryptionPublicKey: () => shieldedAddress.shieldedEncryptionPublicKey,
    balanceTx: async (tx: any) => {
      const txHex = toHex(tx.serialize());
      const balanced = await api.balanceUnsealedTransaction(txHex);
      if (!balanced?.tx) throw new Error('balanceUnsealedTransaction returned invalid result');
      const { Transaction } = await import('@midnight-ntwrk/ledger-v8');
      return Transaction.deserialize('signature', 'proof', 'binding', fromHex(balanced.tx));
    },
  };

  const midnightProvider: MidnightProvider = {
    // FIX (review item 2): `api.submitTransaction` on the official connector
    // returns `Promise<void>` — it is a relay call, not an id lookup. The old
    // code invented a fake id from the tx hex bytes whenever the (nonstandard)
    // wallet response didn't include one. The real, spec-correct transaction
    // identifier comes from the *transaction object itself*
    // (`Transaction.identifiers()`, per @midnight-ntwrk/ledger-v8), computed
    // before submission — that's what should be used to watch for the tx.
    submitTx: async (tx: any) => {
      const ids: string[] = tx.identifiers();
      if (!ids?.length) throw new Error('Transaction has no identifiers to track.');
      const txHex = toHex(tx.serialize());
      await api.submitTransaction(txHex);
      return ids[0];
    },
  };

  const publicDataProvider = createPatchedPublicDataProvider(config.indexerUri, config.indexerWsUri);

  return {
    api,
    config,
    providers: {
      privateStateProvider: createPrivateStateProvider(shieldedAddress.shieldedCoinPublicKey),
      publicDataProvider,
      zkConfigProvider,
      proofProvider,
      walletProvider,
      midnightProvider,
    },
    unshieldedAddress: unshieldedAddr.unshieldedAddress,
  };
}

// ---------------------------------------------------------------------------
// Polling helpers
// ---------------------------------------------------------------------------
export async function waitForContractDeployment(
  publicDataProvider: ReturnType<typeof createPatchedPublicDataProvider>,
  contractAddress: string,
  pollIntervalMs = 2000,
  maxAttempts = 45,
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const state = await publicDataProvider.queryContractState(contractAddress);
    if (state?.data) return;
    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }
  throw new Error(`Contract not indexed after ${maxAttempts * pollIntervalMs}ms — check address or indexer lag`);
}
