import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, KeyRound, Settings2, Info, Check } from 'lucide-react';
import WalletBanner from './WalletBanner';

export default function NavBar() {
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={16} /> },
    { name: 'Verify', path: '/verify', icon: <KeyRound size={16} /> },
    { name: 'Admin', path: '/admin', icon: <Settings2 size={16} /> },
    { name: 'About', path: '/about', icon: <Info size={16} /> },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="seal-mark">
            <Check size={15} strokeWidth={3} color="var(--gold-500)" />
          </span>
          <span>EDURISE</span>
        </Link>

        <div className="navbar-links">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-item ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.icon}
              <span className="nav-item-text">{link.name}</span>
            </Link>
          ))}
        </div>

        <div className="navbar-wallet">
          <WalletBanner />
        </div>
      </div>
    </nav>
  );
}
