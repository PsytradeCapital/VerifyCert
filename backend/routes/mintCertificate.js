const express = require('express');
const { ethers } = require('ethers');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Load contract ABI and address
const contractABI = require('../../artifacts/contracts/Certificate.sol/Certificate.json').abi;
const contractAddresses = require('../contract-addresses.json');

// Rate limiting for minting
const mintRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many mint requests, please try again later.'
  }
});

// Validation schema
const mintCertificateSchema = Joi.object({
  recipientAddress: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{40}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid Ethereum address format'
    }),
  recipientName: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Recipient name must be at least 2 characters',
      'string.max': 'Recipient name must not exceed 100 characters'
    }),
  courseName: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': 'Course name must be at least 2 characters',
      'string.max': 'Course name must not exceed 200 characters'
    }),
  institutionName: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': 'Institution name must be at least 2 characters',
      'string.max': 'Institution name must not exceed 200 characters'
    }),
  expiryDate: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.min': 'Expiry date must be a valid timestamp'
    }),
  metadataURI: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Metadata URI must be a valid URL'
    })
});

/**
 * @route POST /api/mint-certificate
 * @desc Mint a new certificate NFT
 * @access Private (requires authorized issuer)
 */
router.post('/mint-certificate', mintRateLimit, async (req, res) => {
  try {
    // Validate request body
    const { error, value } = mintCertificateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const {
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      expiryDate = 0,
      metadataURI = ''
    } = value;

    // Initialize provider and signer
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_AMOY_RPC_URL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Get contract instance
    const contractAddress = contractAddresses.amoy?.Certificate;
    if (!contractAddress) {
      return res.status(500).json({
        success: false,
        message: 'Contract not deployed on this network'
      });
    }

    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    // Check if signer is authorized issuer
    const isAuthorized = await contract.authorizedIssuers(signer.address);
    const isOwner = await contract.owner() === signer.address;
    
    if (!isAuthorized && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to issue certificates'
      });
    }

    // Validate expiry date if provided
    if (expiryDate > 0) {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (expiryDate <= currentTimestamp) {
        return res.status(400).json({
          success: false,
          message: 'Expiry date must be in the future'
        });
      }
    }

    // Estimate gas for the transaction
    let gasEstimate;
    try {
      gasEstimate = await contract.issueCertificate.estimateGas(
        recipientAddress,
        recipientName,
        courseName,
        institutionName,
        expiryDate,
        metadataURI
      );
    } catch (estimateError) {
      console.error('Gas estimation failed:', estimateError);
      return res.status(400).json({
        success: false,
        message: 'Failed to estimate gas. Please check your parameters.',
        error: estimateError.message
      });
    }

    // Issue the certificate
    const tx = await contract.issueCertificate(
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      expiryDate,
      metadataURI,
      {
        gasLimit: gasEstimate.mul(120).div(100) // Add 20% buffer
      }
    );

    console.log('Certificate minting transaction sent:', tx.hash);

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    if (receipt.status !== 1) {
      throw new Error('Transaction failed');
    }

    // Extract token ID from events
    const certificateIssuedEvent = receipt.events?.find(
      event => event.event === 'CertificateIssued'
    );

    if (!certificateIssuedEvent) {
      throw new Error('Certificate issued event not found');
    }

    const tokenId = certificateIssuedEvent.args.tokenId.toString();

    // Get certificate details
    const certificateData = await contract.getCertificate(tokenId);

    // Format response
    const certificate = {
      tokenId: tokenId,
      recipientAddress: recipientAddress,
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
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };

    res.status(201).json({
      success: true,
      message: 'Certificate minted successfully',
      certificate: certificate,
      transactionDetails: {
        hash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        confirmations: receipt.confirmations
      }
    });

  } catch (error) {
    console.error('Error minting certificate:', error);

    // Handle specific error types
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return res.status(400).json({
        success: false,
        message: 'Insufficient funds to complete transaction'
      });
    }

    if (error.code === 'NETWORK_ERROR') {
      return res.status(503).json({
        success: false,
        message: 'Network error. Please try again later.'
      });
    }

    if (error.message.includes('execution reverted')) {
      return res.status(400).json({
        success: false,
        message: 'Transaction reverted. Please check your parameters.',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to mint certificate',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/mint-certificate/gas-estimate
 * @desc Get gas estimate for minting a certificate
 * @access Private
 */
router.post('/mint-certificate/gas-estimate', async (req, res) => {
  try {
    const { error, value } = mintCertificateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const {
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      expiryDate = 0,
      metadataURI = ''
    } = value;

    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_AMOY_RPC_URL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contractAddress = contractAddresses.amoy?.Certificate;
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    const gasEstimate = await contract.issueCertificate.estimateGas(
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      expiryDate,
      metadataURI
    );

    const gasPrice = await provider.getGasPrice();
    const estimatedCost = gasEstimate.mul(gasPrice);

    res.json({
      success: true,
      gasEstimate: gasEstimate.toString(),
      gasPrice: gasPrice.toString(),
      estimatedCost: estimatedCost.toString(),
      estimatedCostEth: ethers.formatEther(estimatedCost)
    });

  } catch (error) {
    console.error('Error estimating gas:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to estimate gas',
      error: error.message
    });
  }
});

module.exports = router;