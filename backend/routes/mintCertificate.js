const express = require('express');
const { ethers } = require('ethers');
const crypto = require('crypto');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Rate limiting for certificate minting
const mintRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many certificate minting requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schema for certificate minting
const certificateSchema = Joi.object({
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
    .trim(),
  courseName: Joi.string()
    .min(2)
    .max(200)
    .required()
    .trim(),
  institutionName: Joi.string()
    .min(2)
    .max(200)
    .required()
    .trim(),
  expiryDate: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0),
  metadataURI: Joi.string()
    .uri()
    .optional()
    .default(''),
  issuerPrivateKey: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{64}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid private key format'
    })
});

// Express validator middleware
const validateCertificateData = [
  body('recipientAddress')
    .isEthereumAddress()
    .withMessage('Invalid Ethereum address'),
  body('recipientName')
    .isLength({ min: 2, max: 100 })
    .trim()
    .escape()
    .withMessage('Recipient name must be between 2 and 100 characters'),
  body('courseName')
    .isLength({ min: 2, max: 200 })
    .trim()
    .escape()
    .withMessage('Course name must be between 2 and 200 characters'),
  body('institutionName')
    .isLength({ min: 2, max: 200 })
    .trim()
    .escape()
    .withMessage('Institution name must be between 2 and 200 characters'),
  body('expiryDate')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Expiry date must be a valid timestamp'),
  body('metadataURI')
    .optional()
    .isURL()
    .withMessage('Metadata URI must be a valid URL'),
  body('issuerPrivateKey')
    .matches(/^0x[a-fA-F0-9]{64}$/)
    .withMessage('Invalid private key format')
];

// Load contract configuration
const loadContractConfig = () => {
  try {
    const contractAddresses = require('../contract-addresses.json');
    const contractABI = require('../artifacts/contracts/Certificate.sol/Certificate.json');
    
    return {
      address: contractAddresses.Certificate,
      abi: contractABI.abi
    };
  } catch (error) {
    throw new Error('Failed to load contract configuration: ' + error.message);
  }
};

// Generate unique certificate hash
const generateCertificateHash = (recipientAddress, courseName, institutionName, timestamp) => {
  const data = `${recipientAddress}-${courseName}-${institutionName}-${timestamp}-${crypto.randomBytes(16).toString('hex')}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Create metadata JSON for IPFS (optional)
const createCertificateMetadata = (certificateData, certificateHash) => {
  return {
    name: `${certificateData.courseName} Certificate`,
    description: `Certificate of completion for ${certificateData.courseName} issued by ${certificateData.institutionName}`,
    image: `https://api.verifycert.com/certificate/${certificateHash}/image`,
    attributes: [
      {
        trait_type: "Recipient",
        value: certificateData.recipientName
      },
      {
        trait_type: "Course",
        value: certificateData.courseName
      },
      {
        trait_type: "Institution",
        value: certificateData.institutionName
      },
      {
        trait_type: "Issue Date",
        value: new Date().toISOString()
      },
      {
        trait_type: "Certificate Hash",
        value: certificateHash
      }
    ],
    external_url: `https://verifycert.com/verify/${certificateHash}`
  };
};

/**
 * @route POST /api/certificates/mint
 * @desc Mint a new certificate NFT
 * @access Private (requires valid issuer private key)
 */
