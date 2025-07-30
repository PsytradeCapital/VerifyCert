const express = require('express');
const { ethers } = require('ethers');
const rateLimit = require('express-rate-limit');
const { param, validationResult } = require('express-validator');
const NodeCache = require('node-cache');

const router = express.Router();

// Cache for verification results (5 minute TTL)
const verificationCache = new NodeCache({ stdTTL: 300 });

// Rate limiting for verification requests
const verifyRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per minute
  message: {
    error: 'Too many verification requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Load contract configuration
const loadContractConfig = () => {
  try {
    const contractAddresses = require('../contract-addresses.json');
    const contractABI = require('../artifacts/contracts/Certificate.sol/Certificate.json');
    
    return {
      address: contractAddresses.Certificate,
      abi: contractABI.abi
    };
  } catch (error) {
    throw new Error('Failed to load contract configuration: ' + error.message);
  }
};

// Initialize provider and contract
let provider;
let certificateContract;

const initializeContract = () => {
  try {
    const contractConfig = loadContractConfig();
    provider = new ethers.JsonRpcProvider(process.env.POLYGON_MUMBAI_RPC_URL);
    certificateContract = new ethers.Contract(
      contractConfig.address,
      contractConfig.abi,
      provider
    );
  } catch (error) {
    console.error('Failed to initialize contract:', error);
    throw error;
  }
};

// Initialize contract on module load
initializeContract();

// Validation middleware
const validateCertificateHash = [
  param('hash')
    .isLength({ min: 1, max: 128 })
    .matches(/^[a-fA-F0-9]+$/)
    .withMessage('Invalid certificate hash format')
];

// Format certificate data for response
const formatCertificateData = (certificateData, tokenId, verificationStatus) => {
  return {
    tokenId: tokenId.toString(),
    recipientName: certificateData.recipientName,
    courseName: certificateData.courseName,
    institutionName: certificateData.institutionName,
    issueDate: certificateData.issueDate.toString(),
    expiryDate: certificateData.expiryDate.toString(),
    isRevoked: certificateData.isRevoked,
    issuer: certificateData.issuer,
    certificateHash: certificateData.certificateHash,
    metadataURI: certificateData.metadataURI,
    ...verificationStatus,
    verificationTimestamp: Math.floor(Date.now() / 1000),
    blockchainNetwork: 'Polygon Mumbai Testnet'
  };
};

// Get detailed verification status
const getVerificationStatus = (certificateData) => {
  const now = Math.floor(Date.now() / 1000);
  const isRevoked = certificateData.isRevoked;
  const isExpired = certificateData.expiryDate > 0 && now > certificateData.expiryDate;
  const isValid = !isRevoked && !isExpired;

  return {
    isValid,
    isRevoked,
    isExpired,
    status: isRevoked ? 'revoked' : isExpired ? 'expired' : isValid ? 'valid' : 'unknown',
    statusMessage: isRevoked 
      ? 'This certificate has been revoked by the issuer'
      : isExpired 
        ? 'This certificate has expired'
        : isValid 
          ? 'This certificate is valid and authentic'
          : 'Certificate status unknown'
  };
};

/**
 * @route GET /api/certificates/verify/:hash
 * @desc Verify a certificate by its hash
 * @access Public
 */
router.get('/verify/:hash', verifyRateLimit, validateCertificateHash, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid certificate hash',
        details: errors.array()
      });
    }

    const { hash } = req.params;
    const cacheKey = `verify_${hash}`;

    // Check cache first
    const cachedResult = verificationCache.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        cached: true
      });
    }

    // Verify certificate exists and get detailed status
    const verificationResult = await certificateContract.verifyCertificateByHash(hash);
    const [exists, tokenId, isValid, isExpired, isRevoked] = verificationResult;

    if (!exists) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found',
        message: 'No certificate found with the provided hash'
      });
    }

    // Get full certificate data
    const certificateData = await certificateContract.getCertificate(tokenId);
    
    // Get verification status
    const verificationStatus = {
      isValid,
      isExpired,
      isRevoked,
      status: isRevoked ? 'revoked' : isExpired ? 'expired' : isValid ? 'valid' : 'unknown',
      statusMessage: isRevoked 
        ? 'This certificate has been revoked by the issuer'
        : isExpired 
          ? 'This certificate has expired'
          : isValid 
            ? 'This certificate is valid and authentic'
            : 'Certificate status unknown'
    };

    // Format response data
    const formattedData = formatCertificateData(certificateData, tokenId, verificationStatus);

    // Cache the result
    verificationCache.set(cacheKey, formattedData);

    res.json({
      success: true,
      data: formattedData,
      cached: false
    });

  } catch (error) {
    console.error('Certificate verification error:', error);

    // Handle specific contract errors
    if (error.code === 'CALL_EXCEPTION') {
      return res.status(400).json({
        success: false,
        error: 'Contract call failed',
        message: 'Unable to verify certificate on blockchain',
        details: error.reason
      });
    }

    // Handle network errors
    if (error.code === 'NETWORK_ERROR') {
      return res.status(503).json({
        success: false,
        error: 'Network error',
        message: 'Unable to connect to the blockchain network'
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Verification failed',
      message: 'An unexpected error occurred during certificate verification',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

/**
 * @route GET /api/certificates/verify/:hash/metadata
 * @desc Get certificate metadata
 * @access Public
 */
router.get('/verify/:hash/metadata', verifyRateLimit, validateCertificateHash, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid certificate hash',
        details: errors.array()
      });
    }

    const { hash } = req.params;

    // Verify certificate exists
    const verificationResult = await certificateContract.verifyCertificateByHash(hash);
    const [exists, tokenId] = verificationResult;

    if (!exists) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
      });
    }

    // Get certificate data
    const certificateData = await certificateContract.getCertificate(tokenId);
    
    // Create OpenGraph metadata for social sharing
    const metadata = {
      title: `${certificateData.courseName} Certificate`,
      description: `Certificate of completion for ${certificateData.courseName} issued by ${certificateData.institutionName} to ${certificateData.recipientName}`,
      image: `${req.protocol}://${req.get('host')}/api/certificates/verify/${hash}/image`,
      url: `${req.protocol}://${req.get('host')}/verify/${hash}`,
      type: 'website',
      siteName: 'VerifyCert',
      certificate: {
        recipient: certificateData.recipientName,
        course: certificateData.courseName,
        institution: certificateData.institutionName,
        issueDate: new Date(parseInt(certificateData.issueDate) * 1000).toISOString(),
        tokenId: tokenId.toString()
      }
    };

    res.json({
      success: true,
      data: metadata
    });

  } catch (error) {
    console.error('Metadata retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve certificate metadata',
      message: error.message
    });
  }
});

