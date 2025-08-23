const express = require('express');
const { ethers } = require('ethers');
const router = express.Router();

// Load contract ABI and address
const contractABI = require('../../../artifacts/contracts/Certificate.sol/Certificate.json').abi;
const contractAddresses = require('../../../contract-addresses.json');

// GET /api/verify-certificate/:tokenId
router.get('/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;

    // Validate token ID
    if (!tokenId || isNaN(tokenId) || parseInt(tokenId) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid certificate ID',
        details: 'Certificate ID must be a positive number'
      });
    }

    // Initialize provider
    const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);

    // Get contract instance
    const contractAddress = contractAddresses.amoy?.Certificate;
    if (!contractAddress) {
      return res.status(500).json({
        success: false,
        error: 'Contract not deployed on Amoy network'
      });
    }

    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    // Check if certificate exists
    let certificateExists = false;
    let certificateData = null;
    let isValid = false;

    try {
      // Try to get certificate data
      certificateData = await contract.getCertificate(tokenId);
      certificateExists = true;

      // Check if certificate is valid (exists and not revoked)
      isValid = await contract.isValidCertificate(tokenId);

      // Get token owner
      const owner = await contract.ownerOf(tokenId);

      // Format certificate data
      const formattedCertificate = {
        recipientName: certificateData.recipientName,
        courseName: certificateData.courseName,
        institutionName: certificateData.institutionName,
        issueDate: Number(certificateData.issueDate),
        isRevoked: certificateData.isRevoked,
        issuer: certificateData.issuer,
        owner: owner,
        grade: certificateData.grade || '',
        credits: Number(certificateData.credits) || 0,
        certificateType: certificateData.certificateType || 'Basic',
        tokenId: tokenId
      };

      res.json({
        success: true,
        data: {
          exists: certificateExists,
          isValid: isValid,
          certificate: formattedCertificate,
          verificationTimestamp: Math.floor(Date.now() / 1000)
        }
      });

    } catch (contractError) {
      // Certificate doesn't exist or other contract error
      if (contractError.reason === 'Certificate does not exist' || 
          contractError.message.includes('nonexistent token')) {
        res.json({
          success: true,
          data: {
            exists: false,
            isValid: false,
            certificate: null,
            verificationTimestamp: Math.floor(Date.now() / 1000)
          }
        });
      } else {
        throw contractError;
      }
    }

  } catch (error) {
    console.error('Error verifying certificate:', error);

    // Handle network errors
    if (error.code === 'NETWORK_ERROR') {
      return res.status(503).json({
        success: false,
        error: 'Network error',
        details: 'Unable to connect to blockchain network'
      });
    }

    // Handle contract call errors
    if (error.reason) {
      return res.status(400).json({
        success: false,
        error: 'Contract error',
        details: error.reason
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
});

// GET /api/verify-certificate/batch/:tokenIds
router.get('/batch/:tokenIds', async (req, res) => {
  try {
    const { tokenIds } = req.params;
    const tokenIdArray = tokenIds.split(',').map(id => id.trim()).filter(id => id);

    // Validate token IDs
    if (tokenIdArray.length === 0 || tokenIdArray.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        details: 'Provide 1-10 comma-separated certificate IDs'
      });
    }

    for (const tokenId of tokenIdArray) {
      if (isNaN(tokenId) || parseInt(tokenId) <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid certificate ID',
          details: `Certificate ID "${tokenId}" must be a positive number`
        });
      }
    }

    // Initialize provider and contract
    const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
    const contractAddress = contractAddresses.amoy?.Certificate;
    
    if (!contractAddress) {
      return res.status(500).json({
        success: false,
        error: 'Contract not deployed on Amoy network'
      });
    }

    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    // Verify each certificate
    const results = await Promise.all(
      tokenIdArray.map(async (tokenId) => {
        try {
          const certificateData = await contract.getCertificate(tokenId);
          const isValid = await contract.isValidCertificate(tokenId);
          const owner = await contract.ownerOf(tokenId);

          return {
            tokenId: tokenId,
            exists: true,
            isValid: isValid,
            certificate: {
              recipientName: certificateData.recipientName,
              courseName: certificateData.courseName,
              institutionName: certificateData.institutionName,
              issueDate: Number(certificateData.issueDate),
              isRevoked: certificateData.isRevoked,
              issuer: certificateData.issuer,
              owner: owner,
              grade: certificateData.grade || '',
              credits: Number(certificateData.credits) || 0,
              certificateType: certificateData.certificateType || 'Basic',
              tokenId: tokenId
            }
          };
        } catch (error) {
          return {
            tokenId: tokenId,
            exists: false,
            isValid: false,
            certificate: null,
            error: error.reason || 'Certificate does not exist'
          };
        }
      })
    );

    res.json({
      success: true,
      data: {
        results: results,
        verificationTimestamp: Math.floor(Date.now() / 1000)
      }
    });

  } catch (error) {
    console.error('Error in batch verification:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
});

// GET /api/verify-certificate/stats
router.get('/stats', async (req, res) => {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
    const contractAddress = contractAddresses.amoy?.Certificate;
    
    if (!contractAddress) {
      return res.status(500).json({
        success: false,
        error: 'Contract not deployed on Amoy network'
      });
    }

    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    // Get total supply
    const totalSupply = await contract.totalSupply();

    // Get contract owner
    const owner = await contract.owner();

    res.json({
      success: true,
      data: {
        totalCertificates: Number(totalSupply),
        contractAddress: contractAddress,
        contractOwner: owner,
        network: 'Polygon Amoy Testnet',
        chainId: 80002
      }
    });

  } catch (error) {
    console.error('Error getting contract stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get contract statistics'
    });
  }
});

module.exports = router;