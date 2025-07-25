import { ethers } from 'ethers';

// Mock ethers
jest.mock('ethers');

// Import after mocking
import getBlockchainService, { CertificateData, VerificationResult } from '../blockchainService';

const mockProvider = {
  getNetwork: jest.fn(),
};

const mockContract = {
  getCertificate: jest.fn(),
  verifyCertificate: jest.fn(),
  ownerOf: jest.fn(),
};

// Store original environment
const originalEnv = process.env;

beforeEach(() => {
  jest.resetAllMocks();
  
  // Reset the singleton instance
  jest.resetModules();
  
  process.env = {
    ...originalEnv,
    REACT_APP_CONTRACT_ADDRESS: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4',
    REACT_APP_POLYGON_MUMBAI_RPC_URL: 'https://rpc-mumbai.maticvigil.com',
    REACT_APP_CHAIN_ID: '80001',
  };

  (ethers.JsonRpcProvider as jest.Mock).mockReturnValue(mockProvider);
  (ethers.Contract as jest.Mock).mockReturnValue(mockContract);
});

afterEach(() => {
  process.env = originalEnv;
});

describe('BlockchainService', () => {
  describe('getCertificate', () => {
    it('should fetch certificate data from blockchain successfully', async () => {
      const mockCertificateData = {
        issuer: '0x1234567890123456789012345678901234567890',
        recipient: '0x0987654321098765432109876543210987654321',
        recipientName: 'John Doe',
        courseName: 'Blockchain Development',
        institutionName: 'Tech University',
        issueDate: BigInt(1640995200), // 2022-01-01
        metadataURI: 'https://example.com/metadata/1',
        isValid: true,
      };

      mockContract.getCertificate.mockResolvedValue(mockCertificateData);

      const blockchainService = getBlockchainService();
      const result = await blockchainService.getCertificate('1');

      expect(mockContract.getCertificate).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        tokenId: '1',
        issuer: '0x1234567890123456789012345678901234567890',
        recipient: '0x0987654321098765432109876543210987654321',
        recipientName: 'John Doe',
        courseName: 'Blockchain Development',
        institutionName: 'Tech University',
        issueDate: 1640995200,
        metadataURI: 'https://example.com/metadata/1',
        isValid: true,
        verificationURL: expect.stringContaining('/verify/1'),
        qrCodeURL: expect.stringContaining('/api/v1/qr-code/1'),
      });
    });

    it('should handle certificate not found error', async () => {
      const error = new Error('execution reverted: CertificateNotFound');
      mockContract.getCertificate.mockRejectedValue(error);

      const blockchainService = getBlockchainService();
      await expect(blockchainService.getCertificate('999')).rejects.toThrow(
        'Certificate not found on blockchain'
      );
    });

    it('should handle network connection errors', async () => {
      const error = new Error('network connection failed');
      mockContract.getCertificate.mockRejectedValue(error);

      const blockchainService = getBlockchainService();
      await expect(blockchainService.getCertificate('1')).rejects.toThrow(
        'Network connection error. Please check your internet connection.'
      );
    });

    it('should handle generic blockchain errors', async () => {
      const error = new Error('Unknown blockchain error');
      mockContract.getCertificate.mockRejectedValue(error);

      const blockchainService = getBlockchainService();
      await expect(blockchainService.getCertificate('1')).rejects.toThrow(
        'Failed to fetch certificate from blockchain'
      );
    });
  });

  describe('verifyCertificate', () => {
    it('should verify certificate successfully', async () => {
      const mockCertificateData = {
        issuer: '0x1234567890123456789012345678901234567890',
        recipient: '0x0987654321098765432109876543210987654321',
        recipientName: 'John Doe',
        courseName: 'Blockchain Development',
        institutionName: 'Tech University',
        issueDate: BigInt(1640995200),
        metadataURI: 'https://example.com/metadata/1',
        isValid: true,
      };

      mockContract.getCertificate.mockResolvedValue(mockCertificateData);
      mockContract.verifyCertificate.mockResolvedValue(true);
      mockContract.ownerOf.mockResolvedValue('0x0987654321098765432109876543210987654321');

      const blockchainService = getBlockchainService();
      const result = await blockchainService.verifyCertificate('1');

      expect(result.isValid).toBe(true);
      expect(result.onChain).toBe(true);
      expect(result.message).toBe('Certificate is valid and verified on blockchain');
      expect(result.verificationTimestamp).toBeGreaterThan(0);
    });

    it('should handle revoked certificate', async () => {
      const mockCertificateData = {
        issuer: '0x1234567890123456789012345678901234567890',
        recipient: '0x0987654321098765432109876543210987654321',
        recipientName: 'John Doe',
        courseName: 'Blockchain Development',
        institutionName: 'Tech University',
        issueDate: BigInt(1640995200),
        metadataURI: 'https://example.com/metadata/1',
        isValid: false, // Certificate is revoked
      };

      mockContract.getCertificate.mockResolvedValue(mockCertificateData);
      mockContract.verifyCertificate.mockResolvedValue(false);
      mockContract.ownerOf.mockResolvedValue('0x0987654321098765432109876543210987654321');

      const blockchainService = getBlockchainService();
      const result = await blockchainService.verifyCertificate('1');

      expect(result.isValid).toBe(false);
      expect(result.onChain).toBe(true);
      expect(result.message).toBe('Certificate is not valid or has been revoked');
    });

    it('should handle certificate that does not exist', async () => {
      const error = new Error('Certificate not found on blockchain');
      mockContract.getCertificate.mockRejectedValue(error);

      const blockchainService = getBlockchainService();
      const result = await blockchainService.verifyCertificate('999');

      expect(result.isValid).toBe(false);
      expect(result.onChain).toBe(false);
      expect(result.message).toBe('Certificate not found on blockchain');
    });

    it('should handle owner verification failure', async () => {
      const mockCertificateData = {
        issuer: '0x1234567890123456789012345678901234567890',
        recipient: '0x0987654321098765432109876543210987654321',
        recipientName: 'John Doe',
        courseName: 'Blockchain Development',
        institutionName: 'Tech University',
        issueDate: BigInt(1640995200),
        metadataURI: 'https://example.com/metadata/1',
        isValid: true,
      };

      mockContract.getCertificate.mockResolvedValue(mockCertificateData);
      mockContract.verifyCertificate.mockResolvedValue(true);
      mockContract.ownerOf.mockRejectedValue(new Error('ERC721: owner query for nonexistent token'));

      const blockchainService = getBlockchainService();
      const result = await blockchainService.verifyCertificate('1');

      expect(result.isValid).toBe(false);
      expect(result.onChain).toBe(true);
      expect(result.message).toBe('Certificate is not valid or has been revoked');
    });
  });

  describe('isConfigured', () => {
    it('should return true when properly configured', () => {
      const blockchainService = getBlockchainService();
      expect(blockchainService.isConfigured()).toBe(true);
    });

    it('should return false when contract address is missing', () => {
      delete process.env.REACT_APP_CONTRACT_ADDRESS;
      
      // Need to create a new instance since the constructor runs once
      expect(() => {
        // This should throw during construction
        getBlockchainService();
      }).toThrow('Contract address not configured');
    });
  });

  describe('getNetworkInfo', () => {
    it('should return network information successfully', async () => {
      const mockNetwork = {
        name: 'maticmum',
        chainId: BigInt(80001),
      };

      mockProvider.getNetwork.mockResolvedValue(mockNetwork);

      const blockchainService = getBlockchainService();
      const result = await blockchainService.getNetworkInfo();

      expect(result).toEqual({
        name: 'maticmum',
        chainId: 80001,
        isCorrectNetwork: true,
      });
    });

    it('should handle network info fetch failure', async () => {
      mockProvider.getNetwork.mockRejectedValue(new Error('Network error'));

      const blockchainService = getBlockchainService();
      const result = await blockchainService.getNetworkInfo();

      expect(result).toEqual({
        name: 'Unknown',
        chainId: 0,
        isCorrectNetwork: false,
      });
    });

    it('should detect incorrect network', async () => {
      const mockNetwork = {
        name: 'mainnet',
        chainId: BigInt(1), // Ethereum mainnet instead of Mumbai
      };

      mockProvider.getNetwork.mockResolvedValue(mockNetwork);

      const blockchainService = getBlockchainService();
      const result = await blockchainService.getNetworkInfo();

      expect(result.isCorrectNetwork).toBe(false);
      expect(result.chainId).toBe(1);
    });
  });
});