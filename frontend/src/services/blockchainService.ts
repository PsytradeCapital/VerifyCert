import { ethers } from 'ethers';

interface CertificateData {
  issuer: string;
  recipient: string;
  recipientName: string;
  courseName: string;
  institutionName: string;
  issueDate: number;
  metadataURI: string;
  isRevoked: boolean;
}

interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  contractAddress: string;
}

class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider | null = null;
  private contract: ethers.Contract | null = null;
  private networkConfig: NetworkConfig;

  constructor() {
    this.networkConfig = {
      chainId: 80002,
      name: 'Polygon Amoy',
      rpcUrl: process.env.REACT_APP_RPC_URL || 'https://rpc-amoy.polygon.technology',
      contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS || '0x...'
    };
    this.initializeProvider();
  }

  private initializeProvider(): void {
    try {
      this.provider = new ethers.providers.JsonRpcProvider(this.networkConfig.rpcUrl);
    } catch (error) {
      console.error('Failed to initialize blockchain provider:', error);
    }
  }

  async connectWallet(): Promise<ethers.providers.Web3Provider | null> {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      return provider;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async verifyCertificate(tokenId: string): Promise<CertificateData | null> {
    try {
      // Mock implementation for now
      return {
        issuer: '0x1234567890123456789012345678901234567890',
        recipient: '0x0987654321098765432109876543210987654321',
        recipientName: 'John Doe',
        courseName: 'Blockchain Fundamentals',
        institutionName: 'Tech University',
        issueDate: Date.now(),
        metadataURI: '',
        isRevoked: false
      };
    } catch (error) {
      console.error('Failed to verify certificate:', error);
      return null;
    }
  }

  getNetworkConfig(): NetworkConfig {
    return this.networkConfig;
  }
}

export const blockchainService = new BlockchainService();
export type { CertificateData, NetworkConfig };