// FIX (review item 3): the contract address used to be read from
// `localStorage.getItem('PREPROD_CONTRACT_ADDRESS')` first — meaning
// *anyone* who opened devtools (or whose browser still had a stale value
// from an old admin session) could point the whole app at an arbitrary
// contract address. There is no "local testing override" use case that
// justifies that in production.
//
// The address now comes only from `deployment.preprod.json` — the
// verified deployment artifact written by `scripts/deploy.ts` (see review
// item 4) and committed to the repo — or from `VITE_CONTRACT_ADDRESS` when
// a deployment platform (e.g. Vercel) needs to override it per-environment
// without a new commit. Neither source is writable by someone just using
// the app in their browser.
import deployment from '../../deployment.preprod.json';

const DEPLOYMENT_CONTRACT_ADDRESS: string | undefined = deployment?.contractAddress;

export const PREPROD_CONTRACT_ADDRESS: string =
  import.meta.env.VITE_CONTRACT_ADDRESS ?? DEPLOYMENT_CONTRACT_ADDRESS ?? '';

export const PREPROD_DEPLOYMENT_TX_ID: string | undefined = deployment?.deploymentTransactionId;
export const PREPROD_NETWORK: string | undefined = deployment?.network;

export const MIN_GPA_THRESHOLD = import.meta.env.VITE_MIN_GPA_THRESHOLD
  ? parseInt(import.meta.env.VITE_MIN_GPA_THRESHOLD, 10)
  : 800;
export const MAX_INCOME_THRESHOLD = import.meta.env.VITE_MAX_INCOME_THRESHOLD
  ? parseInt(import.meta.env.VITE_MAX_INCOME_THRESHOLD, 10)
  : 250000;
