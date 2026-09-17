import React, { useEffect, useRef, useState } from 'react';
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

  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close the picker when clicking anywhere outside of it.
  useEffect(() => {
    if (!showPicker) return;
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker]);

  async function handleConnectClick() {
    // Exactly one wallet detected — connect directly, no need to ask.
    if (availableWallets.length === 1) {
      await connect(availableWallets[0].rdns, 'preprod');
      return;
    }
    // Multiple wallets detected — let the user pick from a dropdown.
    setShowPicker((prev) => !prev);
  }

  async function handleSelectWallet(rdns: string) {
    setShowPicker(false);
    await connect(rdns, 'preprod');
  }

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

  // One or more wallets detected — a single button, with a dropdown to
  // choose between wallets when more than one is available.
  if (availableWallets.length >= 1) {
    return (
      <div className="wallet-picker" ref={pickerRef} style={{ position: 'relative' }}>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleConnectClick}
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

        {showPicker && (
          <div
            className="wallet-picker-dropdown"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              minWidth: '180px',
              background: '#1a1a1a',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              overflow: 'hidden',
              zIndex: 50,
            }}
          >
            {availableWallets.map((wallet) => (
              <button
                key={wallet.rdns}
                onClick={() => handleSelectWallet(wallet.rdns)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 16px',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {wallet.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button className="btn btn-primary btn-sm" disabled>
      No wallet found — install 1AM or Lace
    </button>
  );
}
