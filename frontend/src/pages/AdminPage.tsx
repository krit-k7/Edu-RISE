import React, { useState, useCallback } from 'react';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { createUnprovenDeployTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { sampleSigningKey } from '@midnight-ntwrk/compact-runtime';
import { Contract } from '../managed/contract/index.js';
import { useWallet } from '../contexts/WalletContext';
import { Settings, Loader2, CheckCircle, AlertCircle, Copy, ExternalLink, ShieldAlert } from 'lucide-react';
import { MIN_GPA_THRESHOLD, MAX_INCOME_THRESHOLD } from '../config';
import { motion } from 'framer-motion';

function getCompiledContract() {
  return CompiledContract.make('ScholarshipContract', Contract).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(new URL('/managed', window.location.origin).toString()),
  ) as any;
}

export default function AdminPage() {
  const { session, isConnected } = useWallet();
  const [status, setStatus] = useState<'idle' | 'deploying' | 'deployed' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isLocal = session?.config?.indexerUri?.includes('localhost') || session?.config?.indexerUri?.includes('127.0.0.1');

  const handleDeploy = useCallback(async () => {
    if (!session || !isConnected) return;
    setStatus('deploying');
    setErrorMsg(null);

    try {
      const compiledContract = getCompiledContract();
      const initialPrivateState = {};

      const deployTxData = await createUnprovenDeployTx(session.providers as any, {
        compiledContract,
        args: [BigInt(MIN_GPA_THRESHOLD), BigInt(MAX_INCOME_THRESHOLD)],
        privateStateId: 'DeployerState',
        initialPrivateState,
        signingKey: sampleSigningKey(),
      });

      const contractAddress = deployTxData.public.contractAddress;
      
      await submitTxAsync(session.providers as any, {
        unprovenTx: deployTxData.private.unprovenTx,
      });

      setDeployedAddress(contractAddress);
      localStorage.setItem('PREPROD_CONTRACT_ADDRESS', contractAddress);
      setStatus('deployed');
      
    } catch (e: any) {
      setStatus('error');
      setErrorMsg(e?.message ?? String(e));
    }
  }, [session, isConnected]);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass-card max-w-md w-full p-10 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Settings size={40} className="text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Admin Portal</h2>
          <p className="text-slate-500 leading-relaxed">Please connect your wallet to access the deployer interface.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto py-8"
    >
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-3 tracking-tight">Admin Settings</h1>
        <p className="text-slate-500 text-lg">Deploy the ScholarShield contract to the Midnight network.</p>
      </div>

      <div className="glass-card p-6 md:p-10 border-t-4 border-t-emerald-500">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
            <Settings size={24} />
          </div>
          Deploy Contract
        </h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Deploy the scholarship contract to the Preprod network. The contract will be initialized with the criteria defined in the application config.
        </p>

        {isLocal && (
          <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-800 flex gap-4 items-start shadow-sm">
            <ShieldAlert size={24} className="text-orange-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold mb-1">Warning: Local Network Detected</div>
              <div className="text-sm opacity-90">
                Your wallet appears to be connected to a local network. Deployments on local nodes will not be accessible to Preprod users.
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Initial GPA Threshold</div>
            <div className="text-3xl font-extrabold text-slate-800">8.00</div>
          </div>
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Initial Income Threshold</div>
            <div className="text-3xl font-extrabold text-slate-800">₹2,50,000</div>
          </div>
        </div>

        <div aria-live="polite" aria-atomic="true">
          {status === 'idle' || status === 'error' ? (
            <button className="glass-button w-full text-lg py-4" onClick={handleDeploy}>
              Deploy Contract to Preprod
            </button>
          ) : status === 'deploying' ? (
            <button className="glass-button w-full text-lg py-4 opacity-70 cursor-not-allowed" disabled>
              <Loader2 className="animate-spin shrink-0" size={24} />
              Deploying... Check wallet extension
            </button>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle size={28} className="text-emerald-500" />
                <div className="text-lg font-bold text-emerald-800">Successfully Deployed to Preprod!</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-emerald-100 flex items-center justify-between gap-4 shadow-inner">
                <span className="font-mono text-sm text-slate-600 truncate">{deployedAddress}</span>
                <button 
                  onClick={() => {
                    if (deployedAddress) {
                      navigator.clipboard.writeText(deployedAddress);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }
                  }}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  <Copy size={16} />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="mt-4">
                <a
                  href={`https://preprod.midnightexplorer.com/contracts/${deployedAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  View on Midnight Explorer <ExternalLink size={16} />
                </a>
              </div>
            </motion.div>
          )}

          {status === 'error' && errorMsg && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 p-5 bg-red-50 border border-red-200 rounded-xl text-red-800 flex gap-4 items-start"
            >
              <AlertCircle size={24} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold mb-1">Deployment Failed</div>
                <div className="text-sm opacity-90 break-words font-mono bg-red-100/50 p-2 rounded mt-2">{errorMsg}</div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
