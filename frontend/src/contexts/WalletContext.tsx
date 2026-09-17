import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
// Registers the `Window.midnight` global type from the official package —
// do not hand-roll `(window as any).midnight`.
import '@midnight-ntwrk/dapp-connector-api';
import type { InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { createConnectedSession, type ConnectedSession } from '../lib/midnight';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type WalletStatus = 'checking' | 'detected' | 'not-found';

type WalletContextType = {
  address: string | null;
  isConnected: boolean;
  walletType: string | null; // rdns of the connected wallet, e.g. "io.lace.midnight"
  availableWallets: InitialAPI[];
  isConnecting: boolean;
  walletStatus: WalletStatus;
  session: ConnectedSession | null;
  connect: (rdns: string, network?: string) => Promise<ConnectedSession | undefined>;
  disconnect: () => void;
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const WalletContext = createContext<WalletContextType | null>(null);

// Known legacy injection keys, kept only as a fallback for wallets that have
// not yet migrated to the v4 rdns-scan discovery model described in the
// DApp Connector API spec (CAIP-372). Prefer the rdns scan below.
const LEGACY_KEYS = ['1am', 'mnLace'] as const;

function discoverWallets(): InitialAPI[] {
  if (typeof window === 'undefined' || !window.midnight) return [];
  // Official v4 discovery: every value registered under `window.midnight`
  // is a typed InitialAPI — no casting, no guessing at object keys.
  const discovered = Object.values(window.midnight) as InitialAPI[];
  if (discovered.length > 0) return discovered;
  // Fallback for older wallet builds that only registered under a
  // hardcoded legacy key instead of the rdns-scan model.
  return LEGACY_KEYS
    .map((key) => (window.midnight as Record<string, InitialAPI> | undefined)?.[key])
    .filter((w): w is InitialAPI => Boolean(w));
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletType, setWalletType] = useState<string | null>(null);
  const [availableWallets, setAvailableWallets] = useState<InitialAPI[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('checking');
  const [session, setSession] = useState<ConnectedSession | null>(null);
  const connectingRef = useRef(false);

  const pollForWallets = useCallback((timeoutMs: number) => {
    const startedAt = Date.now();
    const id = setInterval(() => {
      const found = discoverWallets();
      if (found.length > 0) {
        setAvailableWallets(found);
        setWalletStatus('detected');
        clearInterval(id);
        return;
      }
      if (Date.now() - startedAt >= timeoutMs) {
        setWalletStatus('not-found');
        clearInterval(id);
      }
    }, 300);
    return id;
  }, []);

  // Poll for wallet injection — runs once on mount
  useEffect(() => {
    const id = pollForWallets(6000);
    return () => clearInterval(id);
  }, [pollForWallets]);

  const connect = useCallback(async (rdns: string, network = 'preprod') => {
    if (connectingRef.current) return;
    connectingRef.current = true;
    setIsConnecting(true);
    try {
      const wallet = discoverWallets().find((w) => w.rdns === rdns);
      if (!wallet) throw new Error('Selected wallet is no longer available. Please refresh and try again.');
      const api = await wallet.connect(network);
      const sess = await createConnectedSession(api);
      setSession(sess);
      setAddress(sess.unshieldedAddress);
      setWalletType(rdns);
      setIsConnected(true);
      return sess;
    } finally {
      connectingRef.current = false;
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    setSession(null);
    setWalletType(null);
    setWalletStatus('checking');
    pollForWallets(3000);
  }, [pollForWallets]);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        walletType,
        availableWallets,
        isConnecting,
        walletStatus,
        session,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useWallet(): WalletContextType {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within a WalletProvider');
  return ctx;
}
