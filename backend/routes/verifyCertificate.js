const express = require('express');
const { ethers } = require('ethers');
const rateLimit = require('express-rate-limit');
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
 * GET /api/verify-certificate/:tokenId
 * Verify a certificate by token ID
 */
router.get('/verify-certificate/:tokenId', verifyRateLimit, async (req, res) => {
  try {
    const { tokenId } = req.params;

    // Validate token ID
    if (!tokenId || isNaN(tokenId) || parseInt(tokenId) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token ID',
        message: 'Token ID must be a positive number'
      });
    }

    // Check if contract is initialized
    if (!contract) {
      return res.status(500).json({
        success: false,
        error: 'Contract not initialized',
        message: 'Verification service is temporarily unavailable'
      });
    }

    console.log('🔍 Verifying certificate:', tokenId);

    // Check if certificate exists
    let certificateExists;
    try {
      // Try to get the owner of the token (this will throw if token doesn't exist)
      await contract.ownerOf(tokenId);
      certificateExists = true;
    } catch (error) {
      certificateExists = false;
    }

    if (!certificateExists) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found',
        message: 'No certificate found with the provided ID'
      });
    }

    // Get certificate data
    const certificateData = await contract.getCertificate(tokenId);
    const isValid = await contract.isValidCertificate(tokenId);
    const owner = await contract.ownerOf(tokenId);
    const tokenURI = await contract.tokenURI(tokenId);

    // Format the response
    const verificationResult = {
      tokenId: tokenId.toString(),
      isValid,
      recipient: owner,
      recipientName: certificateData.recipientName,
      courseName: certificateData.courseName,
      institutionName: certificateData.institutionName,
      issuer: certificateData.issuer,
      issueDate: certificateData.issueDate.toString(),
      metadataURI: tokenURI,
      metadataHash: certificateData.metadataHash,
      contractAddress: await contract.getAddress(),
      verificationTime: new Date().toISOString(),
      blockchainNetwork: 'Polygon Amoy Testnet'
    };

    console.log('✅ Certificate verification completed:', {
      tokenId,
      isValid,
      recipient: verificationResult.recipientName
    });

    res.json({
      success: true,
      message: isValid ? 'Certificate verified successfully' : 'Certificate found but is not valid',
      data: verificationResult
    });

  } catch (error) {
    console.error('❌ Certificate verification error:', error);
    
    // Handle specific blockchain errors
    if (error.message.includes('network')) {
      return res.status(503).json({
        success: false,
        error: 'Network error',
        message: 'Unable to connect to blockchain network. Please try again later.'
      });
    }
    
    if (error.message.includes('timeout')) {
      return res.status(504).json({
        success: false,
        error: 'Request timeout',
        message: 'Blockchain request timed out. Please try again.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Verification failed',
      message: 'An error occurred while verifying the certificate',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

/**
 * POST /api/verify-certificate/batch
 * Verify multiple certificates at once
 */
router.post('/verify-certificate/batch', verifyRateLimit, async (req, res) => {
  try {
    const { tokenIds } = req.body;

    // Validate input
    if (!Array.isArray(tokenIds) || tokenIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        message: 'tokenIds must be a non-empty array'
      });
    }

    if (tokenIds.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Too many certificates',
        message: 'Maximum 10 certificates can be verified at once'
      });
    }

    // Validate each token ID
    for (const tokenId of tokenIds) {
      if (!tokenId || isNaN(tokenId) || parseInt(tokenId) <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid token ID',
          message: `Token ID ${tokenId} is invalid`
        });
      }
    }

    if (!contract) {
      return res.status(500).json({
        success: false,
        error: 'Contract not initialized',
        message: 'Verification service is temporarily unavailable'
      });
    }

    console.log('🔍 Batch verifying certificates:', tokenIds);

    const results = [];
    const contractAddress = await contract.getAddress();

    // Verify each certificate
    for (const tokenId of tokenIds) {
      try {
        // Check if certificate exists
        let certificateExists;
        try {
          await contract.ownerOf(tokenId);
          certificateExists = true;
        } catch (error) {
          certificateExists = false;
        }

        if (!certificateExists) {
          results.push({
            tokenId: tokenId.toString(),
            success: false,
            error: 'Certificate not found'
          });
          continue;
        }

        // Get certificate data
        const certificateData = await contract.getCertificate(tokenId);
        const isValid = await contract.isValidCertificate(tokenId);
        const owner = await contract.ownerOf(tokenId);
        const tokenURI = await contract.tokenURI(tokenId);

        results.push({
          tokenId: tokenId.toString(),
          success: true,
          data: {
            isValid,
            recipient: owner,
            recipientName: certificateData.recipientName,
            courseName: certificateData.courseName,
            institutionName: certificateData.institutionName,
            issuer: certificateData.issuer,
            issueDate: certificateData.issueDate.toString(),
            metadataURI: tokenURI,
            metadataHash: certificateData.metadataHash,
            contractAddress
          }
        });

      } catch (error) {
        console.error(`❌ Error verifying certificate ${tokenId}:`, error);
        results.push({
          tokenId: tokenId.toString(),
          success: false,
          error: 'Verification failed',
          message: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Batch verification completed: ${successCount}/${tokenIds.length} successful`);

    res.json({
      success: true,
      message: `Verified ${successCount} out of ${tokenIds.length} certificates`,
      data: {
        results,
        summary: {
          total: tokenIds.length,
          successful: successCount,
          failed: tokenIds.length - successCount
        },
        verificationTime: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Batch verification error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Batch verification failed',
      message: 'An error occurred while verifying certificates',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
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
        // Test contract connectivity
        const totalSupply = await contract.totalSupply();
        status.contractAddress = await contract.getAddress();
        status.totalCertificatesIssued = totalSupply.toString();
        
        // Test network connectivity
        const blockNumber = await provider.getBlockNumber();
        status.currentBlockNumber = blockNumber;
        
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
 * GET /api/verify-certificate/recipient/:address
 * Get all certificates for a recipient address
 */
router.get('/verify-certificate/recipient/:address', verifyRateLimit, async (req, res) => {
  try {
    const { address } = req.params;

    // Validate address
    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address',
        message: 'Please provide a valid Ethereum address'
      });
    }

    if (!contract) {
      return res.status(500).json({
        success: false,
        error: 'Contract not initialized',
        message: 'Verification service is temporarily unavailable'
      });
    }

    console.log('🔍 Getting certificates for recipient:', address);

    // Get certificate token IDs for the recipient
    const tokenIds = await contract.getCertificatesByRecipient(address);
    
    if (tokenIds.length === 0) {
      return res.json({
        success: true,
        message: 'No certificates found for this address',
        data: {
          recipient: address,
          certificates: [],
          count: 0
        }
      });
    }

    // Get detailed data for each certificate
    const certificates = [];
    const contractAddress = await contract.getAddress();

    for (const tokenId of tokenIds) {
      try {
        const certificateData = await contract.getCertificate(tokenId);
        const isValid = await contract.isValidCertificate(tokenId);
        const tokenURI = await contract.tokenURI(tokenId);

        certificates.push({
          tokenId: tokenId.toString(),
          isValid,
          recipientName: certificateData.recipientName,
          courseName: certificateData.courseName,
          institutionName: certificateData.institutionName,
          issuer: certificateData.issuer,
          issueDate: certificateData.issueDate.toString(),
          metadataURI: tokenURI,
          metadataHash: certificateData.metadataHash,
          contractAddress
        });
      } catch (error) {
        console.error(`Error getting certificate ${tokenId}:`, error);
        // Continue with other certificates even if one fails
      }
    }

    console.log(`✅ Found ${certificates.length} certificates for recipient`);

    res.json({
      success: true,
      message: `Found ${certificates.length} certificates`,
      data: {
        recipient: address,
        certificates,
        count: certificates.length,
        verificationTime: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Recipient certificates error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to get recipient certificates',
      message: 'An error occurred while fetching certificates',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

module.exports = router;