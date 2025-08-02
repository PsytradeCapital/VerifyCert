const express = require('express');
const { ethers } = require('ethers');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const router = express.Router();

// Load contract ABI and address
const contractABI = require('../../artifacts/contracts/Certificate.sol/Certificate.json').abi;
const contractAddresses = require('../../contract-addresses.json');

// Rate limiting for verification requests
const verifyRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 verification requests per minute
  message: {
    error: 'Too many verification requests, please try again later'
  }
});

// Validation schema for certificate verification
const verifyByIdSchema = Joi.object({
  tokenId: Joi.string()
    .pattern(/^\d+$/)
    .required()
    .messages({
      'string.pattern.base': 'Token ID must be a valid number'
    })
});

/**
 * @route GET /api/certificates/verify/:tokenId
 * @desc Verify a certificate by token ID
 * @access Public
 */
router.get('/verify/:tokenId', verifyRateLimit, async (req, res) => {
  try {
    const { tokenId } = req.params;

    // Validate token ID
    const { error } = verifyByIdSchema.validate({ tokenId });
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token ID format',
        details: error.details.map(detail => detail.message)
      });
    }

    // Initialize provider
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

    // Get contract instance
    const contractAddress = contractAddresses[process.env.NETWORK || 'mumbai'];
    if (!contractAddress) {
      return res.status(500).json({
        success: false,
        error: 'Contract not deployed on this network'
      });
    }

    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    // Check if certificate exists
    let certificateExists = false;
    try {
      const totalSupply = await contract.totalSupply();
      certificateExists = parseInt(tokenId) < parseInt(totalSupply.toString());
    } catch (error) {
      console.error('Error checking certificate existence:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to verify certificate existence'
      });
    }

    if (!certificateExists) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found',
        data: {
          isValid: false,
          exists: false
        }
      });
    }

    // Get certificate data
    const certificateData = await contract.getCertificate(tokenId);
    const isValid = await contract.isValidCertificate(tokenId);
    const owner = await contract.ownerOf(tokenId);

    // Get token URI for metadata
    let tokenURI = '';
    try {
      tokenURI = await contract.tokenURI(tokenId);
    } catch (error) {
      console.log('Token URI not available:', error.message);
    }

    // Format certificate data
    const certificate = {
      tokenId: tokenId,
      recipientName: certificateData.recipientName,
      courseName: certificateData.courseName,
      institutionName: certificateData.institutionName,
      issueDate: parseInt(certificateData.issueDate.toString()),
      issuer: certificateData.issuer,
      owner: owner,
      isRevoked: certificateData.isRevoked,
      tokenURI: tokenURI
    };

    // Get blockchain proof
    const blockchainProof = {
      contractAddress: contractAddress,
      network: process.env.NETWORK || 'mumbai',
      chainId: process.env.CHAIN_ID || '80001'
    };

    // Try to get transaction hash from events (optional)
    try {
      const filter = contract.filters.CertificateIssued(tokenId);
      const events = await contract.queryFilter(filter, 0, 'latest');
      if (events.length > 0) {
        blockchainProof.transactionHash = events[0].transactionHash;
        blockchainProof.blockNumber = events[0].blockNumber;
      }
    } catch (error) {
      console.log('Could not retrieve transaction details:', error.message);
    }

    res.json({
      success: true,
      message: isValid ? 'Certificate verified successfully' : 'Certificate is not valid',
      data: {
        certificate,
        isValid,
        blockchainProof,
        verificationDetails: {
          verifiedAt: new Date().toISOString(),
          message: isValid 
            ? 'This certificate is authentic and has been verified on the blockchain.'
            : certificateData.isRevoked 
              ? 'This certificate has been revoked by the issuer.'
              : 'This certificate is not valid.',
          exists: true
        }
      }
    });

  } catch (error) {
    console.error('Certificate verification error:', error);

    // Handle specific contract errors
    if (error.code === 'CALL_EXCEPTION') {
      return res.status(400).json({
        success: false,
        error: 'Contract call failed',
        details: error.reason || 'Invalid certificate ID'
      });
    }

    if (error.code === 'NETWORK_ERROR') {
      return res.status(503).json({
        success: false,
        error: 'Network error, please try again later'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route POST /api/certificates/verify-file
 * @desc Verify a certificate by uploaded file
 * @access Public
 */
router.post('/verify-file', verifyRateLimit, async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.files || !req.files.certificate) {
      return res.status(400).json({
        success: false,
        error: 'No certificate file uploaded'
      });
    }

    const file = req.files.certificate;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/json'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file type. Only PDF, PNG, JPG, and JSON files are supported.'
      });
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 10MB.'
      });
    }

    let tokenId = null;

    // Extract token ID from file based on type
    if (file.mimetype === 'application/json') {
      try {
        const fileContent = file.data.toString('utf8');
        const jsonData = JSON.parse(fileContent);
        
        // Look for token ID in various possible fields
        tokenId = jsonData.tokenId || jsonData.id || jsonData.certificateId;
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid JSON file format'
        });
      }
    } else {
      // For PDF/image files, we would need OCR or QR code reading
      // For now, return an error asking for JSON format or manual ID entry
      return res.status(400).json({
        success: false,
        error: 'File verification currently supports JSON files only. Please use the ID verification method for other file types.'
      });
    }

    if (!tokenId) {
      return res.status(400).json({
        success: false,
        error: 'Could not extract certificate ID from file'
      });
    }

    // Redirect to ID verification
    req.params.tokenId = tokenId.toString();
    return router.handle(req, res);

  } catch (error) {
    console.error('File verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process certificate file'
    });
  }
});

