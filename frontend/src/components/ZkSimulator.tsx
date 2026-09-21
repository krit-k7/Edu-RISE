import React, { useState } from 'react';
import { ShieldCheck, Lock, Sparkles, ArrowRight } from 'lucide-react';

// Real contract thresholds (GPA is stored x100, e.g. 800 = 8.00).
// Reading them from config keeps this demo in sync with the actual criteria.
import { MIN_GPA_THRESHOLD, MAX_INCOME_THRESHOLD } from '../config';

export function ZkSimulator() {
  // --- Slider ranges -------------------------------------------------------
  const GPA_MIN = 4.0;
  const GPA_MAX = 10.0;
  const GPA_STEP = 0.05;
  const INCOME_MIN = 50000;
  const INCOME_MAX = 500000;
  const INCOME_STEP = 5000;

  // --- Private inputs (never leave the component / device) -----------------
  const [gpa, setGpa] = useState<number>(9.1);
  const [income, setIncome] = useState<number>(180000);

  // --- Public criteria (same values the smart contract enforces) -----------
  const minGpa = MIN_GPA_THRESHOLD / 100;
  const maxIncome = MAX_INCOME_THRESHOLD;
  const isEligible = gpa >= minGpa && income <= maxIncome;

  // Pseudo-hash generation to visualize zero-knowledge commitment.
  // Math.round mirrors how VerifyPage scales GPA before sending it to the circuit.
  const pseudoCommitment = `0x${((Math.round(gpa * 100) * 8191) ^ (income * 131))
    .toString(16)
    .padStart(8, '0')}${Math.abs((income * 97) ^ 0xabcdef)
    .toString(16)
    .slice(0, 8)}...`;

  // Filled-track percentage for each slider (drives the gold progress fill).
  const gpaPct = ((gpa - GPA_MIN) / (GPA_MAX - GPA_MIN)) * 100;
  const incomePct = ((income - INCOME_MIN) / (INCOME_MAX - INCOME_MIN)) * 100;

  return (
    <div className="zk-card">
      {/* Background glow */}
      <div className="zk-glow" aria-hidden="true" />

      {/* Header */}
      <div className="zk-header">
        <div>
          <span className="zk-pill">
            <Sparkles size={12} />
            Interactive ZK Playground
          </span>
          <h3 className="zk-title">How Zero-Knowledge Works</h3>
        </div>
        <div className="zk-live">
          <span className="zk-live-dot" aria-hidden="true" />
          Client WASM Active
        </div>
      </div>

      <div className="zk-grid">
        {/* Step 1: Private Inputs */}
        <div className="zk-panel">
          <div className="zk-panel-head">
            <span className="zk-panel-label zk-gold">
              <Lock size={13} /> Private Inputs
            </span>
            <span className="zk-tag zk-tag-gold">Stay on device</span>
          </div>

          <div className="zk-field">
            <div className="zk-field-row">
              <label htmlFor="zk-gpa" className="zk-field-label">Your GPA:</label>
              <span className="zk-field-value">{gpa.toFixed(2)} / 10</span>
            </div>
            <input
              id="zk-gpa"
              type="range"
              className="zk-range"
              min={GPA_MIN}
              max={GPA_MAX}
              step={GPA_STEP}
              value={gpa}
              style={{ ['--zk-pct' as string]: `${gpaPct}%` }}
              onChange={(e) => setGpa(parseFloat(e.target.value))}
            />
          </div>

          <div className="zk-field">
            <div className="zk-field-row">
              <label htmlFor="zk-income" className="zk-field-label">Family Income:</label>
              <span className="zk-field-value">₹{income.toLocaleString('en-IN')}</span>
            </div>
            <input
              id="zk-income"
              type="range"
              className="zk-range"
              min={INCOME_MIN}
              max={INCOME_MAX}
              step={INCOME_STEP}
              value={income}
              style={{ ['--zk-pct' as string]: `${incomePct}%` }}
              onChange={(e) => setIncome(parseInt(e.target.value, 10))}
            />
          </div>
        </div>

        {/* Arrow / Connector */}
        <div className="zk-connector" aria-hidden="true">
          <div className="zk-connector-desktop">
            <span className="zk-connector-label">WASM Prover</span>
            <div className="zk-connector-orb">
              <ArrowRight size={18} />
            </div>
          </div>
          <div className="zk-connector-mobile">
            <span>Circuit computes locally</span>
            <ArrowRight size={14} style={{ transform: 'rotate(90deg)' }} />
          </div>
        </div>

        {/* Step 2: Zero-Knowledge Public Output */}
        <div className="zk-panel zk-panel-public">
          <div className="zk-panel-head">
            <span className="zk-panel-label zk-verify">
              <ShieldCheck size={14} /> On-Chain Broadcast
            </span>
            <span className="zk-tag zk-tag-mono">Public Proof</span>
          </div>

          <div className="zk-commit">
            <div className="zk-commit-label">Pedersen Commitment:</div>
            <div className="zk-commit-value">{pseudoCommitment}</div>
          </div>

          <div className="zk-result-row">
            <span className="zk-result-label">Criteria Result:</span>
            <span className={`zk-badge ${isEligible ? 'zk-badge-ok' : 'zk-badge-no'}`}>
              {isEligible ? (
                <>
                  <ShieldCheck size={14} />
                  <span>ELIGIBLE (VERIFIED)</span>
                </>
              ) : (
                <span>NOT QUALIFIED</span>
              )}
            </span>
          </div>

          <p className="zk-note">
            *The blockchain verifies the criteria without seeing the GPA or Income.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ZkSimulator;
