// Import CompiledContract to create the compiled version of the smart contract
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

// Import Node.js path utilities for handling file and directory paths
import path from 'node:path';

// Import utility to convert the current module URL into a file path
import { fileURLToPath } from 'node:url';

// Export the contract definition, ledger, and circuit types
// These are generated and managed by the Compact compiler
export {
  Contract,
  ledger,
  pureCircuits,
  type Ledger,
  type ImpureCircuits,
  type PureCircuits,
} from './managed/scholarship/contract/index.js';

// Import the Contract definition for compilation
import { Contract } from './managed/scholarship/contract/index.js';

// Get the absolute directory path of the current file
const currentDir = path.resolve(fileURLToPath(import.meta.url), '..');

// Define the path where the compiled contract files and ZK assets are stored
export const zkConfigPath = path.resolve(
  currentDir,
  'managed',
  'scholarship',
);

// Create the compiled Scholarship contract configuration
export const CompiledScholarshipContract = CompiledContract.make(
  'ScholarshipContract',
  Contract,
).pipe(
  // Use empty/vacant witness implementations by default
  CompiledContract.withVacantWitnesses,

  // Load the compiled contract and zero-knowledge proof assets
  CompiledContract.withCompiledFileAssets(zkConfigPath),
);
