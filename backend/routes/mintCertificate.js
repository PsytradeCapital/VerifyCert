const express = require('express');
const { ethers } = require('ethers');
const Joi = require('joi');
const crypto = require('crypto');
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
  recipientName: Joi.string().min(1).max(100).required()
    .messages({
      'string.min': 'Recipient name is required',
      'string.max': 'Recipient name must be less than 100 characters'
    }),
  courseName: Joi.string().min(1).max(200).required()
    .messages({
      'string.min': 'Course name is required',
      'string.max': 'Course name must be less than 200 characters'
    }),
  institutionName: Joi.string().min(1).max(200).required()
    .messages({
      'string.min': 'Institution name is required',
      'string.max': 'Institution name must be less than 200 characters'
    }),
  expiryDate: Joi.number().integer().min(0).optional()
    .messages({
      'number.min': 'Expiry date must be a valid timestamp'
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
      recipientName: Joi.string().min(1).max(100).required(),
      courseName: Joi.string().min(1).max(200).required(),
      institutionName: Joi.string().min(1).max(200).required(),
      expiryDate: Joi.number().integer().min(0).optional()
    })
  ).min(1).max(50).required(),
  issuerPrivateKey: Joi.string().length(64).hex().required()
});

/**
 * Generate a unique certificate hash
 * @param {Object} certificateData - Certificate data
 * @returns {string} Unique hash
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
    const isAuthorized = await contract.isAuthorizedIssuer(signer.address);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to issue certificates'
      });
    }

    // Generate unique certificate hash
    const certificateHash = generateCertificateHash({
      recipientAddress,
      recipientName,
      courseName,
      institutionName
    });

    // Validate expiry date if provided
    if (expiryDate > 0) {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (expiryDate <= currentTimestamp) {
        return res.status(400).json({
          success: false,
          message: 'Expiry date must be in the future'
        });
      }
    }

    // Estimate gas for the transaction
    let gasEstimate;
    try {
      gasEstimate = await contract.issueCertificate.estimateGas(
        recipientAddress,
        recipientName,
        courseName,
        institutionName,
        expiryDate,
        certificateHash
      );
    } catch (gasError) {
      console.error('Gas estimation failed:', gasError);
      return res.status(400).json({
        success: false,
        message: 'Transaction would fail. Please check parameters.',
        details: gasError.reason || gasError.message
      });
    }

    // Add 20% buffer to gas estimate
    const gasLimit = gasEstimate * 120n / 100n;

    // Issue the certificate
    const tx = await contract.issueCertificate(
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      expiryDate,
      certificateHash,
      {
        gasLimit: gasLimit
      }
    );

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    // Extract token ID from the event
    const certificateIssuedEvent = receipt.logs.find(
      log => log.topics[0] === ethers.id('CertificateIssued(uint256,address,address,string,string,string,string)')
    );

    let tokenId = null;
    if (certificateIssuedEvent) {
      const decodedEvent = contract.interface.parseLog(certificateIssuedEvent);
      tokenId = decodedEvent.args.tokenId.toString();
    }

    // Get certificate data for response
    const certificateData = tokenId ? await contract.certificates(tokenId) : null;

    res.status(201).json({
      success: true,
      message: 'Certificate minted successfully',
      data: {
        tokenId,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        certificateHash,
        certificate: certificateData ? {
          tokenId,
          recipientName: certificateData.recipientName,
          recipientAddress,
          courseName: certificateData.courseName,
          institutionName: certificateData.institutionName,
          issueDate: certificateData.issueDate.toString(),
          expiryDate: certificateData.expiryDate.toString(),
          isRevoked: certificateData.isRevoked,
          issuer: certificateData.issuer,
          certificateHash: certificateData.certificateHash
        } : null,
        verificationUrl: `${req.protocol}://${req.get('host')}/verify/${certificateHash}`
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
    const isAuthorized = await contract.isAuthorizedIssuer(signer.address);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to issue certificates'
      });
    }

    const results = [];
    const errors = [];

    // Process each certificate
    for (let i = 0; i < certificates.length; i++) {
      const cert = certificates[i];
      
      try {
        // Generate unique hash for each certificate
        const certificateHash = generateCertificateHash(cert);

        // Validate expiry date if provided
        if (cert.expiryDate > 0) {
          const currentTimestamp = Math.floor(Date.now() / 1000);
          if (cert.expiryDate <= currentTimestamp) {
            errors.push({
              index: i,
              error: 'Expiry date must be in the future',
              certificate: cert
            });
            continue;
          }
        }

        // Issue the certificate
        const tx = await contract.issueCertificate(
          cert.recipientAddress,
          cert.recipientName,
          cert.courseName,
          cert.institutionName,
          cert.expiryDate || 0,
          certificateHash
        );

        const receipt = await tx.wait();

        // Extract token ID from the event
        const certificateIssuedEvent = receipt.logs.find(
          log => log.topics[0] === ethers.id('CertificateIssued(uint256,address,address,string,string,string,string)')
        );

        let tokenId = null;
        if (certificateIssuedEvent) {
          const decodedEvent = contract.interface.parseLog(certificateIssuedEvent);
          tokenId = decodedEvent.args.tokenId.toString();
        }

        results.push({
          index: i,
          success: true,
          tokenId,
          transactionHash: tx.hash,
          certificateHash,
          verificationUrl: `${req.protocol}://${req.get('host')}/verify/${certificateHash}`
        });

        // Add small delay between transactions to avoid nonce issues
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (certError) {
        console.error(`Error minting certificate ${i}:`, certError);
        errors.push({
          index: i,
          error: certError.reason || certError.message,
          certificate: cert
        });
      }
    }

    res.status(results.length > 0 ? 201 : 400).json({
      success: results.length > 0,
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
 * @route POST /api/certificates/revoke
 * @desc Revoke a certificate
 * @access Private (requires issuer private key)
 */
