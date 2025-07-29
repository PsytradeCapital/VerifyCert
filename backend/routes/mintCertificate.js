const express = require('express');
const { ethers } = require('ethers');
const Joi = require('joi');
const crypto = require('crypto');
const QRCode = require('qrcode');
const router = express.Router();

// Import contract ABI and address
const contractABI = require('../../artifacts/contracts/Certificate.sol/Certificate.json').abi;
const contractAddresses = require('../contract-addresses.json');

// Validation schema for certificate minting
const mintCertificateSchema = Joi.object({
  recipientAddress: Joi.string().length(42).pattern(/^0x[a-fA-F0-9]{40}$/).required()
    .messages({
      'string.length': 'Recipient address must be 42 characters',
      'string.pattern.base': 'Invalid Ethereum address format'
    }),
  recipientName: Joi.string().min(2).max(100).required()
    .messages({
      'string.min': 'Recipient name must be at least 2 characters',
      'string.max': 'Recipient name cannot exceed 100 characters'
    }),
  courseName: Joi.string().min(2).max(200).required()
    .messages({
      'string.min': 'Course name must be at least 2 characters',
      'string.max': 'Course name cannot exceed 200 characters'
    }),
  institutionName: Joi.string().min(2).max(200).required()
    .messages({
      'string.min': 'Institution name must be at least 2 characters',
      'string.max': 'Institution name cannot exceed 200 characters'
    }),
  expiryDate: Joi.number().integer().min(0).optional()
    .messages({
      'number.min': 'Expiry date must be a valid timestamp'
    }),
  metadataURI: Joi.string().uri().optional().allow('')
    .messages({
      'string.uri': 'Metadata URI must be a valid URL'
    }),
  issuerPrivateKey: Joi.string().length(64).hex().required()
    .messages({
      'string.length': 'Private key must be 64 characters',
      'string.hex': 'Private key must be hexadecimal'
    })
});

// Validation schema for batch minting
const batchMintSchema = Joi.object({
  certificates: Joi.array().items(
    Joi.object({
      recipientAddress: Joi.string().length(42).pattern(/^0x[a-fA-F0-9]{40}$/).required(),
      recipientName: Joi.string().min(2).max(100).required(),
      courseName: Joi.string().min(2).max(200).required(),
      institutionName: Joi.string().min(2).max(200).required(),
      expiryDate: Joi.number().integer().min(0).optional(),
      metadataURI: Joi.string().uri().optional().allow('')
    })
  ).min(1).max(50).required()
    .messages({
      'array.min': 'At least one certificate is required',
      'array.max': 'Cannot mint more than 50 certificates at once'
    }),
  issuerPrivateKey: Joi.string().length(64).hex().required()
});

/**
 * Generate a unique certificate hash
 * @param {Object} certificateData - Certificate data
 * @returns {string} - Unique hash
 */
function generateCertificateHash(certificateData) {
  const dataString = JSON.stringify({
    recipientAddress: certificateData.recipientAddress,
    recipientName: certificateData.recipientName,
    courseName: certificateData.courseName,
    institutionName: certificateData.institutionName,
    timestamp: Date.now(),
    random: crypto.randomBytes(16).toString('hex')
  });
  
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

/**
 * Create metadata URI for certificate
 * @param {Object} certificateData - Certificate data
 * @param {string} certificateHash - Certificate hash
 * @returns {string} - Metadata URI
 */
function createMetadataURI(certificateData, certificateHash) {
  if (certificateData.metadataURI) {
    return certificateData.metadataURI;
  }
  
  // Create a basic metadata object
  const metadata = {
    name: `Certificate: ${certificateData.courseName}`,
    description: `Certificate of completion for ${certificateData.courseName} issued to ${certificateData.recipientName} by ${certificateData.institutionName}`,
    image: `${process.env.BASE_URL || 'http://localhost:3001'}/api/certificates/image/${certificateHash}`,
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
        trait_type: "Certificate Hash",
        value: certificateHash
      }
    ]
  };
  
  // In production, store this metadata on IPFS or a permanent storage
  // For now, return a placeholder URI
  return `${process.env.BASE_URL || 'http://localhost:3001'}/api/certificates/metadata/${certificateHash}`;
}

