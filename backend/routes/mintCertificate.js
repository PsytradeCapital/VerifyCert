const express = require('express');
const { ethers } = require('ethers');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Import contract ABI and configuration
const certificateABI = require('../../artifacts/contracts/Certificate.sol/Certificate.json').abi;
const contractAddresses = require('../../contract-addresses.json');

// Rate limiting for minting (prevent spam)
const mintRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 mint requests per windowMs
  message: {
    error: 'Too many mint requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schema for mint certificate request
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
    .required()
    .messages({
      'string.min': 'Recipient name must be at least 2 characters',
      'string.max': 'Recipient name must not exceed 100 characters',
      'any.required': 'Recipient name is required'
    }),
  courseName: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': 'Course name must be at least 2 characters',
      'string.max': 'Course name must not exceed 200 characters',
      'any.required': 'Course name is required'
    }),
  institutionName: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': 'Institution name must be at least 2 characters',
      'string.max': 'Institution name must not exceed 200 characters',
      'any.required': 'Institution name is required'
    }),
  metadata: Joi.object({
    description: Joi.string().max(500).optional(),
    image: Joi.string().uri().optional(),
    attributes: Joi.array().items(
      Joi.object({
        trait_type: Joi.string().required(),
        value: Joi.alternatives().try(Joi.string(), Joi.number()).required()
      })
    ).optional()
  }).optional()
});

// Initialize blockchain provider and contract
let provider, contract, signer;

const initializeBlockchain = () => {
  try {
    // Initialize provider (Polygon Mumbai testnet)
    provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    
    // Initialize signer with private key
    signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // Initialize contract instance
    const contractAddress = contractAddresses.mumbai?.Certificate || contractAddresses.Certificate;
    if (!contractAddress) {
      throw new Error('Certificate contract address not found');
    }
    
    contract = new ethers.Contract(contractAddress, certificateABI, signer);
    
    console.log('Blockchain connection initialized successfully');
  } catch (error) {
    console.error('Failed to initialize blockchain connection:', error);
    throw error;
  }
};

// Initialize on module load
initializeBlockchain();

/**
 * Generate metadata URI for certificate
 */
const generateMetadataURI = (certificateData) => {
  const metadata = {
    name: `${certificateData.courseName} Certificate`,
    description: `Certificate of completion for ${certificateData.courseName} issued to ${certificateData.recipientName} by ${certificateData.institutionName}`,
    image: certificateData.metadata?.image || `${process.env.FRONTEND_URL}/api/certificate-image/${Date.now()}`,
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
        value: new Date().toISOString().split('T')[0]
      },
      ...(certificateData.metadata?.attributes || [])
    ],
    external_url: `${process.env.FRONTEND_URL}/certificate/`,
    ...certificateData.metadata
  };

  // In production, you would upload this to IPFS or a decentralized storage
  // For now, we'll use a placeholder URI
  const metadataString = JSON.stringify(metadata);
  const metadataBase64 = Buffer.from(metadataString).toString('base64');
  return `data:application/json;base64,${metadataBase64}`;
};

/**
 * POST /api/mint-certificate
 * Mint a new certificate NFT
 */
