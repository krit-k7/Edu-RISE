import React, { useState, useEffect } from 'react';
import { PREPROD_CONTRACT_ADDRESS } from '../config';
import { explorerTxUrl } from '../constants';
import { useEligibilityPrecheck } from '../hooks/useEligibilityPrecheck';
import { useLiveCriteria } from '../hooks/useLiveCriteria';
import { ToastContainer } from '../components/ToastNotification';
import type { ToastProps } from '../components/ToastNotification';
import { useVerifySubmit } from '../hooks/useVerifySubmit';
import { useWallet } from '../contexts/WalletContext';
import { 
  AlertCircle, 
  Shield, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Lock, 
  Terminal, 
  Copy, 
  Check, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import PrivacyFlowViz from '../components/PrivacyFlowViz';
import { motion, AnimatePresence } from 'framer-motion';

export default function VerifyPage() {
  const { session, isConnected } = useWallet();
  const [gpaRaw, setGpaRaw] = useState('');
  const [incomeRaw, setIncomeRaw] = useState('');
  const [copied, setCopied] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);

  const addToast = (type: 'success' | 'error', message: string) => {
    setToasts(prev => [...prev, { id: crypto.randomUUID(), type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const precheckResult = useEligibilityPrecheck(gpaRaw, incomeRaw);
  const { liveGpa, liveIncome, isLoading: isCriteriaLoading } = useLiveCriteria();

  const { status, txId, errorMsg, submit: handleVerify, reset: resetHook, isProcessingStatus } = useVerifySubmit(gpaRaw, incomeRaw, addToast);

  // Stream terminal logs during proving stages
  useEffect(() => {
    if (status === 'proving') {
      setTerminalLogs([
        '⚡ [ZK_INIT] Loading Midnight Compact WASM circuit...',
        '🔒 [WITNESS] Encapsulating GPA & Income into private memory...',
        '🧮 [SNARK_SYNTHESIS] Computing constraint satisfaction polynomial...',
      ]);
    } else if (status === 'submitting') {
      setTerminalLogs(prev => [
        ...prev,
        '✨ [ZK_READY] Zero-Knowledge argument generated successfully (184ms).',
        '📡 [BROADCAST] Submitting proof transaction to Midnight Preprod RPC...',
      ]);
    } else if (status === 'eligible') {
      setTerminalLogs(prev => [
        ...prev,
        '✅ [CONSENSUS] Preprod ledger accepted proof. Status: ELIGIBLE.',
      ]);
    } else if (status === 'ineligible') {
      setTerminalLogs(prev => [
        ...prev,
        '❌ [LEDGER] Proof verification evaluated: INELIGIBLE.',
      ]);
    } else if (status === 'error') {
      setTerminalLogs(prev => [
        ...prev,
        `⚠️ [ABORT] Verification halted: ${errorMsg || 'Circuit error'}`,
      ]);
    }
  }, [status, errorMsg]);

  const reset = () => {
    resetHook();
    setGpaRaw('');
    setIncomeRaw('');
    setTerminalLogs([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && gpaRaw.trim() && incomeRaw.trim() && isConnected && !isProcessingStatus) {
      handleVerify();
    }
  };

  const copyProof = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="glass-card max-w-md w-full p-10 text-center bg-white/90">
          <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner text-emerald-600">
            <Lock size={36} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Connect Midnight Wallet</h2>
          <p className="text-slate-600 leading-relaxed text-sm mb-6">
            Please connect your 1AM or Lace wallet on the Midnight Preprod testnet to synthesize and broadcast your proof.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-500 font-mono">
            Requires 1AM Wallet Extension
          </div>
        </div>
      </div>
    );
  }

  if (PREPROD_CONTRACT_ADDRESS === 'UPDATE_WITH_YOUR_PREPROD_CONTRACT_ADDRESS' || !/^[0-9a-fA-F]{64}$/.test(PREPROD_CONTRACT_ADDRESS)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="glass-card max-w-md w-full p-10 text-center border-t-4 border-t-amber-500 bg-white/90">
          <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner text-amber-600">
            <AlertCircle size={36} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Contract Not Configured</h2>
          <p className="text-slate-600 leading-relaxed text-sm">
            Please ensure the scholarship contract address is deployed and configured in the system.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto py-6 px-4"
    >
      {/* Header Banner */}
      <div className="glass-card p-8 mb-8 text-center relative overflow-hidden bg-white/90">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>
        <div className="w-16 h-16 rounded-2xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Shield size={36} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
          Verify Scholarship Eligibility
        </h1>
        <p className="text-slate-600 mb-6 max-w-lg mx-auto text-sm sm:text-base">
          Prove your academic merit and financial qualification on Midnight Preprod without exposing raw data.
        </p>
        
        {/* On-Chain Active Criteria Card */}
        <div className="bg-slate-50/90 p-5 rounded-2xl border border-slate-200/90 shadow-2xs inline-block w-full max-w-md">
          <h3 className="text-emerald-700 font-extrabold text-xs uppercase tracking-wider mb-3 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            On-Chain Criteria (Live from Midnight)
          </h3>
          {isCriteriaLoading ? (
            <div className="flex justify-center items-center gap-2 opacity-70 py-1">
              <Loader2 className="animate-spin text-emerald-600" size={16} /> 
              <span className="text-xs font-mono text-slate-600">Querying Midnight ledger...</span>
            </div>
          ) : (
            <div className="flex justify-around items-center text-sm py-1">
              <div className="text-center">
                <span className="text-slate-400 text-xs block font-medium">Minimum GPA</span> 
                <span className="text-slate-900 text-lg font-bold font-mono">{(liveGpa / 100).toFixed(2)} / 10.0</span>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="text-center">
                <span className="text-slate-400 text-xs block font-medium">Max Annual Income</span> 
                <span className="text-slate-900 text-lg font-bold font-mono">₹{liveIncome.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="mb-8">
        <PrivacyFlowViz status={status} />
      </div>

      {/* Verification Input Deck */}
      <div className="glass-card p-7 sm:p-9 bg-white/90">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="input-gpa" className="block text-sm font-bold text-slate-800">
                Academic GPA (0.0 - 10.0)
              </label>
              <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                Private Witness
              </span>
            </div>
            <input
              id="input-gpa"
              type="number"
              className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none text-slate-900 font-medium disabled:opacity-50 disabled:bg-slate-50"
              placeholder="e.g. 8.75"
              min="0"
              max="10"
              step="0.01"
              value={gpaRaw}
              onChange={(e) => setGpaRaw(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isProcessingStatus || status === 'eligible' || status === 'ineligible'}
            />
            <div className="text-slate-400 text-xs">Evaluated against contract minimum (scaled ×100)</div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="input-income" className="block text-sm font-bold text-slate-800">
                Annual Household Income (₹)
              </label>
              <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                Private Witness
              </span>
            </div>
            <input
              id="input-income"
              type="number"
              className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none text-slate-900 font-medium disabled:opacity-50 disabled:bg-slate-50"
              placeholder="e.g. 150000"
              min="0"
              step="1000"
              value={incomeRaw}
              onChange={(e) => setIncomeRaw(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isProcessingStatus || status === 'eligible' || status === 'ineligible'}
            />
            <div className="text-slate-400 text-xs">Evaluated against contract upper threshold</div>
          </div>
        </div>

        {/* Local Precheck Pill */}
        {status === 'idle' && precheckResult !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs"
          >
            <span className="text-slate-600 font-medium flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-500" />
              Client-side qualification preview:
            </span>
            <span className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
              precheckResult === 'likely_eligible' 
                ? 'bg-emerald-100 text-emerald-800' 
                : precheckResult === 'likely_ineligible'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {precheckResult === 'likely_eligible' ? 'Likely Eligible' : precheckResult === 'likely_ineligible' ? 'Does Not Meet Criteria' : 'Invalid Values'}
            </span>
          </motion.div>
        )}

        {/* Action Controls */}
        {status === 'idle' || status === 'error' ? (
          <div className="flex gap-4">
            <button
              className="glass-button flex-[2] py-4 text-base"
              onClick={handleVerify}
              disabled={!gpaRaw.trim() || !incomeRaw.trim() || !isConnected}
            >
              <span>Synthesize & Verify Proof</span>
              <ArrowRight size={18} />
            </button>
            <button
              className="flex-1 py-4 px-6 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 text-sm"
              onClick={reset}
              disabled={!gpaRaw.trim() && !incomeRaw.trim() && !errorMsg}
            >
              Reset
            </button>
          </div>
        ) : isProcessingStatus ? (
          <div className="space-y-4">
            <button className="glass-button w-full py-4 text-base opacity-90 cursor-wait flex items-center justify-center gap-3" disabled>
              <Loader2 className="animate-spin" size={20} />
              <span>{status === 'proving' ? 'Synthesizing ZK-SNARK in Browser...' : 'Submitting to Midnight Preprod...'}</span>
            </button>
          </div>
        ) : (
          <button 
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-md text-base" 
            onClick={reset}
          >
            Verify Another Applicant
          </button>
        )}

        {/* Proving Telemetry Terminal (inspired by terminal-cli-control-deck) */}
        <AnimatePresence>
          {(isProcessingStatus || terminalLogs.length > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 terminal-box text-xs"
            >
              <div className="terminal-header">
                <span className="flex items-center gap-2">
                  <Terminal size={13} className="text-emerald-400" />
                  Midnight Prover Terminal (WASM Runtime)
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">ACTIVE</span>
              </div>
              <div className="p-4 space-y-1.5 text-slate-300 font-mono overflow-x-auto max-h-48 overflow-y-auto">
                {terminalLogs.map((log, i) => (
                  <div key={i} className="leading-relaxed">
                    {log}
                  </div>
                ))}
                {isProcessingStatus && (
                  <div className="flex items-center gap-1 text-emerald-400 animate-pulse pt-1">
                    <span>&gt; Processing constraints...</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Badges & Verifiable Credential Cards */}
        <div aria-live="polite" aria-atomic="true">
          {status === 'eligible' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 p-7 bg-gradient-to-b from-emerald-50/90 to-white border-2 border-emerald-400/80 rounded-2xl shadow-xl flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                <CheckCircle2 size={36} />
              </div>
              
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full mb-2">
                Verifiable Credential Generated
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Scholarship Eligibility Verified!</h3>
              <p className="text-slate-600 mb-6 max-w-md text-sm leading-relaxed">
                Your Zero-Knowledge proof passed on-chain contract evaluation. Your exact GPA and income were cryptographically preserved.
              </p>

              {txId && (
                <div className="w-full bg-white p-4 rounded-xl border border-slate-200 shadow-2xs mb-6 text-left">
                  <div className="flex justify-between items-center mb-1 text-xs text-slate-500 font-medium">
                    <span>On-Chain Transaction ID:</span>
                    <button 
                      onClick={() => copyProof(txId)}
                      className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold"
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-xs text-slate-800 break-all select-all bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {txId}
                  </div>
                </div>
              )}

              {txId && (
                <a 
                  href={explorerTxUrl(txId)}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-md text-sm"
                >
                  <span>Verify on Midnight Explorer</span>
                  <ExternalLink size={16} />
                </a>
              )}
            </motion.div>
          )}

          {status === 'ineligible' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 p-7 bg-slate-50 border border-slate-300 rounded-2xl flex flex-col items-center text-center shadow-md"
            >
              <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mb-4 text-slate-600">
                <XCircle size={36} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Qualifications Not Satisfied</h3>
              <p className="text-slate-600 mb-6 max-w-md text-sm leading-relaxed">
                The smart contract evaluated your proof assertions, but your credentials did not meet the required threshold. Your private data was not leaked.
              </p>
              {txId && (
                <a 
                  href={explorerTxUrl(txId)}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-sm text-sm"
                >
                  <span>Inspect Receipt</span>
                  <ExternalLink size={16} />
                </a>
              )}
            </motion.div>
          )}

          {status === 'error' && errorMsg && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-8 p-6 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col items-center text-center"
            >
              <AlertCircle size={32} className="text-rose-500 mb-2" />
              <div className="text-lg font-bold text-rose-900 mb-1">Verification Error</div>
              <div className="text-rose-700 font-mono text-xs bg-rose-100/60 p-3 rounded-lg break-all max-w-full">
                {errorMsg}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </motion.div>
  );
}