/**
 * @route POST /api/certificates/mint
 * @desc Mint a new certificate
 * @access Private (requires issuer private key)
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
      issuerPrivateKey
    } = value;

    // Initialize provider and signer
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    const signer = new ethers.Wallet(issuerPrivateKey, provider);

    // Get contract instance
    const contractAddress = contractAddresses.Certificate;
    if (!contractAddress) {
      return res.status(500).json({
        success: false,
        message: 'Contract not deployed'
      });
    }

    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    // Check if signer is authorized issuer
    const isAuthorized = await contract.authorizedIssuers(signer.address);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Address not authorized to issue certificates'
      });
    }

    // Generate certificate hash
    const certificateHash = generateCertificateHash({
      recipientAddress,
      recipientName,
      courseName,
      institutionName
    });

    // Check if hash already exists
    const hashExists = await contract.usedHashes(certificateHash);
    if (hashExists) {
      return res.status(409).json({
        success: false,
        message: 'Certificate with this data already exists'
      });
    }

    // Create metadata URI
    const metadataURI = createMetadataURI({
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      metadataURI: value.metadataURI
    }, certificateHash);

    // Validate expiry date if provided
    let expiryTimestamp = expiryDate;
    if (expiryDate > 0) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (expiryDate <= currentTime) {
        return res.status(400).json({
          success: false,
          message: 'Expiry date must be in the future'
        });
      }
      expiryTimestamp = expiryDate;
    }

    // Estimate gas
    const gasEstimate = await contract.issueCertificate.estimateGas(
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      expiryTimestamp,
      certificateHash,
      metadataURI
    );

    // Add 20% buffer to gas estimate
    const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

    // Issue certificate
    const tx = await contract.issueCertificate(
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      expiryTimestamp,
      certificateHash,
      metadataURI,
      { gasLimit }
    );

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    // Extract token ID from events
    const certificateIssuedEvent = receipt.logs.find(
      log => log.topics[0] === ethers.id('CertificateIssued(uint256,address,address,string,string,string,string)')
    );

    let tokenId = null;
    if (certificateIssuedEvent) {
      const decodedEvent = contract.interface.parseLog(certificateIssuedEvent);
      tokenId = decodedEvent.args.tokenId.toString();
    }

    // Generate QR code for verification
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${certificateHash}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#1f2937',
        light: '#ffffff'
      }
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Certificate minted successfully',
      data: {
        tokenId,
        certificateHash,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        certificate: {
          tokenId,
          recipientName,
          recipientAddress,
          courseName,
          institutionName,
          issueDate: Math.floor(Date.now() / 1000).toString(),
          expiryDate: expiryTimestamp.toString(),
          isRevoked: false,
          issuer: signer.address,
          certificateHash,
          metadataURI,
          verificationUrl,
          qrCode: qrCodeDataUrl
        }
      }
    });

  } catch (error) {
    console.error('Error minting certificate:', error);

    // Handle specific blockchain errors
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return res.status(400).json({
        success: false,
        message: 'Insufficient funds to complete transaction'
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
        message: error.reason
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during certificate minting'
    });
  }
});

/**
 * @route POST /api/certificates/mint/batch
 * @desc Mint multiple certificates in batch
 * @access Private (requires issuer private key)
 */
