const express = require('express');
const { ethers } = require('ethers');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const router = express.Router();

// Import contract ABI and configuration
const certificateABI = require('../../artifacts/contracts/Certificate.sol/Certificate.json').abi;
const contractAddresses = require('../../contract-addresses.json');

// Validation schemas
const verifyByIdSchema = Joi.object({
  certificateId: Joi.string()
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Certificate ID must be a valid number',
      'any.required': 'Certificate ID is required'
    })
});

const verifyByHashSchema = Joi.object({
  metadataHash: Joi.string()
    .length(64)
    .pattern(/^[a-fA-F0-9]+$/)
    .required()
    .messages({
      'string.length': 'Metadata hash must be 64 characters long',
      'string.pattern.base': 'Invalid metadata hash format',
      'any.required': 'Metadata hash is required'
    })
});

// Rate limiting for verification requests
const verifyRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 verification requests per windowMs
  message: {
    error: 'Too many verification requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware
router.use(helmet());

// Initialize blockchain connection
const initializeProvider = () => {
  const rpcUrl = process.env.POLYGON_MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com/';
  return new ethers.JsonRpcProvider(rpcUrl);
};

// Generate verification URL for certificate
const generateVerificationUrl = (tokenId) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  return `${baseUrl}/verify/${tokenId}`;
};

// Format certificate data for response
const formatCertificateData = (certificateData, tokenId, verificationDetails) => {
  return {
    tokenId,
    recipientName: certificateData.recipientName,
    courseName: certificateData.courseName,
    institutionName: certificateData.institutionName,
    issueDate: certificateData.issueDate,
    issuer: certificateData.issuer,
    recipient: null, // Don't expose recipient address in public verification
    isRevoked: certificateData.isRevoked,
    metadataHash: certificateData.metadataHash,
    verificationUrl: generateVerificationUrl(tokenId),
    qrCodeURL: `${process.env.FRONTEND_URL}/api/qr-code/${tokenId}`,
    isValid: !certificateData.isRevoked,
    ...verificationDetails
  };
};

/**
 * @route GET /api/verify-certificate/:id
 * @desc Verify certificate by token ID
 * @access Public
 */
