const QRCode = require('qrcode');
const fs = require('fs').promises;
const path = require('path');

class QRCodeService {
  constructor() {
    this.qrCodeDir = path.join(__dirname, '../../public/qr-codes');
    this.baseURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    this.ensureQRCodeDirectory();
  }

  /**
   * Ensure QR code directory exists
   */
  async ensureQRCodeDirectory() {
    try {
      await fs.access(this.qrCodeDir);
    } catch (error) {
      // Directory doesn't exist, create it
      await fs.mkdir(this.qrCodeDir, { recursive: true });
    }
  }

  /**
   * Generate QR code for certificate verification
   * @param {string} tokenId - Certificate token ID
   * @param {Object} options - QR code generation options
   * @returns {Promise<Object>} QR code data with URLs
   */
  async generateCertificateQR(tokenId, options = {}) {
    try {
      if (!tokenId) {
        throw new Error('Token ID is required for QR code generation');
      }

      // Create verification URL
      const verificationURL = `${this.baseURL}/verify/${tokenId}`;
      
      // QR code options
      const qrOptions = {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: options.width || 256,
        ...options
      };

      // Generate QR code as data URL (base64)
      const qrDataURL = await QRCode.toDataURL(verificationURL, qrOptions);

      // Generate QR code as buffer for file storage
      const qrBuffer = await QRCode.toBuffer(verificationURL, qrOptions);

      // Save QR code image to file system
      const fileName = `cert-${tokenId}.png`;
      const filePath = path.join(this.qrCodeDir, fileName);
      await fs.writeFile(filePath, qrBuffer);

      // Create public URL for the QR code image
      const qrImageURL = `${process.env.BACKEND_URL || 'http://localhost:5000'}/public/qr-codes/${fileName}`;

      return {
        success: true,
        data: {
          tokenId,
          verificationURL,
          qrDataURL, // Base64 data URL for immediate use
          qrImageURL, // Public URL to the saved image file
          fileName,
          filePath
        }
      };

    } catch (error) {
      console.error('QR Code generation failed:', error);
      return {
        success: false,
        error: {
          code: 'QR_GENERATION_FAILED',
          message: 'Failed to generate QR code',
          details: error.message
        }
      };
    }
  }

  /**
   * Generate QR code for certificate sharing
   * @param {string} tokenId - Certificate token ID
   * @param {Object} certificateData - Certificate information
   * @returns {Promise<Object>} QR code data for sharing
   */
  async generateSharingQR(tokenId, certificateData) {
    try {
      // Create a more detailed sharing URL with certificate info
      const shareURL = `${this.baseURL}/certificate/${tokenId}`;
      
      const qrOptions = {
        errorCorrectionLevel: 'H', // Higher error correction for sharing
        width: 300,
        margin: 2
      };

      const qrDataURL = await QRCode.toDataURL(shareURL, qrOptions);
      const qrBuffer = await QRCode.toBuffer(shareURL, qrOptions);

      const fileName = `share-${tokenId}.png`;
      const filePath = path.join(this.qrCodeDir, fileName);
      await fs.writeFile(filePath, qrBuffer);

      const qrImageURL = `${process.env.BACKEND_URL || 'http://localhost:5000'}/public/qr-codes/${fileName}`;

      return {
        success: true,
        data: {
          tokenId,
          shareURL,
          qrDataURL,
          qrImageURL,
          fileName,
          filePath,
          certificateInfo: {
            recipientName: certificateData.recipientName,
            courseName: certificateData.courseName,
            institutionName: certificateData.institutionName
          }
        }
      };

    } catch (error) {
      console.error('Sharing QR Code generation failed:', error);
      return {
        success: false,
        error: {
          code: 'SHARING_QR_GENERATION_FAILED',
          message: 'Failed to generate sharing QR code',
          details: error.message
        }
      };
    }
  }

  /**
   * Delete QR code files for a certificate
   * @param {string} tokenId - Certificate token ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteQRCodes(tokenId) {
    try {
      const files = [
        `cert-${tokenId}.png`,
        `share-${tokenId}.png`
      ];

      const deletionResults = [];

      for (const fileName of files) {
        const filePath = path.join(this.qrCodeDir, fileName);
        try {
          await fs.unlink(filePath);
          deletionResults.push({ fileName, deleted: true });
        } catch (error) {
          // File might not exist, which is okay
          deletionResults.push({ fileName, deleted: false, reason: error.message });
        }
      }

      return {
        success: true,
        data: {
          tokenId,
          deletionResults
        }
      };

    } catch (error) {
      console.error('QR Code deletion failed:', error);
      return {
        success: false,
        error: {
          code: 'QR_DELETION_FAILED',
          message: 'Failed to delete QR codes',
          details: error.message
        }
      };
    }
  }

  /**
   * Get QR code URLs for a certificate
   * @param {string} tokenId - Certificate token ID
   * @returns {Object} QR code URLs
   */
  getQRCodeURLs(tokenId) {
    const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';
    return {
      verificationQR: `${baseURL}/public/qr-codes/cert-${tokenId}.png`,
      sharingQR: `${baseURL}/public/qr-codes/share-${tokenId}.png`,
      verificationURL: `${this.baseURL}/verify/${tokenId}`,
      shareURL: `${this.baseURL}/certificate/${tokenId}`
    };
  }

  /**
   * Validate QR code file exists
   * @param {string} tokenId - Certificate token ID
   * @param {string} type - QR code type ('cert' or 'share')
   * @returns {Promise<boolean>} Whether file exists
   */
  async validateQRCodeExists(tokenId, type = 'cert') {
    try {
      const fileName = `${type}-${tokenId}.png`;
      const filePath = path.join(this.qrCodeDir, fileName);
      await fs.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = QRCodeService;