import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Code, Globe, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t mt-xl py-xl" style={{ borderTop: '1px solid var(--border-color)', marginTop: '4rem', padding: '3rem 0', backgroundColor: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto px-md grid grid-cols-1 md:grid-cols-4 gap-xl" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', padding: '0 2rem' }}>
        
        {/* Brand Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link to="/" className="flex items-center gap-xs" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#fff' }}>
            <Shield className="text-accent" size={24} style={{ color: 'var(--accent-color)' }} />
            <span className="font-bold text-lg" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>ScholarShield</span>
          </Link>
          <p className="text-secondary text-sm" style={{ fontSize: '0.9rem', color: '#888' }}>
            Privacy-preserving eligibility verification built on the Midnight Network using Zero-Knowledge proofs.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <a href="#" className="text-secondary hover-text-accent" style={{ color: '#888', transition: 'color 0.2s' }}><Code size={20} /></a>
            <a href="#" className="text-secondary hover-text-accent" style={{ color: '#888', transition: 'color 0.2s' }}><Globe size={20} /></a>
            <a href="#" className="text-secondary hover-text-accent" style={{ color: '#888', transition: 'color 0.2s' }}><Mail size={20} /></a>
          </div>
        </div>

        {/* Links Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ color: '#fff', fontWeight: 'bold', marginBottom: '0.5rem' }}>Application</h4>
          <Link to="/" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>Home</Link>
          <Link to="/verify" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>Verify Eligibility</Link>
          <Link to="/about" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>How it Works</Link>
          <Link to="/admin" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>Admin Portal</Link>
        </div>

        {/* Resources Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ color: '#fff', fontWeight: 'bold', marginBottom: '0.5rem' }}>Resources</h4>
          <a href="https://midnight.network/" target="_blank" rel="noopener noreferrer" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>Midnight Network</a>
          <a href="https://docs.midnight.network/" target="_blank" rel="noopener noreferrer" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>Documentation</a>
          <a href="https://github.com/midnight-ntwrk" target="_blank" rel="noopener noreferrer" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>GitHub</a>
        </div>

        {/* Status Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ color: '#fff', fontWeight: 'bold', marginBottom: '0.5rem' }}>Network Status</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', boxShadow: '0 0 8px var(--accent-color)' }}></span>
            <span style={{ color: '#888', fontSize: '0.9rem' }}>Preprod Live</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span style={{ padding: '0.25rem 0.5rem', backgroundColor: 'rgba(0,255,102,0.1)', color: 'var(--accent-color)', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid rgba(0,255,102,0.2)' }}>
              v1.0.0
            </span>
          </div>
        </div>

      </div>

      <div style={{ borderTop: '1px solid #1a1a1a', marginTop: '3rem', paddingTop: '1.5rem', textAlign: 'center' }}>
        <p style={{ color: '#666', fontSize: '0.85rem' }}>
          &copy; {new Date().getFullYear()} ScholarShield. Built for the New Moon to Full Hackathon.
        </p>
      </div>
    </footer>
  );
}