router.get('/:id', verifyRateLimit, async (req, res) => {
  try {
    const { error, value } = verifyByIdSchema.validate({ certificateId: req.params.id });
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid certificate ID',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    const { certificateId } = value;
    const tokenId = certificateId;

    // Initialize blockchain connection
    const provider = initializeProvider();
    const contractAddress = contractAddresses.Certificate;
    
    if (!contractAddress) {
      return res.status(500).json({
        success: false,
        error: 'Contract not deployed',
        message: 'Certificate contract address not found'
      });
    }

    const contract = new ethers.Contract(contractAddress, certificateABI, provider);

    // Check if certificate exists
    let certificateExists;
    try {
      certificateExists = await contract.isValidCertificate(tokenId);
    } catch (error) {
      console.error('Error checking certificate existence:', error);
      return res.status(404).json({
        success: false,
        error: 'Certificate not found',
        message: `Certificate with ID ${tokenId} does not exist`
      });
    }

    if (!certificateExists) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found',
        message: `Certificate with ID ${tokenId} does not exist or has been revoked`
      });
    }

    // Get certificate data
    let certificateData;
    try {
      certificateData = await contract.getCertificate(tokenId);
    } catch (error) {
      console.error('Error fetching certificate data:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch certificate data',
        message: 'Unable to retrieve certificate information from blockchain'
      });
    }

    // Get additional verification details
    const network = await provider.getNetwork();
    const currentBlock = await provider.getBlockNumber();
    
    // Get token owner
    let tokenOwner;
    try {
      tokenOwner = await contract.ownerOf(tokenId);
    } catch (error) {
      console.error('Error getting token owner:', error);
      tokenOwner = null;
    }

    const verificationDetails = {
      verification: {
        timestamp: new Date().toISOString(),
        network: `Polygon Mumbai (Chain ID: ${network.chainId})`,
        contractAddress,
        blockNumber: currentBlock,
        verifiedBy: 'VerifyCert System'
      },
      recipient: tokenOwner
    };

    // Format and return certificate data
    const formattedCertificate = formatCertificateData(certificateData, tokenId, verificationDetails);

    // Determine verification status
    const isValid = !certificateData.isRevoked;
    const message = isValid 
      ? 'Certificate verified successfully' 
      : 'Certificate has been revoked and is no longer valid';

    res.json({
      success: true,
      isValid,
      message,
      certificate: formattedCertificate,
      verificationDetails
    });

  } catch (error) {
    console.error('Certificate verification failed:', error);
    
    // Handle specific error types
    if (error.code === 'NETWORK_ERROR') {
      return res.status(503).json({
        success: false,
        error: 'Network error',
        message: 'Unable to connect to blockchain network. Please try again later.'
      });
    }

    if (error.code === 'TIMEOUT') {
      return res.status(504).json({
        success: false,
        error: 'Request timeout',
        message: 'Blockchain request timed out. Please try again.'
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Verification failed',
      message: error.message || 'An unexpected error occurred during certificate verification',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

/**
 * @route POST /api/verify-certificate/file
 * @desc Verify certificate from uploaded file
 * @access Public
 */
router.post('/file', verifyRateLimit, async (req, res) => {
  try {
    // Handle file upload (assuming multer middleware is configured)
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
        message: 'Please upload a certificate file'
      });
    }

    const file = req.file;
    let certificateData;

    // Parse certificate file based on type
    if (file.mimetype === 'application/json') {
      try {
        const fileContent = file.buffer.toString('utf8');
        certificateData = JSON.parse(fileContent);
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid JSON file',
          message: 'Unable to parse certificate JSON file'
        });
      }
    } else if (file.mimetype === 'application/pdf') {
      // For PDF files, we would need to extract metadata
      // This is a simplified implementation
      return res.status(400).json({
        success: false,
        error: 'PDF verification not implemented',
        message: 'PDF certificate verification is not yet supported. Please use JSON format or certificate ID.'
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Unsupported file type',
        message: 'Only JSON and PDF certificate files are supported'
      });
    }

    // Extract certificate ID or metadata hash from file
    const tokenId = certificateData.tokenId || certificateData.id;
    const metadataHash = certificateData.metadataHash;

    if (!tokenId && !metadataHash) {
      return res.status(400).json({
        success: false,
        error: 'Invalid certificate file',
        message: 'Certificate file must contain either tokenId or metadataHash'
      });
    }

    // If we have a token ID, verify by ID
    if (tokenId) {
      // Redirect to ID verification
      req.params.id = tokenId.toString();
      return router.handle(req, res);
    }

    // If we have metadata hash, verify by hash
    if (metadataHash) {
      const { error, value } = verifyByHashSchema.validate({ metadataHash });
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid metadata hash',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      // Initialize blockchain connection
      const provider = initializeProvider();
      const contractAddress = contractAddresses.Certificate;
      const contract = new ethers.Contract(contractAddress, certificateABI, provider);

      // This would require additional contract methods to verify by hash
      // For now, return an error
      return res.status(501).json({
        success: false,
        error: 'Hash verification not implemented',
        message: 'Verification by metadata hash is not yet implemented. Please use certificate ID.'
      });
    }

  } catch (error) {
    console.error('File verification failed:', error);
    res.status(500).json({
      success: false,
      error: 'File verification failed',
      message: error.message || 'An unexpected error occurred during file verification'
    });
  }
});

/**
 * @route POST /api/verify-certificate/hash
 * @desc Verify certificate by metadata hash
 * @access Public
 */
