import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Code2, Globe, Mail, Check, Copy } from 'lucide-react';

// Single source of truth for the deployed contract (also picks up the
// localStorage override that the Admin Portal sets after a fresh deploy).
import { PREPROD_CONTRACT_ADDRESS } from '../config';

export default function Footer() {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending "Copied" reset when the footer unmounts.
  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(PREPROD_CONTRACT_ADDRESS);
      setCopied(true);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable (insecure context / denied permission).
      // Fail silently rather than claiming "Copied" when nothing was copied.
    }
  };

  return (
    <footer className="footer">
      <div className="footer-grid">

        {/* Brand Column */}
        <div>
          <Link to="/" className="navbar-logo" style={{ fontSize: '1.15rem' }}>
            <span className="seal-mark" style={{ width: 28, height: 28 }}>
              <Check size={13} strokeWidth={3} color="var(--gold-500)" />
            </span>
            <span>EDURISE</span>
          </Link>
          <p className="footer-brand-desc">
            Privacy-preserving eligibility verification built on the Midnight Network using zero-knowledge proofs.
          </p>
          <div className="footer-socials">
            <a href="https://github.com/krit-k7/Edu-RISE" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Source code"><Code2 size={19} /></a>
            <a href="https://midnight.network/" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Midnight Network"><Globe size={19} /></a>
            <a href="mailto:hello@edurise.app" className="footer-social-link" aria-label="Email"><Mail size={19} /></a>
          </div>
        </div>

        {/* Links Column */}
        <div>
          <h4 className="footer-heading">Application</h4>
          <div className="footer-links">
            <Link to="/" className="footer-link">Home</Link>
            <Link to="/verify" className="footer-link">Verify Eligibility</Link>
            <Link to="/about" className="footer-link">How it Works</Link>
            <Link to="/admin" className="footer-link">Admin Portal</Link>
          </div>
        </div>

        {/* Resources Column */}
        <div>
          <h4 className="footer-heading">Resources</h4>
          <div className="footer-links">
            <a href="https://midnight.network/" target="_blank" rel="noopener noreferrer" className="footer-link">Midnight Network</a>
            <a href="https://docs.midnight.network/" target="_blank" rel="noopener noreferrer" className="footer-link">Documentation</a>
            <a href="https://github.com/midnight-ntwrk" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
          </div>
        </div>

        {/* Status Column */}
        <div>
          <h4 className="footer-heading">Network Status</h4>
          <div className="footer-status-row">
            <span className="status-dot connected"></span>
            <span className="text-secondary text-sm">Preprod Live</span>
          </div>
          <span className="footer-version-tag">v1.0.0</span>

          {/* Deployed contract address — click the box or "Copy" to copy it */}
          <div className="footer-contract">
            <div className="footer-contract-head">
              <span className="footer-contract-label">Contract Address</span>
              <button
                type="button"
                className={`footer-copy-btn ${copied ? 'copied' : ''}`}
                onClick={copyAddress}
                title="Copy contract address"
              >
                {copied ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
                <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <button
              type="button"
              className={`footer-contract-address ${copied ? 'copied' : ''}`}
              onClick={copyAddress}
              title={PREPROD_CONTRACT_ADDRESS}
              aria-label={`Contract address ${PREPROD_CONTRACT_ADDRESS}. Click to copy.`}
            >
              {PREPROD_CONTRACT_ADDRESS}
            </button>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} EDURISE. Built for the New Moon to Full Hackathon.</p>
      </div>
    </footer>
  );
}
