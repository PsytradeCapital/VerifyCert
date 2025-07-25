const express = require('express');
const { ethers } = require('ethers');
const Joi = require('joi');
const router = express.Router();

// Load contract ABI and address
const contractABI = require('../../artifacts/contracts/Certificate.sol/Certificate.json').abi;
const contractAddresses = require('../../contract-addresses.json');

// Validation schema
const mintCertificateSchema = Joi.object({
  recipientAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  recipientName: Joi.string().min(1).max(100).required(),
  courseName: Joi.string().min(1).max(200).required(),
  institutionName: Joi.string().min(1).max(200).required()
});

// Initialize provider and contract
const getContract = () => {
  const rpcUrl = process.env.POLYGON_AMOY_RPC_URL || process.env.POLYGON_RPC_URL;
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  return new ethers.Contract(contractAddresses.contractAddress, contractABI, wallet);
};

router.post('/mint', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = mintCertificateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const { recipientAddress, recipientName, courseName, institutionName } = value;

    // Get contract instance
    const contract = getContract();
    
    // Check if sender is authorized issuer
    const senderAddress = new ethers.Wallet(process.env.PRIVATE_KEY).address;
    const isAuthorized = await contract.authorizedIssuers(senderAddress);
    const isOwner = await contract.owner() === senderAddress;
    
    if (!isAuthorized && !isOwner) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to issue certificates'
      });
    }

    // Estimate gas for the transaction
    const gasEstimate = await contract.estimateGas.issueCertificate(
      recipientAddress,
      recipientName,
      courseName,
      institutionName
    );

    // Add 20% buffer to gas estimate
    const gasLimit = gasEstimate.mul(120).div(100);

    // Issue certificate
    const tx = await contract.issueCertificate(
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      { gasLimit }
    );

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    // Extract token ID from event logs
    const certificateIssuedEvent = receipt.events?.find(
      event => event.event === 'CertificateIssued'
    );

    if (!certificateIssuedEvent) {
      throw new Error('Certificate issuance event not found');
    }

    const tokenId = certificateIssuedEvent.args.tokenId.toString();

    // Get certificate data
    const certificateData = await contract.getCertificate(tokenId);

    res.status(201).json({
      success: true,
      data: {
        tokenId,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        certificate: {
          recipientName: certificateData.recipientName,
          courseName: certificateData.courseName,
          institutionName: certificateData.institutionName,
          issueDate: certificateData.issueDate.toString(),
          isRevoked: certificateData.isRevoked,
          issuer: certificateData.issuer,
          recipient: recipientAddress
        }
      }
    });

  } catch (error) {
    console.error('Error minting certificate:', error);

    // Handle specific contract errors
    if (error.message.includes('Not authorized to issue certificates')) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to issue certificates'
      });
    }

    if (error.message.includes('Invalid recipient address')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid recipient address'
      });
    }

    if (error.message.includes('insufficient funds')) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient funds for gas fees'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to mint certificate',
      details: error.message
    });
  }
});

// Get issuer status
router.get('/issuer-status/:address', async (req, res) => {
  try {
    const { address } = req.params;

    if (!ethers.utils.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address format'
      });
    }

    const contract = getContract();
    const isAuthorized = await contract.authorizedIssuers(address);
    const owner = await contract.owner();
    const isOwner = owner.toLowerCase() === address.toLowerCase();

    res.json({
      success: true,
      data: {
        address,
        isAuthorized,
        isOwner,
        canIssue: isAuthorized || isOwner
      }
    });

  } catch (error) {
    console.error('Error checking issuer status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check issuer status'
    });
  }
});

// Get total supply
router.get('/total-supply', async (req, res) => {
  try {
    const contract = getContract();
    const totalSupply = await contract.totalSupply();

    res.json({
      success: true,
      data: {
        totalSupply: totalSupply.toString()
      }
    });

  } catch (error) {
    console.error('Error getting total supply:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get total supply'
    });
  }
});

module.exports = router;