const express = require('express');
const { ethers } = require('ethers');
const Joi = require('joi');
const crypto = require('crypto');
const router = express.Router();

// Import contract ABI and address
const contractABI = require('../../artifacts/contracts/Certificate.sol/Certificate.json').abi;
const contractAddresses = require('../contract-addresses.json');

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
  metadata: Joi.object({
    description: Joi.string().max(500).optional(),
    skills: Joi.array().items(Joi.string().max(50)).max(10).optional(),
    grade: Joi.string().max(10).optional(),
    credits: Joi.number().min(0).optional(),
    additionalInfo: Joi.object().optional()
  }).optional()
});

/**
 * @route POST /api/certificates/mint
 * @desc Mint a new certificate NFT
 * @access Private (Authorized issuers only)
 */
router.post('/mint', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = mintCertificateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    const {
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      expiryDate = 0,
      metadata = {}
    } = value;

    // Initialize provider and signer
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    const signer = new ethers.Wallet(process.env.ISSUER_PRIVATE_KEY, provider);

    // Get contract instance
    const contractAddress = contractAddresses.Certificate;
    if (!contractAddress) {
      return res.status(500).json({
        success: false,
        message: 'Contract not deployed'
      });
    }

    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    // Check if signer is authorized to issue certificates
    const isAuthorized = await contract.authorizedIssuers(signer.address);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to issue certificates'
      });
    }

    // Generate unique certificate hash
    const certificateData = {
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      issuer: signer.address,
      timestamp: Date.now(),
      metadata
    };

    const certificateHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(certificateData))
      .digest('hex');

    // Check if hash already exists
    const hashExists = await contract.usedHashes(certificateHash);
    if (hashExists) {
      return res.status(409).json({
        success: false,
        message: 'Certificate with this data already exists'
      });
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
        certificateHash
      );
    } catch (estimateError) {
      console.error('Gas estimation failed:', estimateError);
      return res.status(400).json({
        success: false,
        message: 'Failed to estimate transaction cost',
        details: estimateError.reason || estimateError.message
      });
    }

    // Add 20% buffer to gas estimate
    const gasLimit = gasEstimate * 120n / 100n;

    // Get current gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;

    // Calculate transaction cost
    const transactionCost = gasLimit * gasPrice;
    const transactionCostEth = ethers.formatEther(transactionCost);

    // Check signer balance
    const signerBalance = await provider.getBalance(signer.address);
    if (signerBalance < transactionCost) {
      return res.status(402).json({
        success: false,
        message: 'Insufficient funds for transaction',
        details: {
          required: transactionCostEth,
          available: ethers.formatEther(signerBalance)
        }
      });
    }

    // Execute the minting transaction
    const transaction = await contract.issueCertificate(
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      expiryDate,
      certificateHash,
      {
        gasLimit,
        gasPrice
      }
    );

    // Wait for transaction confirmation
    const receipt = await transaction.wait();

    // Extract token ID from the event logs
    const certificateIssuedEvent = receipt.logs.find(
      log => log.topics[0] === contract.interface.getEvent('CertificateIssued').topicHash
    );

    let tokenId;
    if (certificateIssuedEvent) {
      const decodedEvent = contract.interface.parseLog(certificateIssuedEvent);
      tokenId = decodedEvent.args.tokenId.toString();
    }

    // Get the minted certificate data
    const certificateOnChain = await contract.certificates(tokenId);

    // Format response data
    const certificateResponse = {
      tokenId,
      recipientName: certificateOnChain.recipientName,
      recipientAddress,
      courseName: certificateOnChain.courseName,
      institutionName: certificateOnChain.institutionName,
      issueDate: certificateOnChain.issueDate.toString(),
      expiryDate: certificateOnChain.expiryDate.toString(),
      isRevoked: certificateOnChain.isRevoked,
      issuer: certificateOnChain.issuer,
      certificateHash: certificateOnChain.certificateHash,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      metadata
    };

    res.status(201).json({
      success: true,
      message: 'Certificate minted successfully',
      data: {
        certificate: certificateResponse,
        transaction: {
          hash: receipt.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          effectiveGasPrice: receipt.effectiveGasPrice?.toString(),
          cost: ethers.formatEther(receipt.gasUsed * (receipt.effectiveGasPrice || gasPrice))
        },
        verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${certificateHash}`
      }
    });

  } catch (error) {
    console.error('Error minting certificate:', error);

    // Handle specific blockchain errors
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return res.status(402).json({
        success: false,
        message: 'Insufficient funds for transaction'
      });
    }

    if (error.code === 'NETWORK_ERROR') {
      return res.status(503).json({
        success: false,
        message: 'Blockchain network error. Please try again later.'
      });
    }

    if (error.reason) {
      return res.status(400).json({
        success: false,
        message: 'Transaction failed',
        details: error.reason
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during certificate minting'
    });
  }
});

/**
 * @route POST /api/certificates/batch-mint
 * @desc Mint multiple certificates in batch
 * @access Private (Authorized issuers only)
 */
router.post('/batch-mint', async (req, res) => {
  try {
    const { certificates } = req.body;

    if (!Array.isArray(certificates) || certificates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Certificates array is required and must not be empty'
      });
    }

    if (certificates.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 50 certificates can be minted in a single batch'
      });
    }

    // Validate each certificate
    const validationErrors = [];
    const validatedCertificates = [];

    for (let i = 0; i < certificates.length; i++) {
      const { error, value } = mintCertificateSchema.validate(certificates[i]);
      if (error) {
        validationErrors.push({
          index: i,
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      } else {
        validatedCertificates.push({ index: i, data: value });
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed for some certificates',
        errors: validationErrors
      });
    }

    // Initialize provider and signer
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    const signer = new ethers.Wallet(process.env.ISSUER_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(contractAddresses.Certificate, contractABI, signer);

    // Check authorization
    const isAuthorized = await contract.authorizedIssuers(signer.address);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to issue certificates'
      });
    }

    const results = [];
    const errors = [];

    // Process each certificate
    for (const { index, data } of validatedCertificates) {
      try {
        const {
          recipientAddress,
          recipientName,
          courseName,
          institutionName,
          expiryDate = 0,
          metadata = {}
        } = data;

        // Generate certificate hash
        const certificateData = {
          recipientAddress,
          recipientName,
          courseName,
          institutionName,
          issuer: signer.address,
          timestamp: Date.now() + index, // Add index to ensure uniqueness
          metadata
        };

        const certificateHash = crypto
          .createHash('sha256')
          .update(JSON.stringify(certificateData))
          .digest('hex');

        // Check if hash already exists
        const hashExists = await contract.usedHashes(certificateHash);
        if (hashExists) {
          errors.push({
            index,
            error: 'Certificate with this data already exists'
          });
          continue;
        }

        // Mint certificate
        const transaction = await contract.issueCertificate(
          recipientAddress,
          recipientName,
          courseName,
          institutionName,
          expiryDate,
          certificateHash
        );

        const receipt = await transaction.wait();

        // Extract token ID
        const certificateIssuedEvent = receipt.logs.find(
          log => log.topics[0] === contract.interface.getEvent('CertificateIssued').topicHash
        );

        let tokenId;
        if (certificateIssuedEvent) {
          const decodedEvent = contract.interface.parseLog(certificateIssuedEvent);
          tokenId = decodedEvent.args.tokenId.toString();
        }

        results.push({
          index,
          success: true,
          tokenId,
          certificateHash,
          transactionHash: receipt.hash,
          verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${certificateHash}`
        });

      } catch (error) {
        console.error(`Error minting certificate at index ${index}:`, error);
        errors.push({
          index,
          error: error.reason || error.message || 'Unknown error'
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
    console.error('Error in batch minting:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during batch minting'
    });
  }
});