router.post('/hash', verifyRateLimit, async (req, res) => {
  try {
    const { error, value } = verifyByHashSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    const { metadataHash } = value;

    // Initialize blockchain connection
    const provider = initializeProvider();
    const contractAddress = contractAddresses.Certificate;
    const contract = new ethers.Contract(contractAddress, certificateABI, provider);

    // This would require scanning through certificates to find matching hash
    // For now, return not implemented
    res.status(501).json({
      success: false,
      error: 'Hash verification not implemented',
      message: 'Verification by metadata hash requires additional contract methods. Please use certificate ID for verification.'
    });

  } catch (error) {
    console.error('Hash verification failed:', error);
    res.status(500).json({
      success: false,
      error: 'Hash verification failed',
      message: error.message || 'An unexpected error occurred during hash verification'
    });
  }
});

/**
 * @route GET /api/verify-certificate/batch
 * @desc Verify multiple certificates by IDs
 * @access Public
 */
router.post('/batch', verifyRateLimit, async (req, res) => {
  try {
    const { certificateIds } = req.body;

    if (!Array.isArray(certificateIds) || certificateIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'certificateIds must be a non-empty array'
      });
    }

    if (certificateIds.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Too many certificates',
        message: 'Maximum 10 certificates can be verified in a single batch request'
      });
    }

    // Validate all certificate IDs
    const validationErrors = [];
    certificateIds.forEach((id, index) => {
      const { error } = verifyByIdSchema.validate({ certificateId: id.toString() });
      if (error) {
        validationErrors.push({
          index,
          id,
          error: error.details[0].message
        });
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Some certificate IDs are invalid',
        details: validationErrors
      });
    }

    // Initialize blockchain connection
    const provider = initializeProvider();
    const contractAddress = contractAddresses.Certificate;
    const contract = new ethers.Contract(contractAddress, certificateABI, provider);

    // Verify each certificate
    const results = [];
    for (const certificateId of certificateIds) {
      try {
        const tokenId = certificateId.toString();
        const isValid = await contract.isValidCertificate(tokenId);
        
        if (isValid) {
          const certificateData = await contract.getCertificate(tokenId);
          const formattedCertificate = formatCertificateData(certificateData, tokenId, {
            verification: {
              timestamp: new Date().toISOString(),
              method: 'batch_verification'
            }
          });
          
          results.push({
            certificateId: tokenId,
            success: true,
            isValid: !certificateData.isRevoked,
            certificate: formattedCertificate
          });
        } else {
          results.push({
            certificateId: tokenId,
            success: false,
            isValid: false,
            error: 'Certificate not found or revoked'
          });
        }
      } catch (error) {
        results.push({
          certificateId: certificateId.toString(),
          success: false,
          isValid: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success && r.isValid).length;
    const totalCount = results.length;

    res.json({
      success: true,
      message: `Verified ${successCount} out of ${totalCount} certificates`,
      summary: {
        total: totalCount,
        valid: successCount,
        invalid: totalCount - successCount
      },
      results
    });

  } catch (error) {
    console.error('Batch verification failed:', error);
    res.status(500).json({
      success: false,
      error: 'Batch verification failed',
      message: error.message || 'An unexpected error occurred during batch verification'
    });
  }
});

/**
 * @route GET /api/verify-certificate/stats
 * @desc Get verification statistics
 * @access Public
 */
router.get('/stats', async (req, res) => {
  try {
    // Initialize blockchain connection
    const provider = initializeProvider();
    const contractAddress = contractAddresses.Certificate;
    const contract = new ethers.Contract(contractAddress, certificateABI, provider);

    // Get total supply
    const totalSupply = await contract.totalSupply();
    
    // Get network info
    const network = await provider.getNetwork();
    const currentBlock = await provider.getBlockNumber();

    res.json({
      success: true,
      stats: {
        totalCertificates: totalSupply.toString(),
        contractAddress,
        network: {
          name: 'Polygon Mumbai',
          chainId: network.chainId.toString(),
          currentBlock
        },
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Failed to get verification stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
      message: error.message || 'Unable to retrieve verification statistics'
    });
  }
});

module.exports = router;