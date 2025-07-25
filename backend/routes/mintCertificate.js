const express = require('express');
const { ethers } = require('ethers');
const Joi = require('joi');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();

// Load contract ABI and configuration
const contractABI = require('../../artifacts/contracts/Certificate.sol/Certificate.json').abi;
const contractAddress = process.env.CONTRACT_ADDRESS;
const privateKey = process.env.PRIVATE_KEY;
const rpcUrl = process.env.POLYGON_MUMBAI_RPC_URL;

// Validation schema
const mintCertificateSchema = Joi.object({
  recipientAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  recipientName: Joi.string().min(1).max(100).required(),
  courseName: Joi.string().min(1).max(200).required(),
  institutionName: Joi.string().min(1).max(100).required(),
  metadataURI: Joi.string().uri().optional().default('')
});

// Initialize blockchain connection
const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

/**
 * POST /api/v1/certificates/mint
 * Mint a new certificate NFT
 */
router.post('/mint', async (req, res) => {
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

    const { recipientAddress, recipientName, courseName, institutionName, metadataURI } = value;

    // Check if the wallet is authorized to mint certificates
    const isAuthorized = await contract.authorizedIssuers(wallet.address);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized issuer',
        message: 'This wallet is not authorized to mint certificates'
      });
    }

    // Estimate gas for the transaction
    let gasEstimate;
    try {
      gasEstimate = await contract.mintCertificate.estimateGas(
        recipientAddress,
        recipientName,
        courseName,
        institutionName,
        metadataURI
      );
    } catch (gasError) {
      console.error('Gas estimation failed:', gasError);
      return res.status(400).json({
        success: false,
        error: 'Transaction simulation failed',
        message: 'Unable to estimate gas for this transaction'
      });
    }

    // Mint the certificate
    const tx = await contract.mintCertificate(
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      metadataURI,
      {
        gasLimit: gasEstimate.mul(120).div(100) // Add 20% buffer
      }
    );

    console.log('Certificate minting transaction sent:', tx.hash);

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    // Extract token ID from the transaction receipt
    const mintEvent = receipt.events?.find(event => event.event === 'CertificateMinted');
    if (!mintEvent) {
      throw new Error('Certificate minting event not found in transaction receipt');
    }

    const tokenId = mintEvent.args.tokenId.toString();
    
    // Generate verification URL and QR code
    const verificationURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${tokenId}`;
    
    // Generate QR code
    let qrCodePath = null;
    try {
      const qrCodeDir = path.join(__dirname, '../public/qr-codes');
      await fs.mkdir(qrCodeDir, { recursive: true });
      
      qrCodePath = path.join(qrCodeDir, `${tokenId}.png`);
      await QRCode.toFile(qrCodePath, verificationURL, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (qrError) {
      console.error('QR code generation failed:', qrError);
      // Continue without QR code - not critical
    }

    // Get the complete certificate data
    const certificateData = await contract.getCertificate(tokenId);

    const response = {
      success: true,
      data: {
        tokenId,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        certificate: {
          tokenId,
          issuer: certificateData.issuer,
          recipient: certificateData.recipient,
          recipientName: certificateData.recipientName,
          courseName: certificateData.courseName,
          institutionName: certificateData.institutionName,
          issueDate: Number(certificateData.issueDate),
          metadataURI: certificateData.metadataURI,
          isValid: certificateData.isValid,
          verificationURL,
          qrCodeURL: qrCodePath ? `/api/v1/qr-code/${tokenId}` : null
        }
      },
      message: 'Certificate minted successfully'
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Certificate minting error:', error);

    // Handle specific blockchain errors
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return res.status(400).json({
        success: false,
        error: 'Insufficient funds',
        message: 'Not enough MATIC to pay for transaction fees'
      });
    }

    if (error.code === 'NETWORK_ERROR') {
      return res.status(503).json({
        success: false,
        error: 'Network error',
        message: 'Unable to connect to blockchain network'
      });
    }

    if (error.message.includes('UnauthorizedIssuer')) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized issuer',
        message: 'This wallet is not authorized to mint certificates'
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to mint certificate',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/v1/qr-code/:tokenId
 * Serve QR code image for a certificate
 */
router.get('/qr-code/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    
    const qrCodePath = path.join(__dirname, '../public/qr-codes', `${tokenId}.png`);
    
    try {
      await fs.access(qrCodePath);
      res.sendFile(path.resolve(qrCodePath));
    } catch (fileError) {
      // Generate QR code on-the-fly if it doesn't exist
      const verificationURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${tokenId}`;
      
      res.setHeader('Content-Type', 'image/png');
      await QRCode.toFileStream(res, verificationURL, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    }
  } catch (error) {
    console.error('QR code serving error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate QR code'
    });
  }
});

module.exports = router;