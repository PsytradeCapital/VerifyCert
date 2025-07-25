const express = require('express');
const { ethers } = require('ethers');
const router = express.Router();

// Load contract ABI and address
const contractABI = require('../../artifacts/contracts/Certificate.sol/Certificate.json').abi;
const contractAddresses = require('../../contract-addresses.json');

// Initialize provider and contract
const getContract = () => {
  const rpcUrl = process.env.POLYGON_AMOY_RPC_URL || process.env.POLYGON_RPC_URL;
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  return new ethers.Contract(contractAddresses.contractAddress, contractABI, provider);
};

// Verify certificate by token ID
router.get('/verify/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;

    // Validate token ID
    if (!tokenId || isNaN(tokenId) || parseInt(tokenId) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid certificate ID'
      });
    }

    const contract = getContract();
    
    // Check if certificate exists
    try {
      const certificateData = await contract.getCertificate(tokenId);
      const isValid = await contract.isValidCertificate(tokenId);
      const owner = await contract.ownerOf(tokenId);

      res.json({
        success: true,
        data: {
          tokenId,
          recipientName: certificateData.recipientName,
          courseName: certificateData.courseName,
          institutionName: certificateData.institutionName,
          issueDate: certificateData.issueDate.toString(),
          isRevoked: certificateData.isRevoked,
          issuer: certificateData.issuer,
          recipient: owner,
          isValid,
          contractAddress: contractAddresses.contractAddress,
          network: process.env.NETWORK || 'amoy',
          chainId: process.env.CHAIN_ID || '80002'
        }
      });

    } catch (contractError) {
      if (contractError.message.includes('Certificate does not exist')) {
        return res.status(404).json({
          success: false,
          error: 'Certificate not found'
        });
      }
      throw contractError;
    }

  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify certificate',
      details: error.message
    });
  }
});

// Get certificate details with additional metadata
router.get('/details/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;

    if (!tokenId || isNaN(tokenId) || parseInt(tokenId) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid certificate ID'
      });
    }

    const contract = getContract();
    
    try {
      const certificateData = await contract.getCertificate(tokenId);
      const isValid = await contract.isValidCertificate(tokenId);
      const owner = await contract.ownerOf(tokenId);
      
      // Get additional blockchain information
      const provider = contract.provider;
      const currentBlock = await provider.getBlockNumber();
      
      // Calculate certificate age
      const issueDate = new Date(certificateData.issueDate.toNumber() * 1000);
      const now = new Date();
      const ageInDays = Math.floor((now - issueDate) / (1000 * 60 * 60 * 24));

      res.json({
        success: true,
        data: {
          certificate: {
            tokenId,
            recipientName: certificateData.recipientName,
            courseName: certificateData.courseName,
            institutionName: certificateData.institutionName,
            issueDate: certificateData.issueDate.toString(),
            isRevoked: certificateData.isRevoked,
            issuer: certificateData.issuer,
            recipient: owner,
            isValid
          },
          blockchain: {
            contractAddress: contractAddresses.contractAddress,
            network: process.env.NETWORK || 'amoy',
            chainId: process.env.CHAIN_ID || '80002',
            currentBlock,
            explorerUrl: process.env.EXPLORER_URL || 'https://amoy.polygonscan.com'
          },
          metadata: {
            ageInDays,
            formattedIssueDate: issueDate.toLocaleDateString(),
            status: isValid ? 'Valid' : 'Invalid/Revoked'
          }
        }
      });

    } catch (contractError) {
      if (contractError.message.includes('Certificate does not exist')) {
        return res.status(404).json({
          success: false,
          error: 'Certificate not found'
        });
      }
      throw contractError;
    }

  } catch (error) {
    console.error('Error getting certificate details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get certificate details',
      details: error.message
    });
  }
});

// Get certificates by recipient address
router.get('/recipient/:address', async (req, res) => {
  try {
    const { address } = req.params;

    if (!ethers.utils.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address format'
      });
    }

    const contract = getContract();
    const tokenIds = await contract.getRecipientCertificates(address);

    const certificates = [];
    for (const tokenId of tokenIds) {
      try {
        const certificateData = await contract.getCertificate(tokenId);
        const isValid = await contract.isValidCertificate(tokenId);

        certificates.push({
          tokenId: tokenId.toString(),
          recipientName: certificateData.recipientName,
          courseName: certificateData.courseName,
          institutionName: certificateData.institutionName,
          issueDate: certificateData.issueDate.toString(),
          isRevoked: certificateData.isRevoked,
          issuer: certificateData.issuer,
          isValid
        });
      } catch (err) {
        console.error(`Error fetching certificate ${tokenId}:`, err);
        // Continue with other certificates
      }
    }

    res.json({
      success: true,
      data: {
        recipient: address,
        totalCertificates: certificates.length,
        validCertificates: certificates.filter(cert => cert.isValid).length,
        certificates
      }
    });

  } catch (error) {
    console.error('Error getting recipient certificates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recipient certificates',
      details: error.message
    });
  }
});

// Batch verify multiple certificates
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

    const contract = getContract();
    const results = [];

    for (const tokenId of tokenIds) {
      try {
        if (!tokenId || isNaN(tokenId) || parseInt(tokenId) <= 0) {
          results.push({
            tokenId,
            success: false,
            error: 'Invalid token ID'
          });
          continue;
        }

        const certificateData = await contract.getCertificate(tokenId);
        const isValid = await contract.isValidCertificate(tokenId);
        const owner = await contract.ownerOf(tokenId);

        results.push({
          tokenId,
          success: true,
          data: {
            recipientName: certificateData.recipientName,
            courseName: certificateData.courseName,
            institutionName: certificateData.institutionName,
            issueDate: certificateData.issueDate.toString(),
            isRevoked: certificateData.isRevoked,
            issuer: certificateData.issuer,
            recipient: owner,
            isValid
          }
        });

      } catch (err) {
        results.push({
          tokenId,
          success: false,
          error: err.message.includes('Certificate does not exist') 
            ? 'Certificate not found' 
            : 'Verification failed'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.json({
      success: true,
      data: {
        totalRequested: tokenIds.length,
        successCount,
        failureCount,
        results
      }
    });

  } catch (error) {
    console.error('Error in batch verification:', error);
    res.status(500).json({
      success: false,
      error: 'Batch verification failed',
      details: error.message
    });
  }
});

module.exports = router;