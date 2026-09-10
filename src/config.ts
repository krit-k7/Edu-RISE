// Defines the configuration structure for a Midnight network.
export type NetworkConfig = {
  // Network identifier used by Midnight.
  networkId: string;

  // HTTP endpoint for the indexer.
  indexer: string;

  // WebSocket endpoint for the indexer.
  indexerWS: string;

  // HTTP endpoint for the Midnight node.
  node: string;

  // WebSocket endpoint for the Midnight node.
  nodeWS: string;

  // Endpoint of the proof server.
  proofServer: string;

  // Faucet endpoint used to obtain test funds.
  faucet: string;
};

// Configuration for the local Midnight development network.
export const LOCAL_CONFIG: NetworkConfig = {
  networkId: 'undeployed',
  indexer: 'http://127.0.0.1:8088/api/v4/graphql',
  indexerWS: 'ws://127.0.0.1:8088/api/v4/graphql/ws',
  node: 'http://127.0.0.1:9944',
  nodeWS: 'ws://127.0.0.1:9944',
  proofServer: 'http://127.0.0.1:6300',
  faucet: '',
};

// Configuration for the Midnight Preview network.
export const PREVIEW_CONFIG: NetworkConfig = {
  networkId: 'preview',
  indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
  indexerWS: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
  node: 'https://rpc.preview.midnight.network',
  nodeWS: 'wss://rpc.preview.midnight.network',
  proofServer: process.env['MIDNIGHT_PROOF_SERVER'] ?? 'http://127.0.0.1:6300',
  faucet: 'https://faucet.preview.midnight.network/api/drips',
};

// Configuration for the Midnight Preprod network.
export const PREPROD_CONFIG: NetworkConfig = {
  networkId: 'preprod',
  indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
  indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  node: 'https://rpc.preprod.midnight.network',
  nodeWS: 'wss://rpc.preprod.midnight.network',
  proofServer: process.env['MIDNIGHT_PROOF_SERVER'] ?? 'http://127.0.0.1:6300',
  faucet: 'https://faucet.preprod.midnight.network/api/drips',
};

// Returns the configuration for the network selected through the environment.
export function getConfig(): NetworkConfig {
  // Read the selected network, defaulting to local.
  const network = process.env['MIDNIGHT_NETWORK'] ?? 'local';

  // Return the local network configuration.
  if (network === 'local') return LOCAL_CONFIG;

  // Return the Preview network configuration.
  if (network === 'preview') return PREVIEW_CONFIG;

  // Return the Preprod network configuration.
  if (network === 'preprod') return PREPROD_CONFIG;

  // Throw an error if an unsupported network is specified.
  throw new Error(
    `Unknown network: ${network}. Supported: 'local', 'preview', 'preprod'.`,
  );
}
