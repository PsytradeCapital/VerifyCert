const QRCodeService = require('../services/QRCodeService');
const fs = require('fs').promises;
const path = require('path');

// Mock environment variables
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.BACKEND_URL = 'http://localhost:5000';

describe('QRCodeService', () => {
  let qrCodeService;
  const testTokenId = 'test-token-123';
  const testCertificateData = {
    recipientName: 'John Doe',
    courseName: 'Blockchain Development',
    institutionName: 'Tech University'
  };

  beforeEach(() => {
    qrCodeService = new QRCodeService();
  });

  afterEach(async () => {
    // Clean up test files
    try {
      await qrCodeService.deleteQRCodes(testTokenId);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('generateCertificateQR', () => {
    it('should generate QR code for certificate verification', async () => {
      const result = await qrCodeService.generateCertificateQR(testTokenId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('tokenId', testTokenId);
      expect(result.data).toHaveProperty('verificationURL');
      expect(result.data).toHaveProperty('qrDataURL');
      expect(result.data).toHaveProperty('qrImageURL');
      expect(result.data).toHaveProperty('fileName');
      expect(result.data).toHaveProperty('filePath');

      // Verify URL format
      expect(result.data.verificationURL).toBe(`http://localhost:3000/verify/${testTokenId}`);
      expect(result.data.qrDataURL).toMatch(/^data:image\/png;base64,/);
      expect(result.data.fileName).toBe(`cert-${testTokenId}.png`);
    });

    it('should create QR code file on filesystem', async () => {
      const result = await qrCodeService.generateCertificateQR(testTokenId);
      
      expect(result.success).toBe(true);
      
      // Check if file exists
      const fileExists = await qrCodeService.validateQRCodeExists(testTokenId, 'cert');
      expect(fileExists).toBe(true);
    });

    it('should handle custom QR code options', async () => {
      const customOptions = {
        width: 512,
        margin: 2,
        color: {
          dark: '#FF0000',
          light: '#FFFFFF'
        }
      };

      const result = await qrCodeService.generateCertificateQR(testTokenId, customOptions);

      expect(result.success).toBe(true);
      expect(result.data.qrDataURL).toMatch(/^data:image\/png;base64,/);
    });

    it('should return error for missing token ID', async () => {
      const result = await qrCodeService.generateCertificateQR('');

      expect(result.success).toBe(false);
      expect(result.error).toHaveProperty('code', 'QR_GENERATION_FAILED');
      expect(result.error).toHaveProperty('message', 'Failed to generate QR code');
    });

    it('should return error for null token ID', async () => {
      const result = await qrCodeService.generateCertificateQR(null);

      expect(result.success).toBe(false);
      expect(result.error).toHaveProperty('code', 'QR_GENERATION_FAILED');
    });
  });

  describe('generateSharingQR', () => {
    it('should generate QR code for certificate sharing', async () => {
      const result = await qrCodeService.generateSharingQR(testTokenId, testCertificateData);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('tokenId', testTokenId);
      expect(result.data).toHaveProperty('shareURL');
      expect(result.data).toHaveProperty('qrDataURL');
      expect(result.data).toHaveProperty('qrImageURL');
      expect(result.data).toHaveProperty('certificateInfo');

      // Verify URL format
      expect(result.data.shareURL).toBe(`http://localhost:3000/certificate/${testTokenId}`);
      expect(result.data.certificateInfo).toEqual(testCertificateData);
      expect(result.data.fileName).toBe(`share-${testTokenId}.png`);
    });

    it('should create sharing QR code file on filesystem', async () => {
      const result = await qrCodeService.generateSharingQR(testTokenId, testCertificateData);
      
      expect(result.success).toBe(true);
      
      // Check if file exists
      const fileExists = await qrCodeService.validateQRCodeExists(testTokenId, 'share');
      expect(fileExists).toBe(true);
    });
  });

  describe('deleteQRCodes', () => {
    it('should delete QR code files for a certificate', async () => {
      // First generate QR codes
      await qrCodeService.generateCertificateQR(testTokenId);
      await qrCodeService.generateSharingQR(testTokenId, testCertificateData);

      // Verify files exist
      expect(await qrCodeService.validateQRCodeExists(testTokenId, 'cert')).toBe(true);
      expect(await qrCodeService.validateQRCodeExists(testTokenId, 'share')).toBe(true);

      // Delete files
      const result = await qrCodeService.deleteQRCodes(testTokenId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('tokenId', testTokenId);
      expect(result.data).toHaveProperty('deletionResults');
      expect(result.data.deletionResults).toHaveLength(2);

      // Verify files are deleted
      expect(await qrCodeService.validateQRCodeExists(testTokenId, 'cert')).toBe(false);
      expect(await qrCodeService.validateQRCodeExists(testTokenId, 'share')).toBe(false);
    });

    it('should handle deletion of non-existent files gracefully', async () => {
      const result = await qrCodeService.deleteQRCodes('non-existent-token');

      expect(result.success).toBe(true);
      expect(result.data.deletionResults).toHaveLength(2);
      expect(result.data.deletionResults[0].deleted).toBe(false);
      expect(result.data.deletionResults[1].deleted).toBe(false);
    });
  });

  describe('getQRCodeURLs', () => {
    it('should return correct QR code URLs', () => {
      const urls = qrCodeService.getQRCodeURLs(testTokenId);

      expect(urls).toHaveProperty('verificationQR');
      expect(urls).toHaveProperty('sharingQR');
      expect(urls).toHaveProperty('verificationURL');
      expect(urls).toHaveProperty('shareURL');

      expect(urls.verificationQR).toBe(`http://localhost:5000/public/qr-codes/cert-${testTokenId}.png`);
      expect(urls.sharingQR).toBe(`http://localhost:5000/public/qr-codes/share-${testTokenId}.png`);
      expect(urls.verificationURL).toBe(`http://localhost:3000/verify/${testTokenId}`);
      expect(urls.shareURL).toBe(`http://localhost:3000/certificate/${testTokenId}`);
    });
  });

  describe('validateQRCodeExists', () => {
    it('should return true for existing QR code files', async () => {
      await qrCodeService.generateCertificateQR(testTokenId);
      
      const exists = await qrCodeService.validateQRCodeExists(testTokenId, 'cert');
      expect(exists).toBe(true);
    });

    it('should return false for non-existent QR code files', async () => {
      const exists = await qrCodeService.validateQRCodeExists('non-existent-token', 'cert');
      expect(exists).toBe(false);
    });

    it('should default to cert type when type not specified', async () => {
      await qrCodeService.generateCertificateQR(testTokenId);
      
      const exists = await qrCodeService.validateQRCodeExists(testTokenId);
      expect(exists).toBe(true);
    });
  });

  describe('ensureQRCodeDirectory', () => {
    it('should create QR code directory if it does not exist', async () => {
      // This is tested implicitly when the service is instantiated
      // and QR codes are generated successfully
      const result = await qrCodeService.generateCertificateQR(testTokenId);
      expect(result.success).toBe(true);
    });
  });
});