router.post('/mint-certificate', mintRateLimit, async (req, res) => {
  try {
    // Validate request body
    const { error, value } = mintCertificateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        })),
        code: 'VALIDATION_ERROR'
      });
    }

    const { recipientAddress, recipientName, courseName, institutionName, metadata } = value;

    // Check if signer is authorized issuer
    const isAuthorized = await contract.authorizedIssuers(signer.address);
    const isOwner = await contract.owner() === signer.address;
    
    if (!isAuthorized && !isOwner) {
      return res.status(403).json({
        error: 'Unauthorized: Not an authorized certificate issuer',
        code: 'UNAUTHORIZED_ISSUER'
      });
    }

    // Generate metadata URI
    const tokenURI = generateMetadataURI({
      recipientName,
      courseName,
      institutionName,
      metadata
    });

    // Estimate gas for the transaction
    let gasEstimate;
    try {
      gasEstimate = await contract.issueCertificate.estimateGas(
        recipientAddress,
        recipientName,
        courseName,
        institutionName,
        tokenURI
      );
    } catch (estimateError) {
      console.error('Gas estimation failed:', estimateError);
      return res.status(400).json({
        error: 'Transaction simulation failed',
        details: estimateError.message,
        code: 'GAS_ESTIMATION_FAILED'
      });
    }

    // Add 20% buffer to gas estimate
    const gasLimit = gasEstimate * 120n / 100n;

    // Execute the mint transaction
    console.log('Minting certificate...', {
      recipient: recipientAddress,
      recipientName,
      courseName,
      institutionName,
      gasLimit: gasLimit.toString()
    });

    const tx = await contract.issueCertificate(
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      tokenURI,
      { gasLimit }
    );

    console.log('Transaction submitted:', tx.hash);

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt.transactionHash);

    // Extract token ID from the event logs
    const certificateIssuedEvent = receipt.logs.find(
      log => log.topics[0] === ethers.id('CertificateIssued(uint256,address,address,string,string,string)')
    );

    let tokenId;
    if (certificateIssuedEvent) {
      const decodedEvent = contract.interface.parseLog(certificateIssuedEvent);
      tokenId = decodedEvent.args.tokenId.toString();
    }

    // Get certificate data from blockchain
    const certificateData = tokenId ? await contract.getCertificate(tokenId) : null;

    res.status(201).json({
      success: true,
      message: 'Certificate minted successfully',
      data: {
        tokenId,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        certificate: certificateData ? {
          tokenId,
          recipientName: certificateData.recipientName,
          courseName: certificateData.courseName,
          institutionName: certificateData.institutionName,
          issueDate: certificateData.issueDate.toString(),
          issuer: certificateData.issuer,
          isRevoked: certificateData.isRevoked,
          recipient: recipientAddress,
          tokenURI,
          verificationUrl: `${process.env.FRONTEND_URL}/verify/${tokenId}`
        } : null
      }
    });

  } catch (error) {
    console.error('Certificate minting error:', error);

    // Handle specific blockchain errors
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return res.status(400).json({
        error: 'Insufficient funds for transaction',
        code: 'INSUFFICIENT_FUNDS'
      });
    }

    if (error.code === 'NETWORK_ERROR') {
      return res.status(503).json({
        error: 'Blockchain network error',
        details: error.message,
        code: 'NETWORK_ERROR'
      });
    }

    if (error.reason) {
      return res.status(400).json({
        error: 'Smart contract error',
        details: error.reason,
        code: 'CONTRACT_ERROR'
      });
    }

    res.status(500).json({
      error: 'Internal server error during certificate minting',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/mint-status/:txHash
 * Check the status of a minting transaction
 */
router.get('/mint-status/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;

    if (!ethers.isHexString(txHash, 32)) {
      return res.status(400).json({
        error: 'Invalid transaction hash format',
        code: 'INVALID_TX_HASH'
      });
    }

    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      return res.json({
        status: 'pending',
        message: 'Transaction is still pending'
      });
    }

    if (receipt.status === 0) {
      return res.json({
        status: 'failed',
        message: 'Transaction failed',
        blockNumber: receipt.blockNumber
      });
    }

    // Extract token ID from successful transaction
    const certificateIssuedEvent = receipt.logs.find(
      log => log.topics[0] === ethers.id('CertificateIssued(uint256,address,address,string,string,string)')
    );

    let tokenId;
    if (certificateIssuedEvent) {
      const decodedEvent = contract.interface.parseLog(certificateIssuedEvent);
      tokenId = decodedEvent.args.tokenId.toString();
    }

    res.json({
      status: 'confirmed',
      message: 'Certificate minted successfully',
      data: {
        tokenId,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        verificationUrl: tokenId ? `${process.env.FRONTEND_URL}/verify/${tokenId}` : null
      }
    });

  } catch (error) {
    console.error('Error checking mint status:', error);
    res.status(500).json({
      error: 'Failed to check transaction status',
      code: 'STATUS_CHECK_ERROR'
    });
  }
});

/**
 * GET /api/issuer-info
 * Get information about the current issuer
 */
router.get('/issuer-info', async (req, res) => {
  try {
    const issuerAddress = signer.address;
    const isAuthorized = await contract.authorizedIssuers(issuerAddress);
    const isOwner = (await contract.owner()).toLowerCase() === issuerAddress.toLowerCase();
    const balance = await provider.getBalance(issuerAddress);

    res.json({
      address: issuerAddress,
      isAuthorized: isAuthorized || isOwner,
      isOwner,
      balance: ethers.formatEther(balance),
      canMint: isAuthorized || isOwner
    });

  } catch (error) {
    console.error('Error getting issuer info:', error);
    res.status(500).json({
      error: 'Failed to get issuer information',
      code: 'ISSUER_INFO_ERROR'
    });
  }
});

module.exports = router;