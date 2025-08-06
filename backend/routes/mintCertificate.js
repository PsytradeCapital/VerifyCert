const express = require('express');
const { ethers } = require('ethers');
const Joi = require('joi');
const QRCode = require('qrcode');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Load contract ABI and addresses
const contractABI = require('../contracts/Certificate.json').abi;
const contractAddresses = require('../contract-addresses.json');

// Rate limiting for minting requests
const mintRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 minting requests per 15 minutes
  message: {
    error: 'Too many certificate minting requests from this IP, please try again later.',
    retryAfter: 900 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schema for certificate minting
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
let wallet;
let contract;

try {
  // Initialize provider
  provider = new ethers.JsonRpcProvider(
    process.env.POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology/'
  );
  
  // Initialize wallet
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
  
  console.log('✅ Certificate minting contract initialized:', contractAddress);
  console.log('📝 Issuer wallet address:', wallet.address);
} catch (error) {
  console.error('❌ Failed to initialize minting contract:', error.message);
}

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
        success: false,
        error: 'Validation failed',
        message: error.details[0].message,
        details: error.details
      });
    }

    const { recipientAddress, recipientName, courseName, institutionName, metadataURI } = value;

    // Check if contract is initialized
    if (!contract || !wallet) {
      return res.status(500).json({
        success: false,
        error: 'Contract not initialized',
        message: 'Certificate minting service is currently unavailable'
      });
    }

    console.log(`🎓 Minting certificate for ${recipientName} - ${courseName}`);

    try {
      // Check if issuer is authorized
      const isAuthorized = await contract.isAuthorizedIssuer(wallet.address);
      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized issuer',
          message: 'This wallet is not authorized to issue certificates'
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
          metadataURI || ''
        );
        console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
      } catch (gasError) {
        console.error('Gas estimation failed:', gasError);
        return res.status(400).json({
          success: false,
          error: 'Transaction simulation failed',
          message: 'Unable to estimate gas for this transaction. Please check the input data.'
        });
      }

      // Check wallet balance
      const balance = await provider.getBalance(wallet.address);
      const gasPrice = await provider.getFeeData();
      const estimatedCost = gasEstimate * gasPrice.gasPrice;
      
      if (balance < estimatedCost) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient funds',
          message: 'Issuer wallet has insufficient funds to pay for gas fees'
        });
      }

      // Execute the minting transaction
      const tx = await contract.issueCertificate(
        recipientAddress,
        recipientName,
        courseName,
        institutionName,
        metadataURI || '',
        {
          gasLimit: gasEstimate * 120n / 100n, // Add 20% buffer
          gasPrice: gasPrice.gasPrice
        }
      );

      console.log(`📤 Transaction sent: ${tx.hash}`);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

      // Extract token ID from the transaction receipt
      const certificateIssuedEvent = receipt.logs.find(
        log => log.topics[0] === ethers.id('CertificateIssued(uint256,address,address,string,string,string)')
      );

      if (!certificateIssuedEvent) {
        throw new Error('CertificateIssued event not found in transaction receipt');
      }

      // Decode the event to get token ID
      const decodedEvent = contract.interface.parseLog(certificateIssuedEvent);
      const tokenId = decodedEvent.args.tokenId.toString();

      console.log(`🎉 Certificate minted successfully with token ID: ${tokenId}`);

      // Generate verification URL
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationUrl = `${frontendUrl}/verify/${tokenId}`;

      // Generate QR code for verification
      let qrCodeDataURL;
      try {
        qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
      } catch (qrError) {
        console.warn('Failed to generate QR code:', qrError.message);
        qrCodeDataURL = null;
      }

      // Prepare response data
      const responseData = {
        tokenId: tokenId,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        contractAddress: await contract.getAddress(),
        recipient: recipientAddress,
        issuer: wallet.address,
        recipientName: recipientName,
        courseName: courseName,
        institutionName: institutionName,
        verificationUrl: verificationUrl,
        qrCode: qrCodeDataURL,
        explorerUrl: `https://amoy.polygonscan.com/tx/${tx.hash}`,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice?.toString() || 'N/A',
        network: 'Polygon Amoy Testnet'
      };

      console.log(`🎊 Certificate minting completed successfully for token ID: ${tokenId}`);

      res.status(201).json({
        success: true,
        message: 'Certificate minted successfully',
        data: responseData
      });

    } catch (contractError) {
      console.error('Contract interaction error:', contractError);
      
      // Handle specific contract errors
      if (contractError.message.includes('Certificate with identical data already exists')) {
        return res.status(409).json({
          success: false,
          error: 'Duplicate certificate',
          message: 'A certificate with identical data already exists'
        });
      }
      
      if (contractError.message.includes('Not authorized to issue certificates')) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized issuer',
          message: 'This wallet is not authorized to issue certificates'
        });
      }

      if (contractError.message.includes('insufficient funds')) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient funds',
          message: 'Insufficient funds to complete the transaction'
        });
      }

      // Generic contract error
      return res.status(500).json({
        success: false,
        error: 'Blockchain transaction failed',
        message: 'Failed to mint certificate on blockchain',
        ...(process.env.NODE_ENV === 'development' && { details: contractError.message })
      });
    }

  } catch (error) {
    console.error('❌ Certificate minting error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred during certificate minting',
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
      walletInitialized: !!wallet,
      timestamp: new Date().toISOString()
    };

    if (contract && wallet) {
      try {
        // Test contract connectivity and authorization
        const contractAddress = await contract.getAddress();
        const isAuthorized = await contract.isAuthorizedIssuer(wallet.address);
        const balance = await provider.getBalance(wallet.address);
        
        status.contractAddress = contractAddress;
        status.issuerAddress = wallet.address;
        status.isAuthorized = isAuthorized;
        status.walletBalance = ethers.formatEther(balance) + ' MATIC';
        status.networkConnected = true;
        
        if (!isAuthorized) {
          status.status = 'warning';
          status.warning = 'Issuer wallet is not authorized to mint certificates';
        }
        
      } catch (error) {
        status.status = 'degraded';
        status.networkConnected = false;
        status.error = 'Failed to connect to blockchain';
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

/**
 * GET /api/mint-certificate/issuer-info
 * Get issuer wallet information
 */
router.get('/mint-certificate/issuer-info', async (req, res) => {
  try {
    if (!wallet || !contract) {
      return res.status(500).json({
        success: false,
        error: 'Service not initialized',
        message: 'Minting service is not properly configured'
      });
    }

    const balance = await provider.getBalance(wallet.address);
    const isAuthorized = await contract.isAuthorizedIssuer(wallet.address);
    const totalSupply = await contract.totalSupply();

    res.json({
      success: true,
      data: {
        address: wallet.address,
        balance: ethers.formatEther(balance) + ' MATIC',
        isAuthorized: isAuthorized,
        totalCertificatesIssued: totalSupply.toString(),
        network: 'Polygon Amoy Testnet',
        contractAddress: await contract.getAddress()
      }
    });
  } catch (error) {
    console.error('Issuer info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get issuer information',
      message: error.message
    });
  }
});

module.exports = router;