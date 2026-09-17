import React from 'react';
import { useWallet } from '../contexts/WalletContext';

export default function WalletBanner() {
  const {
    address,
    isConnected,
    walletType,
    availableWallets,
    walletStatus,
    isConnecting,
    connect,
    disconnect,
  } = useWallet();

  if (walletStatus === 'checking') {
    return (
      <div className="wallet-pill loading">
        <span className="spinner-small"></span>
        <span>Detecting wallet...</span>
      </div>
    );
  }

  if (isConnected && address) {
    const label = availableWallets.find((w) => w.rdns === walletType)?.name ?? walletType ?? 'Wallet';
    return (
      <div className="wallet-pill connected">
        <div className="status-dot connected"></div>
        <div className="wallet-pill-info">
          <div className="wallet-pill-type">{label}</div>
          <div className="wallet-pill-address">{address.slice(0, 8)}…{address.slice(-6)}</div>
        </div>
        <button className="btn-icon" onClick={disconnect} title="Disconnect Wallet">
          ✕
        </button>
      </div>
    );
  }

  // Exactly one wallet detected — connect directly.
  if (availableWallets.length === 1) {
    const wallet = availableWallets[0];
    return (
      <button
        className="btn btn-primary btn-sm"
        onClick={() => connect(wallet.rdns, 'preprod')}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <>
            <span className="spinner-small"></span>
            Connecting
          </>
        ) : (
          'Connect Wallet'
        )}
      </button>
    );
  }

  // Multiple wallets detected — let the user pick.
  if (availableWallets.length > 1) {
    return (
      <div className="wallet-pill-group">
        {availableWallets.map((wallet) => (
          <button
            key={wallet.rdns}
            className="btn btn-primary btn-sm"
            onClick={() => connect(wallet.rdns, 'preprod')}
            disabled={isConnecting}
          >
            {isConnecting ? <span className="spinner-small"></span> : `Connect ${wallet.name}`}
          </button>
        ))}
      </div>
    );
  }

  return (
    <button className="btn btn-primary btn-sm" disabled>
      No wallet found — install 1AM or Lace
    </button>
  );
}
