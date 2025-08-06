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
    if (!tokenId || isNaN(tokenId) || parseInt(tokenId) < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token ID',
        message: 'Token ID must be a valid positive number'
      });
    }

    // Check if contract is initialized
    if (!contract) {
      return res.status(500).json({
        success: false,
        error: 'Contract not initialized',
        message: 'Verification service is currently unavailable'
      });
    }

    console.log(`🔍 Verifying certificate with token ID: ${tokenId}`);

    try {
      // Check if token exists
      const owner = await contract.ownerOf(tokenId);
      console.log(`📋 Certificate owner: ${owner}`);
      
      // Get certificate data
      const certificateData = await contract.getCertificate(tokenId);
      console.log(`📄 Certificate data retrieved for token ${tokenId}`);
      
      // Check if certificate is valid (not revoked)
      const isValid = await contract.isValidCertificate(tokenId);
      console.log(`✅ Certificate validity: ${isValid}`);
      
      // Get token URI for metadata
      let metadataURI = '';
      try {
        metadataURI = await contract.tokenURI(tokenId);
      } catch (error) {
        console.warn('Could not retrieve metadata URI:', error.message);
      }

      // Format the response data
      const verificationResult = {
        tokenId: tokenId.toString(),
        contractAddress: await contract.getAddress(),
        owner: owner,
        recipient: owner, // In this system, owner is the recipient
        issuer: certificateData.issuer,
        recipientName: certificateData.recipientName,
        courseName: certificateData.courseName,
        institutionName: certificateData.institutionName,
        issueDate: certificateData.issueDate.toString(),
        isValid: isValid && certificateData.isValid,
        metadataURI: metadataURI,
        metadataHash: certificateData.metadataHash,
        verificationTimestamp: new Date().toISOString(),
        network: 'Polygon Amoy Testnet',
        explorerUrl: `https://amoy.polygonscan.com/token/${await contract.getAddress()}?a=${tokenId}`
      };

      console.log(`✅ Certificate ${tokenId} verification completed successfully`);

      res.json({
        success: true,
        message: isValid ? 'Certificate verified successfully' : 'Certificate found but is invalid or revoked',
        data: verificationResult
      });

    } catch (contractError) {
      console.error('Contract interaction error:', contractError);
      
      // Handle specific contract errors
      if (contractError.message.includes('ERC721: invalid token ID') || 
          contractError.message.includes('nonexistent token')) {
        return res.status(404).json({
          success: false,
          error: 'Certificate not found',
          message: `No certificate found with ID ${tokenId}`
        });
      }
      
      if (contractError.message.includes('call revert exception')) {
        return res.status(404).json({
          success: false,
          error: 'Certificate not found',
          message: `Certificate with ID ${tokenId} does not exist`
        });
      }

      // Generic contract error
      return res.status(500).json({
        success: false,
        error: 'Blockchain query failed',
        message: 'Failed to query certificate data from blockchain'
      });
    }

  } catch (error) {
    console.error('❌ Certificate verification error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred during verification',
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
        error: 'Too many requests',
        message: 'Maximum 10 certificates can be verified at once'
      });
    }

    // Check if contract is initialized
    if (!contract) {
      return res.status(500).json({
        success: false,
        error: 'Contract not initialized',
        message: 'Verification service is currently unavailable'
      });
    }

    console.log(`🔍 Batch verifying ${tokenIds.length} certificates`);

    const results = [];
    const errors = [];

    // Verify each certificate
    for (const tokenId of tokenIds) {
      try {
        // Validate token ID
        if (!tokenId || isNaN(tokenId) || parseInt(tokenId) < 0) {
          errors.push({
            tokenId: tokenId,
            error: 'Invalid token ID format'
          });
          continue;
        }

        // Get certificate data
        const owner = await contract.ownerOf(tokenId);
        const certificateData = await contract.getCertificate(tokenId);
        const isValid = await contract.isValidCertificate(tokenId);
        
        let metadataURI = '';
        try {
          metadataURI = await contract.tokenURI(tokenId);
        } catch (error) {
          console.warn(`Could not retrieve metadata URI for token ${tokenId}:`, error.message);
        }

        results.push({
          tokenId: tokenId.toString(),
          isValid: isValid && certificateData.isValid,
          recipientName: certificateData.recipientName,
          courseName: certificateData.courseName,
          institutionName: certificateData.institutionName,
          issueDate: certificateData.issueDate.toString(),
          owner: owner,
          issuer: certificateData.issuer
        });

      } catch (error) {
        console.error(`Error verifying certificate ${tokenId}:`, error);
        errors.push({
          tokenId: tokenId,
          error: error.message.includes('nonexistent token') ? 'Certificate not found' : 'Verification failed'
        });
      }
    }

    console.log(`✅ Batch verification completed: ${results.length} successful, ${errors.length} errors`);

    res.json({
      success: true,
      message: `Verified ${results.length} certificates`,
      data: {
        results: results,
        errors: errors,
        summary: {
          total: tokenIds.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });

  } catch (error) {
    console.error('❌ Batch verification error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred during batch verification',
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
        const contractAddress = await contract.getAddress();
        const totalSupply = await contract.totalSupply();
        
        status.contractAddress = contractAddress;
        status.totalCertificates = totalSupply.toString();
        status.networkConnected = true;
        
      } catch (error) {
        status.status = 'degraded';
        status.networkConnected = false;
        status.error = 'Failed to connect to blockchain';
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
 * GET /api/verify-certificate/search
 * Search certificates by recipient name or course name
 */
router.get('/verify-certificate/search', verifyRateLimit, async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query',
        message: 'Search query must be at least 2 characters long'
      });
    }

    if (!contract) {
      return res.status(500).json({
        success: false,
        error: 'Contract not initialized',
        message: 'Search service is currently unavailable'
      });
    }

    console.log(`🔍 Searching certificates with query: "${query}"`);

    // Get total supply to know how many certificates exist
    const totalSupply = await contract.totalSupply();
    const searchLimit = Math.min(parseInt(limit), 50); // Max 50 results
    const results = [];

    // Search through certificates (this is a simple implementation)
    // In production, you'd want to use events/indexing for better performance
    for (let i = 1; i <= Math.min(totalSupply, 100); i++) { // Limit search to first 100 certificates
      try {
        const certificateData = await contract.getCertificate(i);
        const isValid = await contract.isValidCertificate(i);
        
        // Check if query matches recipient name or course name
        const queryLower = query.toLowerCase();
        const recipientMatch = certificateData.recipientName.toLowerCase().includes(queryLower);
        const courseMatch = certificateData.courseName.toLowerCase().includes(queryLower);
        const institutionMatch = certificateData.institutionName.toLowerCase().includes(queryLower);
        
        if (recipientMatch || courseMatch || institutionMatch) {
          results.push({
            tokenId: i.toString(),
            recipientName: certificateData.recipientName,
            courseName: certificateData.courseName,
            institutionName: certificateData.institutionName,
            issueDate: certificateData.issueDate.toString(),
            isValid: isValid && certificateData.isValid,
            matchType: recipientMatch ? 'recipient' : courseMatch ? 'course' : 'institution'
          });
          
          if (results.length >= searchLimit) {
            break;
          }
        }
      } catch (error) {
        // Skip certificates that can't be read (might be revoked or have issues)
        continue;
      }
    }

    console.log(`✅ Search completed: found ${results.length} matching certificates`);

    res.json({
      success: true,
      message: `Found ${results.length} matching certificates`,
      data: {
        query: query,
        results: results,
        totalFound: results.length,
        searchLimit: searchLimit
      }
    });

  } catch (error) {
    console.error('❌ Certificate search error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred during search',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

module.exports = router;