const { ethers } = require("hardhat");

// Global test setup for integration tests
before(async function () {
  // Increase timeout for integration tests
  this.timeout(60000);

  // Set up test environment variables
  process.env.NODE_ENV = "test";
  process.env.PORT = "3001";
  process.env.CORS_ORIGIN = "http://localhost:3000";
  process.env.RATE_LIMIT_WINDOW = "900000"; // 15 minutes
  process.env.RATE_LIMIT_MAX = "1000"; // High limit for testing
  
  // Mock email service for testing
  process.env.EMAIL_SERVICE = "test";
  process.env.EMAIL_FROM = "test@verifycert.com";
  
  // Set up blockchain test environment
  const network = await ethers.provider.getNetwork();
  console.log(`Running integration tests on network: ${network.name} (chainId: ${network.chainId})`);
});

// Global test cleanup
after(async function () {
  // Clean up any test data
  console.log("Integration tests completed");
});

// Helper functions for integration tests
global.testHelpers = {
  // Generate random test data
  generateCertificateData: (overrides = {}) => {
    const timestamp = Math.floor(Date.now() / 1000);
    return {
      recipientName: `Test User ${timestamp}`,
      courseName: `Test Course ${timestamp}`,
      institutionName: `Test Institution ${timestamp}`,
      issueDate: timestamp,
      metadataURI: `https://ipfs.io/ipfs/QmTest${timestamp}`,
      ...overrides
    };
  },

  // Wait for blockchain transaction
  waitForTransaction: async (txHash) => {
    const provider = ethers.provider;
    let receipt = null;
    let attempts = 0;
    const maxAttempts = 30;

    while (!receipt && attempts < maxAttempts) {
      try {
        receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        }
      } catch (error) {
        console.log(`Waiting for transaction ${txHash}... (attempt ${attempts + 1})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
    }

    if (!receipt) {
      throw new Error(`Transaction ${txHash} not mined after ${maxAttempts} attempts`);
    }

    return receipt;
  },

  // Validate certificate structure
  validateCertificateStructure: (certificate) => {
    const requiredFields = [
      'tokenId', 'issuer', 'recipient', 'recipientName',
      'courseName', 'institutionName', 'issueDate', 'isValid'
    ];

    for (const field of requiredFields) {
      if (certificate[field] === undefined || certificate[field] === null) {
        throw new Error(`Certificate missing required field: ${field}`);
      }
    }

    // Validate address formats
    if (!ethers.isAddress(certificate.issuer)) {
      throw new Error(`Invalid issuer address: ${certificate.issuer}`);
    }
    if (!ethers.isAddress(certificate.recipient)) {
      throw new Error(`Invalid recipient address: ${certificate.recipient}`);
    }

    // Validate string fields are not empty
    const stringFields = ['recipientName', 'courseName', 'institutionName'];
    for (const field of stringFields) {
      if (typeof certificate[field] !== 'string' || certificate[field].trim() === '') {
        throw new Error(`Certificate field ${field} must be a non-empty string`);
      }
    }

    // Validate issue date is a valid timestamp
    if (typeof certificate.issueDate !== 'number' || certificate.issueDate <= 0) {
      throw new Error(`Invalid issue date: ${certificate.issueDate}`);
    }

    return true;
  },

  // Generate test wallet
  generateTestWallet: () => {
    return ethers.Wallet.createRandom();
  },

  // Format error for testing
  formatTestError: (error) => {
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    };
  }
};

// Custom assertion helpers
global.assertCertificateEquals = (actual, expected) => {
  const fieldsToCompare = [
    'recipientName', 'courseName', 'institutionName', 
    'issuer', 'recipient', 'isValid'
  ];

  for (const field of fieldsToCompare) {
    if (actual[field] !== expected[field]) {
      throw new Error(
        `Certificate field ${field} mismatch. Expected: ${expected[field]}, Actual: ${actual[field]}`
      );
    }
  }
};

// Mock MetaMask for testing
global.mockMetaMask = {
  isConnected: false,
  currentAccount: null,
  chainId: '0x13881', // Polygon Mumbai

  connect: async function(account) {
    this.isConnected = true;
    this.currentAccount = account;
    return [account];
  },

  disconnect: function() {
    this.isConnected = false;
    this.currentAccount = null;
  },

  switchChain: async function(chainId) {
    this.chainId = chainId;
    return true;
  },

  signMessage: async function(message, account) {
    // Mock signature - in real tests this would use actual signing
    return `0x${'a'.repeat(130)}`; // Mock signature
  }
};

// Error simulation helpers
global.simulateNetworkError = () => {
  const originalFetch = global.fetch;
  global.fetch = () => Promise.reject(new Error('Network error'));
  
  return () => {
    global.fetch = originalFetch;
  };
};

global.simulateBlockchainError = (errorType = 'NETWORK_ERROR') => {
  const originalProvider = ethers.provider;
  const mockProvider = {
    ...originalProvider,
    send: () => Promise.reject(new Error(errorType))
  };
  
  // This is a simplified mock - in real implementation you'd need more sophisticated mocking
  return () => {
    // Restore original provider
  };
};