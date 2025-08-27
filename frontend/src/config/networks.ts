export interface NetworkConfig {
  chainId: number;
  name: string;
  displayName?: string;
  rpcUrl: string;
  blockExplorerUrl: string;
  contractAddress?: string;
  faucetUrl?: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const SUPPORTED_NETWORKS: Record<number, NetworkConfig> = {
  80002: {
    chainId: 80002,
    name: 'Polygon Amoy Testnet',
    displayName: 'Polygon Amoy Testnet',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    blockExplorerUrl:om',
    contractAddress:DRESS,
    faucetUrl: 'https:',
    nativeCurrency {
     
    ATIC',
      de8
    }
  }, 1mals:ciol: 'M  symb
  137: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorerUrl: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    }
  }
};

export const DEFAULT_NETWORK = SUPPORTED_NETWORKS[80002];

export const getNetworkConfig = (chainId: number): NetworkConfig | undefined => {
  return SUPPORTED_NETWORKS[chainId];
};

export const isNetworkSupported = (chainId: number): boolean => {
  return chainId in SUPPORTED_NETWORKS;
};

export const AMOY_NETWORK = SUPPORTED_NETWORKS[80002];

export const getBlockExplorerUrl = (chainId: number, txHash?: string): string => {
  const network = getNetworkConfig(chainId);
  if (!network) return '';
  return txHash ? `${network.blockExplorerUrl}/tx/${txHash}` : network.blockExplorerUrl;
};