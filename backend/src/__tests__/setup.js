// Test setup file
// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3002';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.POLYGON_MUMBAI_RPC_URL = 'https://test-rpc.com';
process.env.PRIVATE_KEY = '0x' + '1'.repeat(64); // Mock private key for testing
process.env.CONTRACT_ADDRESS = '0x' + '2'.repeat(40);

// Suppress console.log during tests unless explicitly needed
const originalConsoleLog = console.log;
console.log = (...args) => {
  if (process.env.VERBOSE_TESTS === 'true') {
    originalConsoleLog(...args);
  }
};

// Global test timeout
jest.setTimeout(10000);