router.post('/mint/batch', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = batchMintSchema.validate(req.body);
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

    const { certificates, issuerPrivateKey } = value;

    // Initialize provider and signer
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    const signer = new ethers.Wallet(issuerPrivateKey, provider);

    // Get contract instance
    const contractAddress = contractAddresses.Certificate;
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    // Check if signer is authorized issuer
    const isAuthorized = await contract.authorizedIssuers(signer.address);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Address not authorized to issue certificates'
      });
    }

    const results = [];
    const errors = [];

    // Process each certificate
    for (let i = 0; i < certificates.length; i++) {
      const cert = certificates[i];
      
      try {
        // Generate certificate hash
        const certificateHash = generateCertificateHash(cert);

        // Check if hash already exists
        const hashExists = await contract.usedHashes(certificateHash);
        if (hashExists) {
          errors.push({
            index: i,
            certificate: cert,
            error: 'Certificate with this data already exists'
          });
          continue;
        }

        // Create metadata URI
        const metadataURI = createMetadataURI(cert, certificateHash);

        // Validate expiry date
        let expiryTimestamp = cert.expiryDate || 0;
        if (expiryTimestamp > 0) {
          const currentTime = Math.floor(Date.now() / 1000);
          if (expiryTimestamp <= currentTime) {
            errors.push({
              index: i,
              certificate: cert,
              error: 'Expiry date must be in the future'
            });
            continue;
          }
        }

        // Issue certificate
        const tx = await contract.issueCertificate(
          cert.recipientAddress,
          cert.recipientName,
          cert.courseName,
          cert.institutionName,
          expiryTimestamp,
          certificateHash,
          metadataURI
        );

        const receipt = await tx.wait();

        // Extract token ID from events
        const certificateIssuedEvent = receipt.logs.find(
          log => log.topics[0] === ethers.id('CertificateIssued(uint256,address,address,string,string,string,string)')
        );

        let tokenId = null;
        if (certificateIssuedEvent) {
          const decodedEvent = contract.interface.parseLog(certificateIssuedEvent);
          tokenId = decodedEvent.args.tokenId.toString();
        }

        // Generate QR code
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${certificateHash}`;
        const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);

        results.push({
          index: i,
          success: true,
          tokenId,
          certificateHash,
          transactionHash: tx.hash,
          verificationUrl,
          qrCode: qrCodeDataUrl
        });

        // Add small delay between transactions to avoid nonce issues
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (certError) {
        console.error(`Error minting certificate ${i}:`, certError);
        errors.push({
          index: i,
          certificate: cert,
          error: certError.reason || certError.message || 'Unknown error'
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
 * @route GET /api/certificates/estimate-gas
 * @desc Estimate gas cost for minting a certificate
 * @access Public
 */
router.post('/estimate-gas', async (req, res) => {
  try {
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
      issuerPrivateKey
    } = value;

    // Initialize provider and signer
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    const signer = new ethers.Wallet(issuerPrivateKey, provider);

    // Get contract instance
    const contractAddress = contractAddresses.Certificate;
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    // Generate certificate hash
    const certificateHash = generateCertificateHash({
      recipientAddress,
      recipientName,
      courseName,
      institutionName
    });

    // Create metadata URI
    const metadataURI = createMetadataURI({
      recipientAddress,
      recipientName,
      courseName,
      institutionName
    }, certificateHash);

    // Estimate gas
    const gasEstimate = await contract.issueCertificate.estimateGas(
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      expiryDate,
      certificateHash,
      metadataURI
    );

    // Get current gas price
    const gasPrice = await provider.getFeeData();

    // Calculate costs
    const estimatedCost = gasEstimate * gasPrice.gasPrice;
    const estimatedCostEth = ethers.formatEther(estimatedCost);

    res.json({
      success: true,
      message: 'Gas estimation completed',
      data: {
        gasEstimate: gasEstimate.toString(),
        gasPrice: gasPrice.gasPrice.toString(),
        estimatedCost: estimatedCost.toString(),
        estimatedCostEth,
        estimatedCostUSD: null // Would need price oracle integration
      }
    });

  } catch (error) {
    console.error('Error estimating gas:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error estimating gas cost'
    });
  }
});

/**
 * @route GET /api/certificates/metadata/:hash
 * @desc Get certificate metadata by hash
 * @access Public
 */
router.get('/metadata/:hash', async (req, res) => {
  try {
    const { hash } = req.params;

    // Initialize provider
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    
    // Get contract instance
    const contractAddress = contractAddresses.Certificate;
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    // Check if certificate exists
    const hashExists = await contract.usedHashes(hash);
    if (!hashExists) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Get token ID and certificate data
    const tokenId = await contract.hashToTokenId(hash);
    const certificateData = await contract.certificates(tokenId);

    // Create metadata response
    const metadata = {
      name: `Certificate: ${certificateData.courseName}`,
      description: `Certificate of completion for ${certificateData.courseName} issued to ${certificateData.recipientName} by ${certificateData.institutionName}`,
      image: `${process.env.BASE_URL || 'http://localhost:3001'}/api/certificates/image/${hash}`,
      external_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${hash}`,
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
          value: new Date(Number(certificateData.issueDate) * 1000).toISOString()
        },
        {
          trait_type: "Certificate Hash",
          value: hash
        }
      ]
    };

    res.json(metadata);

  } catch (error) {
    console.error('Error getting metadata:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error retrieving certificate metadata'
    });
  }
});

module.exports = router;