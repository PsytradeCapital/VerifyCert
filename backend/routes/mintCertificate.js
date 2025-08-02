const express = require('express');
const { ethers } = require('ethers');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const pushNotificationService = require('../src/services/pushNotificationService');
const router = express.Router();

// Load contract ABI and address
const contractABI = require('../../artifacts/contracts/Certificate.sol/Certificate.json').abi;
const contractAddresses = require('../../contract-addresses.json');

// Rate limiting for minting
const mintRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 mint requests per windowMs
  message: {
    error: 'Too many mint requests, please try again later'
  }
});

// Validation schema for certificate minting
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
    .max(100)
    .required()
    .messages({
      'string.min': 'Institution name must be at least 2 characters',
      'string.max': 'Institution name must not exceed 100 characters'
    }),
  metadata: Joi.object({
    description: Joi.string().max(500),
    image: Joi.string().uri(),
    attributes: Joi.array().items(
      Joi.object({
        trait_type: Joi.string().required(),
        value: Joi.alternatives().try(Joi.string(), Joi.number()).required()
      })
    )
  }).optional()
});

/**
 * @route POST /api/certificates/mint
 * @desc Mint a new certificate NFT
 * @access Private (Authorized issuers only)
 */
router.post('/mint', mintRateLimit, async (req, res) => {
  try {
    // Validate request body
    const { error, value } = mintCertificateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }

    const {
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      metadata = {}
    } = value;

    // Initialize provider and signer
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Get contract instance
    const contractAddress = contractAddresses[process.env.NETWORK || 'mumbai'];
    if (!contractAddress) {
      return res.status(500).json({
        success: false,
        error: 'Contract not deployed on this network'
      });
    }

    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    // Check if signer is authorized to mint
    const isAuthorized = await contract.authorizedIssuers(signer.address);
    const isOwner = await contract.owner() === signer.address;

    if (!isAuthorized && !isOwner) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to mint certificates'
      });
    }

    // Create metadata JSON
    const tokenMetadata = {
      name: `${courseName} Certificate`,
      description: metadata.description || `Certificate of completion for ${courseName} issued by ${institutionName}`,
      image: metadata.image || process.env.DEFAULT_CERTIFICATE_IMAGE,
      attributes: [
        {
          trait_type: "Recipient",
          value: recipientName
        },
        {
          trait_type: "Course",
          value: courseName
        },
        {
          trait_type: "Institution",
          value: institutionName
        },
        {
          trait_type: "Issue Date",
          value: new Date().toISOString().split('T')[0]
        },
        ...(metadata.attributes || [])
      ]
    };

    // Upload metadata to IPFS or use a metadata service
    // For now, we'll create a simple metadata URI
    const metadataURI = `${process.env.METADATA_BASE_URL}/certificates/${Date.now()}.json`;

    // Estimate gas for the transaction
    const gasEstimate = await contract.issueCertificate.estimateGas(
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      metadataURI
    );

    // Add 20% buffer to gas estimate
    const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

    // Execute the minting transaction
    const transaction = await contract.issueCertificate(
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      metadataURI,
      {
        gasLimit: gasLimit
      }
    );

    console.log(`Certificate minting transaction submitted: ${transaction.hash}`);

    // Wait for transaction confirmation
    const receipt = await transaction.wait();

    // Extract token ID from the event logs
    const certificateIssuedEvent = receipt.logs.find(
      log => log.topics[0] === ethers.id("CertificateIssued(uint256,address,address,string,string,string)")
    );

    let tokenId;
    if (certificateIssuedEvent) {
      const decodedEvent = contract.interface.parseLog(certificateIssuedEvent);
      tokenId = decodedEvent.args.tokenId.toString();
    }

    // Store metadata (in a real implementation, you'd store this in IPFS or a database)
    // For now, we'll just log it
    console.log('Certificate metadata:', JSON.stringify(tokenMetadata, null, 2));

    // Send push notification to recipient
    try {
      await pushNotificationService.notifyCertificateIssued(recipientAddress, {
        tokenId: tokenId,
        courseName,
        institutionName,
        recipientName
      });
    } catch (notificationError) {
      console.error('Failed to send push notification:', notificationError);
      // Don't fail the entire request if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Certificate minted successfully',
      data: {
        tokenId: tokenId,
        transactionHash: transaction.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        contractAddress: contractAddress,
        recipient: recipientAddress,
        recipientName,
        courseName,
        institutionName,
        metadataURI,
        metadata: tokenMetadata
      }
    });

  } catch (error) {
    console.error('Certificate minting error:', error);

    // Handle specific contract errors
    if (error.code === 'CALL_EXCEPTION') {
      return res.status(400).json({
        success: false,
        error: 'Contract call failed',
        details: error.reason || 'Transaction reverted'
      });
    }

    if (error.code === 'INSUFFICIENT_FUNDS') {
      return res.status(400).json({
        success: false,
        error: 'Insufficient funds for gas'
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
 * @route POST /api/certificates/batch-mint
 * @desc Mint multiple certificates in batch
 * @access Private (Authorized issuers only)
 */
router.post('/batch-mint', mintRateLimit, async (req, res) => {
  try {
    const { certificates } = req.body;

    if (!Array.isArray(certificates) || certificates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Certificates array is required and must not be empty'
      });
    }

    if (certificates.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 50 certificates can be minted in a single batch'
      });
    }

    // Validate each certificate
    const validationErrors = [];
    certificates.forEach((cert, index) => {
      const { error } = mintCertificateSchema.validate(cert);
      if (error) {
        validationErrors.push({
          index,
          errors: error.details.map(detail => detail.message)
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
    for (let i = 0; i < certificates.length; i++) {
      try {
        // This is a simplified approach - in production, you'd want to optimize this
        // by creating a batch minting function in the smart contract
        const result = await mintSingleCertificate(certificates[i]);
        results.push({
          index: i,
          success: true,
          ...result
        });

      } catch (error) {
        errors.push({
          index: i,
          success: false,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Batch minting completed. ${results.length} successful, ${errors.length} failed.`,
      data: {
        successful: results,
        failed: errors,
        summary: {
          total: certificates.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });

  } catch (error) {
    console.error('Batch minting error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during batch minting'
    });
  }
});

// Helper function for single certificate minting (used in batch)
async function mintSingleCertificate(certificateData) {
  const {
    recipientAddress,
    recipientName,
    courseName,
    institutionName,
    metadata = {}
  } = certificateData;

  // Initialize provider and signer
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // Get contract instance
  const contractAddress = contractAddresses[process.env.NETWORK || 'mumbai'];
  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  // Create metadata JSON
  const tokenMetadata = {
    name: `${courseName} Certificate`,
    description: metadata.description || `Certificate of completion for ${courseName} issued by ${institutionName}`,
    image: metadata.image || process.env.DEFAULT_CERTIFICATE_IMAGE,
    attributes: [
      {
        trait_type: "Recipient",
        value: recipientName
      },
      {
        trait_type: "Course",
        value: courseName
      },
      {
        trait_type: "Institution",
        value: institutionName
      },
      {
        trait_type: "Issue Date",
        value: new Date().toISOString().split('T')[0]
      },
      ...(metadata.attributes || [])
    ]
  };

  const metadataURI = `${process.env.METADATA_BASE_URL}/certificates/${Date.now()}.json`;

  // Execute the minting transaction
  const transaction = await contract.issueCertificate(
    recipientAddress,
    recipientName,
    courseName,
    institutionName,
    metadataURI
  );

  const receipt = await transaction.wait();

  // Extract token ID from the event logs
  const certificateIssuedEvent = receipt.logs.find(
    log => log.topics[0] === ethers.id("CertificateIssued(uint256,address,address,string,string,string)")
  );

  let tokenId;
  if (certificateIssuedEvent) {
    const decodedEvent = contract.interface.parseLog(certificateIssuedEvent);
    tokenId = decodedEvent.args.tokenId.toString();
  }

  return {
    tokenId: tokenId,
    transactionHash: transaction.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString(),
    contractAddress: contractAddress,
    recipient: recipientAddress,
    recipientName,
    courseName,
    institutionName,
    metadataURI,
    metadata: tokenMetadata
  };
}

module.exports = router;