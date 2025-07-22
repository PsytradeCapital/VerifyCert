const express = require('express');
const CertificateService = require('../services/CertificateService');
const { validate, schemas } = require('../middleware/validation');
const router = express.Router();

// Initialize certificate service
const certificateService = new CertificateService();

/**
 * POST /verify/:tokenId
 * Verify certificate authenticity and return certificate data
 */
router.post('/verify/:tokenId',
  validate({ tokenId: schemas.tokenId }, 'params'),
  async (req, res, next) => {
    try {
      const { tokenId } = req.params;
      
      console.log('Verifying certificate:', tokenId);

      // Get certificate data and verify authenticity in parallel
      const [certificate, isValid] = await Promise.all([
        certificateService.getCertificate(tokenId).catch(() => null),
        certificateService.verifyCertificate(tokenId)
      ]);

      // If certificate doesn't exist or is invalid
      if (!certificate || !isValid) {
        return res.status(404).json({
          success: false,
          data: {
            isValid: false,
            verificationTimestamp: new Date().toISOString(),
            blockchainVerified: false
          },
          error: {
            code: 'CERTIFICATE_INVALID',
            message: 'Certificate not found or invalid'
          }
        });
      }

      // Certificate is valid and exists
      res.json({
        success: true,
        data: {
          isValid: true,
          certificate,
          verificationTimestamp: new Date().toISOString(),
          blockchainVerified: true,
          verificationDetails: {
            tokenId: certificate.tokenId,
            issuer: certificate.issuer,
            recipient: certificate.recipient,
            issueDate: certificate.issueDate,
            isRevoked: !certificate.isValid
          }
        },
        message: 'Certificate is valid and authentic'
      });

    } catch (error) {
      console.error('Certificate verification error:', error);
      
      // Handle specific error types
      if (error.code === 'CERTIFICATE_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          data: {
            isValid: false,
            verificationTimestamp: new Date().toISOString(),
            blockchainVerified: false
          },
          error: {
            code: 'CERTIFICATE_NOT_FOUND',
            message: 'Certificate not found'
          }
        });
      }

      if (error.code === 'BLOCKCHAIN_ERROR') {
        return res.status(503).json({
          success: false,
          data: {
            isValid: false,
            verificationTimestamp: new Date().toISOString(),
            blockchainVerified: false
          },
          error: {
            code: 'BLOCKCHAIN_ERROR',
            message: 'Failed to verify certificate on blockchain',
            details: error.reason || error.message
          }
        });
      }

      // Generic verification failure
      res.status(500).json({
        success: false,
        data: {
          isValid: false,
          verificationTimestamp: new Date().toISOString(),
          blockchainVerified: false
        },
        error: {
          code: 'VERIFICATION_FAILED',
          message: 'Unable to verify certificate authenticity',
          details: error.message
        }
      });
    }
  }
);

/**
 * GET /verify/:tokenId
 * Get certificate verification status (alternative endpoint for GET requests)
 */
router.get('/verify/:tokenId',
  validate({ tokenId: schemas.tokenId }, 'params'),
  async (req, res, next) => {
    try {
      const { tokenId } = req.params;
      
      console.log('Getting certificate verification status:', tokenId);

      // Get certificate data and verify authenticity
      const [certificate, isValid] = await Promise.all([
        certificateService.getCertificate(tokenId).catch(() => null),
        certificateService.verifyCertificate(tokenId)
      ]);

      if (!certificate) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CERTIFICATE_NOT_FOUND',
            message: 'Certificate not found'
          }
        });
      }

      // Return certificate data with verification status
      res.json({
        success: true,
        data: {
          certificate,
          verification: {
            isValid,
            blockchainVerified: true,
            verificationTimestamp: new Date().toISOString()
          }
        }
      });

    } catch (error) {
      console.error('Get certificate verification error:', error);
      next(error);
    }
  }
);

/**
 * POST /batch-verify
 * Verify multiple certificates in batch
 */
router.post('/batch-verify',
  async (req, res, next) => {
    try {
      const { tokenIds } = req.body;

      // Validate input
      if (!Array.isArray(tokenIds) || tokenIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Token IDs array is required and must not be empty'
          }
        });
      }

      if (tokenIds.length > 50) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Maximum 50 certificates can be verified in a single batch'
          }
        });
      }

      console.log(`Batch verifying ${tokenIds.length} certificates`);

      const results = [];

      // Process each certificate
      for (const tokenId of tokenIds) {
        try {
          // Validate token ID format
          const { error } = schemas.tokenId.validate(tokenId);
          if (error) {
            results.push({
              tokenId,
              success: false,
              error: 'Invalid token ID format'
            });
            continue;
          }

          // Verify certificate
          const [certificate, isValid] = await Promise.all([
            certificateService.getCertificate(tokenId).catch(() => null),
            certificateService.verifyCertificate(tokenId)
          ]);

          results.push({
            tokenId,
            success: true,
            isValid: isValid && certificate !== null,
            certificate: certificate || null,
            verificationTimestamp: new Date().toISOString()
          });

        } catch (error) {
          console.error(`Failed to verify certificate ${tokenId}:`, error);
          results.push({
            tokenId,
            success: false,
            error: error.message
          });
        }
      }

      const successfulVerifications = results.filter(r => r.success).length;
      const validCertificates = results.filter(r => r.success && r.isValid).length;

      res.json({
        success: true,
        data: {
          totalRequested: tokenIds.length,
          successful: successfulVerifications,
          valid: validCertificates,
          invalid: successfulVerifications - validCertificates,
          failed: tokenIds.length - successfulVerifications,
          results
        },
        message: `Batch verification completed: ${validCertificates} valid, ${successfulVerifications - validCertificates} invalid, ${tokenIds.length - successfulVerifications} failed`
      });

    } catch (error) {
      console.error('Batch verification error:', error);
      next(error);
    }
  }
);

/**
 * GET /certificate/:tokenId/status
 * Get detailed certificate status including blockchain information
 */
router.get('/certificate/:tokenId/status',
  validate({ tokenId: schemas.tokenId }, 'params'),
  async (req, res, next) => {
    try {
      const { tokenId } = req.params;
      
      console.log('Getting detailed certificate status:', tokenId);

      // Get certificate data
      const certificate = await certificateService.getCertificate(tokenId);
      
      // Verify certificate
      const isValid = await certificateService.verifyCertificate(tokenId);
      
      // Get network information
      const networkInfo = await certificateService.getNetworkInfo();

      res.json({
        success: true,
        data: {
          certificate,
          status: {
            exists: true,
            isValid,
            isRevoked: !certificate.isValid,
            verificationTimestamp: new Date().toISOString()
          },
          blockchain: {
            network: networkInfo.name,
            chainId: networkInfo.chainId,
            contractAddress: networkInfo.contractAddress,
            blockNumber: networkInfo.blockNumber
          },
          verification: {
            verificationUrl: `${req.protocol}://${req.get('host')}/verify/${tokenId}`,
            qrCodeUrl: `${req.protocol}://${req.get('host')}/api/v1/qr-code/${tokenId}`
          }
        }
      });

    } catch (error) {
      console.error('Get certificate status error:', error);
      
      if (error.code === 'CERTIFICATE_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          data: {
            status: {
              exists: false,
              isValid: false,
              verificationTimestamp: new Date().toISOString()
            }
          },
          error: {
            code: 'CERTIFICATE_NOT_FOUND',
            message: 'Certificate not found'
          }
        });
      }
      
      next(error);
    }
  }
);

module.exports = router;