const CertificateService = require('../services/CertificateService');
const { ethers } = require('ethers');

// Mock ethers
jest.mock('ethers');

// Mock config
jest.mock('../config', () => ({
  blockchain: {
    rpcUrl: 'https://test-rpc.com',
    privateKey: '0x' + '1'.repeat(64),
    contractAddress: '0x' + '2'.repeat(40),
    networkId: 80001,
    gasLimit: 500000,
    gasPrice: '20000000000'
  }
}));

describe('CertificateService', () => {
  let certificateService;
  let mockProvider;
  let mockSigner;
  let mockContract;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock provider
    mockProvider = {
      getNetwork: jest.fn().mockResolvedValue({ chainId: 80001n, name: 'polygon-mumbai' }),
      getBlockNumber: jest.fn().mockResolvedValue(12345)
    };
    
    // Mock signer
    mockSigner = {
      address: '0x1234567890123456789012345678901234567890'
    };
    
    // Mock contract
    mockContract = {
      mintCertificate: jest.fn(),
      getCertificate: jest.fn(),
      verifyCertificate: jest.fn(),
      authorizedIssuers: jest.fn(),
      revokeCertificate: jest.fn(),
      queryFilter: jest.fn(),
      filters: {
        CertificateMinted: jest.fn()
      },
      interface: {
        parseLog: jest.fn()
      }
    };
    
    // Mock ethers constructors
    ethers.JsonRpcProvider = jest.fn().mockReturnValue(mockProvider);
    ethers.Wallet = jest.fn().mockReturnValue(mockSigner);
    ethers.Contract = jest.fn().mockReturnValue(mockContract);
    ethers.isAddress = jest.fn().mockReturnValue(true);
    
    // Set up environment variables for testing
    process.env.POLYGON_MUMBAI_RPC_URL = 'https://test-rpc.com';
    process.env.PRIVATE_KEY = '0x' + '1'.repeat(64);
    process.env.CONTRACT_ADDRESS = '0x' + '2'.repeat(40);
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.CONTRACT_ADDRESS;
  });

  describe('Initialization', () => {
    it('should initialize successfully with valid configuration', async () => {
      certificateService = new CertificateService();
      
      expect(ethers.JsonRpcProvider).toHaveBeenCalledWith('https://test-rpc.com');
      expect(ethers.Wallet).toHaveBeenCalledWith(process.env.PRIVATE_KEY, mockProvider);
      expect(ethers.Contract).toHaveBeenCalledWith(
        process.env.CONTRACT_ADDRESS,
        expect.any(Array),
        mockSigner
      );
      expect(certificateService.isInitialized()).toBe(true);
    });

    it('should handle initialization without private key', async () => {
      delete process.env.PRIVATE_KEY;
      certificateService = new CertificateService();
      
      expect(ethers.JsonRpcProvider).toHaveBeenCalledWith('https://test-rpc.com');
      expect(ethers.Wallet).not.toHaveBeenCalled();
      expect(certificateService.isInitialized()).toBe(true);
    });

    it('should handle initialization without contract address', async () => {
      delete process.env.CONTRACT_ADDRESS;
      certificateService = new CertificateService();
      
      expect(certificateService.isInitialized()).toBe(false);
    });
  });

  describe('mintCertificate', () => {
    beforeEach(() => {
      certificateService = new CertificateService();
    });

    it('should mint certificate successfully', async () => {
      const certificateData = {
        recipientAddress: '0x' + '3'.repeat(40),
        recipientName: 'John Doe',
        courseName: 'Blockchain Development',
        institutionName: 'Tech University',
        metadataURI: 'ipfs://test-hash'
      };

      const mockTx = {
        hash: '0x' + '4'.repeat(64),
        wait: jest.fn().mockResolvedValue({
          blockNumber: 12346,
          gasUsed: 150000n,
          logs: [{
            topics: ['0x' + '5'.repeat(64)],
            data: '0x' + '6'.repeat(128)
          }]
        })
      };

      mockContract.mintCertificate.estimateGas = jest.fn().mockResolvedValue(125000n);
      mockContract.mintCertificate.mockResolvedValue(mockTx);
      mockContract.interface.parseLog.mockReturnValue({
        name: 'CertificateMinted',
        args: { tokenId: 1n }
      });

      const result = await certificateService.mintCertificate(certificateData);

      expect(mockContract.mintCertificate).toHaveBeenCalledWith(
        certificateData.recipientAddress,
        certificateData.recipientName,
        certificateData.courseName,
        certificateData.institutionName,
        certificateData.metadataURI,
        expect.objectContaining({
          gasLimit: 150000n, // 125000 * 1.2
          gasPrice: expect.any(String)
        })
      );

      expect(result).toEqual({
        success: true,
        tokenId: '1',
        transactionHash: mockTx.hash,
        blockNumber: 12346,
        gasUsed: '150000'
      });
    });

    it('should throw error for invalid recipient address', async () => {
      ethers.isAddress.mockReturnValue(false);
      
      const certificateData = {
        recipientAddress: 'invalid-address',
        recipientName: 'John Doe',
        courseName: 'Test Course',
        institutionName: 'Test Institution'
      };

      await expect(certificateService.mintCertificate(certificateData))
        .rejects.toThrow('Invalid recipient address');
    });

    it('should throw error when service not initialized', async () => {
      certificateService.contract = null;
      
      const certificateData = {
        recipientAddress: '0x' + '3'.repeat(40),
        recipientName: 'John Doe',
        courseName: 'Test Course',
        institutionName: 'Test Institution'
      };

      await expect(certificateService.mintCertificate(certificateData))
        .rejects.toThrow('Service not initialized');
    });

    it('should throw error when no signer available', async () => {
      certificateService.signer = null;
      
      const certificateData = {
        recipientAddress: '0x' + '3'.repeat(40),
        recipientName: 'John Doe',
        courseName: 'Test Course',
        institutionName: 'Test Institution'
      };

      await expect(certificateService.mintCertificate(certificateData))
        .rejects.toThrow('No signer available for minting');
    });
  });

  describe('getCertificate', () => {
    beforeEach(() => {
      certificateService = new CertificateService();
    });

    it('should get certificate successfully', async () => {
      const mockCertificateData = {
        issuer: '0x' + '1'.repeat(40),
        recipient: '0x' + '2'.repeat(40),
        recipientName: 'John Doe',
        courseName: 'Blockchain Development',
        institutionName: 'Tech University',
        issueDate: 1640995200n, // Jan 1, 2022
        metadataURI: 'ipfs://test-hash',
        isValid: true
      };

      mockContract.getCertificate.mockResolvedValue(mockCertificateData);

      const result = await certificateService.getCertificate('1');

      expect(mockContract.getCertificate).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        tokenId: '1',
        issuer: mockCertificateData.issuer,
        recipient: mockCertificateData.recipient,
        recipientName: mockCertificateData.recipientName,
        courseName: mockCertificateData.courseName,
        institutionName: mockCertificateData.institutionName,
        issueDate: '2022-01-01T00:00:00.000Z',
        metadataURI: mockCertificateData.metadataURI,
        isValid: mockCertificateData.isValid
      });
    });

    it('should handle certificate not found error', async () => {
      const error = new Error('execution reverted');
      error.reason = 'CertificateNotFound';
      mockContract.getCertificate.mockRejectedValue(error);

      await expect(certificateService.getCertificate('999'))
        .rejects.toThrow('Certificate not found');
    });
  });

  describe('verifyCertificate', () => {
    beforeEach(() => {
      certificateService = new CertificateService();
    });

    it('should verify certificate successfully', async () => {
      mockContract.verifyCertificate.mockResolvedValue(true);

      const result = await certificateService.verifyCertificate('1');

      expect(mockContract.verifyCertificate).toHaveBeenCalledWith('1');
      expect(result).toBe(true);
    });

    it('should return false for invalid certificate', async () => {
      mockContract.verifyCertificate.mockResolvedValue(false);

      const result = await certificateService.verifyCertificate('999');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockContract.verifyCertificate.mockRejectedValue(new Error('Network error'));

      const result = await certificateService.verifyCertificate('1');

      expect(result).toBe(false);
    });
  });

  describe('getCertificatesByIssuer', () => {
    beforeEach(() => {
      certificateService = new CertificateService();
    });

    it('should get certificates by issuer successfully', async () => {
      const issuerAddress = '0x' + '1'.repeat(40);
      const mockEvents = [
        { args: { tokenId: 1n } },
        { args: { tokenId: 2n } }
      ];

      mockContract.filters.CertificateMinted.mockReturnValue('mock-filter');
      mockContract.queryFilter.mockResolvedValue(mockEvents);
      
      // Mock getCertificate calls
      certificateService.getCertificate = jest.fn()
        .mockResolvedValueOnce({ tokenId: '1', recipientName: 'John Doe' })
        .mockResolvedValueOnce({ tokenId: '2', recipientName: 'Jane Smith' });

      const result = await certificateService.getCertificatesByIssuer(issuerAddress);

      expect(mockContract.filters.CertificateMinted).toHaveBeenCalledWith(null, issuerAddress, null);
      expect(mockContract.queryFilter).toHaveBeenCalledWith('mock-filter', -10000);
      expect(certificateService.getCertificate).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });

    it('should handle invalid issuer address', async () => {
      ethers.isAddress.mockReturnValue(false);

      await expect(certificateService.getCertificatesByIssuer('invalid-address'))
        .rejects.toThrow('Invalid issuer address');
    });
  });

  describe('isAuthorizedIssuer', () => {
    beforeEach(() => {
      certificateService = new CertificateService();
    });

    it('should check authorized issuer successfully', async () => {
      mockContract.authorizedIssuers.mockResolvedValue(true);

      const result = await certificateService.isAuthorizedIssuer('0x' + '1'.repeat(40));

      expect(result).toBe(true);
    });

    it('should return false for invalid address', async () => {
      ethers.isAddress.mockReturnValue(false);

      const result = await certificateService.isAuthorizedIssuer('invalid-address');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockContract.authorizedIssuers.mockRejectedValue(new Error('Network error'));

      const result = await certificateService.isAuthorizedIssuer('0x' + '1'.repeat(40));

      expect(result).toBe(false);
    });
  });

  describe('getNetworkInfo', () => {
    beforeEach(() => {
      certificateService = new CertificateService();
    });

    it('should get network info successfully', async () => {
      const result = await certificateService.getNetworkInfo();

      expect(mockProvider.getNetwork).toHaveBeenCalled();
      expect(mockProvider.getBlockNumber).toHaveBeenCalled();
      expect(result).toEqual({
        chainId: 80001,
        name: 'polygon-mumbai',
        blockNumber: 12345,
        contractAddress: process.env.CONTRACT_ADDRESS
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      certificateService = new CertificateService();
    });

    it('should create blockchain error correctly', () => {
      const originalError = new Error('Original error');
      originalError.reason = 'Revert reason';
      originalError.code = 'CALL_EXCEPTION';

      const blockchainError = certificateService.createBlockchainError('Test message', originalError);

      expect(blockchainError.message).toBe('Test message');
      expect(blockchainError.code).toBe('BLOCKCHAIN_ERROR');
      expect(blockchainError.reason).toBe('Revert reason');
      expect(blockchainError.ethersCode).toBe('CALL_EXCEPTION');
      expect(blockchainError.originalError).toBe(originalError);
    });
  });
});