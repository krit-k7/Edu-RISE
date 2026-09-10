// Import the Midnight network ID configuration.
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

// Import the environment configuration type.
import type { EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';

// Import the project network configuration.
import { getConfig } from '../src/config.js';

// Import the Midnight wallet provider, wallet secret type, and sync function.
import { MidnightWalletProvider, type WalletSecret, syncWallet } from '../src/wallet.js';

// Import the Pino logger.
import pino from 'pino';

// Create a logger for displaying wallet and synchronization information.
const logger = pino({ level: 'info', transport: { target: 'pino-pretty' } });

// Get the selected Midnight network from the environment.
// Defaults to the local network.
const network = process.env['MIDNIGHT_NETWORK'] ?? 'local';

// Resolve the wallet mnemonic for the selected network.
function resolveSecret(net: string): WalletSecret {
  // Read the network-specific mnemonic from the environment.
  const mnemonic = process.env[`MIDNIGHT_${net.toUpperCase()}_MNEMONIC`]?.trim().replace(/\s+/g, ' ');

  // Return the mnemonic as the wallet secret if it exists.
  if (mnemonic) return { kind: 'mnemonic', value: mnemonic };

  // Throw an error if no mnemonic is configured.
  throw new Error('No mnemonic');
}

// Main function used to initialize and synchronize the wallet.
async function main() {
  // Load the network configuration.
  const config = getConfig();

  // Set the Midnight network ID.
  setNetworkId(config.networkId);

  // Resolve the wallet secret for the selected network.
  const secret = resolveSecret(network);

  // Build the environment configuration for the wallet.
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

  // Create the Midnight wallet provider.
  const provider = await MidnightWalletProvider.build(logger, envConfig, secret);

  // Start the wallet.
  await provider.wallet.start();
  
  // Synchronize the wallet with the Midnight network.
  const state = await syncWallet(logger, provider.wallet);

  // Display the wallet's unshielded address.
  console.log('UNSHIELDED_ADDRESS=' + state.unshielded.localState.address);

  // Display the wallet's unshielded balances.
  console.log('UNSHIELDED_BALANCES=' + JSON.stringify(state.unshielded.balances));

  // Display the wallet's dust balances.
  console.log('DUST_BALANCES=' + JSON.stringify(state.dust.state.balances));

  // Exit the process successfully.
  process.exit(0);
}

// Run the main function and print any errors that occur.
main().catch(console.error);
