const express = require('express');
const { ethers } = require('ethers');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const router = express.Router();

// Load contract ABI and addresses
const contractABI = require('../contracts/Certificate.json').abi;
const contractAddresses = require('../contract-addresses.json');

// Rate limiting for verification requests
const verifyRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 verification requests per minute
  message: {
    error: 'Too many verification requests from this IP, please try again later.',
    retryAfter: 60 // 1 minute in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schema for verification request
const verifySchema = Joi.object({
  certificateId: Joi.string()
    .pattern(/^\d+$/)
    .required()
    .messages({
      'string.pattern.base': 'Certificate ID must be a valid number',
      'any.required': 'Certificate ID is required'
    })
});

// Initialize provider and contract
let provider;
let contract;

try {
  // Use Polygon Amoy RPC
  provider = new ethers.JsonRpcProvider(
    process.env.POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology/'
  );
  
  // Initialize contract (read-only, no wallet needed for verification)
  const contractAddress = contractAddresses.polygonAmoy?.Certificate;
  if (!contractAddress) {
    throw new Error('Certificate contract address not found for Polygon Amoy');
  }
  
  contract = new ethers.Contract(contractAddress, contractABI, provider);
  
  console.log('✅ Certificate verification contract initialized:', contractAddress);
} catch (error) {
  console.error('❌ Failed to initialize verification contract:', error.message);
}

/**
 * Format certificate data for response
 */
const formatCertificateData = (certificateData, tokenId, contractAddress) => {
  return {
    tokenId: tokenId.toString(),
    issuer: certificateData.issuer,
    recipient: certificateData.recipient || 'Unknown',
    recipientName: certificateData.recipientName,
    courseName: certificateData.courseName,
    institutionName: ce unavailable',
        message: 'Certificate verification service is currently unavailable'
      });
    }

    const certificateId = parseInt(tokenId);
    
    console.log(`🔍 Verifying certificate ID: ${certificateId}`);

    // Check if certificate exists
    let certificateExists;
    try {
      // Try to get the owner of the token (will throw if token doesn't exist)
      await contract.ownerOf(certificateId);
      certificateExists = true;
    } catch (error) {
      certificateExists = false;
    }

    if (!certificateExists) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found',
        message: `Certificate with ID ${certificateId} does not exist`
      });
    }

    // Get certificate data
    let certificateData;
    try {
      certificateData = await contract.getCertificate(certificateId);
    } catch (error) {
      console.error('Failed to fetch certificate data:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch certificate data',
        message: 'Could not retrieve certificate information from blockchain'
      });
    }

    // Get additional certificate information
    let owner;
    let tokenURI;
    let isValid;
    
    try {
      [owner, tokenURI, isValid] = await Promise.all([
        contract.ownerOf(certificateId),
        contract.tokenURI(certificateId).catch(() => ''),
        contract.isValidCertificate(certificateId)
      ]);
    } catch (error) {
      console.error('Failed to fetch additional certificate info:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch certificate details',
        message: 'Could not retrieve complete certificate information'
      });
    }

    // Format the response
    const verificationResult = {
      tokenId: certificateId.toString(),
      recipient: owner,
      recipientName: certificateData.recipientName,
      courseName: certificateData.courseName,
      institutionName: certificateData.institutionName,
      issuer: certificateData.issuer,
      issueDate: certificateData.issueDate.toString(),
      isValid: isValid && certificateData.isValid,
      metadataURI: tokenURI,
      contractAddress: await contract.getAddress(),
      verificationTime: new Date().toISOString(),
      network: 'Polygon Amoy Testnet',
      explorerUrl: `https://amoy.polygonscan.com/token/${await contract.getAddress()}?a=${certificateId}`
    };

    console.log(`✅ Certificate ${certificateId} verified successfully`);
    console.log(`   Recipient: ${certificateData.recipientName}`);
    console.log(`   Course: ${certificateData.courseName}`);
    console.log(`   Valid: ${verificationResult.isValid}`);

    res.json({
      success: true,
      message: 'Certificate verification completed',
      data: verificationResult
    });

  } catch (error) {
    console.error('❌ Certificate verification error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Verification failed',
      message: 'An unexpected error occurred during certificate verification',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

/**
 * POST /api/verify-certificate
 * Verify a certificate with flexible input (legacy support)
 */
router.post('/verify-certificate', verifyRateLimit, async (req, res) => {
  try {
    const { certificateId, tokenId, transactionHash } = req.body;

    // Determine which verification method to use
    let targetTokenId;
    
    if (certificateId || tokenId) {
      targetTokenId = certificateId || tokenId;
    } else if (transactionHash) {
      // For transaction hash verification, we would need to parse the transaction
      // This is more complex and requires additional blockchain queries
      return res.status(400).json({
        success: false,
        error: 'Transaction hash verification not implemented',
        message: 'Please use certificate ID for verification'
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Missing verification parameter',
        message: 'Please provide either certificateId or tokenId'
      });
    }

    // Redirect to GET endpoint
    req.params.tokenId = targetTokenId;
    return router.handle(
      { ...req, method: 'GET', url: `/verify-certificate/${targetTokenId}` },
      res
    );

  } catch (error) {
    console.error('❌ Certificate verification error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Verification failed',
      message: 'An unexpected error occurred during certificate verification'
    });
  }
});

/**
 * GET /api/verify-certificate/status
 * Get verification service status
 */
router.get('/verify-certificate/status', async (req, res) => {
  try {
    let status = {
      service: 'Certificate Verification Service',
      status: 'operational',
      network: 'Polygon Amoy',
      contractInitialized: !!contract,
      timestamp: new Date().toISOString()
    };

    if (contract) {
      try {
        // Check contract connectivity
        const totalSupply = await contract.totalSupply();
        status.totalCertificatesIssued = totalSupply.toString();
        status.contractAddress = await contract.getAddress();
        
        // Check network connectivity
        const blockNumber = await provider.getBlockNumber();
        status.latestBlock = blockNumber;
        
      } catch (error) {
        status.status = 'degraded';
        status.error = 'Failed to fetch blockchain data';
        status.details = error.message;
      }
    } else {
      status.status = 'error';
      status.error = 'Contract not initialized';
    }

    res.json(status);
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      service: 'Certificate Verification Service',
      status: 'error',
      error: 'Failed to check service status',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/verify-certificate/:tokenId/metadata
 * Get certificate metadata
 */
router.get('/verify-certificate/:tokenId/metadata', verifyRateLimit, async (req, res) => {
  try {
    const { tokenId } = req.params;

    if (!tokenId || isNaN(tokenId) || parseInt(tokenId) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid certificate ID'
      });
    }

    if (!contract) {
      return res.status(500).json({
        success: false,
        error: 'Service unavailable'
      });
    }

    const certificateId = parseInt(tokenId);

    // Check if certificate exists
    try {
      await contract.ownerOf(certificateId);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
      });
    }

    // Get certificate data and metadata URI
    const [certificateData, tokenURI] = await Promise.all([
      contract.getCertificate(certificateId),
      contract.tokenURI(certificateId).catch(() => '')
    ]);

    // Generate metadata JSON
    const metadata = {
      name: `Certificate: ${certificateData.courseName}`,
      description: `Certificate of completion for ${certificateData.courseName} issued to ${certificateData.recipientName} by ${certificateData.institutionName}`,
      image: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/certificate/${certificateId}/image`,
      external_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${certificateId}`,
      attributes: [
        {
          trait_type: 'Recipient',
          value: certificateData.recipientName
        },
        {
          trait_type: 'Course',
          value: certificateData.courseName
        },
        {
          trait_type: 'Institution',
          value: certificateData.institutionName
        },
        {
          trait_type: 'Issue Date',
          value: new Date(parseInt(certificateData.issueDate) * 1000).toISOString()
        },
        {
          trait_type: 'Blockchain',
          value: 'Polygon Amoy'
        },
        {
          trait_type: 'Valid',
          value: certificateData.isValid ? 'Yes' : 'No'
        }
      ]
    };

    res.json({
      success: true,
      metadata,
      tokenURI
    });

  } catch (error) {
    console.error('Metadata fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metadata'
    });
  }
});

module.exports = router;