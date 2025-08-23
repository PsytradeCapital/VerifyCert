import React from 'react';
// Network configuration for VerifyCert
export interface NetworkConfig {
chainId: number;
  name: string;
  displayName: string;
  rpcUrl: string;
  blockExplorer: string;
  faucetUrl?: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
};
  contractAddress: string;

// Amoy Testnet Configuration
export const AMOY_NETWORK: NetworkConfig = {
  chainId: 80002,
  name: 'amoy',
  displayName: 'Polygon Amoy Testnet',
  rpcUrl: 'https://rpc-amoy.polygon.technology/',
  blockExplorer: 'https://amoy.polygonscan.com',
  faucetUrl: 'https://faucet.polygon.technology/',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18
  },
  contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS || '0x6c9D554C721dA0CEA1b975982eAEe1f924271F50'
};

// Mumbai Testnet Configuration (for backward compatibility)
export const MUMBAI_NETWORK: NetworkConfig = {
  chainId: 80001,
  name: 'mumbai',
  displayName: 'Polygon Mumbai Testnet',
  rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
  blockExplorer: 'https://mumbai.polygonscan.com',
  faucetUrl: 'https://faucet.polygon.technology/',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18
  },
  contractAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4' // Old Mumbai contract
};

// Default network (Amoy)
export const DEFAULT_NETWORK = AMOY_NETWORK;

// All supported networks
export const SUPPORTED_NETWORKS: Record<number, NetworkConfig> = {
  [AMOY_NETWORK.chainId]: AMOY_NETWORK,
  [MUMBAI_NETWORK.chainId]: MUMBAI_NETWORK
};

// Network switching utilities
export const switchToAmoyNetwork = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');

  try {
    // Try to switch to Amoy network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: 0x${AMOY_NETWORK.chainId.toString(16)} }],
    });
  } catch (switchError: any) {
    // If network doesn't exist, add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: 0x${AMOY_NETWORK.chainId.toString(16)},
            chainName: AMOY_NETWORK.displayName,
            nativeCurrency: AMOY_NETWORK.nativeCurrency,
            rpcUrls: [AMOY_NETWORK.rpcUrl],
            blockExplorerUrls: [AMOY_NETWORK.blockExplorer],
          },
        ],
      });
    } else {
      throw switchError;
};

// Get network configuration by chain ID
export const getNetworkConfig = (chainId: number): NetworkConfig | null => {
  return SUPPORTED_NETWORKS[chainId] || null;
};

// Check if network is supported
export const isSupportedNetwork = (chainId: number): boolean => {
  return chainId in SUPPORTED_NETWORKS;
};

// Get current network from provider
export const getCurrentNetwork = async (): Promise<NetworkConfig | null> => {
  if (!window.ethereum) {
    return null;

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const numericChainId = parseInt(chainId, 16);
    return getNetworkConfig(numericChainId);
  } catch (error) {
    console.error('Failed to get current network:', error);
    return null;
};

// Network display utilities
export const formatNetworkName = (chainId: number): string => {
  const network = getNetworkConfig(chainId);
  return network ? network.displayName : Unknown Network (${chainId});
};

export const getBlockExplorerUrl = (chainId: number, type: 'tx' | 'address' | 'token', value: string): string => {
  const network = getNetworkConfig(chainId);
  if (!network) {
    return '#';

  switch (type) {
    case 'tx':
      return ${network.blockExplorer}/tx/${value};
    case 'address':
      return ${network.blockExplorer}/address/${value};
    case 'token':
      return ${network.blockExplorer}/token/${value};
    default:
      return network.blockExplorer;
};

// Contract interaction utilities
export const getContractAddress = (chainId?: number): string => {
  const targetChainId = chainId || DEFAULT_NETWORK.chainId;
  const network = getNetworkConfig(targetChainId);
  return network?.contractAddress || DEFAULT_NETWORK.contractAddress;
};

export const getRpcUrl = (chainId?: number): string => {
  const targetChainId = chainId || DEFAULT_NETWORK.chainId;
  const network = getNetworkConfig(targetChainId);
  return network?.rpcUrl || DEFAULT_NETWORK.rpcUrl;
};
}
}