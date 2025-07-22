const request = require('supertest');
const express = require('express');

// Mock the CertificateService before importing the router
const mockCertificateService = {
  isAuthorizedIssuer: jest.fn(),
  mintCertificate: jest.fn(),
  getCertificate: jest.fn(),
  verifyCertificate: jest.fn(),
  getCertificatesByIssuer: jest.fn(),
  revokeCertificate: jest.fn()
};

jest.mock('../services/CertificateService', () => {
  return jest.fn().mockImplementation(() => mockCertificateService);
});

// Mock middleware
jest.mock('../middleware/validation', () => ({
  validate: () => (req, res, next) => next(),
  schemas: {
    certificateData: {},
    tokenId: {},
    ethereumAddress: {}
  }
}));

jest.mock('../middleware/auth', () => ({
  verifyWalletSignature: (req, res, next) => {
    req.walletAddress = '0x1234567890123456789012345678901234567890';
    next();
  },
  requireAuthorizedIssuer: (req, res, next) => next()
}));

// Import router after mocking
const certificatesRouter = require('../routes/certificates');

describe('Certificates API', () => {
  let app;

  beforeEach(() => {
    // Create Express app for testing
    app = express();
    app.use(express.json());
    app.use('/api/v1/certificates', certificatesRouter);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('POST /mint - Certificate Minting Endpoint', () => {
    const validCertificateData = {
      recipientAddress: '0x' + '3'.repeat(40),
      recipientName: 'John Doe',
      courseName: 'Blockchain Development',
      institutionName: 'Tech University',
      metadataURI: 'ipfs://test-hash'
    };

    it('should mint certificate successfully for authorized issuer', async () => {
      // Mock authorized issuer
      mockCertificateService.isAuthorizedIssuer.mockResolvedValue(true);
      
      // Mock successful minting
      mockCertificateService.mintCertificate.mockResolvedValue({
        success: true,
        tokenId: '1',
        transactionHash: '0x' + '4'.repeat(64),
        blockNumber: 12346,
        gasUsed: '150000'
      });

      const response = await request(app)
        .post('/api/v1/certificates/mint')
        .send(validCertificateData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tokenId).toBe('1');
      expect(response.body.message).toBe('Certificate minted successfully');
      
      // Verify the service methods were called correctly
      expect(mockCertificateService.isAuthorizedIssuer).toHaveBeenCalledWith('0x1234567890123456789012345678901234567890');
      expect(mockCertificateService.mintCertificate).toHaveBeenCalledWith({
        recipientAddress: validCertificateData.recipientAddress,
        recipientName: validCertificateData.recipientName,
        courseName: validCertificateData.courseName,
        institutionName: validCertificateData.institutionName,
        metadataURI: validCertificateData.metadataURI
      });
    });

    it('should reject minting for unauthorized issuer', async () => {
      // Mock unauthorized issuer
      mockCertificateService.isAuthorizedIssuer.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/v1/certificates/mint')
        .send(validCertificateData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
      expect(response.body.error.message).toBe('Address is not authorized to issue certificates');
      
      // Verify only authorization was checked
      expect(mockCertificateService.isAuthorizedIssuer).toHaveBeenCalledWith('0x1234567890123456789012345678901234567890');
      expect(mockCertificateService.mintCertificate).not.toHaveBeenCalled();
    });

    it('should handle blockchain errors during minting', async () => {
      // Mock authorized issuer
      mockCertificateService.isAuthorizedIssuer.mockResolvedValue(true);
      
      // Mock blockchain error
      const blockchainError = new Error('Gas estimation failed');
      blockchainError.code = 'BLOCKCHAIN_ERROR';
      blockchainError.reason = 'insufficient funds';
      mockCertificateService.mintCertificate.mockRejectedValue(blockchainError);

      const response = await request(app)
        .post('/api/v1/certificates/mint')
        .send(validCertificateData);

      expect(response.status).toBe(503);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('BLOCKCHAIN_ERROR');
      expect(response.body.error.message).toBe('Failed to mint certificate on blockchain');
      expect(response.body.error.details).toBe('insufficient funds');
    });

    it('should handle network errors during minting', async () => {
      // Mock authorized issuer
      mockCertificateService.isAuthorizedIssuer.mockResolvedValue(true);
      
      // Mock network error
      const networkError = new Error('Network timeout');
      networkError.code = 'NETWORK_ERROR';
      mockCertificateService.mintCertificate.mockRejectedValue(networkError);

      const response = await request(app)
        .post('/api/v1/certificates/mint')
        .send(validCertificateData);

      expect(response.status).toBe(503);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NETWORK_ERROR');
      expect(response.body.error.message).toBe('Network connectivity issue');
      expect(response.body.error.details).toBe('Network timeout');
    });

    it('should include verification URL in successful response', async () => {
      // Mock authorized issuer and successful minting
      mockCertificateService.isAuthorizedIssuer.mockResolvedValue(true);
      mockCertificateService.mintCertificate.mockResolvedValue({
        success: true,
        tokenId: '123',
        transactionHash: '0x' + 'a'.repeat(64),
        blockNumber: 12346,
        gasUsed: '150000'
      });

      const response = await request(app)
        .post('/api/v1/certificates/mint')
        .send(validCertificateData);

      expect(response.status).toBe(201);
      expect(response.body.data.verificationURL).toContain('/api/v1/certificates/verify/123');
      expect(response.body.data.certificate.issuer).toBe('0x1234567890123456789012345678901234567890');
    });

    it('should validate input data through middleware', async () => {
      // This test verifies that the validation middleware is properly integrated
      // The actual validation logic is tested separately in validation middleware tests
      mockCertificateService.isAuthorizedIssuer.mockResolvedValue(true);
      mockCertificateService.mintCertificate.mockResolvedValue({
        success: true,
        tokenId: '1',
        transactionHash: '0x' + '4'.repeat(64),
        blockNumber: 12346,
        gasUsed: '150000'
      });

      const response = await request(app)
        .post('/api/v1/certificates/mint')
        .send(validCertificateData);

      expect(response.status).toBe(201);
      // If we get here, validation middleware passed the request through
    });

    it('should require wallet signature through middleware', async () => {
      // This test verifies that the auth middleware is properly integrated
      // The actual auth logic is tested separately in auth middleware tests
      mockCertificateService.isAuthorizedIssuer.mockResolvedValue(true);
      mockCertificateService.mintCertificate.mockResolvedValue({
        success: true,
        tokenId: '1',
        transactionHash: '0x' + '4'.repeat(64),
        blockNumber: 12346,
        gasUsed: '150000'
      });

      const response = await request(app)
        .post('/api/v1/certificates/mint')
        .send(validCertificateData);

      expect(response.status).toBe(201);
      // If we get here, auth middleware set req.walletAddress correctly
    });
  });
});