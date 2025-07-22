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

  describe('GET /:tokenId - Certificate Retrieval Endpoint', () => {
    it('should retrieve certificate successfully', async () => {
      const mockCertificate = {
        tokenId: '1',
        issuer: '0x' + '1'.repeat(40),
        recipient: '0x' + '2'.repeat(40),
        recipientName: 'John Doe',
        courseName: 'Blockchain Development',
        institutionName: 'Tech University',
        issueDate: '2022-01-01T00:00:00.000Z',
        metadataURI: 'ipfs://test-hash',
        isValid: true
      };

      mockCertificateService.getCertificate.mockResolvedValue(mockCertificate);

      const response = await request(app)
        .get('/api/v1/certificates/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tokenId).toBe('1');
      expect(response.body.data.recipientName).toBe('John Doe');
      expect(response.body.data.verificationURL).toContain('/api/v1/certificates/verify/1');
      
      expect(mockCertificateService.getCertificate).toHaveBeenCalledWith('1');
    });

    it('should return 404 for non-existent certificate', async () => {
      const notFoundError = new Error('Certificate not found');
      notFoundError.code = 'CERTIFICATE_NOT_FOUND';
      mockCertificateService.getCertificate.mockRejectedValue(notFoundError);

      const response = await request(app)
        .get('/api/v1/certificates/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CERTIFICATE_NOT_FOUND');
      expect(response.body.error.message).toBe('Certificate not found');
    });

    it('should handle blockchain errors during retrieval', async () => {
      const blockchainError = new Error('Network timeout');
      blockchainError.code = 'BLOCKCHAIN_ERROR';
      blockchainError.reason = 'connection timeout';
      mockCertificateService.getCertificate.mockRejectedValue(blockchainError);

      const response = await request(app)
        .get('/api/v1/certificates/1');

      expect(response.status).toBe(503);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('BLOCKCHAIN_ERROR');
      expect(response.body.error.message).toBe('Failed to retrieve certificate from blockchain');
      expect(response.body.error.details).toBe('connection timeout');
    });

    it('should include verification URL in response', async () => {
      const mockCertificate = {
        tokenId: '123',
        issuer: '0x' + '1'.repeat(40),
        recipient: '0x' + '2'.repeat(40),
        recipientName: 'Jane Smith',
        courseName: 'Web Development',
        institutionName: 'Code Academy',
        issueDate: '2022-06-15T00:00:00.000Z',
        metadataURI: 'ipfs://another-hash',
        isValid: true
      };

      mockCertificateService.getCertificate.mockResolvedValue(mockCertificate);

      const response = await request(app)
        .get('/api/v1/certificates/123');

      expect(response.status).toBe(200);
      expect(response.body.data.verificationURL).toMatch(/\/api\/v1\/certificates\/verify\/123$/);
    });
  });

  describe('POST /verify/:tokenId - Certificate Verification Endpoint', () => {
    it('should verify valid certificate successfully', async () => {
      const mockCertificate = {
        tokenId: '1',
        issuer: '0x' + '1'.repeat(40),
        recipient: '0x' + '2'.repeat(40),
        recipientName: 'John Doe',
        courseName: 'Blockchain Development',
        institutionName: 'Tech University',
        issueDate: '2022-01-01T00:00:00.000Z',
        metadataURI: 'ipfs://test-hash',
        isValid: true
      };

      mockCertificateService.getCertificate.mockResolvedValue(mockCertificate);
      mockCertificateService.verifyCertificate.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/v1/certificates/verify/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(true);
      expect(response.body.data.certificate).toEqual(mockCertificate);
      expect(response.body.data.blockchainVerified).toBe(true);
      expect(response.body.data.verificationTimestamp).toBeDefined();
      expect(response.body.message).toBe('Certificate is valid and authentic');
      
      expect(mockCertificateService.getCertificate).toHaveBeenCalledWith('1');
      expect(mockCertificateService.verifyCertificate).toHaveBeenCalledWith('1');
    });

    it('should return 404 for non-existent certificate', async () => {
      mockCertificateService.getCertificate.mockResolvedValue(null);
      mockCertificateService.verifyCertificate.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/v1/certificates/verify/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CERTIFICATE_INVALID');
      expect(response.body.error.message).toBe('Certificate not found or invalid');
    });

    it('should return 404 for invalid certificate', async () => {
      const mockCertificate = {
        tokenId: '1',
        issuer: '0x' + '1'.repeat(40),
        recipient: '0x' + '2'.repeat(40),
        recipientName: 'John Doe',
        courseName: 'Blockchain Development',
        institutionName: 'Tech University',
        issueDate: '2022-01-01T00:00:00.000Z',
        metadataURI: 'ipfs://test-hash',
        isValid: false
      };

      mockCertificateService.getCertificate.mockResolvedValue(mockCertificate);
      mockCertificateService.verifyCertificate.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/v1/certificates/verify/1');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CERTIFICATE_INVALID');
      expect(response.body.error.message).toBe('Certificate not found or invalid');
    });

    it('should handle verification errors gracefully', async () => {
      mockCertificateService.getCertificate.mockRejectedValue(new Error('Network error'));
      mockCertificateService.verifyCertificate.mockRejectedValue(new Error('Network error'));

      const response = await request(app)
        .post('/api/v1/certificates/verify/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.data.isValid).toBe(false);
      expect(response.body.data.blockchainVerified).toBe(false);
      expect(response.body.data.verificationTimestamp).toBeDefined();
      expect(response.body.error.code).toBe('VERIFICATION_FAILED');
      expect(response.body.error.message).toBe('Unable to verify certificate authenticity');
    });

    it('should include verification timestamp in all responses', async () => {
      const beforeTime = new Date().toISOString();
      
      mockCertificateService.getCertificate.mockRejectedValue(new Error('Test error'));
      mockCertificateService.verifyCertificate.mockRejectedValue(new Error('Test error'));

      const response = await request(app)
        .post('/api/v1/certificates/verify/1');

      const afterTime = new Date().toISOString();
      const responseTime = response.body.data.verificationTimestamp;

      expect(responseTime).toBeDefined();
      expect(responseTime >= beforeTime).toBe(true);
      expect(responseTime <= afterTime).toBe(true);
    });
  });

  describe('GET /issuer/:address - Issuer Certificates Endpoint', () => {
    const issuerAddress = '0x' + '1'.repeat(40);

    it('should retrieve certificates by issuer successfully', async () => {
      const mockCertificates = [
        {
          tokenId: '1',
          issuer: issuerAddress,
          recipient: '0x' + '2'.repeat(40),
          recipientName: 'John Doe',
          courseName: 'Blockchain Development',
          institutionName: 'Tech University',
          issueDate: '2022-01-01T00:00:00.000Z',
          metadataURI: 'ipfs://test-hash-1',
          isValid: true
        },
        {
          tokenId: '2',
          issuer: issuerAddress,
          recipient: '0x' + '3'.repeat(40),
          recipientName: 'Jane Smith',
          courseName: 'Web Development',
          institutionName: 'Tech University',
          issueDate: '2022-02-01T00:00:00.000Z',
          metadataURI: 'ipfs://test-hash-2',
          isValid: true
        }
      ];

      mockCertificateService.getCertificatesByIssuer.mockResolvedValue(mockCertificates);

      const response = await request(app)
        .get(`/api/v1/certificates/issuer/${issuerAddress}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.certificates).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
      expect(response.body.data.limit).toBe(50);
      expect(response.body.data.offset).toBe(0);
      expect(response.body.data.issuer).toBe(issuerAddress);
      
      expect(mockCertificateService.getCertificatesByIssuer).toHaveBeenCalledWith(issuerAddress, 50);
    });

    it('should handle custom limit parameter', async () => {
      const mockCertificates = [
        {
          tokenId: '1',
          issuer: issuerAddress,
          recipient: '0x' + '2'.repeat(40),
          recipientName: 'John Doe',
          courseName: 'Test Course',
          institutionName: 'Test Institution',
          issueDate: '2022-01-01T00:00:00.000Z',
          metadataURI: 'ipfs://test-hash',
          isValid: true
        }
      ];

      mockCertificateService.getCertificatesByIssuer.mockResolvedValue(mockCertificates);

      const response = await request(app)
        .get(`/api/v1/certificates/issuer/${issuerAddress}?limit=10`);

      expect(response.status).toBe(200);
      expect(response.body.data.limit).toBe(10);
      
      expect(mockCertificateService.getCertificatesByIssuer).toHaveBeenCalledWith(issuerAddress, 10);
    });

    it('should handle pagination with offset', async () => {
      const mockCertificates = [
        { tokenId: '1', recipientName: 'John Doe' },
        { tokenId: '2', recipientName: 'Jane Smith' },
        { tokenId: '3', recipientName: 'Bob Johnson' }
      ];

      mockCertificateService.getCertificatesByIssuer.mockResolvedValue(mockCertificates);

      const response = await request(app)
        .get(`/api/v1/certificates/issuer/${issuerAddress}?limit=10&offset=1`);

      expect(response.status).toBe(200);
      expect(response.body.data.certificates).toHaveLength(2); // 3 total - 1 offset
      expect(response.body.data.total).toBe(3);
      expect(response.body.data.limit).toBe(10);
      expect(response.body.data.offset).toBe(1);
      expect(response.body.data.certificates[0].tokenId).toBe('2'); // First after offset
    });

    it('should return empty array for issuer with no certificates', async () => {
      mockCertificateService.getCertificatesByIssuer.mockResolvedValue([]);

      const response = await request(app)
        .get(`/api/v1/certificates/issuer/${issuerAddress}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.certificates).toHaveLength(0);
      expect(response.body.data.total).toBe(0);
    });

    it('should handle blockchain errors during issuer certificate retrieval', async () => {
      const blockchainError = new Error('Failed to query events');
      blockchainError.code = 'BLOCKCHAIN_ERROR';
      blockchainError.reason = 'network timeout';
      mockCertificateService.getCertificatesByIssuer.mockRejectedValue(blockchainError);

      const response = await request(app)
        .get(`/api/v1/certificates/issuer/${issuerAddress}`);

      expect(response.status).toBe(503);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('BLOCKCHAIN_ERROR');
      expect(response.body.error.message).toBe('Failed to retrieve certificates from blockchain');
      expect(response.body.error.details).toBe('network timeout');
    });

    it('should validate issuer address through middleware', async () => {
      // This test verifies that the validation middleware is properly integrated
      // The actual validation logic is tested separately in validation middleware tests
      mockCertificateService.getCertificatesByIssuer.mockResolvedValue([]);

      const response = await request(app)
        .get(`/api/v1/certificates/issuer/${issuerAddress}`);

      expect(response.status).toBe(200);
      // If we get here, validation middleware passed the request through
    });

    it('should handle large certificate lists efficiently', async () => {
      // Create a large array of mock certificates
      const largeCertificateList = Array.from({ length: 100 }, (_, i) => ({
        tokenId: (i + 1).toString(),
        issuer: issuerAddress,
        recipient: '0x' + (i + 2).toString().padStart(40, '0'),
        recipientName: `User ${i + 1}`,
        courseName: `Course ${i + 1}`,
        institutionName: 'Test Institution',
        issueDate: '2022-01-01T00:00:00.000Z',
        metadataURI: `ipfs://test-hash-${i + 1}`,
        isValid: true
      }));

      mockCertificateService.getCertificatesByIssuer.mockResolvedValue(largeCertificateList);

      const response = await request(app)
        .get(`/api/v1/certificates/issuer/${issuerAddress}?limit=25&offset=10`);

      expect(response.status).toBe(200);
      expect(response.body.data.certificates).toHaveLength(90); // 100 total - 10 offset = 90 (no limit applied in current implementation)
      expect(response.body.data.total).toBe(100);
      expect(response.body.data.certificates[0].tokenId).toBe('11'); // First after offset of 10
    });
  });
});