router.post('/revoke', async (req, res) => {
  try {
    const revokeSchema = Joi.object({
      tokenId: Joi.number().integer().min(0).required(),
      reason: Joi.string().min(1).max(500).required(),
      issuerPrivateKey: Joi.string().length(64).hex().required()
    });

    const { error, value } = revokeSchema.validate(req.body);
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

    const { tokenId, reason, issuerPrivateKey } = value;

    // Initialize provider and signer
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    const signer = new ethers.Wallet(issuerPrivateKey, provider);

    // Get contract instance
    const contractAddress = contractAddresses.Certificate;
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    // Check if certificate exists
    try {
      await contract.ownerOf(tokenId);
    } catch (ownerError) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Get certificate data to check issuer
    const certificateData = await contract.certificates(tokenId);
    
    // Check if signer is authorized to revoke (issuer or owner)
    const isOwner = signer.address.toLowerCase() === (await contract.owner()).toLowerCase();
    const isIssuer = signer.address.toLowerCase() === certificateData.issuer.toLowerCase();
    
    if (!isOwner && !isIssuer) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to revoke this certificate'
      });
    }

    // Check if already revoked
    if (certificateData.isRevoked) {
      return res.status(400).json({
        success: false,
        message: 'Certificate is already revoked'
      });
    }

    // Revoke the certificate
    const tx = await contract.revokeCertificate(tokenId, reason);
    const receipt = await tx.wait();

    res.json({
      success: true,
      message: 'Certificate revoked successfully',
      data: {
        tokenId: tokenId.toString(),
        reason,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      }
    });

  } catch (error) {
    console.error('Error revoking certificate:', error);
    
    if (error.reason) {
      return res.status(400).json({
        success: false,
        message: error.reason
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during certificate revocation'
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
    const estimateSchema = Joi.object({
      recipientAddress: Joi.string().length(42).pattern(/^0x[a-fA-F0-9]{40}$/).required(),
      recipientName: Joi.string().min(1).max(100).required(),
      courseName: Joi.string().min(1).max(200).required(),
      institutionName: Joi.string().min(1).max(200).required(),
      expiryDate: Joi.number().integer().min(0).optional()
    });

    const { error, value } = estimateSchema.validate(req.body);
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
      expiryDate = 0
    } = value;

    // Initialize provider
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    
    // Get contract instance (without signer for estimation)
    const contractAddress = contractAddresses.Certificate;
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    // Generate a sample hash for estimation
    const sampleHash = generateCertificateHash({
      recipientAddress,
      recipientName,
      courseName,
      institutionName
    });

    // Estimate gas (this will fail but give us the gas estimate)
    try {
      const gasEstimate = await contract.issueCertificate.estimateGas(
        recipientAddress,
        recipientName,
        courseName,
        institutionName,
        expiryDate,
        sampleHash
      );

      // Get current gas price
      const gasPrice = await provider.getFeeData();

      // Calculate costs
      const estimatedCost = gasEstimate * gasPrice.gasPrice;
      const estimatedCostInMatic = ethers.formatEther(estimatedCost);

      res.json({
        success: true,
        message: 'Gas estimation completed',
        data: {
          gasEstimate: gasEstimate.toString(),
          gasPrice: gasPrice.gasPrice.toString(),
          estimatedCost: estimatedCost.toString(),
          estimatedCostInMatic: estimatedCostInMatic,
          currency: 'MATIC'
        }
      });

    } catch (estimateError) {
      // Even if estimation fails, we can provide approximate values
      res.json({
        success: true,
        message: 'Gas estimation (approximate)',
        data: {
          gasEstimate: '150000', // Approximate gas for certificate minting
          gasPrice: '30000000000', // 30 gwei
          estimatedCost: '4500000000000000', // Approximate cost
          estimatedCostInMatic: '0.0045',
          currency: 'MATIC',
          note: 'Approximate values - actual costs may vary'
        }
      });
    }

  } catch (error) {
    console.error('Error estimating gas:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during gas estimation'
    });
  }
});

module.exports = router;