router.post('/mint', mintRateLimit, validateCertificateData, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Validate request body with Joi
    const { error, value } = certificateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.details.map(detail => detail.message)
      });
    }

    const {
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      expiryDate,
      metadataURI,
      issuerPrivateKey
    } = value;

    // Load contract configuration
    const contractConfig = loadContractConfig();

    // Setup provider and signer
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_MUMBAI_RPC_URL);
    const signer = new ethers.Wallet(issuerPrivateKey, provider);
    
    // Create contract instance
    const certificateContract = new ethers.Contract(
      contractConfig.address,
      contractConfig.abi,
      signer
    );

    // Check if the signer is an authorized issuer
    const isAuthorized = await certificateContract.authorizedIssuers(signer.address);
    const isOwner = await certificateContract.owner() === signer.address;
    
    if (!isAuthorized && !isOwner) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized issuer',
        message: 'The provided private key does not belong to an authorized certificate issuer'
      });
    }

    // Generate unique certificate hash
    const certificateHash = generateCertificateHash(
      recipientAddress,
      courseName,
      institutionName,
      Date.now()
    );

    // Create metadata if URI not provided
    let finalMetadataURI = metadataURI;
    if (!finalMetadataURI) {
      const metadata = createCertificateMetadata({
        recipientName,
        courseName,
        institutionName
      }, certificateHash);
      
      // In a production environment, you would upload this to IPFS
      // For now, we'll create a placeholder URI
      finalMetadataURI = `https://api.verifycert.com/metadata/${certificateHash}`;
    }

    // Estimate gas for the transaction
    const gasEstimate = await certificateContract.issueCertificate.estimateGas(
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      expiryDate,
      finalMetadataURI,
      certificateHash
    );

    // Add 20% buffer to gas estimate
    const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

    // Get current gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;

    // Issue the certificate
    const transaction = await certificateContract.issueCertificate(
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      expiryDate,
      finalMetadataURI,
      certificateHash,
      {
        gasLimit: gasLimit,
        gasPrice: gasPrice
      }
    );

    // Wait for transaction confirmation
    const receipt = await transaction.wait();

    // Extract token ID from the event logs
    const certificateIssuedEvent = receipt.logs.find(
      log => log.topics[0] === ethers.id('CertificateIssued(uint256,address,address,string,string,string)')
    );

    let tokenId = null;
    if (certificateIssuedEvent) {
      const decodedEvent = certificateContract.interface.parseLog(certificateIssuedEvent);
      tokenId = decodedEvent.args.tokenId.toString();
    }

    // Calculate transaction cost
    const transactionCost = ethers.formatEther(
      BigInt(receipt.gasUsed) * BigInt(receipt.gasPrice || gasPrice)
    );

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Certificate minted successfully',
      data: {
        tokenId: tokenId,
        certificateHash: certificateHash,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        transactionCost: transactionCost,
        recipient: recipientAddress,
        issuer: signer.address,
        verificationUrl: `${req.protocol}://${req.get('host')}/verify/${certificateHash}`,
        certificate: {
          recipientName,
          courseName,
          institutionName,
          issueDate: Math.floor(Date.now() / 1000),
          expiryDate: expiryDate || 0,
          metadataURI: finalMetadataURI
        }
      }
    });

  } catch (error) {
    console.error('Certificate minting error:', error);

    // Handle specific contract errors
    if (error.code === 'CALL_EXCEPTION') {
      return res.status(400).json({
        success: false,
        error: 'Contract call failed',
        message: error.reason || 'Transaction reverted',
        details: error.data
      });
    }

    // Handle insufficient funds
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return res.status(400).json({
        success: false,
        error: 'Insufficient funds',
        message: 'The issuer account does not have enough MATIC to pay for gas fees'
      });
    }

    // Handle network errors
    if (error.code === 'NETWORK_ERROR') {
      return res.status(503).json({
        success: false,
        error: 'Network error',
        message: 'Unable to connect to the blockchain network'
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while minting the certificate',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

/**
 * @route GET /api/certificates/mint/estimate
 * @desc Estimate gas cost for minting a certificate
 * @access Public
 */
router.get('/estimate', async (req, res) => {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_MUMBAI_RPC_URL);
    const feeData = await provider.getFeeData();
    
    // Estimate gas for a typical certificate minting (approximate)
    const estimatedGas = 250000; // Typical gas usage for certificate minting
    const gasPrice = feeData.gasPrice;
    const estimatedCost = ethers.formatEther(BigInt(estimatedGas) * BigInt(gasPrice));

    res.json({
      success: true,
      data: {
        estimatedGas: estimatedGas,
        gasPrice: gasPrice.toString(),
        estimatedCostMATIC: estimatedCost,
        network: 'Polygon Mumbai Testnet'
      }
    });

  } catch (error) {
    console.error('Gas estimation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to estimate gas cost',
      message: error.message
    });
  }
});

module.exports = router;