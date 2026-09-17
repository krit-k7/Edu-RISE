// Import React and required React hooks.
import React, { useState, useCallback } from 'react';

// Import Midnight compiled contract utilities.
import { CompiledContract } from '@midnight-ntwrk/compact-js';

// Import functions used to create and submit contract transactions.
import { createUnprovenCallTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';

// Import the generated Compact smart contract.
import { Contract } from '../managed/contract/index.js';

// Import wallet connection context.
import { useWallet } from '../contexts/WalletContext';

// Import the privacy flow visualization component.
import PrivacyFlowViz from '../components/PrivacyFlowViz';

// Import icons used throughout the verification interface.
import { CheckCircle, XCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

// Import public contract configuration and eligibility thresholds.
import { PREPROD_CONTRACT_ADDRESS, MIN_GPA_THRESHOLD, MAX_INCOME_THRESHOLD } from '../config';

// Import helper for generating/retrieving the applicant's private secret.
import { getOrCreateApplicantSecret } from '../lib/applicantSecret';

// Define all possible verification states.
type VerifyStatus = 'idle' | 'proving' | 'submitting' | 'eligible' | 'ineligible' | 'already-verified' | 'error';

// Create and configure the compiled version of the scholarship contract.
function getCompiledContract() {
  return CompiledContract.make('ScholarshipContract', Contract).pipe(
    // Use vacant witnesses because they are provided separately when required.
    CompiledContract.withVacantWitnesses,

    // Load the compiled contract assets from the public managed directory.
    CompiledContract.withCompiledFileAssets(new URL('/managed', window.location.origin).toString()),
  ) as any;
}

// Main page component responsible for verifying scholarship eligibility.
export default function VerifyPage() {
  // Get wallet session and connection information.
  const { session, isConnected, walletStatus } = useWallet();

  // Store the GPA entered by the applicant as a string.
  const [gpaRaw, setGpaRaw] = useState('');

  // Store the annual income entered by the applicant as a string.
  const [incomeRaw, setIncomeRaw] = useState('');

  // Track the current verification status.
  const [status, setStatus] = useState<VerifyStatus>('idle');

  // Store the submitted transaction ID.
  const [txId, setTxId] = useState<string | null>(null);

  // Store any verification error message.
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle the complete eligibility verification process.
  const handleVerify = useCallback(async () => {
    // Verification cannot continue without an active wallet session.
    if (!session || !isConnected) return;

    // Convert the GPA input from text into a floating-point number.
    const gpaValue = parseFloat(gpaRaw);

    // Convert the income input from text into an integer.
    const incomeValue = parseInt(incomeRaw, 10);

    // Validate that GPA is within the allowed 0–10 range.
    if (isNaN(gpaValue) || gpaValue < 0 || gpaValue > 10) {
      setErrorMsg('Please enter a valid GPA between 0.0 and 10.0');
      setStatus('error');
      return;
    }

    // Validate that annual income is a non-negative number.
    if (isNaN(incomeValue) || incomeValue < 0) {
      setErrorMsg('Please enter a valid annual income in INR');
      setStatus('error');
      return;
    }

    // Scale GPA by 100 so decimal precision can be represented as an integer.
    const gpaScaled = BigInt(Math.round(gpaValue * 100));

    // Convert income into a BigInt for the contract call.
    const incomeBig = BigInt(incomeValue);

    // Get or create the applicant's private secret.
    const applicantSecret = getOrCreateApplicantSecret();

    // Start the local zero-knowledge proof generation stage.
    setStatus('proving');

    // Clear any previous error and transaction ID.
    setErrorMsg(null);
    setTxId(null);

    try {
      // Prepare the compiled scholarship contract.
      const compiledContract = getCompiledContract();

      // Create an unproven contract transaction for eligibility verification.
      const callTxData = await createUnprovenCallTx(session.providers as any, {
        compiledContract,

        // Use the configured Preprod contract address.
        contractAddress: PREPROD_CONTRACT_ADDRESS,

        // Specify the eligibility verification circuit.
        circuitId: 'verify_eligibility',

        // Pass GPA, income, and applicant secret to the circuit.
        args: [gpaScaled, incomeBig, applicantSecret],
      });

      // Move to the transaction submission stage.
      setStatus('submitting');

      // Submit the generated proof transaction to the Midnight network.
      const id = await submitTxAsync(session.providers as any, {
        unprovenTx: callTxData.private.unprovenTx,
        circuitId: 'verify_eligibility',
      });

      // Store the resulting transaction ID or transaction hash.
      setTxId(typeof id === 'string' ? id : id?.txHash ?? 'confirmed');

      // Determine the local eligibility result using the configured thresholds.
      const passes = gpaScaled >= BigInt(MIN_GPA_THRESHOLD) && incomeBig <= BigInt(MAX_INCOME_THRESHOLD);

      // Update the UI according to the eligibility result.
      setStatus(passes ? 'eligible' : 'ineligible');
    } catch (e: any) {
      // Extract the error message returned by the transaction or contract.
      const msg: string = e?.message ?? String(e);

      // Handle the case where the applicant has already verified.
      if (msg.includes('already verified')) {
        setStatus('already-verified');

      // Handle known eligibility-related contract failures.
      } else if (msg.includes('GPA too low') || msg.includes('Income too high') || msg.toLowerCase().includes('assert')) {
        setStatus('ineligible');

      // Handle all other unexpected errors.
      } else {
        setStatus('error');
        setErrorMsg(msg);
      }
    }
  }, [session, isConnected, gpaRaw, incomeRaw]);

  // Reset the verification form and its status.
  const reset = () => {
    setStatus('idle');
    setErrorMsg(null);
    setTxId(null);
    setGpaRaw('');
    setIncomeRaw('');
  };

  // Determine whether the verification process is currently running.
  const isProcessing = status === 'proving' || status === 'submitting';

  // Display a wallet connection message when no wallet is connected.
  if (!isConnected) {
    return (
      <div className="page-container flex-center">
        <div className="card text-center max-w-md mx-auto border-accent">
          <LockCircleIcon />
          <h2 className="title-md mb-sm">Connect Wallet</h2>
          <p className="text-secondary mb-lg">
            You must connect your 1AM or Lace wallet on the Preprod network to verify your eligibility.
          </p>
        </div>
      </div>
    );
  }

  // Display an error message if the contract address has not been configured.
  if (!PREPROD_CONTRACT_ADDRESS) {
    return (
      <div className="page-container flex-center">
        <div className="card text-center max-w-md mx-auto">
          <AlertCircle size={44} className="text-warning mx-auto mb-md" />
          <h2 className="title-md mb-sm">Contract Not Deployed</h2>
          <p className="text-secondary mb-lg">
            No verified deployment found. Please ask an administrator to run <code>yarn deploy</code> first.
          </p>
        </div>
      </div>
    );
  }

  // Render the main eligibility verification interface.
  return (
    <div className="page-container">
      <div className="max-w-3xl mx-auto">

        {/* Display the page heading and explanation. */}
        <div className="mb-xl">
          <span className="eyebrow mb-sm" style={{ display: 'inline-flex' }}>Eligibility Circuit</span>
          <h1 className="title-lg mb-sm" style={{ marginTop: '0.5rem' }}>Verify Eligibility</h1>
          <p className="text-secondary">Provide your private credentials below to generate a zero-knowledge proof.</p>
        </div>

        {/* Visualize the current privacy and verification flow. */}
        <PrivacyFlowViz status={status} />

        <div className="card">

          {/* Display the publicly defined eligibility requirements. */}
          <div className="rules-grid mb-lg">
            <div className="rule-box">
              <div className="rule-label">Min GPA (Public)</div>
              <div className="rule-value">≥ 8.00</div>
            </div>
            <div className="rule-box">
              <div className="rule-label">Max Income (Public)</div>
              <div className="rule-value">≤ ₹2,50,000</div>
            </div>
          </div>

          {/* Collect the applicant's private GPA and income information. */}
          <div className="form-grid mb-lg">
            <div className="input-group">
              <label htmlFor="input-gpa">
                Your GPA <span className="tag-private" style={{ color: 'var(--verify-500)' }}>· Private</span>
              </label>

              {/* GPA input field. */}
              <input
                id="input-gpa"
                type="number"
                className="input-field"
                placeholder="e.g. 9.1"
                min="0"
                max="10"
                step="0.01"
                value={gpaRaw}
                onChange={(e) => setGpaRaw(e.target.value)}
                disabled={isProcessing || status === 'eligible' || status === 'ineligible' || status === 'already-verified'}
              />

              <div className="text-secondary mt-xs" style={{ fontSize: '0.8rem' }}>
                Enter a value between 0.0 and 10.0
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="input-income">
                Annual Family Income (₹) <span className="tag-private" style={{ color: 'var(--verify-500)' }}>· Private</span>
              </label>

              {/* Annual family income input field. */}
              <input
                id="input-income"
                type="number"
                className="input-field"
                placeholder="e.g. 180000"
                min="0"
                step="1000"
                value={incomeRaw}
                onChange={(e) => setIncomeRaw(e.target.value)}
                disabled={isProcessing || status === 'eligible' || status === 'ineligible' || status === 'already-verified'}
              />

              <div className="text-secondary mt-xs" style={{ fontSize: '0.8rem' }}>
                Enter total income in INR
              </div>
            </div>
          </div>

          {/* Show the appropriate controls based on the current verification state. */}
          {status === 'idle' || status === 'error' ? (
            <div style={{ display: 'flex', gap: '1rem' }}>

              {/* Start the eligibility verification process. */}
              <button
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={handleVerify}
                disabled={!gpaRaw || !incomeRaw || !isConnected}
              >
                Verify Eligibility
              </button>

              {/* Clear the entered information and current error. */}
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={reset}
                disabled={!gpaRaw && !incomeRaw && !errorMsg}
              >
                Clear
              </button>
            </div>

          ) : isProcessing ? (

            // Display progress while the proof is being generated or submitted.
            <button className="btn btn-primary btn-block" disabled>
              <Loader2 className="spinner-icon mr-sm" size={18} />
              {status === 'proving' ? 'Generating ZK Proof Locally…' : 'Submitting Proof to Preprod…'}
            </button>

          ) : (

            // Allow the user to start a new verification after completion.
            <button className="btn btn-secondary btn-block" onClick={reset}>
              Verify Another Application
            </button>
          )}

          {/* Display the successful eligibility result. */}
          {status === 'eligible' && (
            <div className="result-box success mt-lg">
              <CheckCircle size={32} className="mb-sm" />
              <div className="result-title">Eligible for Scholarship!</div>
              <div className="result-desc mb-sm">Your ZK proof was verified on-chain. Your data remained private.</div>

              {/* Provide a link to view the verification transaction. */}
              {txId && (
                <a
                  href={`https://explorer.1am.xyz/tx/${txId}?network=preprod`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary inline-flex items-center gap-xs mt-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                >
                  View on Explorer <ExternalLink size={16} />
                </a>
              )}
            </div>
          )}

          {/* Display the result when the applicant does not meet the requirements. */}
          {status === 'ineligible' && (
            <div className="result-box error mt-lg">
              <XCircle size={32} className="mb-sm" />
              <div className="result-title">Not Eligible</div>
              <div className="result-desc mb-sm">Your credentials do not satisfy the thresholds. Data remained private.</div>

              {/* Provide the transaction explorer link when available. */}
              {txId && (
                <a
                  href={`https://explorer.1am.xyz/tx/${txId}?network=preprod`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary inline-flex items-center gap-xs mt-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                >
                  View on Explorer <ExternalLink size={16} />
                </a>
              )}
            </div>
          )}

          {/* Display a warning when the applicant has already completed verification. */}
          {status === 'already-verified' && (
            <div className="result-box warning mt-lg">
              <AlertCircle size={32} className="mb-sm" />
              <div className="result-title">Already Verified</div>
              <div className="result-desc mb-sm">
                This browser has already submitted a successful verification for this scholarship. Repeated
                verification isn't allowed.
              </div>
            </div>
          )}

          {/* Display unexpected verification errors. */}
          {status === 'error' && errorMsg && (
            <div className="result-box warning mt-lg">
              <AlertCircle size={24} className="mb-sm" />
              <div className="result-title">Verification Error</div>
              <div className="result-desc">{errorMsg}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Small reusable icon component shown when the wallet is not connected.
function LockCircleIcon() {
  return (
    <div
      className="mx-auto mb-md seal-mark"
      style={{ width: 64, height: 64 }}
    >
      <AlertCircle size={26} color="var(--gold-500)" />
    </div>
  );
}
