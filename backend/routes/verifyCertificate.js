const express = require('express');
const { ethers } = require('ethers');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();

// Import contract ABI and configuration
const certificateABI = require('../../artifacts/contracts/Certificate.sol/Certificate.json').abi;
const contractAddresses = require('../contract-addresses.json');

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.json', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JSON, PNG, JPG, and JPEG files are allowed.'));
    }
  }
});

/**
 * @route GET /api/certificates/verify/:tokenId
 * @desc Verify a certificate by token ID
 * @access Public
 */
router.get('/verify/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;

    // Validate token ID
    if (!tokenId || isNaN(tokenId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid certificate ID'
      });
    }

    // Initialize provider
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);

    // Get contract instance
    const contractAddress = contractAddresses.mumbai?.Certificate || contractAddresses.Certificate;
    if (!contractAddress) {
      return res.status(500).json({
        success: false,
        message: 'Contract address not found'
      });
    }

    const contract = new ethers.Contract(contractAddress, certificateABI, provider);

    try {
      // Check if certificate exists
      const exists = await contract.ownerOf(tokenId);
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Certificate not found'
        });
      }

      // Get certificate data
      const certificateData = await contract.getCertificate(tokenId);
      const isValid = await contract.isValidCertificate(tokenId);
      const tokenURI = await contract.tokenURI(tokenId);
      const owner = await contract.ownerOf(tokenId);

      // Format certificate data
      const certificate = {
        tokenId: tokenId.toString(),
        recipientName: certificateData.recipientName,
        courseName: certificateData.courseName,
        institutionName: certificateData.institutionName,
        issueDate: certificateData.issueDate.toString(),
        issuer: certificateData.issuer,
        isRevoked: certificateData.isRevoked,
        owner: owner,
        tokenURI: tokenURI,
        contractAddress: contractAddress
      };

      // Get additional blockchain information
      let blockNumber = null;
      let transactionHash = null;

      try {
        // Query for CertificateIssued events to get transaction details
        const filter = contract.filters.CertificateIssued(tokenId);
        const events = await contract.queryFilter(filter);
        
        if (events.length > 0) {
          const event = events[0];
          blockNumber = event.blockNumber;
          transactionHash = event.transactionHash;
        }
      } catch (eventError) {
        console.warn('Could not fetch event data:', eventError.message);
      }

      res.json({
        success: true,
        message: 'Certificate verification completed',
        data: {
          certificate: {
            ...certificate,
            blockNumber,
            transactionHash
          },
          verification: {
            isValid,
            isRevoked: certificateData.isRevoked,
            onChain: true,
            verifiedAt: new Date().toISOString(),
            network: 'Polygon Mumbai Testnet',
            contractAddress
          }
        }
      });

    } catch (contractError) {
      // Handle specific contract errors
      if (contractError.message.includes('ERC721: invalid token ID') || 
          contractError.message.includes('ERC721: owner query for nonexistent token')) {
        return res.status(404).json({
          success: false,
          message: 'Certificate not found'
        });
      }

      throw contractError;
    }

  } catch (error) {
    console.error('Certificate verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify certificate',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route POST /api/certificates/verify-file
 * @desc Verify a certificate by uploaded file
 * @access Public
 */
router.post('/verify-file', upload.single('certificate'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    let certificateData = null;

    try {
      if (fileExtension === '.json') {
        // Handle JSON certificate files
        const fileContent = await fs.readFile(filePath, 'utf8');
        const jsonData = JSON.parse(fileContent);
        
        // Extract token ID from JSON data
        if (jsonData.tokenId) {
          // Redirect to token ID verification
          const verifyResponse = await fetch(`${req.protocol}://${req.get('host')}/api/certificates/verify/${jsonData.tokenId}`);
          const verifyData = await verifyResponse.json();
          
          return res.json(verifyData);
        } else {
          throw new Error('Token ID not found in certificate file');
        }
      } else if (['.pdf', '.png', '.jpg', '.jpeg'].includes(fileExtension)) {
        // For image/PDF files, we would typically:
        // 1. Extract QR code if present
        // 2. Parse embedded metadata
        // 3. Extract certificate information
        
        // For demo purposes, we'll return a placeholder response
        return res.status(400).json({
          success: false,
          message: 'File type verification not yet implemented. Please use JSON files or enter certificate ID manually.'
        });
      } else {
        throw new Error('Unsupported file type');
      }

    } finally {
      // Clean up uploaded file
      try {
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.warn('Failed to delete uploaded file:', unlinkError.message);
      }
    }

  } catch (error) {
    console.error('File verification error:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.warn('Failed to delete uploaded file:', unlinkError.message);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to verify certificate file',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/certificates/verify-batch
 * @desc Verify multiple certificates by token IDs
 * @access Public
 */
router.post('/verify-batch', async (req, res) => {
  try {
    const { tokenIds } = req.body;

    if (!Array.isArray(tokenIds) || tokenIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token IDs array is required'
      });
    }

    if (tokenIds.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 100 certificates per batch'
      });
    }

    // Validate all token IDs
    const invalidIds = tokenIds.filter(id => !id || isNaN(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid certificate IDs found',
        invalidIds
      });
    }

    const results = [];
    const errors = [];

    // Verify each certificate
    for (const tokenId of tokenIds) {
      try {
        const verifyResponse = await fetch(`${req.protocol}://${req.get('host')}/api/certificates/verify/${tokenId}`);
        const verifyData = await verifyResponse.json();
        
        if (verifyData.success) {
          results.push({
            tokenId,
            ...verifyData.data
          });
        } else {
          errors.push({
            tokenId,
            error: verifyData.message
          });
        }
      } catch (error) {
        errors.push({
          tokenId,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Batch verification completed. ${results.length} successful, ${errors.length} failed.`,
      data: {
        successful: results,
        failed: errors,
        summary: {
          total: tokenIds.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });

  } catch (error) {
    console.error('Batch verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Batch verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/certificates/:tokenId/metadata
 * @desc Get certificate metadata
 * @access Public
 */
router.get('/:tokenId/metadata', async (req, res) => {
  try {
    const { tokenId } = req.params;

    if (!tokenId || isNaN(tokenId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid certificate ID'
      });
    }

    // Initialize provider
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    const contractAddress = contractAddresses.mumbai?.Certificate || contractAddresses.Certificate;
    const contract = new ethers.Contract(contractAddress, certificateABI, provider);

    try {
      const certificateData = await contract.getCertificate(tokenId);
      const tokenURI = await contract.tokenURI(tokenId);
      const owner = await contract.ownerOf(tokenId);

      // Generate metadata in OpenSea standard format
      const metadata = {
        name: `${certificateData.courseName} Certificate`,
        description: `Certificate of completion for ${certificateData.courseName} issued by ${certificateData.institutionName} to ${certificateData.recipientName}`,
        image: `${process.env.BASE_URL}/api/certificates/${tokenId}/image`,
        external_url: `${process.env.FRONTEND_URL}/verify/${tokenId}`,
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
            display_type: "date",
            value: parseInt(certificateData.issueDate.toString())
          },
          {
            trait_type: "Status",
            value: certificateData.isRevoked ? "Revoked" : "Valid"
          }
        ]
      };

      res.json(metadata);

    } catch (contractError) {
      if (contractError.message.includes('ERC721: invalid token ID')) {
        return res.status(404).json({
          error: 'Certificate not found'
        });
      }
      throw contractError;
    }

  } catch (error) {
    console.error('Metadata fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch certificate metadata'
    });
  }
});

module.exports = router;