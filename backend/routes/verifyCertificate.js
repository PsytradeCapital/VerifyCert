const express = require('express');
const { ethers } = require('ethers');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Import contract ABI and configuration
const certificateABI = require('../../artifacts/contracts/Certificate.sol/Certificate.json').abi;
const contractAddresses = require('../../contract-addresses.json');

// Rate limiting for verification requests
const verifyRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 verification requests per minute
  message: {
    error: 'Too many verification requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schema for certificate verification
const verifySchema = Joi.object({
  tokenId: Joi.string()
    .pattern(/^\d+$/)
    .required()
    .messages({
      'string.pattern.base': 'Token ID must be a valid number',
      'any.required': 'Token ID is required'
    })
});

// Initialize blockchain provider and contract
let provider, contract;

const initializeBlockchain = () => {
  try {
    // Initialize provider (Polygon Mumbai testnet)
    provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    
    // Initialize contract instance (read-only)
    const contractAddress = contractAddresses.mumbai?.Certificate || contractAddresses.Certificate;
    if (!contractAddress) {
      throw new Error('Certificate contract address not found');
    }
    
    contract = new ethers.Contract(contractAddress, certificateABI, provider);
    
    console.log('Blockchain connection initialized for verification');
  } catch (error) {
    console.error('Failed to initialize blockchain connection:', error);
    throw error;
  }
};

// Initialize on module load
initializeBlockchain();

/**
 * Format certificate data for API response
 */
const formatCertificateData = (certificateData, tokenId) => {
  return {
    tokenId: tokenId.toString(),
    recipientName: certificateData.recipientName,
    courseName: certificateData.courseName,
    institutionName: certificateData.institutionName,
    issueDate: parseInt(certificateData.issueDate.toString()),
    issuer: certificateData.issuer,
    recipient: certificateData.recipient,
    isRevoked: certificateData.isRevoked,
    metadataHash: certificateData.metadataHash,
    verificationURL: `${process.env.FRONTEND_URL}/verify/${tokenId}`,
    qrCodeURL: `${process.env.BACKEND_URL}/api/qr-code/${tokenId}`
  };
};

/**
 * GET /api/verify-certificate/:tokenId
 * Verify a certificate by token ID
 */
router.get('/verify-certificate/:tokenId', verifyRateLimit, async (req, res) => {
  try {
    const { tokenId } = req.params;

    // Validate token ID
    const { error } = verifySchema.validate({ tokenId });
    if (error) {
      return res.status(400).json({
        error: 'Invalid token ID format',
        details: error.details[0].message,
        code: 'INVALID_TOKEN_ID'
      });
    }

    console.log(`Verifying certificate with token ID: ${tokenId}`);

    // Check if certificate exists
    let certificateExists;
    try {
      // This will throw if the token doesn't exist
      const owner = await contract.ownerOf(tokenId);
      certificateExists = owner !== ethers.ZeroAddress;
    } catch (error) {
      certificateExists = false;
    }

    if (!certificateExists) {
      return res.status(404).json({
        error: 'Certificate not found',
        message: 'No certificate exists with the provided token ID',
        code: 'CERTIFICATE_NOT_FOUND',
        status: 'invalid'
      });
    }

    // Get certificate data
    const certificateData = await contract.getCertificate(tokenId);
    
    // Check if certificate is valid (not revoked)
    const isValid = await contract.isValidCertificate(tokenId);
    
    // Determine verification status
    let status;
    if (certificateData.isRevoked) {
      status = 'revoked';
    } else if (isValid) {
      status = 'valid';
    } else {
      status = 'invalid';
    }

    // Format response
    const formattedCertificate = formatCertificateData(certificateData, tokenId);

    res.json({
      success: true,
      status,
      message: getStatusMessage(status),
      certificate: formattedCertificate,
      verification: {
        timestamp: new Date().toISOString(),
        blockchainNetwork: 'Polygon Mumbai',
        contractAddress: contract.target,
        verified: status === 'valid'
      }
    });

  } catch (error) {
    console.error('Certificate verification error:', error);

    // Handle specific blockchain errors
    if (error.code === 'NETWORK_ERROR') {
      return res.status(503).json({
        error: 'Blockchain network error',
        message: 'Unable to connect to the blockchain network. Please try again later.',
        code: 'NETWORK_ERROR'
      });
    }

    if (error.reason && error.reason.includes('does not exist')) {
      return res.status(404).json({
        error: 'Certificate not found',
        message: 'No certificate exists with the provided token ID',
        code: 'CERTIFICATE_NOT_FOUND',
        status: 'invalid'
      });
    }

    res.status(500).json({
      error: 'Internal server error during certificate verification',
      message: 'An unexpected error occurred while verifying the certificate',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/verify-certificate
 * Verify a certificate by token ID (alternative endpoint for POST requests)
 */
router.post('/verify-certificate', verifyRateLimit, async (req, res) => {
  try {
    const { tokenId } = req.body;

    // Validate request body
    const { error } = verifySchema.validate({ tokenId });
    if (error) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: error.details[0].message,
        code: 'VALIDATION_ERROR'
      });
    }

    // Redirect to GET endpoint logic
    req.params.tokenId = tokenId;
    return router.handle(
      { ...req, method: 'GET', url: `/verify-certificate/${tokenId}` },
      res
    );

  } catch (error) {
    console.error('Certificate verification error (POST):', error);
    res.status(500).json({
      error: 'Internal server error during certificate verification',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/certificate-status/:tokenId
 * Get basic certificate status without full details
 */
router.get('/certificate-status/:tokenId', verifyRateLimit, async (req, res) => {
  try {
    const { tokenId } = req.params;

    // Validate token ID
    const { error } = verifySchema.validate({ tokenId });
    if (error) {
      return res.status(400).json({
        error: 'Invalid token ID format',
        code: 'INVALID_TOKEN_ID'
      });
    }

    // Check if certificate exists and is valid
    const exists = await contract._exists ? await contract._exists(tokenId) : true;
    const isValid = exists ? await contract.isValidCertificate(tokenId) : false;
    const isRevoked = exists ? await contract.revokedCertificates(tokenId) : false;

    let status;
    if (!exists) {
      status = 'not_found';
    } else if (isRevoked) {
      status = 'revoked';
    } else if (isValid) {
      status = 'valid';
    } else {
      status = 'invalid';
    }

    res.json({
      tokenId,
      status,
      exists,
      isValid,
      isRevoked,
      message: getStatusMessage(status)
    });

  } catch (error) {
    console.error('Certificate status check error:', error);
    res.status(500).json({
      error: 'Failed to check certificate status',
      code: 'STATUS_CHECK_ERROR'
    });
  }
});

/**
 * GET /api/qr-code/:tokenId
 * Generate QR code for certificate verification
 */
router.get('/qr-code/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const QRCode = require('qrcode');

    // Validate token ID
    const { error } = verifySchema.validate({ tokenId });
    if (error) {
      return res.status(400).json({
        error: 'Invalid token ID format',
        code: 'INVALID_TOKEN_ID'
      });
    }

    // Generate verification URL
    const verificationURL = `${process.env.FRONTEND_URL}/verify/${tokenId}`;

    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(verificationURL, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Set appropriate headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

    // Convert data URL to buffer and send
    const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    res.send(buffer);

  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).json({
      error: 'Failed to generate QR code',
      code: 'QR_GENERATION_ERROR'
    });
  }
});

/**
 * GET /api/certificates/batch-verify
 * Verify multiple certificates at once
 */
router.post('/certificates/batch-verify', verifyRateLimit, async (req, res) => {
  try {
    const { tokenIds } = req.body;

    if (!Array.isArray(tokenIds) || tokenIds.length === 0) {
      return res.status(400).json({
        error: 'Token IDs array is required',
        code: 'INVALID_REQUEST'
      });
    }

    if (tokenIds.length > 10) {
      return res.status(400).json({
        error: 'Maximum 10 certificates can be verified at once',
        code: 'BATCH_SIZE_EXCEEDED'
      });
    }

    const results = [];

    for (const tokenId of tokenIds) {
      try {
        // Validate each token ID
        const { error } = verifySchema.validate({ tokenId: tokenId.toString() });
        if (error) {
          results.push({
            tokenId,
            status: 'invalid',
            error: 'Invalid token ID format'
          });
          continue;
        }

        // Check certificate
        const exists = await contract._exists ? await contract._exists(tokenId) : true;
        if (!exists) {
          results.push({
            tokenId,
            status: 'not_found',
            error: 'Certificate not found'
          });
          continue;
        }

        const isValid = await contract.isValidCertificate(tokenId);
        const isRevoked = await contract.revokedCertificates(tokenId);

        let status;
        if (isRevoked) {
          status = 'revoked';
        } else if (isValid) {
          status = 'valid';
        } else {
          status = 'invalid';
        }

        results.push({
          tokenId,
          status,
          message: getStatusMessage(status)
        });

      } catch (error) {
        results.push({
          tokenId,
          status: 'error',
          error: 'Verification failed'
        });
      }
    }

    res.json({
      success: true,
      results,
      summary: {
        total: results.length,
        valid: results.filter(r => r.status === 'valid').length,
        invalid: results.filter(r => r.status === 'invalid').length,
        revoked: results.filter(r => r.status === 'revoked').length,
        notFound: results.filter(r => r.status === 'not_found').length,
        errors: results.filter(r => r.status === 'error').length
      }
    });

  } catch (error) {
    console.error('Batch verification error:', error);
    res.status(500).json({
      error: 'Batch verification failed',
      code: 'BATCH_VERIFICATION_ERROR'
    });
  }
});

/**
 * Helper function to get status message
 */
function getStatusMessage(status) {
  switch (status) {
    case 'valid':
      return 'Certificate is authentic and valid';
    case 'revoked':
      return 'Certificate has been revoked by the issuer';
    case 'invalid':
      return 'Certificate is not valid or authentic';
    case 'not_found':
      return 'Certificate not found';
    default:
      return 'Unknown certificate status';
  }
}

/**
 * GET /api/contract-info
 * Get contract information for verification
 */
router.get('/contract-info', async (req, res) => {
  try {
    const contractAddress = contract.target;
    const totalSupply = await contract.totalSupply();
    const totalValid = await contract.totalValidCertificates();

    res.json({
      contractAddress,
      network: 'Polygon Mumbai',
      totalCertificates: totalSupply.toString(),
      validCertificates: totalValid.toString(),
      revokedCertificates: (totalSupply - totalValid).toString()
    });

  } catch (error) {
    console.error('Error getting contract info:', error);
    res.status(500).json({
      error: 'Failed to get contract information',
      code: 'CONTRACT_INFO_ERROR'
    });
  }
});

module.exports = router;