// Import React and required React hooks.
import React, { useEffect, useRef, useState } from 'react';

// Import wallet connection context.
import { useWallet } from '../contexts/WalletContext';

// Component that displays the current wallet connection state and lets
// the user connect, switch, or disconnect a wallet.
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

  // Whether the wallet-selection dropdown is currently visible.
  const [showPicker, setShowPicker] = useState(false);

  // Ref to the picker container, used to detect outside clicks.
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close the picker when clicking anywhere outside of it.
  useEffect(() => {
    // Skip attaching the listener if the picker isn't open.
    if (!showPicker) return;

    // Close the picker if the click target is outside its DOM node.
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }

    // Listen for clicks anywhere in the document.
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up the listener when the picker closes or the component unmounts.
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker]);

  // Handle a click on the main "Connect Wallet" button.
  async function handleConnectClick() {
    // Exactly one wallet detected — connect directly, no need to ask.
    if (availableWallets.length === 1) {
      await connect(availableWallets[0].rdns, 'preprod');
      return;
    }
    // Multiple wallets detected — let the user pick from a dropdown.
    setShowPicker((prev) => !prev);
  }

  // Handle the user selecting a specific wallet from the dropdown.
  async function handleSelectWallet(rdns: string) {
    setShowPicker(false);
    await connect(rdns, 'preprod');
  }

  // Show a loading pill while wallet detection is in progress.
  if (walletStatus === 'checking') {
    return (
      <div className="wallet-pill loading">
        <span className="spinner-small"></span>
        <span>Detecting wallet...</span>
      </div>
    );
  }

  // Show the connected state with wallet type, shortened address, and disconnect button.
  if (isConnected && address) {
    // Resolve a human-readable wallet name, falling back to the raw type or a default label.
    const label = availableWallets.find((w) => w.rdns === walletType)?.name ?? walletType ?? 'Wallet';
    return (
      <div className="wallet-pill connected">
        <div className="status-dot connected"></div>
        <div className="wallet-pill-info">
          <div className="wallet-pill-type">{label}</div>

          {/* Shortened address: first 8 characters, ellipsis, last 6 characters. */}
          <div className="wallet-pill-address">{address.slice(0, 8)}…{address.slice(-6)}</div>
        </div>

        {/* Disconnect the currently connected wallet. */}
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
        {/* Main connect button; triggers direct connect or opens the picker. */}
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

        {/* Dropdown listing each detected wallet, shown only when picker is open. */}
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
            {/* Render one selectable row per available wallet. */}
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
                // Highlight the row on hover.
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
                // Remove the highlight when the mouse leaves.
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

  // No wallets detected at all — show a disabled button prompting installation.
  return (
    <button className="btn btn-primary btn-sm" disabled>
      No wallet found — install 1AM or Lace
    </button>
  );
}
