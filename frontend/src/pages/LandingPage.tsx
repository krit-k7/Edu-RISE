import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, LockKeyhole, Zap, ChevronRight, CheckCircle2, User, Cpu, Database } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="badge-pill">Powered by Midnight Network</div>
          <h1 className="hero-title">
            Verify Eligibility with <span className="text-accent">Zero-Knowledge</span>
          </h1>
          <p className="hero-subtitle">
            Prove your scholarship qualifications without revealing your actual GPA or Family Income. True privacy, fully on-chain.
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
      </section>

      {/* Ecosystem Stats (Mock) */}
      <section className="stats-section my-xl">
        <div className="card max-w-3xl mx-auto flex flex-col md:flex-row justify-around text-center py-lg border-accent" style={{ display: 'flex', justifyContent: 'space-around', backgroundColor: 'rgba(0, 255, 102, 0.03)' }}>
          <div>
            <div className="text-3xl font-bold text-accent mb-sm">5,000+</div>
            <div className="text-secondary text-sm uppercase tracking-widest">Proofs Verified</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent mb-sm">$1.2M</div>
            <div className="text-secondary text-sm uppercase tracking-widest">Scholarships Awarded</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent mb-sm">100%</div>
            <div className="text-secondary text-sm uppercase tracking-widest">Data Privacy</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section mb-xl">
        <div className="features-grid">
          <motion.div 
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="feature-icon"><LockKeyhole size={32} /></div>
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
            <div className="feature-icon"><ShieldCheck size={32} /></div>
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
            <div className="feature-icon"><Zap size={32} /></div>
            <h3>Instant Decisions</h3>
            <p>Get an immediate, verifiable decision on your scholarship application.</p>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works my-xl max-w-3xl mx-auto">
        <h2 className="title-md text-center mb-xl">How ScholarShield Works</h2>
        <div className="space-y-md" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="card flex items-start gap-md" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            <div className="bg-accent text-black rounded-full p-sm" style={{ backgroundColor: 'var(--accent-color)', color: '#000', padding: '0.75rem', borderRadius: '50%' }}>
              <User size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-xs">1. Enter Credentials Locally</h3>
              <p className="text-secondary">Input your sensitive data (GPA and Income) into the app. It never leaves your browser.</p>
            </div>
          </div>

          <div className="card flex items-start gap-md" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            <div className="bg-accent text-black rounded-full p-sm" style={{ backgroundColor: 'var(--accent-color)', color: '#000', padding: '0.75rem', borderRadius: '50%' }}>
              <Cpu size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-xs">2. ZK Proof Generation</h3>
              <p className="text-secondary">A WASM circuit compiles your inputs into a zero-knowledge proof, asserting you meet the criteria without exposing the actual numbers.</p>
            </div>
          </div>

          <div className="card flex items-start gap-md" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            <div className="bg-accent text-black rounded-full p-sm" style={{ backgroundColor: 'var(--accent-color)', color: '#000', padding: '0.75rem', borderRadius: '50%' }}>
              <Database size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-xs">3. Blockchain Verification</h3>
              <p className="text-secondary">The proof is submitted to the Midnight Preprod Network. If valid, the contract marks your address as 'eligible'.</p>
            </div>
          </div>

        </div>
      </section>
      
      {/* Final CTA */}
      <section className="text-center my-xl py-xl border-t" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '4rem', paddingBottom: '2rem' }}>
        <h2 className="title-md mb-md">Ready to prove your eligibility?</h2>
        <Link to="/verify" className="btn btn-primary btn-lg">
          Launch App
        </Link>
      </section>
    </div>
  );
}
