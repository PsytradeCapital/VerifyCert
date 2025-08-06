const { ethers } = require('ethers');

// Amoy network configuration
const AMOY_CHAIN_ID = 80002;
const AMOY_RPC_URL = 'https://rpc-amoy.polygon.technology/';

/**
 * Middleware to validate Amoy network connection
 */
const validateAmoyNetwork = async (req, res, next) => {
  try {
    const provider = new ethers.JsonRpcProvider(AMOY_RPC_URL);
    const network = await provider.getNetwork();
    
    if (Number(network.chainId) !== AMOY_CHAIN_ID) {
      return res.status(400).json({
        success: false,
        error: 'Invalid network',
        message: `Expected Amoy network (Chain ID: ${AMOY_CHAIN_ID}), got Chain ID: ${network.chainId}`,
        expectedNetwork: {
          name: 'amoy',
          chainId: AMOY_CHAIN_ID,
          rpcUrl: AMOY_RPC_URL
        }
      });
    }
    
    // Add network info to request
    req.network = {
      name: 'amoy',
      chainId: AMOY_CHAIN_ID,
      provider: provider
    };
    
    next();
  } catch (error) {
    console.error('Amoy network validation failed:', error);
    res.status(503).json({
      success: false,
      error: 'Network connection failed',
      message: 'Unable to connect to Amoy network',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Middleware to handle Amoy-specific errors
 */
const handleAmoyErrors = (error, req, res, next) => {
  console.error('Amoy network error:', error);
  
  // Handle specific Amoy network errors
  if (error.code === 'NETWORK_ERROR') {
    return res.status(503).json({
      success: false,
      error: 'Amoy network error',
      message: 'Unable to connect to Amoy testnet. Please try again later.',
      troubleshooting: {
        checkRpc: 'Verify Amoy RPC is accessible',
        checkInternet: 'Check your internet connection',
        faucet: 'Get test MATIC from https://faucet.polygon.technology/'
      }
    });
  }
  
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return res.status(400).json({
      success: false,
      error: 'Insufficient funds',
      message: 'Not enough MATIC for transaction on Amoy network',
      solution: {
        faucet: 'Get test MATIC from https://faucet.polygon.technology/',
        network: 'Make sure you are on Amoy testnet',
        amount: 'Faucet provides 0.5 MATIC per request'
      }
    });
  }
  
  if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
    return res.status(400).json({
      success: false,
      error: 'Gas estimation failed',
      message: 'Unable to estimate gas for Amoy transaction',
      troubleshooting: {
        checkParams: 'Verify transaction parameters',
        checkBalance: 'Ensure sufficient MATIC balance',
        checkContract: 'Verify contract is deployed on Amoy'
      }
    });
  }
  
  if (error.message && error.message.includes('nonce')) {
    return res.status(400).json({
      success: false,
      error: 'Nonce error',
      message: 'Transaction nonce issue on Amoy network',
      solution: {
        wait: 'Wait a moment and try again',
        reset: 'Reset MetaMask account if using MetaMask',
        check: 'Check for pending transactions'
      }
    });
  }
  
  // Default error handling
  res.status(500).json({
    success: false,
    error: 'Amoy network operation failed',
    message: error.message || 'Unknown error occurred',
    network: 'amoy',
    chainId: AMOY_CHAIN_ID,
    details: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
};

/**
 * Validate contract address for Amoy network
 */
const validateAmoyContract = (contractAddress) => {
  const expectedAddress = '0x6c9D554C721dA0CEA1b975982eAEe1f924271F50';
  
  if (!contractAddress) {
    throw new Error('Contract address is required');
  }
  
  if (!ethers.isAddress(contractAddress)) {
    throw new Error('Invalid contract address format');
  }
  
  if (contractAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
    throw new Error(`Invalid contract address for Amoy. Expected: ${expectedAddress}, got: ${contractAddress}`);
  }
  
  return true;
};

/**
 * Validate Ethereum address
 */
const validateEthereumAddress = (address, fieldName = 'address') => {
  if (!address) {
    throw new Error(`${fieldName} is required`);
  }
  
  if (!ethers.isAddress(address)) {
    throw new Error(`Invalid ${fieldName} format`);
  }
  
  return true;
};

module.exports = {
  validateAmoyNetwork,
  handleAmoyErrors,
  validateAmoyContract,
  validateEthereumAddress,
  AMOY_CHAIN_ID,
  AMOY_RPC_URL
};