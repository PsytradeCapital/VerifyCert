const express = require('express');
const { ethers } = require('ethers');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const QRCode = require('qrcode');
const router = express.Router();

// Load contract ABI and addresses
const contractABI = require('../contracts/Certificate.json').abi;
const contractAddresses = require('../contract-addresses.json');

// Rate limiting for minting
const mintRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 mint requests per windowMs
  message: {
    error: 'Too many mint requests from this IP, please try again later.',
    retryAfter: 15 * 60 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schema for mint request
const mintSchema = Joi.object({
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
  metadataURI: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Metadata URI must be a valid URL'
    })
});

// Initialize provider and contract
let provider;
let contract;
let wallet;

try {
  // Use Polygon Amoy RPC
  provider = new ethers.JsonRpcProvider(
    process.env.POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology/'
  );
  
  // Initialize wallet with private key
  if (!process.env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY environment variable is required');
  }
  
  wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  // Initialize contract
  const contractAddress = contractAddresses.polygonAmoy?.Certificate;
  if (!contractAddress) {
    throw new Error('Certificate contract address not found for Polygon Amoy');
  }
  
  contract = new ethers.Contract(contractAddress, contractABI, wallet);
  
  console.log('✅ Certificate contract initialized:', contractAddress);
} catch (error) {
  console.error('❌ Failed to initialize contract:', error.message);
}

/**
 * Generate metadata URI for certificate
 */
