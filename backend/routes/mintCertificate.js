const express = require('express');
const { ethers } = require('ethers');
const QRCode = require('qrcode');
const crypto = require('crypto');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const router = express.Router();

// Import contract ABI and configuration
const certificateABI = require('../../artifacts/contracts/Certificate.sol/Certificate.json').abi;
const contractAddresses = require('../../contract-addresses.json');

// Validation schema
const mintCertificateSchema = Joi.object({
  recipientAddress: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{40}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid Ethereum address format',
      'any.required': 'Recipient address is required'
    }),
  recipientName: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Recipient name must be at least 2 characters',
      'string.max': 'Recipient name cannot exceed 100 characters',
      'any.required': 'Recipient name is required'
    }),
  courseName: Joi.string()
    .min(2)
    .max(200)
    .trim()
    .required()
    .messages({
      'string.min': 'Course name must be at least 2 characters',
      'string.max': 'Course name cannot exceed 200 characters',
      'any.required': 'Course name is required'
    }),
  institutionName: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Institution name must be at least 2 characters',
      'string.max': 'Institution name cannot exceed 100 characters',
      'any.required': 'Institution name is required'
    }),
  issuerPrivateKey: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{64}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid private key format',
      'any.required': 'Issuer private key is required'
    }),
  additionalMetadata: Joi.object().optional(),
  expirationDate: Joi.date().greater('now').optional(),
  skills: Joi.array().items(Joi.string().trim()).optional(),
  grade: Joi.string().trim().optional(),
  credits: Joi.number().positive().optional()
});

