const express = require('express');
const { ethers } = require('ethers');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Load contract ABI and address
const contractABI = require('../../artifacts/contracts/Certificate.sol/Certificate.json').abi;
const contractAddresses = require('../contract-addresses.json');

// Rate limiting for verification
const verifyRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per minute
  message: {
    success: false,
    message: 'Too many verification requests, please try again later.'
  }
});

// Validation schemas
const verifyCertificateSchema = Joi.object({
  certificateId: Joi.number()
    .integer()
    .min(0)
    .when('transactionHash', {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required()
    }),
  transactionHash: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{64}$/)
    .when('certificateId', {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required()
    })
}).xor('certificateId', 'transactionHash');

/**
 * @route POST /api/verify-certificate
 * @desc Verify a certificate by ID or transaction hash
 * @access Public
 */
router.post('/verify-certificate', verifyRateLimit, async (req, res) => {
  try {
    // Validate request body
    const { error, value } = verifyCertificateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { certificateId, transactionHash } = value;

    // Initialize provider
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_AMOY_RPC_URL);
    
    // Get contract instance
    const contractAddress = contractAddresses.amoy?.Certificate;
    if (!contractAddress) {
      return res.status(500).json({
        success: false,
        message: 'Contract not deployed on this network'
      });
    }

    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    let tokenId;
    let verificationMethod;
    let transactionDetails = null;

    // Determine verification method and get token ID
    if (certificateId !== undefined) {
      tokenId = certificateId;
      verificationMethod = 'certificateId';
    } else if (transactionHash) {
      verificationMethod = 'transactionHash';
      
      try {
        // Get transaction receipt
        const receipt = await provider.getTransactionReceipt(transactionHash);
        
        if (!receipt) {
          return res.status(404).json({
            success: false,
            message: 'Transaction not found'
          });
        }

        if (receipt.status !== 1) {
          return res.status(400).json({
            success: false,
            message: 'Transaction failed'
          });
        }

        // Parse logs to find CertificateIssued event
        const iface = new ethers.Interface(contractABI);
        let certificateIssuedEvent = null;

        for (const log of receipt.logs) {
          try {
            const parsedLog = iface.parseLog(log);
            if (parsedLog.name === 'CertificateIssued' && log.address.toLowerCase() === contractAddress.toLowerCase()) {
              certificateIssuedEvent = parsedLog;
              break;
            }
          } catch (parseError) {
            // Skip logs that can't be parsed
            continue;
          }
        }

        if (!certificateIssuedEvent) {
          return res.status(404).json({
            success: false,
            message: 'No certificate found in this transaction'
          });
        }

        tokenId = certificateIssuedEvent.args.tokenId.toString();
        
        // Get transaction details
        const transaction = await provider.getTransaction(transactionHash);
        transactionDetails = {
          hash: transactionHash,
          blockNumber: receipt.blockNumber,
          blockHash: receipt.blockHash,
          gasUsed: receipt.gasUsed.toString(),
          gasPrice: transaction.gasPrice.toString(),
          from: transaction.from,
          to: transaction.to,
          timestamp: null // Will be filled with block timestamp
        };

        // Get block timestamp
        const block = await provider.getBlock(receipt.blockNumber);
        transactionDetails.timestamp = new Date(block.timestamp * 1000).toISOString();

      } catch (txError) {
        console.error('Error processing transaction:', txError);
        return res.status(400).json({
          success: false,
          message: 'Invalid transaction hash or network error'
        });
      }
    }

    // Check if certificate exists
    let certificateExists;
    try {
      // Try to get the certificate owner (this will throw if token doesn't exist)
      await contract.ownerOf(tokenId);
      certificateExists = true;
    } catch (ownerError) {
      certificateExists = false;
    }

    if (!certificateExists) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
        verificationDetails: {
          method: verificationMethod,
          tokenId: tokenId,
          exists: false
        }
      });
    }

    // Get certificate details
    const certificateData = await contract.getCertificate(tokenId);
    const isValid = await contract.isValidCertificate(tokenId);
    const owner = await contract.ownerOf(tokenId);

    // Format certificate data
    const certificate = {
      tokenId: tokenId.toString(),
      recipientAddress: owner,
      recipientName: certificateData.recipientName,
      courseName: certificateData.courseName,
      institutionName: certificateData.institutionName,
      issueDate: new Date(certificateData.issueDate.toNumber() * 1000).toISOString(),
      expiryDate: certificateData.expiryDate.toNumber() > 0 
        ? new Date(certificateData.expiryDate.toNumber() * 1000).toISOString() 
        : null,
      isRevoked: certificateData.isRevoked,
      issuer: certificateData.issuer,
      metadataURI: certificateData.metadataURI
    };

    // Determine validity status and reasons
    const validityReasons = [];
    if (certificateData.isRevoked) {
      validityReasons.push('Certificate has been revoked');
    }
    if (certificateData.expiryDate.toNumber() > 0 && certificateData.expiryDate.toNumber() < Math.floor(Date.now() / 1000)) {
      validityReasons.push('Certificate has expired');
    }

    const response = {
      success: true,
      message: isValid ? 'Certificate is valid' : 'Certificate found but is not valid',
      certificate: certificate,
      isValid: isValid,
      validityReasons: validityReasons,
      verificationDetails: {
        method: verificationMethod,
        tokenId: tokenId.toString(),
        exists: true,
        verifiedAt: new Date().toISOString(),
        contractAddress: contractAddress,
        network: 'Polygon Amoy Testnet'
      }
    };

    // Add transaction details if available
    if (transactionDetails) {
      response.transactionDetails = transactionDetails;
    }

    res.json(response);

  } catch (error) {
    console.error('Error verifying certificate:', error);

    // Handle specific error types
    if (error.code === 'NETWORK_ERROR') {
      return res.status(503).json({
        success: false,
        message: 'Network error. Please try again later.'
      });
    }

    if (error.code === 'SERVER_ERROR') {
      return res.status(503).json({
        success: false,
        message: 'Blockchain network is currently unavailable'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to verify certificate',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/verify-certificate/:tokenId
 * @desc Verify a certificate by token ID (GET method for QR codes)
 * @access Public
 */
router.get('/verify-certificate/:tokenId', verifyRateLimit, async (req, res) => {
  try {
    const tokenId = parseInt(req.params.tokenId);
    
    if (isNaN(tokenId) || tokenId < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid certificate ID'
      });
    }

    // Use the same verification logic as POST endpoint
    const verificationResult = await router.post('/verify-certificate', {
      body: { certificateId: tokenId }
    });

    // Forward the result
    res.json(verificationResult);

  } catch (error) {
    console.error('Error in GET verification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify certificate'
    });
  }
});

/**
 * @route GET /api/certificate/:tokenId/details
 * @desc Get detailed certificate information
 * @access Public
 */
router.get('/certificate/:tokenId/details', verifyRateLimit, async (req, res) => {
  try {
    const tokenId = parseInt(req.params.tokenId);
    
    if (isNaN(tokenId) || tokenId < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid certificate ID'
      });
    }

    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_AMOY_RPC_URL);
    const contractAddress = contractAddresses.amoy?.Certificate;
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    // Check if certificate exists
    let certificateExists;
    try {
      await contract.ownerOf(tokenId);
      certificateExists = true;
    } catch (ownerError) {
      certificateExists = false;
    }

    if (!certificateExists) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Get comprehensive certificate details
    const certificateData = await contract.getCertificate(tokenId);
    const isValid = await contract.isValidCertificate(tokenId);
    const owner = await contract.ownerOf(tokenId);
    const tokenURI = await contract.tokenURI(tokenId).catch(() => '');

    // Get issuer certificates count
    const issuerCertificates = await contract.getCertificatesByIssuer(certificateData.issuer);
    
    // Get recipient certificates count
    const recipientCertificates = await contract.getCertificatesByRecipient(owner);

    const response = {
      success: true,
      certificate: {
        tokenId: tokenId.toString(),
        recipientAddress: owner,
        recipientName: certificateData.recipientName,
        courseName: certificateData.courseName,
        institutionName: certificateData.institutionName,
        issueDate: new Date(certificateData.issueDate.toNumber() * 1000).toISOString(),
        expiryDate: certificateData.expiryDate.toNumber() > 0 
          ? new Date(certificateData.expiryDate.toNumber() * 1000).toISOString() 
          : null,
        isRevoked: certificateData.isRevoked,
        issuer: certificateData.issuer,
        metadataURI: certificateData.metadataURI,
        tokenURI: tokenURI,
        isValid: isValid
      },
      statistics: {
        totalCertificatesByIssuer: issuerCertificates.length,
        totalCertificatesByRecipient: recipientCertificates.length
      },
      contractInfo: {
        address: contractAddress,
        network: 'Polygon Amoy Testnet',
        chainId: 80002
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error getting certificate details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get certificate details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;