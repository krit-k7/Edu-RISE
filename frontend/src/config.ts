// We prioritize the localStorage value (for local testing/admin deployments)
// If not found, we fallback to the Vercel injected environment variable.
// If neither exists, we fallback to the hardcoded Preprod address.
export const PREPROD_CONTRACT_ADDRESS = 
  localStorage.getItem('PREPROD_CONTRACT_ADDRESS') || 
  '5a9cd8179b54c81863309dcfacd83f8207f0fc35a1ab79cc4ff524b334c8ae1e';

export const MIN_GPA_THRESHOLD = import.meta.env.VITE_MIN_GPA_THRESHOLD ? parseInt(import.meta.env.VITE_MIN_GPA_THRESHOLD, 10) : 800;
export const MAX_INCOME_THRESHOLD = import.meta.env.VITE_MAX_INCOME_THRESHOLD ? parseInt(import.meta.env.VITE_MAX_INCOME_THRESHOLD, 10) : 250000;
