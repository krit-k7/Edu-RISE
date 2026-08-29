import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, LockKeyhole, Zap, ChevronRight, Check } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-grid">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="eyebrow">Powered by Midnight Network</span>
            <h1 className="hero-title">
              Prove you qualify.<br /><em>Reveal nothing.</em>
            </h1>
            <p className="hero-subtitle">
              EDURISE lets students verify scholarship eligibility with a zero-knowledge
              proof — GPA and family income never leave the browser, and never touch a
              database.
            </p>
            <div className="hero-actions">
              <Link to="/verify" className="btn btn-primary btn-lg">
                Start Verification <ChevronRight size={20} />
              </Link>
              <Link to="/about" className="btn btn-secondary btn-lg">
                How it works
              </Link>
            </div>
          </motion.div>

          {/* Signature element: redacted transcript + wax seal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, rotate: 3 }}
            animate={{ opacity: 1, scale: 1, rotate: 1.2 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div className="transcript-card">
              <div className="transcript-header">
                <div>
                  <div className="transcript-eyebrow">Applicant Record</div>
                  <div className="transcript-title">Eligibility Transcript</div>
                </div>
                <div className="transcript-serial">
                  NO. ZK-2026-8841<br />MIDNIGHT PREPROD
                </div>
              </div>

              <div className="transcript-row">
                <span className="transcript-label">GPA</span>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="redaction-bar" />
                  <span className="tag-private">Private</span>
                </span>
              </div>
              <div className="transcript-row">
                <span className="transcript-label">Family Income</span>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="redaction-bar" />
                  <span className="tag-private">Private</span>
                </span>
              </div>
              <div className="transcript-row">
                <span className="transcript-label">Wallet Address</span>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="redaction-bar" style={{ width: 64 }} />
                  <span className="tag-private">Public</span>
                </span>
              </div>

              <div className="proof-line">
                <Check size={15} strokeWidth={3} /> ZK PROOF — VALID ON-CHAIN
              </div>

              <motion.div
                className="seal-stamp"
                initial={{ scale: 0, rotate: 20 }}
                animate={{ scale: 1, rotate: -14 }}
                transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.7 }}
              >
                <div className="seal-stamp-inner">
                  <ShieldCheck size={26} strokeWidth={2} />
                  <span className="seal-stamp-text">VERIFIED</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="stats-strip">
        <div className="stats-strip-inner">
          <div className="stat-cell">
            <div className="stat-value">5,000+</div>
            <div className="stat-label">Proofs Verified</div>
          </div>
          <div className="stat-cell">
            <div className="stat-value">₹12L+</div>
            <div className="stat-label">Scholarships Awarded</div>
          </div>
          <div className="stat-cell">
            <div className="stat-value">100%</div>
            <div className="stat-label">Data Privacy</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-grid">
          <motion.div
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="feature-icon"><LockKeyhole size={28} /></div>
            <h3>Absolute Privacy</h3>
            <p>Your data stays on your device. Only a cryptographic proof is sent to the network.</p>
          </motion.div>
          <motion.div
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="feature-icon"><ShieldCheck size={28} /></div>
            <h3>On-Chain Verification</h3>
            <p>The Midnight blockchain verifies the ZK proof transparently and immutably.</p>
          </motion.div>
          <motion.div
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="feature-icon"><Zap size={28} /></div>
            <h3>Instant Decisions</h3>
            <p>Get an immediate, verifiable decision on your scholarship application.</p>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section — a real 3-step sequence, so numbering earns its place */}
      <section className="how-it-works">
        <h2 className="title-md text-center mb-xl">How EDURISE Works</h2>
        <div>
          <div className="step-row">
            <div className="step-number">1</div>
            <div>
              <h3>Enter credentials locally</h3>
              <p className="text-secondary">Input your sensitive data (GPA and income) into the app. It never leaves your browser.</p>
            </div>
          </div>

          <div className="step-row">
            <div className="step-number">2</div>
            <div>
              <h3>ZK proof generation</h3>
              <p className="text-secondary">A WASM circuit compiles your inputs into a zero-knowledge proof, asserting you meet the criteria without exposing the actual numbers.</p>
            </div>
          </div>

          <div className="step-row">
            <div className="step-number">3</div>
            <div>
              <h3>Blockchain verification</h3>
              <p className="text-secondary">The proof is submitted to the Midnight Preprod network. If valid, the contract marks your address as eligible.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <h2 className="title-md mb-md">Ready to prove your eligibility?</h2>
        <p className="text-secondary mb-lg">No paperwork. No disclosure. Just a proof.</p>
        <Link to="/verify" className="btn btn-primary btn-lg">
          Launch App
        </Link>
      </section>
    </div>
  );
}
