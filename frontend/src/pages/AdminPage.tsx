import React, { useCallback, useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Settings, ShieldCheck, ShieldAlert, ExternalLink } from 'lucide-react';
import {
  MIN_GPA_THRESHOLD,
  MAX_INCOME_THRESHOLD,
  PREPROD_CONTRACT_ADDRESS,
  PREPROD_DEPLOYMENT_TX_ID,
  PREPROD_NETWORK,
} from '../config';

// FIX (review items 5 & 6):
//
// The old page let *any* wallet that connected deploy a brand-new contract
// straight from the browser, signed with `sampleSigningKey()` from
// `@midnight-ntwrk/compact-runtime` — that key is a fixed, publicly-known
// demo key shipped with the SDK for local testing. Using it in production
// meant the "admin" deploy button had no real access control at all, and
// a successful click would silently repoint the whole app (via
// localStorage) at a brand-new, unaudited contract.
//
// Deployment is a privileged, rare operation and now happens exclusively
// through `scripts/deploy.ts`, which builds a real wallet from a funded
// mnemonic/seed held only in CI/deployment secrets (see
// MIDNIGHT_PREPROD_MNEMONIC / MIDNIGHT_PREPROD_SEED) — never in the
// browser bundle. Its output is the verified `deployment.preprod.json`
// artifact that `frontend/src/config.ts` reads at build time.
//
// This page becomes a read-only status view. The only thing gated behind
// "authorization" here is *seeing* the admin diagnostics — real
// authorization is: only people with access to the deploy secret can
// actually deploy.
const ADMIN_ADDRESSES = (import.meta.env.VITE_ADMIN_ADDRESSES ?? '')
  .split(',')
  .map((a: string) => a.trim())
  .filter(Boolean);

export default function AdminPage() {
  const { session, isConnected, address } = useWallet();
  const [signature, setSignature] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const isAllowlisted = !!address && ADMIN_ADDRESSES.includes(address);

  const handleProveAdmin = useCallback(async () => {
    if (!session || !address) return;
    setVerifying(true);
    setAuthError(null);
    try {
      // Require the connected wallet to actually sign a challenge —
      // merely being connected proves nothing about who holds the keys.
      const challenge = `EduRISE admin session — ${new Date().toISOString().slice(0, 10)}`;
      const sig = await session.api.signData(challenge, { format: 'utf8' } as any);
      setSignature(typeof sig === 'string' ? sig : JSON.stringify(sig));
    } catch (e: any) {
      setAuthError(e?.message ?? 'Signature request was rejected.');
    } finally {
      setVerifying(false);
    }
  }, [session, address]);

  if (!isConnected) {
    return (
      <div className="page-container flex-center">
        <div className="card text-center max-w-md mx-auto">
          <Settings size={48} className="text-secondary mx-auto mb-md" />
          <h2 className="title-md">Admin Portal</h2>
          <p className="text-secondary">Connect an allowlisted admin wallet to view deployment diagnostics.</p>
        </div>
      </div>
    );
  }

  if (!isAllowlisted) {
    return (
      <div className="page-container flex-center">
        <div className="card text-center max-w-md mx-auto">
          <ShieldAlert size={48} className="text-warning mx-auto mb-md" />
          <h2 className="title-md">Not an admin address</h2>
          <p className="text-secondary">
            The connected address isn't on the admin allowlist (<code>VITE_ADMIN_ADDRESSES</code>).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="max-w-2xl mx-auto">
        <div className="mb-xl">
          <h1 className="title-lg mb-sm">Admin — Deployment Status</h1>
          <p className="text-secondary">
            Deployments run through the authenticated CLI pipeline (<code>yarn deploy</code>), not the browser.
            This page only reports the currently verified deployment.
          </p>
        </div>

        <div className="card border-accent mb-lg">
          <h2 className="title-md mb-sm flex items-center">
            <Settings size={20} className="mr-sm" /> Verified Deployment
          </h2>

          <div className="rules-grid mb-lg">
            <div className="rule-box">
              <div className="rule-label">GPA Threshold</div>
              <div className="rule-value">{(MIN_GPA_THRESHOLD / 100).toFixed(2)}</div>
            </div>
            <div className="rule-box">
              <div className="rule-label">Income Threshold</div>
              <div className="rule-value">₹{MAX_INCOME_THRESHOLD.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="result-box mt-md">
            <div className="result-title">Network</div>
            <div className="result-desc font-mono">{PREPROD_NETWORK ?? 'unknown'}</div>
          </div>
          <div className="result-box mt-md">
            <div className="result-title">Contract Address</div>
            <div className="result-desc font-mono break-words">{PREPROD_CONTRACT_ADDRESS || 'not set'}</div>
          </div>
          <div className="result-box mt-md">
            <div className="result-title">Deployment Transaction</div>
            <div className="result-desc font-mono break-words">{PREPROD_DEPLOYMENT_TX_ID ?? 'not recorded'}</div>
            {PREPROD_DEPLOYMENT_TX_ID && (
              <a
                href={`https://explorer.1am.xyz/tx/${PREPROD_DEPLOYMENT_TX_ID}?network=preprod`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary inline-flex items-center gap-xs mt-sm"
              >
                View on Explorer <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="title-md mb-sm flex items-center">
            <ShieldCheck size={20} className="mr-sm" /> Prove Admin Control
          </h2>
          <p className="text-secondary mb-md">
            Optional: sign a challenge with the connected wallet to record that an allowlisted admin reviewed this
            deployment.
          </p>
          <button className="btn btn-primary" onClick={handleProveAdmin} disabled={verifying}>
            {verifying ? 'Waiting for wallet signature…' : 'Sign Admin Challenge'}
          </button>
          {signature && <div className="result-box success mt-md font-mono break-words">{signature}</div>}
          {authError && <div className="result-box error mt-md">{authError}</div>}
        </div>
      </div>
    </div>
  );
}
