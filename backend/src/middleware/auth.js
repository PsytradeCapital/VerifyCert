const { ethers } = require('ethers');

/**
 * Middleware to verify wallet signature authentication
 * Expects Authorization header with format: "Bearer <signature>"
 * Expects x-wallet-address header with wallet address
 * Expects x-message header with the original message that was signed
 */
const verifyWalletSignature = async (req, res, next) => {
  try {
    const signature = req.headers.authorization?.replace('Bearer ', '');
    const walletAddress = req.headers['x-wallet-address'];
    const message = req.headers['x-message'];

    if (!signature || !walletAddress || !message) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Missing authentication headers'
        }
      });
    }

    // Verify the signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Invalid signature'
        }
      });
    }

    // Add wallet address to request for use in route handlers
    req.walletAddress = walletAddress.toLowerCase();
    next();
  } catch (error) {
    console.error('Signature verification error:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTHORIZATION_ERROR',
        message: 'Signature verification failed'
      }
    });
  }
};

/**
 * Middleware to check if the wallet address is an authorized issuer
 * This will be implemented when the CertificateService is created
 */
const requireAuthorizedIssuer = async (req, res, next) => {
  // Placeholder - will be implemented with CertificateService
  // For now, just pass through
  next();
};

module.exports = {
  verifyWalletSignature,
  requireAuthorizedIssuer
};