const generateMetadataURI = async (certificateData) => {
  const metadata = {
    name: `Certificate: ${certificateData.courseName}`,
    description: `Certificate of completion for ${certificateData.courseName} issued to ${certificateData.recipientName} by ${certificateData.institutionName}`,
    image: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/certificate/${certificateData.tokenId}/image`,
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
        trait_type: 'Blockchain',
        value: 'Polygon Amoy'
      }
    ]
  };
  
  // In production, you would upload this to IPFS or a decentralized storage
  // For now, we'll return a placeholder URI
  return `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/metadata/${Date.now()}`;
};

/**
 * Generate QR code for certificate verification
 */
const generateQRCode = async (tokenId) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${tokenId}`;
  
  try {
    const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return {
      url: verificationUrl,
      qrCode: qrCodeDataURL
    };
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    return {
      url: verificationUrl,
      qrCode: null
    };
  }
};

/**
 * POST /api/mint-certificate
 * Mint a new certificate NFT
 */
router.post('/mint-certificate', mintRateLimit, async (req, res) => {
  try {
    // Validate request body
    const { error, value } = mintSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }

    const { recipientAddress, recipientName, courseName, institutionName, metadataURI } = value;

    // Check if contract is initialized
    if (!contract) {
      return res.status(500).json({
        success: false,
        error: 'Contract not initialized',
        message: 'Please check server configuration'
      });
    }

    // Check if the wallet is authorized to mint
    try {
      const isAuthorized = await contract.isAuthorizedIssuer(wallet.address);
      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized issuer',
          message: 'This wallet is not authorized to issue certificates'
        });
      }
    } catch (error) {
      console.error('Failed to check issuer authorization:', error);
      return res.status(500).json({
        success: false,
        error: 'Authorization check failed',
        message: 'Could not verify issuer authorization'
      });
    }

    // Generate metadata URI if not provided
    let finalMetadataURI = metadataURI;
    if (!finalMetadataURI) {
      finalMetadataURI = await generateMetadataURI({
        recipientName,
        courseName,
        institutionName,
        tokenId: 'pending' // Will be updated after minting
      });
    }

    // Generate metadata hash for integrity verification
    const metadataHash = require('crypto')
      .createHash('sha256')
      .update(JSON.stringify({
        recipientName,
        courseName,
        institutionName,
        timestamp: Date.now()
      }))
      .digest('hex');

    console.log('🔄 Minting certificate...');
    console.log('Recipient:', recipientAddress);
    console.log('Course:', courseName);
    console.log('Institution:', institutionName);

    // Estimate gas
    let gasEstimate;
    try {
      gasEstimate = await contract.issueCertificate.estimateGas(
        recipientAddress,
        recipientName,
        courseName,
        institutionName,
        finalMetadataURI,
        metadataHash
      );
      
      // Add 20% buffer to gas estimate
      gasEstimate = gasEstimate * 120n / 100n;
    } catch (error) {
      console.error('Gas estimation failed:', error);
      return res.status(500).json({
        success: false,
        error: 'Gas estimation failed',
        message: 'Could not estimate transaction gas cost'
      });
    }

    // Execute the minting transaction
    let transaction;
    try {
      transaction = await contract.issueCertificate(
        recipientAddress,
        recipientName,
        courseName,
        institutionName,
        finalMetadataURI,
        metadataHash,
        {
          gasLimit: gasEstimate
        }
      );

      console.log('📝 Transaction submitted:', transaction.hash);
    } catch (error) {
      console.error('Transaction failed:', error);
      
      // Handle specific error cases
      if (error.message.includes('insufficient funds')) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient funds',
          message: 'Not enough MATIC to pay for transaction fees'
        });
      }
      
      if (error.message.includes('nonce too low')) {
        return res.status(400).json({
          success: false,
          error: 'Transaction nonce error',
          message: 'Please try again in a few moments'
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Transaction failed',
        message: error.message || 'Unknown transaction error'
      });
    }

    // Wait for transaction confirmation
    console.log('⏳ Waiting for confirmation...');
    let receipt;
    try {
      receipt = await transaction.wait(1); // Wait for 1 confirmation
      console.log('✅ Transaction confirmed:', receipt.hash);
    } catch (error) {
      console.error('Transaction confirmation failed:', error);
      return res.status(500).json({
        success: false,
        error: 'Transaction confirmation failed',
        message: 'Transaction was submitted but confirmation failed',
        transactionHash: transaction.hash
      });
    }

    // Extract token ID from transaction logs
    let tokenId;
    try {
      const certificateIssuedEvent = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed.name === 'CertificateIssued';
        } catch {
          return false;
        }
      });

      if (certificateIssuedEvent) {
        const parsed = contract.interface.parseLog(certificateIssuedEvent);
        tokenId = parsed.args.tokenId.toString();
      } else {
        throw new Error('CertificateIssued event not found in transaction logs');
      }
    } catch (error) {
      console.error('Failed to extract token ID:', error);
      return res.status(500).json({
        success: false,
        error: 'Token ID extraction failed',
        message: 'Certificate was minted but token ID could not be determined',
        transactionHash: receipt.hash
      });
    }

    // Generate QR code for verification
    const qrData = await generateQRCode(tokenId);

    // Get certificate data from blockchain
    let certificateData;
    try {
      certificateData = await contract.getCertificate(tokenId);
    } catch (error) {
      console.error('Failed to fetch certificate data:', error);
      certificateData = null;
    }

    console.log('🎉 Certificate minted successfully!');
    console.log('Token ID:', tokenId);
    console.log('Transaction Hash:', receipt.hash);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Certificate minted successfully',
      data: {
        tokenId,
        transactionHash: receipt.hash,
        contractAddress: await contract.getAddress(),
        recipient: recipientAddress,
        recipientName,
        courseName,
        institutionName,
        issuer: wallet.address,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        verificationUrl: qrData.url,
        qrCode: qrData.qrCode,
        metadataURI: finalMetadataURI,
        certificateData: certificateData ? {
          recipientName: certificateData.recipientName,
          courseName: certificateData.courseName,
          institutionName: certificateData.institutionName,
          issuer: certificateData.issuer,
          issueDate: certificateData.issueDate.toString(),
          isValid: certificateData.isValid,
          metadataURI: certificateData.metadataURI
        } : null,
        explorerUrl: `https://amoy.polygonscan.com/tx/${receipt.hash}`
      }
    });

  } catch (error) {
    console.error('❌ Mint certificate error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while minting the certificate',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

/**
 * GET /api/mint-certificate/status
 * Get minting service status
 */
router.get('/mint-certificate/status', async (req, res) => {
  try {
    let status = {
      service: 'Certificate Minting Service',
      status: 'operational',
      network: 'Polygon Amoy',
      contractInitialized: !!contract,
      walletConnected: !!wallet,
      timestamp: new Date().toISOString()
    };

    if (contract && wallet) {
      try {
        // Check wallet balance
        const balance = await provider.getBalance(wallet.address);
        status.walletBalance = ethers.formatEther(balance) + ' MATIC';
        
        // Check if wallet is authorized
        const isAuthorized = await contract.isAuthorizedIssuer(wallet.address);
        status.isAuthorizedIssuer = isAuthorized;
        
        // Get contract address
        status.contractAddress = await contract.getAddress();
        
        // Get total certificates issued
        const totalSupply = await contract.totalSupply();
        status.totalCertificatesIssued = totalSupply.toString();
        
      } catch (error) {
        status.status = 'degraded';
        status.error = 'Failed to fetch blockchain data';
        status.details = error.message;
      }
    } else {
      status.status = 'error';
      status.error = 'Contract or wallet not initialized';
    }

    res.json(status);
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      service: 'Certificate Minting Service',
      status: 'error',
      error: 'Failed to check service status',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;