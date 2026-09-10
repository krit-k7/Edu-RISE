import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { WebSocket } from 'ws';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import {
  deployContract,
  submitCallTx,
  type DeployedContract,
} from '@midnight-ntwrk/midnight-js-contracts';
import type { ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import {
  type EnvironmentConfiguration,
  waitForFunds,
} from '@midnight-ntwrk/testkit-js';
import pino from 'pino';

import { getConfig } from '../config.js';
import {
  MidnightWalletProvider,
  syncWallet,
  type WalletSecret,
} from '../wallet.js';
import { buildProviders, type ScholarshipProviders } from '../providers.js';
import {
  CompiledScholarshipContract,
  Contract,
  ledger,
  zkConfigPath,
} from '../../contracts/index.js';
// Required for GraphQL subscriptions in Node.js.
// Assign WebSocket to the global object for Apollo.
 // @ts-expect-error WebSocket global assignment for apollo
globalThis.WebSocket = WebSocket;

// Handle promises that are rejected without a catch block.
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
  console.error('Promise:', promise);
});

// Handle unexpected uncaught exceptions.
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

// Local test wallet seed used when running on the local network.
const ALICE_LOCAL_SEED =
  '0000000000000000000000000000000000000000000000000000000000000001';

// ID used to identify Alice's private scholarship state.
const PRIVATE_STATE_ID = 'AlicePrivateScholarshipState';

// Configure the application logger.
const logger = pino({
  level: process.env['LOG_LEVEL'] ?? 'info',
  transport: { target: 'pino-pretty' },
});

// Select the Midnight network from the environment.
// Defaults to the local network.
const network = process.env['MIDNIGHT_NETWORK'] ?? 'local';

// Resolve the wallet secret based on the selected network.
function resolveSecret(net: string): WalletSecret {
  // Use the predefined local seed for local development.
  if (net === 'local') return { kind: 'seed', value: ALICE_LOCAL_SEED };

  // Convert the network name to uppercase for environment variable names.
  const upper = net.toUpperCase();

  // Environment variable names for mnemonic and seed.
  const mnemonicEnv = `MIDNIGHT_${upper}_MNEMONIC`;
  const seedEnv = `MIDNIGHT_${upper}_SEED`;

  // Read and normalize the mnemonic from the environment.
  const mnemonic = process.env[mnemonicEnv]?.trim().replace(/\s+/g, ' ');

  // Read the seed from the environment.
  const seedHex = process.env[seedEnv]?.trim();

  // Prevent both mnemonic and seed from being configured at the same time.
  if (mnemonic && seedHex) {
    throw new Error(
      `Set only one of ${mnemonicEnv} or ${seedEnv} (both are defined).`,
    );
  }

  // Return the mnemonic if it is provided.
  if (mnemonic) {
    return { kind: 'mnemonic', value: mnemonic };
  }

  // Return the seed if it is provided.
  if (seedHex) {
    // Validate that the seed contains only hexadecimal characters
    // and has an even number of characters.
    if (!/^[0-9a-fA-F]+$/.test(seedHex) || seedHex.length % 2 !== 0) {
      throw new Error(
        `${seedEnv} must be a hex string of even length (no 0x prefix).`,
      );
    }

    return { kind: 'seed', value: seedHex };
  }

  // Throw an error when no wallet credentials are configured.
  throw new Error(
    `Either ${mnemonicEnv} or ${seedEnv} is required for network '${net}'. ` +
      `Set one in .env.${net} or the shell.`,
  );
}

