const express = require('express');
const { ethers } = require('ethers');
const Joi = require('joi');
const router = express.Router();

// Load contract ABI and address
const contractABI = require('../../artifacts/contracts/Certificate.sol/Certificate.json').abi;
const contractAddresses = require('../contract-addresses.json');

// Validation schema
const mintCertificateSchema = Joi.object({
  recipientAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  recipientName: Joi.string().min(1).max(100).required(),
  courseName: Joi.string().min(1).max(200).required(),
  institutionName: Joi.string().min(1).max(100).required()
});

// POST /api/mint-certificate
router.post('/', async (req, res) => {
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

    // Initialize provider and signer
    const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Get contract instance
    const contractAddress = contractAddresses.amoy?.Certificate;
    if (!contractAddress) {
      return res.status(500).json({
        success: false,
        error: 'Contract not deployed on Amoy network'
      });
    }

    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    // Check if signer is authorized issuer
    const isAuthorized = await contract.authorizedIssuers(signer.address);
    const isOwner = await contract.owner() === signer.address;
    
    if (!isAuthorized && !isOwner) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to issue certificates'
      });
    }

    // Estimate gas for the transaction
    const gasEstimate = await contract.issueCertificateBasic.estimateGas(
      recipientAddress,
      recipientName,
      courseName,
      institutionName
    );

    // Add 20% buffer to gas estimate
    const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

    // Issue the certificate
    const tx = await contract.issueCertificateBasic(
      recipientAddress,
      recipientName,
      courseName,
      institutionName,
      { gasLimit }
    );

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    // Extract token ID from the event
    const event = receipt.logs.find(log => {
      try {
        const parsedLog = contract.interface.parseLog(log);
        return parsedLog.name === 'CertificateIssued';
      } catch (e) {
        return false;
      }
    });

    let tokenId = null;
    if (event) {
      const parsedLog = contract.interface.parseLog(event);
      tokenId = parsedLog.args.tokenId.toString();
    }

    res.json({
      success: true,
      data: {
        transactionHash: tx.hash,
        tokenId: tokenId,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        certificate: {
          recipientAddress,
          recipientName,
          courseName,
          institutionName,
          issuer: signer.address
        }
      }
    });

  } catch (error) {
    console.error('Error minting certificate:', error);

    // Handle specific contract errors
    if (error.reason) {
      return res.status(400).json({
        success: false,
        error: 'Contract error',
        details: error.reason
      });
    }

    // Handle network errors
    if (error.code === 'NETWORK_ERROR') {
      return res.status(503).json({
        success: false,
        error: 'Network error',
        details: 'Unable to connect to blockchain network'
      });
    }

    // Handle insufficient funds
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return res.status(400).json({
        success: false,
        error: 'Insufficient funds',
        details: 'Not enough MATIC to complete transaction'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
});

// GET /api/mint-certificate/status/:txHash
router.get('/status/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;

    if (!txHash.match(/^0x[a-fA-F0-9]{64}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction hash format'
      });
    }

    const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      return res.json({
        success: true,
        data: {
          status: 'pending',
          confirmations: 0
        }
      });
    }

    const currentBlock = await provider.getBlockNumber();
    const confirmations = currentBlock - receipt.blockNumber + 1;

    res.json({
      success: true,
      data: {
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        confirmations,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      }
    });

  } catch (error) {
    console.error('Error checking transaction status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check transaction status'
    });
  }
});

module.exports = router;