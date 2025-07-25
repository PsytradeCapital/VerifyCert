const express = require('express');
const { ethers } = require('ethers');
const Joi = require('joi');

const router = express.Router();

// Load contract ABI and configuration
const contractABI = require('../../artifacts/contracts/Certificate.sol/Certificate.json').abi;
const contractAddress = process.env.CONTRACT_ADDRESS;
const rpcUrl = process.env.POLYGON_MUMBAI_RPC_URL;

// Initialize blockchain connection (read-only)
const provider = new ethers.JsonRpcProvider(rpcUrl);
const contract = new ethers.Contract(contractAddress, contractABI, provider);

// Validation schemas
const tokenIdSchema = Joi.object({
  tokenId: Joi.string().pattern(/^\d+$/).required()
});

const verifyRequestSchema = Joi.object({
  tokenId: Joi.string().pattern(/^\d+$/).required(),
  expectedRecipient: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).optional(),
  expectedIssuer: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).optional()
});

/**
 * GET /api/v1/certificates/:tokenId
 * Get certificate data from blockchain
 */
router.get('/:tokenId', async (req, res) => {
  try {
    // Validate token ID
    const { error, value } = tokenIdSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token ID',
        details: error.details.map(detail => detail.message)
      });
    }

    const { tokenId } = value;

    // Check if certificate exists and get data
    let certificateData;
    try {
      certificateData = await contract.getCertificate(tokenId);
    } catch (contractError) {
      if (contractError.message.includes('CertificateNotFound') || 
          contractError.message.includes('execution reverted')) {
        return res.status(404).json({
          success: false,
          error: 'Certificate not found',
          message: `No certificate found with ID ${tokenId}`
        });
      }
      throw contractError;
    }

    // Check if token actually exists (additional verification)
    let ownerAddress;
    try {
      ownerAddress = await contract.ownerOf(tokenId);
    } catch (ownerError) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found',
        message: `Certificate ${tokenId} does not exist on blockchain`
      });
    }

    // Format response
    const certificate = {
      tokenId,
      issuer: certificateData.issuer,
      recipient: certificateData.recipient,
      recipientName: certificateData.recipientName,
      courseName: certificateData.courseName,
      institutionName: certificateData.institutionName,
      issueDate: Number(certificateData.issueDate),
      metadataURI: certificateData.metadataURI,
      isValid: certificateData.isValid,
      owner: ownerAddress,
      verificationURL: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${tokenId}`,
      qrCodeURL: `/api/v1/qr-code/${tokenId}`
    };

    res.json({
      success: true,
      data: certificate,
      message: 'Certificate retrieved successfully'
    });

  } catch (error) {
    console.error('Certificate retrieval error:', error);

    if (error.code === 'NETWORK_ERROR') {
      return res.status(503).json({
        success: false,
        error: 'Network error',
        message: 'Unable to connect to blockchain network'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve certificate',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/v1/certificates/verify/:tokenId
 * Verify certificate authenticity with optional additional checks
 */
router.post('/verify/:tokenId', async (req, res) => {
  try {
    // Validate request
    const tokenIdValidation = tokenIdSchema.validate(req.params);
    if (tokenIdValidation.error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token ID',
        details: tokenIdValidation.error.details.map(detail => detail.message)
      });
    }

    const bodyValidation = verifyRequestSchema.validate({ 
      tokenId: req.params.tokenId, 
      ...req.body 
    });
    if (bodyValidation.error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: bodyValidation.error.details.map(detail => detail.message)
      });
    }

    const { tokenId, expectedRecipient, expectedIssuer } = bodyValidation.value;

    // Perform blockchain verification
    let isValid = false;
    let onChain = false;
    let message = '';
    let certificateData = null;

    try {
      // Check if certificate exists and is valid
      isValid = await contract.verifyCertificate(tokenId);
      onChain = true;

      // Get certificate data for additional verification
      certificateData = await contract.getCertificate(tokenId);

      // Verify owner exists
      const owner = await contract.ownerOf(tokenId);
      const ownerExists = owner && owner !== ethers.ZeroAddress;

      // Determine final validity
      const finalValidity = isValid && certificateData.isValid && ownerExists;

      // Additional verification checks
      let additionalChecks = [];
      
      if (expectedRecipient && certificateData.recipient.toLowerCase() !== expectedRecipient.toLowerCase()) {
        additionalChecks.push('Recipient address mismatch');
        finalValidity = false;
      }

      if (expectedIssuer && certificateData.issuer.toLowerCase() !== expectedIssuer.toLowerCase()) {
        additionalChecks.push('Issuer address mismatch');
        finalValidity = false;
      }

      // Set verification message
      if (finalValidity) {
        message = 'Certificate is valid and verified on blockchain';
      } else if (!certificateData.isValid) {
        message = 'Certificate has been revoked';
      } else if (!ownerExists) {
        message = 'Certificate owner verification failed';
      } else if (additionalChecks.length > 0) {
        message = `Verification failed: ${additionalChecks.join(', ')}`;
      } else {
        message = 'Certificate verification failed';
      }

      const response = {
        success: true,
        data: {
          tokenId,
          isValid: finalValidity,
          onChain: true,
          message,
          verificationTimestamp: Date.now(),
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
            owner
          },
          additionalChecks: additionalChecks.length > 0 ? additionalChecks : undefined
        }
      };

      res.json(response);

    } catch (contractError) {
      // Certificate not found or other contract error
      if (contractError.message.includes('CertificateNotFound') || 
          contractError.message.includes('execution reverted')) {
        
        res.json({
          success: true,
          data: {
            tokenId,
            isValid: false,
            onChain: false,
            message: 'Certificate not found on blockchain',
            verificationTimestamp: Date.now()
          }
        });
      } else {
        throw contractError;
      }
    }

  } catch (error) {
    console.error('Certificate verification error:', error);

    if (error.code === 'NETWORK_ERROR') {
      return res.status(503).json({
        success: false,
        error: 'Network error',
        message: 'Unable to connect to blockchain network'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to verify certificate',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/v1/certificates/issuer/:address
 * Get all certificates issued by a specific address
 */
router.get('/issuer/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // Validate Ethereum address
    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address'
      });
    }

    // Get certificates by issuer
    const tokenIds = await contract.getCertificatesByIssuer(address);
    
    // Fetch detailed data for each certificate
    const certificates = await Promise.all(
      tokenIds.map(async (tokenId) => {
        try {
          const certData = await contract.getCertificate(tokenId.toString());
          return {
            tokenId: tokenId.toString(),
            issuer: certData.issuer,
            recipient: certData.recipient,
            recipientName: certData.recipientName,
            courseName: certData.courseName,
            institutionName: certData.institutionName,
            issueDate: Number(certData.issueDate),
            metadataURI: certData.metadataURI,
            isValid: certData.isValid,
            verificationURL: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${tokenId}`,
            qrCodeURL: `/api/v1/qr-code/${tokenId}`
          };
        } catch (certError) {
          console.error(`Error fetching certificate ${tokenId}:`, certError);
          return null;
        }
      })
    );

    // Filter out any failed certificate fetches
    const validCertificates = certificates.filter(cert => cert !== null);

    res.json({
      success: true,
      data: {
        issuer: address,
        totalCertificates: validCertificates.length,
        certificates: validCertificates
      },
      message: `Found ${validCertificates.length} certificates for issuer`
    });

  } catch (error) {
    console.error('Issuer certificates retrieval error:', error);

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve issuer certificates',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;