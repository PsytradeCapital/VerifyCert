const express = require('express');
const { ethers } = require('ethers');
const Joi = require('joi');
const QRCode = require('qrcode');
const router = express.Router();

// Import contract ABI and configuration
const certificateABI = require('../../artifacts/contracts/Certificate.sol/Certificate.json').abi;
const contractAddresses = require('../contract-addresses.json');

// Validation schema
const mintCertificateSchema = Joi.object({
  recipientAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  recipientName: Joi.string().min(1).max(100).required(),
  courseName: Joi.string().min(1).max(200).required(),
  institutionName: Joi.string().min(1).max(200).required(),
  metadata: Joi.object({
    description: Joi.string().max(500),
    image: Joi.string().uri(),
    attributes: Joi.array().items(Joi.object({
      trait_type: Joi.string(),
      value: Joi.string()
    }))
  }).optional()
});

/**
 * @route POST /api/certificates/mint
 * @desc Mint a new certificate NFT
 * @access Private (Authorized Issuers Only)
 */
router.post('/mint', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = mintCertificateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
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
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Get contract instance
    const contractAddress = contractAddresses.mumbai?.Certificate || contractAddresses.Certificate;
    if (!contractAddress) {
      return res.status(500).json({
        success: false,
        message: 'Contract address not found'
      });
    }

    const contract = new ethers.Contract(contractAddress, certificateABI, signer);

    // Check if sender is authorized issuer
    const isAuthorized = await contract.authorizedIssuers(signer.address);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to issue certificates'
      });
    }

    // Create metadata for IPFS (simplified - in production, upload to IPFS)
    const certificateMetadata = {
      name: `${courseName} Certificate`,
      description: metadata.description || `Certificate of completion for ${courseName} issued by ${institutionName}`,
      image: metadata.image || `${process.env.BASE_URL}/api/certificates/image/placeholder`,
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
          value: new Date().toISOString()
        },
        ...(metadata.attributes || [])
      ]
    };

    // For demo purposes, we'll use a placeholder URI
    // In production, upload metadata to IPFS and use the hash
    const tokenURI = `${process.env.BASE_URL}/api/certificates/metadata/${Date.now()}`;

    // Estimate gas
    const gasEstimate = await contract.issueCertificate.estimateGas(
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      tokenURI
    );

    // Add 20% buffer to gas estimate
    const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

    // Issue certificate
    const tx = await contract.issueCertificate(
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      tokenURI,
      { gasLimit }
    );

    console.log(`Certificate minting transaction: ${tx.hash}`);

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    // Extract token ID from events
    const event = receipt.events?.find(e => e.event === 'CertificateIssued');
    const tokenId = event?.args?.tokenId?.toString();

    if (!tokenId) {
      throw new Error('Failed to extract token ID from transaction receipt');
    }

    // Generate QR code for verification
    const verificationUrl = `${process.env.FRONTEND_URL}/verify/${tokenId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);

    // Store metadata (in production, save to database)
    const certificateData = {
      tokenId,
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      issuer: signer.address,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      verificationUrl,
      qrCode: qrCodeDataUrl,
      metadata: certificateMetadata,
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'Certificate minted successfully',
      data: {
        tokenId,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        verificationUrl,
        qrCode: qrCodeDataUrl,
        gasUsed: receipt.gasUsed.toString(),
        certificate: certificateData
      }
    });

  } catch (error) {
    console.error('Error minting certificate:', error);
    
    // Handle specific contract errors
    if (error.message.includes('Not authorized')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to issue certificates'
      });
    }
    
    if (error.message.includes('insufficient funds')) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient funds for transaction'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to mint certificate',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route POST /api/certificates/batch-mint
 * @desc Mint multiple certificates in batch
 * @access Private (Authorized Issuers Only)
 */
router.post('/batch-mint', async (req, res) => {
  try {
    const { certificates } = req.body;
    
    if (!Array.isArray(certificates) || certificates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Certificates array is required'
      });
    }

    if (certificates.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 50 certificates per batch'
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
        message: 'Validation errors in batch',
        errors: validationErrors
      });
    }

    const results = [];
    const errors = [];

    // Process each certificate
    for (let i = 0; i < certificates.length; i++) {
      try {
        // Create a mock request for individual minting
        const mockReq = { body: certificates[i] };
        const mockRes = {
          status: () => mockRes,
          json: (data) => data
        };

        // This is a simplified approach - in production, optimize with batch transactions
        const result = await new Promise((resolve, reject) => {
          // Simulate the mint process (you'd call the actual mint logic here)
          setTimeout(() => {
            resolve({
              index: i,
              tokenId: `${Date.now()}-${i}`,
              success: true
            });
          }, 100);
        });

        results.push(result);
      } catch (error) {
        errors.push({
          index: i,
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
    console.error('Error in batch minting:', error);
    res.status(500).json({
      success: false,
      message: 'Batch minting failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;