// Rate limiting for minting
const mintRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 mint requests per windowMs
  message: {
    error: 'Too many mint requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware
router.use(helmet());

// Initialize blockchain connection
const initializeProvider = () => {
  const rpcUrl = process.env.POLYGON_MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com/';
  return new ethers.JsonRpcProvider(rpcUrl);
};

// Generate certificate metadata
const generateCertificateMetadata = (certificateData) => {
  const metadata = {
    name: `Certificate: ${certificateData.courseName}`,
    description: `Certificate of completion for ${certificateData.courseName} issued to ${certificateData.recipientName} by ${certificateData.institutionName}`,
    image: `${process.env.FRONTEND_URL}/api/certificate-image/${certificateData.tokenId}`,
    attributes: [
      {
        trait_type: 'Recipient',
        value: certificateData.recipientName
      },
      {
        trait_type: 'Course',
        value: certificateData.courseName
      },
      {
        trait_type: 'Institution',
        value: certificateData.institutionName
      },
      {
        trait_type: 'Issue Date',
        value: new Date().toISOString()
      },
      {
        trait_type: 'Certificate Type',
        value: 'Completion Certificate'
      }
    ],
    external_url: `${process.env.FRONTEND_URL}/verify/${certificateData.tokenId}`,
    ...certificateData.additionalMetadata
  };

  // Add optional attributes
  if (certificateData.skills && certificateData.skills.length > 0) {
    metadata.attributes.push({
      trait_type: 'Skills',
      value: certificateData.skills.join(', ')
    });
  }

  if (certificateData.grade) {
    metadata.attributes.push({
      trait_type: 'Grade',
      value: certificateData.grade
    });
  }

  if (certificateData.credits) {
    metadata.attributes.push({
      trait_type: 'Credits',
      value: certificateData.credits
    });
  }

  if (certificateData.expirationDate) {
    metadata.attributes.push({
      trait_type: 'Expiration Date',
      value: certificateData.expirationDate.toISOString()
    });
  }

  return metadata;
};

// Generate metadata hash for integrity verification
const generateMetadataHash = (metadata) => {
  const metadataString = JSON.stringify(metadata, Object.keys(metadata).sort());
  return crypto.createHash('sha256').update(metadataString).digest('hex');
};

// Generate QR code for certificate verification
const generateQRCode = async (verificationUrl) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('QR Code generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
};

// Store metadata (in production, use IPFS or decentralized storage)
const storeMetadata = async (metadata, metadataHash) => {
  // For development, we'll store in memory or local storage
  // In production, upload to IPFS and return the hash
  
  // Simulate IPFS upload
  const ipfsHash = `Qm${metadataHash.substring(0, 44)}`;
  const metadataURI = `https://ipfs.io/ipfs/${ipfsHash}`;
  
  // Store metadata locally for development
  // In production, this would be handled by IPFS pinning service
  console.log('Metadata stored:', { metadataURI, metadata });
  
  return metadataURI;
};

/**
 * @route POST /api/mint-certificate
 * @desc Mint a new certificate NFT
 * @access Private (requires valid issuer private key)
 */
router.post('/', mintRateLimit, async (req, res) => {
  try {
    // Validate request body
    const { error, value } = mintCertificateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => ({
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
      issuerPrivateKey,
      additionalMetadata,
      expirationDate,
      skills,
      grade,
      credits
    } = value;

    // Initialize blockchain connection
    const provider = initializeProvider();
    const wallet = new ethers.Wallet(issuerPrivateKey, provider);
    
    // Get contract instance
    const contractAddress = contractAddresses.Certificate;
    if (!contractAddress) {
      return res.status(500).json({
        success: false,
        error: 'Contract not deployed',
        message: 'Certificate contract address not found'
      });
    }

    const contract = new ethers.Contract(contractAddress, certificateABI, wallet);

    // Verify issuer is authorized
    const isAuthorized = await contract.authorizedIssuers(wallet.address);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized issuer',
        message: 'The provided private key does not belong to an authorized issuer'
      });
    }

    // Check if recipient address is valid
    if (!ethers.isAddress(recipientAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid recipient address',
        message: 'The provided recipient address is not a valid Ethereum address'
      });
    }

    // Prepare certificate data
    const certificateData = {
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      issuerAddress: wallet.address,
      additionalMetadata,
      expirationDate,
      skills,
      grade,
      credits
    };

    // Generate metadata
    const metadata = generateCertificateMetadata(certificateData);
    const metadataHash = generateMetadataHash(metadata);

    // Store metadata and get URI
    const metadataURI = await storeMetadata(metadata, metadataHash);

    // Estimate gas for the transaction
    let gasEstimate;
    try {
      gasEstimate = await contract.issueCertificate.estimateGas(
        recipientAddress,
        recipientName,
        courseName,
        institutionName,
        metadataURI,
        metadataHash
      );
    } catch (gasError) {
      console.error('Gas estimation failed:', gasError);
      return res.status(500).json({
        success: false,
        error: 'Transaction simulation failed',
        message: 'Unable to estimate gas for certificate minting'
      });
    }

    // Add 20% buffer to gas estimate
    const gasLimit = gasEstimate * 120n / 100n;

    // Get current gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;

    // Mint the certificate
    console.log('Minting certificate...', {
      recipient: recipientAddress,
      course: courseName,
      institution: institutionName,
      gasLimit: gasLimit.toString(),
      gasPrice: gasPrice?.toString()
    });

    const transaction = await contract.issueCertificate(
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      metadataURI,
      metadataHash,
      {
        gasLimit,
        gasPrice
      }
    );

    console.log('Transaction submitted:', transaction.hash);

    // Wait for transaction confirmation
    const receipt = await transaction.wait();
    console.log('Transaction confirmed:', receipt.hash);

    // Extract token ID from transaction logs
    const certificateIssuedEvent = receipt.logs.find(
      log => log.topics[0] === ethers.id('CertificateIssued(uint256,address,address,string,string,string)')
    );

    if (!certificateIssuedEvent) {
      throw new Error('Certificate issued event not found in transaction logs');
    }

    const tokenId = ethers.toBigInt(certificateIssuedEvent.topics[1]).toString();

    // Generate verification URL and QR code
    const verificationUrl = `${process.env.FRONTEND_URL}/verify/${tokenId}`;
    const qrCodeDataURL = await generateQRCode(verificationUrl);

    // Prepare response data
    const responseData = {
      success: true,
      message: 'Certificate minted successfully',
      certificate: {
        tokenId,
        recipientAddress,
        recipientName,
        courseName,
        institutionName,
        issuerAddress: wallet.address,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        metadataURI,
        metadataHash,
        verificationUrl,
        qrCodeDataURL,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice?.toString(),
        timestamp: new Date().toISOString()
      },
      metadata,
      blockchain: {
        network: 'Polygon Mumbai',
        chainId: 80001,
        contractAddress,
        explorerUrl: `https://mumbai.polygonscan.com/tx/${receipt.hash}`
      }
    };

    // Log successful minting
    console.log('Certificate minted successfully:', {
      tokenId,
      recipient: recipientAddress,
      course: courseName,
      txHash: receipt.hash
    });

    res.status(201).json(responseData);

  } catch (error) {
    console.error('Certificate minting failed:', error);

    // Handle specific error types
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return res.status(400).json({
        success: false,
        error: 'Insufficient funds',
        message: 'The issuer wallet does not have enough MATIC to pay for gas fees'
      });
    }

    if (error.code === 'NONCE_EXPIRED' || error.code === 'REPLACEMENT_UNDERPRICED') {
      return res.status(400).json({
        success: false,
        error: 'Transaction failed',
        message: 'Transaction nonce issue. Please try again.'
      });
    }

    if (error.reason && error.reason.includes('Certificate with this hash already exists')) {
      return res.status(409).json({
        success: false,
        error: 'Duplicate certificate',
        message: 'A certificate with identical content already exists'
      });
    }

    if (error.reason && error.reason.includes('Not authorized to issue certificates')) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized issuer',
        message: 'The provided private key does not belong to an authorized issuer'
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Certificate minting failed',
      message: error.message || 'An unexpected error occurred while minting the certificate',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