/**
 * @route POST /api/certificates/verify-batch
 * @desc Verify multiple certificates in batch
 * @access Public
 */
router.post('/verify-batch', verifyRateLimit, async (req, res) => {
  try {
    const { tokenIds } = req.body;

    if (!Array.isArray(tokenIds) || tokenIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Token IDs array is required and must not be empty'
      });
    }

    if (tokenIds.length > 20) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 20 certificates can be verified in a single batch'
      });
    }

    // Validate each token ID
    const validationErrors = [];
    tokenIds.forEach((tokenId, index) => {
      const { error } = verifyByIdSchema.validate({ tokenId: tokenId.toString() });
      if (error) {
        validationErrors.push({
          index,
          tokenId,
          error: 'Invalid token ID format'
        });
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation errors in batch',
        details: validationErrors
      });
    }

    const results = [];
    const errors = [];

    // Process each certificate
    for (let i = 0; i < tokenIds.length; i++) {
      try {
        // This is a simplified approach - in production, you'd optimize this
        const result = await verifySingleCertificate(tokenIds[i].toString());
        results.push({
          index: i,
          tokenId: tokenIds[i],
          success: true,
          ...result
        });

      } catch (error) {
        errors.push({
          index: i,
          tokenId: tokenIds[i],
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Batch verification completed. ${results.length} successful, ${errors.length} failed.`,
      data: {
        successful: results,
        failed: errors,
        summary: {
          total: tokenIds.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });

  } catch (error) {
    console.error('Batch verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during batch verification'
    });
  }
});

// Helper function for single certificate verification (used in batch)
async function verifySingleCertificate(tokenId) {
  // Initialize provider
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const contractAddress = contractAddresses[process.env.NETWORK || 'mumbai'];
  const contract = new ethers.Contract(contractAddress, contractABI, provider);

  // Get certificate data
  const certificateData = await contract.getCertificate(tokenId);
  const isValid = await contract.isValidCertificate(tokenId);
  const owner = await contract.ownerOf(tokenId);

  return {
    certificate: {
      tokenId: tokenId,
      recipientName: certificateData.recipientName,
      courseName: certificateData.courseName,
      institutionName: certificateData.institutionName,
      issueDate: parseInt(certificateData.issueDate.toString()),
      issuer: certificateData.issuer,
      owner: owner,
      isRevoked: certificateData.isRevoked
    },
    isValid,
    blockchainProof: {
      contractAddress: contractAddress,
      network: process.env.NETWORK || 'mumbai',
      chainId: process.env.CHAIN_ID || '80001'
    }
  };
}

module.exports = router;