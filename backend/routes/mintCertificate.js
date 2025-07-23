const express = require('express');
const router = express.Router();
const CertificateService = require('../services/CertificateService');
const QRCodeService = require('../services/QRCodeService');
const NotificationService = require('../services/NotificationService');
const { validate, schemas } = require('../middleware/validation');
const { verifyWalletSignature } = require('../middleware/auth');

// Initialize services
const certificateService = new CertificateService();
const qrCodeService = new QRCodeService();
const notificationService = new NotificationService();

/**
 * POST /mint
 * Mint a new certificate NFT
 */
router.post('/mint', 
  verifyWalletSignature,
  validate(schemas.certificateData),
  async (req, res, next) => {
    try {
      const { 
        recipientAddress, 
        recipientName, 
        courseName, 
        institutionName, 
        metadataURI, 
        recipientEmail, 
        issuerEmail 
      } = req.body;
      const issuerAddress = req.walletAddress;

      console.log('Minting certificate for:', {
        recipientAddress,
        recipientName,
        courseName,
        institutionName,
        issuer: issuerAddress
      });

      // Check if the issuer is authorized
      const isAuthorized = await certificateService.isAuthorizedIssuer(issuerAddress);
      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'AUTHORIZATION_ERROR',
            message: 'Address is not authorized to issue certificates'
          }
        });
      }

      // Prepare certificate data
      const certificateData = {
        recipientAddress,
        recipientName,
        courseName,
        institutionName,
        metadataURI: metadataURI || ''
      };

      // Mint the certificate
      const result = await certificateService.mintCertificate(certificateData);

      // Prepare complete certificate data for notifications
      const completeCertificateData = {
        ...certificateData,
        issuer: issuerAddress,
        tokenId: result.tokenId,
        issueDate: Math.floor(Date.now() / 1000), // Current timestamp in seconds
        transactionHash: result.transactionHash
      };

      // Generate verification URLs
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationURL = `${frontendURL}/verify/${result.tokenId}`;
      const certificateURL = `${frontendURL}/certificate/${result.tokenId}`;

      // Generate QR code for certificate verification
      let qrData = null;
      try {
        const qrResult = await qrCodeService.generateCertificateQR(result.tokenId);
        if (qrResult.success) {
          qrData = qrResult.data;
        }
      } catch (qrError) {
        console.warn('QR code generation failed:', qrError);
        // Continue without QR code - not critical for certificate minting
      }

      // Send notifications (async, don't block response)
      const notificationPromises = [];

      // Send certificate to recipient if email provided
      if (recipientEmail) {
        notificationPromises.push(
          notificationService.sendCertificateDelivery(completeCertificateData, recipientEmail, qrData)
            .then(result => ({ type: 'recipient', result }))
            .catch(error => ({ type: 'recipient', error }))
        );
      }

      // Send confirmation to issuer if email provided
      if (issuerEmail) {
        notificationPromises.push(
          notificationService.sendIssuerNotification(completeCertificateData, issuerEmail)
            .then(result => ({ type: 'issuer', result }))
            .catch(error => ({ type: 'issuer', error }))
        );
      }

      // Process notifications in background
      if (notificationPromises.length > 0) {
        Promise.allSettled(notificationPromises)
          .then(results => {
            results.forEach(({ value }) => {
              if (value.error) {
                console.error(`${value.type} notification failed:`, value.error);
              } else {
                console.log(`${value.type} notification sent successfully:`, value.result.data?.messageId);
              }
            });
          })
          .catch(error => {
            console.error('Notification processing error:', error);
          });
      }

      // Return successful response
      res.status(201).json({
        success: true,
        data: {
          tokenId: result.tokenId,
          transactionHash: result.transactionHash,
          blockNumber: result.blockNumber,
          gasUsed: result.gasUsed,
          verificationURL,
          certificateURL,
          qrCodeURL: qrData?.qrImageURL || null,
          certificate: completeCertificateData,
          notifications: {
            recipientEmail: recipientEmail ? 'queued' : 'not_requested',
            issuerEmail: issuerEmail ? 'queued' : 'not_requested'
          }
        },
        message: 'Certificate minted successfully'
      });

    } catch (error) {
      console.error('Certificate minting error:', error);
      
      // Handle specific error types
      if (error.code === 'BLOCKCHAIN_ERROR') {
        return res.status(503).json({
          success: false,
          error: {
            code: 'BLOCKCHAIN_ERROR',
            message: 'Failed to mint certificate on blockchain',
            details: error.reason || error.message
          }
        });
      }
      
      if (error.code === 'NETWORK_ERROR') {
        return res.status(503).json({
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: 'Network connectivity issue',
            details: error.message
          }
        });
      }
      
      next(error);
    }
  }
);

/**
 * GET /issuer/:address
 * Get certificates issued by a specific address
 */
router.get('/issuer/:address',
  validate({ address: schemas.ethereumAddress }, 'params'),
  async (req, res, next) => {
    try {
      const { address } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      const certificates = await certificateService.getCertificatesByIssuer(
        address, 
        parseInt(limit)
      );
      
      // Apply offset for pagination
      const paginatedCertificates = certificates.slice(parseInt(offset));
      
      res.json({
        success: true,
        data: {
          certificates: paginatedCertificates,
          total: certificates.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          issuer: address
        }
      });
      
    } catch (error) {
      console.error('Get certificates by issuer error:', error);
      
      if (error.code === 'BLOCKCHAIN_ERROR') {
        return res.status(503).json({
          success: false,
          error: {
            code: 'BLOCKCHAIN_ERROR',
            message: 'Failed to retrieve certificates from blockchain',
            details: error.reason || error.message
          }
        });
      }
      
      next(error);
    }
  }
);

module.exports = router;