/**
 * @route GET /api/mint-certificate/gas-estimate
 * @desc Get gas estimate for minting a certificate
 * @access Public
 */
router.post('/gas-estimate', async (req, res) => {
  try {
    const { error, value } = mintCertificateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => ({
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
      issuerPrivateKey
    } = value;

    const provider = initializeProvider();
    const wallet = new ethers.Wallet(issuerPrivateKey, provider);
    const contractAddress = contractAddresses.Certificate;
    const contract = new ethers.Contract(contractAddress, certificateABI, wallet);

    // Generate dummy metadata for estimation
    const metadata = generateCertificateMetadata({
      recipientName,
      courseName,
      institutionName
    });
    const metadataHash = generateMetadataHash(metadata);
    const metadataURI = `https://ipfs.io/ipfs/Qm${metadataHash.substring(0, 44)}`;

    // Estimate gas
    const gasEstimate = await contract.issueCertificate.estimateGas(
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      metadataURI,
      metadataHash
    );

    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;
    const estimatedCost = gasEstimate * gasPrice;

    res.json({
      success: true,
      gasEstimate: {
        gasLimit: gasEstimate.toString(),
        gasPrice: gasPrice?.toString(),
        estimatedCostWei: estimatedCost.toString(),
        estimatedCostMatic: ethers.formatEther(estimatedCost),
        estimatedCostUSD: null // Would need price oracle integration
      }
    });

  } catch (error) {
    console.error('Gas estimation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Gas estimation failed',
      message: error.message
    });
  }
});

/**
 * @route GET /api/mint-certificate/issuer-status/:address
 * @desc Check if an address is an authorized issuer
 * @access Public
 */
router.get('/issuer-status/:address', async (req, res) => {
  try {
    const { address } = req.params;

    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address format'
      });
    }

    const provider = initializeProvider();
    const contractAddress = contractAddresses.Certificate;
    const contract = new ethers.Contract(contractAddress, certificateABI, provider);

    const isAuthorized = await contract.authorizedIssuers(address);

    res.json({
      success: true,
      address,
      isAuthorized,
      contractAddress
    });

  } catch (error) {
    console.error('Issuer status check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check issuer status',
      message: error.message
    });
  }
});

module.exports = router;