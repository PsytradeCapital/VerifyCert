// Simple test to verify blockchain service works
describe('BlockchainService Simple Test', () => {
  beforeAll(() => {
    // Set environment variables for testing
    process.env.REACT_APP_CONTRACT_ADDRESS = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4';
    process.env.REACT_APP_POLYGON_MUMBAI_RPC_URL = 'https://rpc-mumbai.maticvigil.com';
    process.env.REACT_APP_CHAIN_ID = '80001';
  });

  it('should be able to import the blockchain service', async () => {
    const getBlockchainService = await import('../blockchainService');
    expect(getBlockchainService.default).toBeDefined();
    expect(typeof getBlockchainService.default).toBe('function');
  });

  it('should create blockchain service instance', async () => {
    const { default: getBlockchainService } = await import('../blockchainService');
    
    // Mock ethers before creating service
    jest.doMock('ethers', () => ({
      JsonRpcProvider: jest.fn().mockImplementation(() => ({
        getNetwork: jest.fn().mockResolvedValue({ name: 'test', chainId: BigInt(80001) }),
      })),
      Contract: jest.fn().mockImplementation(() => ({
        getCertificate: jest.fn(),
        verifyCertificate: jest.fn(),
        ownerOf: jest.fn(),
      })),
    }));

    const service = getBlockchainService();
    expect(service).toBeDefined();
    expect(service.isConfigured()).toBe(true);
  });
});