const express = require('express');
const { ethers } = require('ethers');
const { param, validationResult } = require('express-validator');
const router = express.Router();

// Load contract ABI and address
const contractABI = require('../../artifacts/contracts/SimpleCertificate.sol/SimpleCertificate.json').abi;
const contractAddresses = require('../../contract-addresses.json');

// Initialize provider and contract
let provider, contract;

try {
  // Use Amoy RPC URL
  const rpcUrl = process.env.RPC_URL || 'https://rpc-amoy.polygon.technology/';
  provider = new ethers.JsonRpcProvider(rpcUrl);
  
  // Get contract address from deployment info
  const contractAddress = contractAddresses.contractAddress;
  
  if (!contractAddress) {
    throw new Error('Contract address not found in contract-addresses.json');
  }
  
  contract = new ethers.Contract(contractAddress, contractABI, provider);
  console.log(`SimpleCertificate verification service initialized at: ${contractAddress} on Amoy network`);
} catch (error) {
  console.error('Failed to initialize verification contract:', error);
}

// Validation middleware
const validateTokenId = [
  param('tokenId')
    .isNumeric()
    .withMessage('Token ID must be a number')
    .custom((value) => {
      if (parseInt(value) < 1) {
        throw new Error('Token ID must be greater than 0');
      }
      return true;
    })
];

/**
 * GET /api/certificates/verify/:tokenId
 * Verify a certificate by token ID on Amoy network
 */
router.get('/verify/:tokenId', validateTokenId, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { tokenId } = req.params;

    // Check if token exists
    const totalSupply = await contract.totalSupply();
    if (parseInt(tokenId) > parseInt(totalSupply.toString())) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found',
        message: `Token ID ${tokenId} does not exist`
      });
    }

    // Get certificate data
    const certificateData = await contract.getCertificate(tokenId);
    
    // Check if certificate is valid (not revoked)
    const isValid = await contract.isValidCertificate(tokenId);
    
    // Get token owner
    const owner = await contract.ownerOf(tokenId);
    
    // Get block information for the certificate
    const network = await provider.getNetwork();
    const currentBlock = await provider.getBlockNumber();

    // Prepare response
    const response = {
      success: true,
      data: {
        tokenId: tokenId,
        certificate: {
          recipientName: certificateData.recipientName,
          courseName: certificateData.courseName,
          institutionName: certificateData.institutionName,
          issuer: certificateData.issuer,
          recipient: owner,
          issueDate: certificateData.issueDate.toString(),
          isValid: isValid,
          isRevoked: !certificateData.isValid
        },
        verification: {
          exists: true,
          isValid: isValid,
          verifiedAt: new Date().toISOString(),
          network: {
            name: 'amoy',
            chainId: network.chainId.toString(),
            currentBlock: currentBlock,
            contractAddress: contract.target,
            blockExplorer: `https://amoy.polygonscan.com/token/${contract.target}?a=${tokenId}`
          }
        }
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Certificate verification failed:', error);
    
    // Handle specific error types
    if (error.message.includes('Token does not exist')) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found',
        message: `Token ID ${req.params.tokenId} does not exist`
      });
    }
    
    if (error.code === 'NETWORK_ERROR') {
      return res.status(503).json({
        success: false,
        error: 'Amoy network error. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to verify certificate',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/certificates/batch-verify
 * Verify multiple certificates by token IDs
 */
router.post('/batch-verify', async (req, res) => {
  try {
    const { tokenIds } = req.body;

    if (!Array.isArray(tokenIds) || tokenIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Token IDs array is required'
      });
    }

    if (tokenIds.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 50 certificates can be verified at once'
      });
    }

    const results = [];
    const totalSupply = await contract.totalSupply();

    for (const tokenId of tokenIds) {
      try {
        // Check if token exists
        if (parseInt(tokenId) > parseInt(totalSupply.toString())) {
          results.push({
            tokenId: tokenId,
            success: false,
            error: 'Certificate not found'
          });
          continue;
        }

        // Get certificate data
        const certificateData = await contract.getCertificate(tokenId);
        const isValid = await contract.isValidCertificate(tokenId);
        const owner = await contract.ownerOf(tokenId);

        results.push({
          tokenId: tokenId,
          success: true,
          certificate: {
            recipientName: certificateData.recipientName,
            courseName: certificateData.courseName,
            institutionName: certificateData.institutionName,
            issuer: certificateData.issuer,
            recipient: owner,
            issueDate: certificateData.issueDate.toString(),
            isValid: isValid,
            isRevoked: !certificateData.isValid
          }
        });

      } catch (error) {
        results.push({
          tokenId: tokenId,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        results: results,
        network: {
          name: 'amoy',
          chainId: 80002,
          contractAddress: contract.target
        }
      }
    });

  } catch (error) {
    console.error('Batch verification failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify certificates',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/certificates/issuer/:address
 * Get all certificates issued by a specific address
 */
router.get('/issuer/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // Validate Ethereum address
    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address'
      });
    }

    // Check if address is authorized issuer
    const isAuthorized = await contract.authorizedIssuers(address);

    const totalSupply = await contract.totalSupply();
    const certificates = [];

    // Iterate through all certificates to find ones issued by this address
    for (let i = 1; i <= parseInt(totalSupply.toString()); i++) {
      try {
        const certificateData = await contract.getCertificate(i);
        
        if (certificateData.issuer.toLowerCase() === address.toLowerCase()) {
          const isValid = await contract.isValidCertificate(i);
          const owner = await contract.ownerOf(i);

          certificates.push({
            tokenId: i.toString(),
            recipientName: certificateData.recipientName,
            courseName: certificateData.courseName,
            institutionName: certificateData.institutionName,
            recipient: owner,
            issueDate: certificateData.issueDate.toString(),
            isValid: isValid,
            isRevoked: !certificateData.isValid
          });
        }
      } catch (error) {
        // Skip if certificate doesn't exist or other error
        continue;
      }
    }

    res.json({
      success: true,
      data: {
        issuer: address,
        isAuthorized: isAuthorized,
        certificatesIssued: certificates.length,
        certificates: certificates,
        network: {
          name: 'amoy',
          chainId: 80002,
          contractAddress: contract.target
        }
      }
    });

  } catch (error) {
    console.error('Failed to get issuer certificates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get issuer certificates',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/certificates/recipient/:address
 * Get all certificates owned by a specific address
 */
router.get('/recipient/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // Validate Ethereum address
    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address'
      });
    }

    const totalSupply = await contract.totalSupply();
    const certificates = [];

    // Iterate through all certificates to find ones owned by this address
    for (let i = 1; i <= parseInt(totalSupply.toString()); i++) {
      try {
        const owner = await contract.ownerOf(i);
        
        if (owner.toLowerCase() === address.toLowerCase()) {
          const certificateData = await contract.getCertificate(i);
          const isValid = await contract.isValidCertificate(i);

          certificates.push({
            tokenId: i.toString(),
            recipientName: certificateData.recipientName,
            courseName: certificateData.courseName,
            institutionName: certificateData.institutionName,
            issuer: certificateData.issuer,
            issueDate: certificateData.issueDate.toString(),
            isValid: isValid,
            isRevoked: !certificateData.isValid
          });
        }
      } catch (error) {
        // Skip if certificate doesn't exist or other error
        continue;
      }
    }

    res.json({
      success: true,
      data: {
        recipient: address,
        certificatesOwned: certificates.length,
        certificates: certificates,
        network: {
          name: 'amoy',
          chainId: 80002,
          contractAddress: contract.target
        }
      }
    });

  } catch (error) {
    console.error('Failed to get recipient certificates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recipient certificates',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;