/**
 * @route GET /api/certificates/estimate-cost
 * @desc Estimate the cost of minting a certificate
 * @access Public
 */
router.get('/estimate-cost', async (req, res) => {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    const signer = new ethers.Wallet(process.env.ISSUER_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(contractAddresses.Certificate, contractABI, signer);

    // Use dummy data for gas estimation
    const dummyData = {
      recipientAddress: '0x0000000000000000000000000000000000000001',
      recipientName: 'Test Recipient',
      courseName: 'Test Course',
      institutionName: 'Test Institution',
      expiryDate: 0,
      certificateHash: 'test_hash_' + Date.now()
    };

    const gasEstimate = await contract.issueCertificate.estimateGas(
      dummyData.recipientAddress,
      dummyData.recipientName,
      dummyData.courseName,
      dummyData.institutionName,
      dummyData.expiryDate,
      dummyData.certificateHash
    );

    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;
    const estimatedCost = gasEstimate * gasPrice;

    res.json({
      success: true,
      data: {
        gasEstimate: gasEstimate.toString(),
        gasPrice: gasPrice.toString(),
        estimatedCostWei: estimatedCost.toString(),
        estimatedCostEth: ethers.formatEther(estimatedCost),
        estimatedCostUSD: null // Would need price oracle integration
      }
    });

  } catch (error) {
    console.error('Error estimating cost:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to estimate minting cost'
    });
  }
});

module.exports = router;