// Test suite for the Scholarship Contract.
describe(`Scholarship Contract (${network})`, () => {
  // Midnight wallet used for contract operations.
  let wallet: MidnightWalletProvider;

  // Providers used to communicate with the Midnight network.
  let providers: ScholarshipProviders;

  // Address of the deployed scholarship contract.
  let contractAddress: ContractAddress;

  // Load the network configuration.
  const config = getConfig();

  // Resolve the wallet secret for the selected network.
  const secret = resolveSecret(network);

  // Determine whether the contract is running on a remote network.
  const isRemote = config.faucet !== '';

  // Configure the wallet synchronization timeout.
  const syncTimeoutMs = Number(
    process.env['MIDNIGHT_SYNC_TIMEOUT_MS'] ??
      (isRemote ? 60 * 60_000 : 10 * 60_000),
  );

  // Helper function to query the current contract ledger state.
  async function queryLedger(p: ScholarshipProviders) {
    // Query the deployed contract state from the public data provider.
    const state = await p.publicDataProvider.queryContractState(contractAddress);

    // Ensure that the contract state exists.
    expect(state).not.toBeNull();

    // Convert the state into the readable ledger structure.
    return ledger(state!.data);
  }

  // Runs once before all tests.
  beforeAll(async () => {
    // Configure the Midnight network ID.
    setNetworkId(config.networkId);

    // Create the environment configuration required by the wallet.
    const envConfig: EnvironmentConfiguration = {
      walletNetworkId: config.networkId,
      networkId: config.networkId,
      indexer: config.indexer,
      indexerWS: config.indexerWS,
      node: config.node,
      nodeWS: config.nodeWS,
      faucet: config.faucet,
      proofServer: config.proofServer,
    };

    // Build the Midnight wallet provider.
    wallet = await MidnightWalletProvider.build(logger, envConfig, secret);

    // Start the wallet.
    await wallet.start();

    // Synchronize the wallet with the network.
    await syncWallet(logger, wallet.wallet, syncTimeoutMs);

    // Request funds when running on a remote network.
    if (isRemote) {
      const nightBalance = await waitForFunds(
        wallet.wallet,
        envConfig,
        true,
        wallet.unshieldedKeystore,
      );

      // Log the available NIGHT balance.
      logger.info(`Wallet NIGHT balance on '${network}': ${nightBalance}`);
    }

    // Build the providers required for contract interaction.
    providers = buildProviders(wallet, zkConfigPath, config);

    logger.info(`Providers initialized on '${network}'. Ready to test!`);
  });

  // Runs once after all tests have completed.
  afterAll(async () => {
    // Stop the wallet if it was initialized.
    if (wallet) {
      logger.info('Stopping wallet...');
      await wallet.stop();
    }
  });

  // Test contract deployment and initial scholarship rules.
  it('Deploys the contract with scholarship rules', async () => {
    logger.info(`Deploying Scholarship Contract...`);

    // Minimum GPA: 8.0, represented as 800.
    // Maximum allowed income: 250,000 INR.
    const minGpa = 800n;
    const maxIncome = 250000n;

    // Deploy the compiled scholarship contract.
    const deployed: DeployedContract<Contract> =
      await (deployContract<Contract>)(providers, {
        compiledContract: CompiledScholarshipContract,
        privateStateId: PRIVATE_STATE_ID,
        initialPrivateState: {},
        args: [minGpa, maxIncome],
      });

    // Save the address of the deployed contract.
    contractAddress = deployed.deployTxData.public.contractAddress;

    logger.info(`Contract deployed at: ${contractAddress}`);

    // Verify that a contract address was returned.
    expect(contractAddress).toBeDefined();

    // Read the contract ledger after deployment.
    const state = await queryLedger(providers);

    // Verify that the configured scholarship rules were stored correctly.
    expect(state.min_gpa).toEqual(minGpa);
    expect(state.max_income).toEqual(maxIncome);
  });

  // Test eligibility verification for a qualifying student.
  it('Verifies eligibility successfully for a qualifying student', async () => {
    // Student GPA: 9.1 (910).
    // Student income: 180,000 INR.
    // Both values satisfy the scholarship requirements.
    logger.info(`Running verify_eligibility for qualifying student...`);

    // Submit the eligibility verification transaction.
    await (submitCallTx<Contract, 'verify_eligibility'>)(providers, {
      compiledContract: CompiledScholarshipContract,
      contractAddress,
      privateStateId: PRIVATE_STATE_ID,
      circuitId: 'verify_eligibility',
      args: [910n, 180000n],
    });

    // Log successful verification.
    logger.info(`Verification transaction completed successfully.`);
  });

  // Test that a student with a GPA below the minimum is rejected.
  it('Fails verification for a student with GPA too low', async () => {
    // Student GPA: 7.5 (750), which is below the required 8.0 (800).
    // Income is within the allowed limit.
    logger.info(`Running verify_eligibility for low GPA student (should fail)...`);

    // The transaction is expected to fail because the GPA is too low.
    await expect(
      (submitCallTx<Contract, 'verify_eligibility'>)(providers, {
        compiledContract: CompiledScholarshipContract,
        contractAddress,
        privateStateId: PRIVATE_STATE_ID,
        circuitId: 'verify_eligibility',
        args: [750n, 180000n],
      })
    ).rejects.toThrow();

    // Confirm that the low GPA student was rejected.
    logger.info(`Rejected low GPA student as expected.`);
  });

  // Test that a student with income above the maximum is rejected.
  it('Fails verification for a student with income too high', async () => {
    // Student GPA: 9.1 (910), which satisfies the GPA requirement.
    // Income: 300,000 INR, which exceeds the 250,000 INR limit.
    logger.info(`Running verify_eligibility for high income student (should fail)...`);

    // The transaction is expected to fail because the income is too high.
    await expect(
      (submitCallTx<Contract, 'verify_eligibility'>)(providers, {
        compiledContract: CompiledScholarshipContract,
        contractAddress,
        privateStateId: PRIVATE_STATE_ID,
        circuitId: 'verify_eligibility',
        args: [910n, 300000n],
      })
    ).rejects.toThrow();

    // Confirm that the high-income student was rejected.
    logger.info(`Rejected high income student as expected.`);
  });
});
