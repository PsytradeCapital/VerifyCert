const express = require('express');
const { ethers } = require('ethers');
const QRCode = require('qrcode');
const router = express.Router();

// Import contract ABI and address
const certificateABI = require('../contracts/Certificate.json');
const { CERTIFICATE_CONTRACT_ADDRESS, PRIVATE_KEY, RPC_URL } = process.env;

// Initialize provider and contract
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const certificateContract = new ethers.Contract(
  CERTIFICATE_CONTRACT_ADDRESS,
  certificateABI.abi,
  wallet
);

// Validation middleware
const validateCertificateData = (req, res, next) => {
  const { recipient, recipientName, courseName, institutionName } = req.body;
  
  const errors = [];
  
  if (!recipient || !ethers.isAddress(recipient)) {
    errors.push('Valid recipient address is required');
  }
  
  if (!recipientName || recipientName.trim().length < 2) {
    errors.push('Recipient name must be at least 2 characters');
  }
  
  if (!courseName || courseName.trim().length < 2) {
    errors.push('Course name must be at least 2 characters');
  }
  
  if (!institutionName || institutionName.trim().length < 2) {
    errors.push('Institution name must be at least 2 characters');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid certificate data',
        details: errors
      }
    });
  }
  
  next();
};

// Generate QR Code
const generateQRCode = async (tokenId) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify/${tokenId}`;
    const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return {
      qrCodeDataURL,
      verificationUrl
    };
  } catch (error) {
    console.error('QR Code generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
};

// POST /api/v1/certificates/mint
router.post('/mint', validateCertificateData, async (req, res) => {
  try {
    const { recipient, recipientName, courseName, institutionName, metadataURI = '' } = req.body;
    
    console.log('Minting certificate for:', {
      recipient,
      recipientName,
      courseName,
      institutionName
    });
    
    // Check if the issuer is authorized
    const issuerAddress = wallet.address;
    const isAuthorized = await certificateContract.authorizedIssuers(issuerAddress);
    const isOwner = await certificateContract.owner() === issuerAddress;
    
    if (!isAuthorized && !isOwner) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Unauthorized issuer',
          details: 'Your address is not authorized to mint certificates'
        }
      });
    }
    
    // Estimate gas for the transaction
    const gasEstimate = await certificateContract.mintCertificate.estimateGas(
      recipient,
      recipientName.trim(),
      courseName.trim(),
      institutionName.trim(),
      metadataURI
    );
    
    // Add 20% buffer to gas estimate
    const gasLimit = Math.floor(Number(gasEstimate) * 1.2);
    
    // Execute the minting transaction
    const tx = await certificateContract.mintCertificate(
      recipient,
      recipientName.trim(),
      courseName.trim(),
      institutionName.trim(),
      metadataURI,
      {
        gasLimit: gasLimit
      }
    );
    
    console.log('Transaction submitted:', tx.hash);
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    if (receipt.status !== 1) {
      throw new Error('Transaction failed');
    }
    
    // Extract token ID from the event logs
    const mintEvent = receipt.logs.find(log => {
      try {
        const parsedLog = certificateContract.interface.parseLog(log);
        return parsedLog.name === 'CertificateMinted';
      } catch (e) {
        return false;
      }
    });
    
    if (!mintEvent) {
      throw new Error('Certificate minted but token ID not found in events');
    }
    
    const parsedEvent = certificateContract.interface.parseLog(mintEvent);
    const tokenId = parsedEvent.args.tokenId.toString();
    
    console.log('Certificate minted with token ID:', tokenId);
    
    // Generate QR code
    const { qrCodeDataURL, verificationUrl } = await generateQRCode(tokenId);
    
    // Get the complete certificate data
    const certificateData = await certificateContract.getCertificate(tokenId);
    
    const response = {
      success: true,
      data: {
        tokenId,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        certificate: {
          tokenId,
          issuer: certificateData.issuer,
          recipient: certificateData.recipient,
          recipientName: certificateData.recipientName,
          courseName: certificateData.courseName,
          institutionName: certificateData.institutionName,
          issueDate: Number(certificateData.issueDate),
          metadataURI: certificateData.metadataURI,
          isValid: certificateData.isValid
        },
        qrCode: qrCodeDataURL,
        verificationUrl,
        gasUsed: receipt.gasUsed.toString()
      }
    };
    
    res.status(201).json(response);
    
  } catch (error) {
    console.error('Certificate minting failed:', error);
    
    let errorResponse = {
      success: false,
      error: {
        code: 'MINT_FAILED',
        message: 'Failed to mint certificate',
        details: error.message
      }
    };
    
    // Handle specific error types
    if (error.code === 'INSUFFICIENT_FUNDS') {
      errorResponse.error.code = 'INSUFFICIENT_FUNDS';
      errorResponse.error.message = 'Insufficient funds for gas';
    } else if (error.code === 'NETWORK_ERROR') {
      errorResponse.error.code = 'NETWORK_ERROR';
      errorResponse.error.message = 'Network connection failed';
    } else if (error.message.includes('UnauthorizedIssuer')) {
      errorResponse.error.code = 'AUTHORIZATION_ERROR';
      errorResponse.error.message = 'Unauthorized to mint certificates';
    }
    
    res.status(500).json(errorResponse);
  }
});

// GET /api/v1/certificates/issuer/:address - Get certificates by issuer
router.get('/issuer/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid address format'
        }
      });
    }
    
    // Get all CertificateMinted events for this issuer
    const filter = certificateContract.filters.CertificateMinted(null, address, null);
    const events = await certificateContract.queryFilter(filter);
    
    const certificates = await Promise.all(
      events.map(async (event) => {
        const tokenId = event.args.tokenId.toString();
        try {
          const certData = await certificateContract.getCertificate(tokenId);
          return {
            tokenId,
            issuer: certData.issuer,
            recipient: certData.recipient,
            recipientName: certData.recipientName,
            courseName: certData.courseName,
            institutionName: certData.institutionName,
            issueDate: Number(certData.issueDate),
            metadataURI: certData.metadataURI,
            isValid: certData.isValid,
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
          };
        } catch (error) {
          console.error(`Failed to get certificate ${tokenId}:`, error);
          return null;
        }
      })
    );
    
    // Filter out failed certificate retrievals
    const validCertificates = certificates.filter(cert => cert !== null);
    
    res.json({
      success: true,
      data: {
        issuer: address,
        totalCertificates: validCertificates.length,
        certificates: validCertificates
      }
    });
    
  } catch (error) {
    console.error('Failed to get issuer certificates:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'QUERY_FAILED',
        message: 'Failed to retrieve certificates',
        details: error.message
      }
    });
  }
});

module.exports = router;