/**
 * @route GET /api/certificates/verify/:hash/image
 * @desc Generate certificate image for social sharing
 * @access Public
 */
router.get('/verify/:hash/image', async (req, res) => {
  try {
    const { hash } = req.params;

    // For now, return a placeholder image URL
    // In production, you would generate an actual certificate image
    const placeholderImageUrl = `https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=VerifyCert+Certificate`;
    
    res.redirect(placeholderImageUrl);

  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate certificate image'
    });
  }
});

/**
 * @route POST /api/certificates/verify/batch
 * @desc Verify multiple certificates at once
 * @access Public
 */
router.post('/batch', verifyRateLimit, async (req, res) => {
  try {
    const { hashes } = req.body;

    if (!Array.isArray(hashes) || hashes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'Hashes array is required'
      });
    }

    if (hashes.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Too many hashes',
        message: 'Maximum 10 certificates can be verified at once'
      });
    }

    const results = [];

    for (const hash of hashes) {
      try {
        const cacheKey = `verify_${hash}`;
        let result = verificationCache.get(cacheKey);

        if (!result) {
          const verificationResult = await certificateContract.verifyCertificateByHash(hash);
          const [exists, tokenId, isValid, isExpired, isRevoked] = verificationResult;

          if (exists) {
            const certificateData = await certificateContract.getCertificate(tokenId);
            const verificationStatus = {
              isValid,
              isExpired,
              isRevoked,
              status: isRevoked ? 'revoked' : isExpired ? 'expired' : isValid ? 'valid' : 'unknown'
            };
            result = formatCertificateData(certificateData, tokenId, verificationStatus);
            verificationCache.set(cacheKey, result);
          }
        }

        results.push({
          hash,
          success: !!result,
          data: result || null,
          error: result ? null : 'Certificate not found'
        });

      } catch (error) {
        results.push({
          hash,
          success: false,
          data: null,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: results,
      summary: {
        total: hashes.length,
        verified: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });

  } catch (error) {
    console.error('Batch verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Batch verification failed',
      message: error.message
    });
  }
});

/**
 * @route GET /api/certificates/verify/stats
 * @desc Get verification statistics
 * @access Public
 */
router.get('/stats', async (req, res) => {
  try {
    // Get total supply of certificates
    const totalSupply = await certificateContract.totalSupply();
    
    // Get cache statistics
    const cacheStats = verificationCache.getStats();

    res.json({
      success: true,
      data: {
        totalCertificates: totalSupply.toString(),
        cacheHits: cacheStats.hits,
        cacheMisses: cacheStats.misses,
        cacheKeys: cacheStats.keys,
        network: 'Polygon Mumbai Testnet',
        contractAddress: certificateContract.target || certificateContract.address
      }
    });

  } catch (error) {
    console.error('Stats retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics',
      message: error.message
    });
  }
});

module.exports = router;