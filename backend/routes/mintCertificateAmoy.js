const express = require('express');
const { ethers } = require('ethers');
const QRCode = require('qrcode');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Load contract ABI and address
const contractABI = require('../../artifacts/contracts/SimpleCertificate.sol/SimpleCertificate.json').abi;
const contractAddresses = require('../../contract-addresses.json');

// Rate limiting for minting
const mintRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many mint requests from this IP, please try again later.',
    retryAfter: 15 * 60 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const validateMintRequest = [
  body('recipientAddress')
    .isEthereumAddress()
    .withMessage('Invalid Ethereum address'),
  body('recipientName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Recipient name must be between 1 and 100 characters'),
  body('courseName')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Course name must be between 1 and 200 characters'),
  body('institutionName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Institution name must be between 1 and 100 characters'),
];

// Initialize provider and contract
let provider, contract;

try {
  // Use Amoy RPC URL
  const rpcUrl = process.env.RPC_URL || 'https://rpc-amoy.polygon.technology/';
  provider = new ethers.JsonRpcProvider(rpcUrl);
  
  // Get contract address from deployment info
  const contractAddress = contractAddresses.contractAddress;
  
  if (!contractAddress) {
    throw new Error('Contract address not found in contract-addresses.json');
  }
  
  contract = new ethers.Contract(contractAddress, contractABI, provider);
  console.log(`SimpleCertificate contract initialized at: ${contractAddress} on Amoy network`);
} catch (error) {
  console.error('Failed to initialize contract:', error);
}

/**
 * Generate QR code for certificate verification
 */
async function generateQRCode(tokenId, contractAddress) {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify?tokenId=${tokenId}&contract=${contractAddress}`;
    const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return {
      qrCodeURL: qrCodeDataURL,
      verificationURL: verificationUrl
    };
  } catch (error) {
    console.error('QR code generation failed:', error);
    return null;
  }
}

/**
 * Create metadata for certificate
 */
function createCertificateMetadata(certificateData, tokenId, qrData) {
  return {
    name: `Certificate #${tokenId}`,
    description: `Certificate of completion for ${certificateData.courseName} issued to ${certificateData.recipientName} by ${certificateData.institutionName}`,
    image: qrData?.qrCodeURL || '',
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
        trait_type: 'Token ID',
        value: tokenId.toString()
      },
      {
        trait_type: 'Network',
        value: 'Polygon Amoy'
      }
    ],
    external_url: qrData?.verificationURL || '',
    certificate_data: {
      tokenId: tokenId.toString(),
      recipientName: certificateData.recipientName,
      courseName: certificateData.courseName,
      institutionName: certificateData.institutionName,
      issueDate: Math.floor(Date.now() / 1000),
      verificationURL: qrData?.verificationURL || '',
      qrCodeURL: qrData?.qrCodeURL || '',
      network: 'amoy',
      chainId: 80002
    }
  };
}

/**
 * POST /api/certificates/mint
 * Mint a new certificate NFT on Amoy network
 */
router.post('/mint', mintRateLimit, validateMintRequest, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      issuerPrivateKey
    } = req.body;

    // Validate required fields
    if (!recipientAddress || !recipientName || !courseName || !institutionName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Validate issuer private key
    if (!issuerPrivateKey) {
      return res.status(400).json({
        success: false,
        error: 'Issuer private key is required'
      });
    }

    // Create wallet from private key
    let issuerWallet;
    try {
      issuerWallet = new ethers.Wallet(issuerPrivateKey, provider);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid issuer private key'
      });
    }

    // Connect contract with issuer wallet
    const contractWithSigner = contract.connect(issuerWallet);

    // Check if issuer is authorized
    const isAuthorized = await contract.authorizedIssuers(issuerWallet.address);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: 'Issuer is not authorized to mint certificates'
      });
    }

    // Get next token ID
    const totalSupply = await contract.totalSupply();
    const nextTokenId = totalSupply + 1n;

    // Generate QR code and verification URL
    const qrData = await generateQRCode(nextTokenId.toString(), contract.target);

    // Create metadata
    const metadata = createCertificateMetadata({
      recipientName,
      courseName,
      institutionName
    }, nextTokenId, qrData);

    // Estimate gas for Amoy network
    let gasEstimate;
    try {
      gasEstimate = await contractWithSigner.issueCertificate.estimateGas(
        recipientAddress,
        recipientName,
        courseName,
        institutionName
      );
    } catch (error) {
      console.error('Gas estimation failed:', error);
      return res.status(400).json({
        success: false,
        error: 'Failed to estimate gas. Please check your parameters.',
        details: error.message
      });
    }

    // Add 20% buffer to gas estimate for Amoy network
    const gasLimit = gasEstimate * 120n / 100n;

    // Issue the certificate on Amoy
    console.log(`Minting certificate for ${recipientName} on Amoy network...`);
    const tx = await contractWithSigner.issueCertificate(
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      {
        gasLimit: gasLimit
      }
    );

    console.log(`Transaction submitted to Amoy: ${tx.hash}`);

    // Wait for transaction confirmation on Amoy
    const receipt = await tx.wait(2); // 2 confirmations for Amoy
    console.log(`Transaction confirmed on Amoy in block: ${receipt.blockNumber}`);

    // Extract token ID from events
    const certificateIssuedEvent = receipt.logs.find(
      log => log.topics[0] === ethers.id('CertificateIssued(uint256,address,address,string,string,string,uint256)')
    );

    let tokenId;
    if (certificateIssuedEvent) {
      const decodedEvent = contract.interface.parseLog(certificateIssuedEvent);
      tokenId = decodedEvent.args.tokenId.toString();
    } else {
      tokenId = nextTokenId.toString();
    }

    // Get certificate data from contract
    const certificateData = await contract.getCertificate(tokenId);

    // Prepare response
    const response = {
      success: true,
      data: {
        tokenId: tokenId,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        network: 'amoy',
        chainId: 80002,
        blockExplorer: `https://amoy.polygonscan.com/tx/${tx.hash}`,
        certificate: {
          tokenId: tokenId,
          recipientName: certificateData.recipientName,
          courseName: certificateData.courseName,
          institutionName: certificateData.institutionName,
          issuer: certificateData.issuer,
          recipient: recipientAddress,
          issueDate: certificateData.issueDate.toString(),
          isValid: certificateData.isValid,
          qrCodeURL: qrData?.qrCodeURL || null,
          verificationURL: qrData?.verificationURL || null
        },
        metadata: metadata
      }
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Certificate minting failed on Amoy:', error);
    
    // Handle specific error types for Amoy network
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return res.status(400).json({
        success: false,
        error: 'Insufficient MATIC for transaction on Amoy network'
      });
    }
    
    if (error.code === 'NETWORK_ERROR') {
      return res.status(503).json({
        success: false,
        error: 'Amoy network error. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to mint certificate on Amoy network',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/certificates/network-info
 * Get current network information
 */
router.get('/network-info', async (req, res) => {
  try {
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    
    res.json({
      success: true,
      data: {
        networkName: 'amoy',
        chainId: network.chainId.toString(),
        blockNumber: blockNumber,
        contractAddress: contract.target,
        rpcUrl: process.env.RPC_URL || 'https://rpc-amoy.polygon.technology/',
        blockExplorer: 'https://amoy.polygonscan.com'
      }
    });
  } catch (error) {
    console.error('Failed to get network info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get network information'
    });
  }
});

module.exports = router;