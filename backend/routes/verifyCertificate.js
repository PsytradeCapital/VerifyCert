const express = require('express');
const { ethers } = require('ethers');
const Joi = require('joi');
const router = express.Router();

// Import contract ABI and address
const contractABI = require('../../artifacts/contracts/Certificate.sol/Certificate.json').abi;
const contractAddresses = require('../contract-addresses.json');

// Validation schemas
const verifyByHashSchema = Joi.object({
  hash: Joi.string().length(64).hex().required()
    .messages({
      'string.length': 'Certificate hash must be 64 characters',
      'string.hex': 'Certificate hash must be hexadecimal'
    })
});

const verifyByTokenIdSchema = Joi.object({
  tokenId: Joi.number().integer().min(0).required()
    .messages({
      'number.min': 'Token ID must be non-negative'
    })
});

/**
 * @route GET /api/certificates/verify/:hash
 * @desc Verify certificate by hash
 * @access Public
 */
router.get('/verify/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    
    // Validate hash format
    const { error } = verifyByHashSchema.validate({ hash });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid certificate hash format',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Initialize provider
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    
    // Get contract instance
    const contractAddress = contractAddresses.Certificate;
    if (!contractAddress) {
      return res.status(500).json({
        success: false,
        message: 'Contract not deployed'
      });
    }
    
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    // Verify certificate by hash
    const [exists, tokenId, isValid, isExpired, isRevoked] = 
      await contract.verifyCertificateByHash(hash);

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
        data: {
          exists: false,
          isValid: false,
          isExpired: false,
          isRevoked: false,
          certificate: null
        }
      });
    }

    // Get certificate details
    const certificateData = await contract.certificates(tokenId);
    const ownerAddress = await contract.ownerOf(tokenId);
    
    // Format certificate data
    const certificate = {
      tokenId: tokenId.toString(),
      recipientName: certificateData.recipientName,
      recipientAddress: ownerAddress,
      courseName: certificateData.courseName,
      institutionName: certificateData.institutionName,
      issueDate: certificateData.issueDate.toString(),
      expiryDate: certificateData.expiryDate.toString(),
      isRevoked: certificateData.isRevoked,
      issuer: certificateData.issuer,
      certificateHash: certificateData.certificateHash,
      isValid,
      isExpired
    };

    res.json({
      success: true,
      message: 'Certificate verification completed',
      data: {
        exists: true,
        isValid,
        isExpired,
        isRevoked,
        certificate
      }
    });

  } catch (error) {
    console.error('Error verifying certificate:', error);
    
    if (error.code === 'NETWORK_ERROR') {
      return res.status(503).json({
        success: false,
        message: 'Blockchain network error. Please try again later.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during verification'
    });
  }
});

/**
 * @route GET /api/certificates/verify/token/:tokenId
 * @desc Verify certificate by token ID
 * @access Public
 */
router.get('/verify/token/:tokenId', async (req, res) => {
  try {
    const tokenId = parseInt(req.params.tokenId);
    
    // Validate token ID
    const { error } = verifyByTokenIdSchema.validate({ tokenId });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token ID format',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Initialize provider
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    
    // Get contract instance
    const contractAddress = contractAddresses.Certificate;
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    try {
      // Verify certificate exists
      const ownerAddress = await contract.ownerOf(tokenId);
      
      // Get verification status
      const [isValid, isExpired, isRevoked, certificateData] = 
        await contract.verifyCertificate(tokenId);

      // Format certificate data
      const certificate = {
        tokenId: tokenId.toString(),
        recipientName: certificateData.recipientName,
        recipientAddress: ownerAddress,
        courseName: certificateData.courseName,
        institutionName: certificateData.institutionName,
        issueDate: certificateData.issueDate.toString(),
        expiryDate: certificateData.expiryDate.toString(),
        isRevoked: certificateData.isRevoked,
        issuer: certificateData.issuer,
        certificateHash: certificateData.certificateHash,
        isValid,
        isExpired
      };

      res.json({
        success: true,
        message: 'Certificate verification completed',
        data: {
          exists: true,
          isValid,
          isExpired,
          isRevoked,
          certificate
        }
      });

    } catch (tokenError) {
      if (tokenError.reason === 'ERC721: invalid token ID') {
        return res.status(404).json({
          success: false,
          message: 'Certificate not found',
          data: {
            exists: false,
            isValid: false,
            isExpired: false,
            isRevoked: false,
            certificate: null
          }
        });
      }
      throw tokenError;
    }

  } catch (error) {
    console.error('Error verifying certificate by token ID:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during verification'
    });
  }
});

/**
 * @route GET /api/certificates/issuer/:address
 * @desc Get certificates issued by a specific address
 * @access Public
 */
router.get('/issuer/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { offset = 0, limit = 10 } = req.query;

    // Validate issuer address
    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issuer address format'
      });
    }

    // Validate pagination parameters
    const offsetNum = parseInt(offset);
    const limitNum = parseInt(limit);

    if (isNaN(offsetNum) || offsetNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid offset parameter'
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid limit parameter (must be between 1 and 100)'
      });
    }

    // Initialize provider
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    
    // Get contract instance
    const contractAddress = contractAddresses.Certificate;
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    // Get certificates by issuer
    const [tokenIds, hasMore] = await contract.getCertificatesByIssuer(
      address,
      offsetNum,
      limitNum
    );

    // Get detailed certificate data
    const certificates = [];
    for (const tokenId of tokenIds) {
      try {
        const certificateData = await contract.certificates(tokenId);
        const ownerAddress = await contract.ownerOf(tokenId);
        
        // Get verification status
        const [isValid, isExpired, isRevoked] = await contract.verifyCertificate(tokenId);

        certificates.push({
          tokenId: tokenId.toString(),
          recipientName: certificateData.recipientName,
          recipientAddress: ownerAddress,
          courseName: certificateData.courseName,
          institutionName: certificateData.institutionName,
          issueDate: certificateData.issueDate.toString(),
          expiryDate: certificateData.expiryDate.toString(),
          isRevoked: certificateData.isRevoked,
          issuer: certificateData.issuer,
          certificateHash: certificateData.certificateHash,
          isValid,
          isExpired
        });
      } catch (certError) {
        console.error(`Error fetching certificate ${tokenId}:`, certError);
        // Continue with other certificates
      }
    }

    res.json({
      success: true,
      message: 'Certificates retrieved successfully',
      data: {
        certificates,
        pagination: {
          offset: offsetNum,
          limit: limitNum,
          hasMore,
          count: certificates.length
        },
        issuer: address
      }
    });

  } catch (error) {
    console.error('Error getting certificates by issuer:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving certificates'
    });
  }
});

/**
 * @route GET /api/certificates/stats
 * @desc Get certificate statistics
 * @access Public
 */
router.get('/stats', async (req, res) => {
  try {
    // Initialize provider
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    
    // Get contract instance
    const contractAddress = contractAddresses.Certificate;
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    // Get total supply
    const totalSupply = await contract.totalSupply();

    // For more detailed stats, we would need to iterate through certificates
    // This is a basic implementation
    res.json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: {
        totalCertificates: totalSupply.toString(),
        contractAddress,
        network: 'Polygon Mumbai Testnet'
      }
    });

  } catch (error) {
    console.error('Error getting certificate statistics:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving statistics'
    });
  }
});

module.exports = router;