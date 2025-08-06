#!/usr/bin/env node

/**
 * Certificate System Integration Test
 * 
 * This script tests the complete certificate workflow:
 * 1. Deploy/connect to certificate contract
 * 2. Mint a test certificate
 * 3. Verify the certificate through the API
 * 4. Test frontend verification flow
 */

const { ethers } = require('ethers');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  rpcUrl: process.env.POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology/',
  privateKey: process.env.PRIVATE_KEY,
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  contractAddressesPath: path.join(__dirname, '..', 'contract-addresses.json')
};

// Test data
const testCertificate = {
  recipientAddress: '0x742d35Cc6634C0532925a3b8D0C9C0E3C5d5c8eF', // Test address
  recipientName: 'John Doe',
  courseName: 'Blockchain Development Fundamentals',
  institutionName: 'VerifyCert Academy',
  metadataURI: 'https://example.com/metadata/test-certificate'
};

class CertificateIntegrationTester {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.contractAddress = null;
    this.testResults = {
      contractConnection: false,
      certificateMinting: false,
      apiVerification: false,
      frontendIntegration: false,
      errors: []
    };
  }

  async initialize() {
    console.log('🚀 Initializing Certificate Integration Test\n');

    try {
      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
      console.log('✅ Connected to Polygon Amoy RPC');

      // Initialize wallet
      if (!config.privateKey) {
        throw new Error('PRIVATE_KEY environment variable is required');
      }
      this.wallet = new ethers.Wallet(config.privateKey, this.provider);
      console.log('✅ Wallet initialized:', this.wallet.address);

      // Load contract address
      if (!fs.existsSync(config.contractAddressesPath)) {
        throw new Error('Contract addresses file not found. Please deploy contracts first.');
      }

      const contractAddresses = JSON.parse(fs.readFileSync(config.contractAddressesPath, 'utf8'));
      this.contractAddress = contractAddresses.polygonAmoy?.Certificate;

      if (!this.contractAddress) {
        throw new Error('Certificate contract address not found for Polygon Amoy');
      }

      console.log('✅ Contract address loaded:', this.contractAddress);

      // Load contract ABI
      const contractArtifactPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'Certificate.sol', 'Certificate.json');
      if (!fs.existsSync(contractArtifactPath)) {
        throw new Error('Contract artifact not found. Please compile contracts first.');
      }

      const contractArtifact = JSON.parse(fs.readFileSync(contractArtifactPath, 'utf8'));
      this.contract = new ethers.Contract(this.contractAddress, contractArtifact.abi, this.wallet);

      console.log('✅ Contract initialized\n');
      this.testResults.contractConnection = true;

    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      this.testResults.errors.push(`Initialization: ${error.message}`);
      throw error;
    }
  }

  async testContractConnection() {
    console.log('🔍 Testing contract connection...');

    try {
      // Test basic contract calls
      const totalSupply = await this.contract.totalSupply();
      console.log('📊 Total certificates issued:', totalSupply.toString());

      const isAuthorized = await this.contract.isAuthorizedIssuer(this.wallet.address);
      console.log('🔐 Wallet authorized to issue:', isAuthorized);

      if (!isAuthorized) {
        console.log('⚠️  Wallet is not authorized to issue certificates');
        console.log('   This test will only verify existing certificates');
      }

      console.log('✅ Contract connection test passed\n');
      return true;

    } catch (error) {
      console.error('❌ Contract connection test failed:', error.message);
      this.testResults.errors.push(`Contract connection: ${error.message}`);
      return false;
    }
  }

  async testCertificateMinting() {
    console.log('🏭 Testing certificate minting...');

    try {
      // Check if wallet is authorized
      const isAuthorized = await this.contract.isAuthorizedIssuer(this.wallet.address);
      if (!isAuthorized) {
        console.log('⏭️  Skipping minting test - wallet not authorized');
        return null;
      }

      // Generate metadata hash
      const metadataHash = ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify({
          recipientName: testCertificate.recipientName,
          courseName: testCertificate.courseName,
          institutionName: testCertificate.institutionName,
          timestamp: Date.now()
        }))
      );

      console.log('📝 Minting test certificate...');
      console.log('   Recipient:', testCertificate.recipientName);
      console.log('   Course:', testCertificate.courseName);
      console.log('   Institution:', testCertificate.institutionName);

      // Estimate gas
      const gasEstimate = await this.contract.issueCertificate.estimateGas(
        testCertificate.recipientAddress,
        testCertificate.recipientName,
        testCertificate.courseName,
        testCertificate.institutionName,
        testCertificate.metadataURI,
        metadataHash
      );

      // Mint certificate
      const tx = await this.contract.issueCertificate(
        testCertificate.recipientAddress,
        testCertificate.recipientName,
        testCertificate.courseName,
        testCertificate.institutionName,
        testCertificate.metadataURI,
        metadataHash,
        { gasLimit: gasEstimate * 120n / 100n } // 20% buffer
      );

      console.log('⏳ Transaction submitted:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait(1);
      console.log('✅ Transaction confirmed in block:', receipt.blockNumber);

      // Extract token ID from logs
      const certificateIssuedEvent = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed.name === 'CertificateIssued';
        } catch {
          return false;
        }
      });

      if (!certificateIssuedEvent) {
        throw new Error('CertificateIssued event not found in transaction logs');
      }

      const parsed = this.contract.interface.parseLog(certificateIssuedEvent);
      const tokenId = parsed.args.tokenId.toString();

      console.log('🎉 Certificate minted successfully!');
      console.log('   Token ID:', tokenId);
      console.log('   Gas used:', receipt.gasUsed.toString());
      console.log('   Explorer:', `https://amoy.polygonscan.com/tx/${receipt.hash}\n`);

      this.testResults.certificateMinting = true;
      return tokenId;

    } catch (error) {
      console.error('❌ Certificate minting failed:', error.message);
      this.testResults.errors.push(`Minting: ${error.message}`);
      return null;
    }
  }

  async testApiVerification(tokenId) {
    console.log('🔍 Testing API verification...');

    if (!tokenId) {
      // Use an existing token ID for testing
      try {
        const totalSupply = await this.contract.totalSupply();
        if (totalSupply > 0) {
          tokenId = '1'; // Test with first certificate
          console.log('   Using existing certificate ID:', tokenId);
        } else {
          console.log('⏭️  Skipping API verification - no certificates available');
          return false;
        }
      } catch (error) {
        console.log('⏭️  Skipping API verification - cannot determine available certificates');
        return false;
      }
    }

    try {
      // Test verification endpoint
      const response = await axios.get(`${config.backendUrl}/api/verify-certificate/${tokenId}`, {
        timeout: 10000
      });

      if (response.data.success) {
        console.log('✅ API verification successful');
        console.log('   Certificate ID:', response.data.data.tokenId);
        console.log('   Recipient:', response.data.data.recipientName);
        console.log('   Course:', response.data.data.courseName);
        console.log('   Institution:', response.data.data.institutionName);
        console.log('   Valid:', response.data.data.isValid);
        console.log('   Network:', response.data.data.network);

        this.testResults.apiVerification = true;
        return true;
      } else {
        throw new Error(response.data.message || 'API verification failed');
      }

    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.error('❌ API verification failed: Backend server not running');
        console.log('   Please start the backend server with: npm run backend:dev');
      } else {
        console.error('❌ API verification failed:', error.message);
      }
      this.testResults.errors.push(`API verification: ${error.message}`);
      return false;
    }
  }

  async testFrontendIntegration(tokenId) {
    console.log('🌐 Testing frontend integration...');

    if (!tokenId) {
      console.log('⏭️  Skipping frontend integration - no token ID available');
      return false;
    }

    try {
      // Test if frontend is accessible
      const response = await axios.get(`${config.frontendUrl}/verify/${tokenId}`, {
        timeout: 5000,
        validateStatus: (status) => status < 500 // Accept 4xx as valid (page exists)
      });

      if (response.status < 400) {
        console.log('✅ Frontend verification page accessible');
        console.log('   URL:', `${config.frontendUrl}/verify/${tokenId}`);
        this.testResults.frontendIntegration = true;
        return true;
      } else {
        throw new Error(`Frontend returned status ${response.status}`);
      }

    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.error('❌ Frontend integration failed: Frontend server not running');
        console.log('   Please start the frontend server with: npm run frontend:dev');
      } else {
        console.error('❌ Frontend integration failed:', error.message);
      }
      this.testResults.errors.push(`Frontend integration: ${error.message}`);
      return false;
    }
  }

  async testBackendStatus() {
    console.log('🏥 Testing backend service status...');

    try {
      const response = await axios.get(`${config.backendUrl}/api/verify-certificate/status`, {
        timeout: 5000
      });

      console.log('✅ Backend status check successful');
      console.log('   Service:', response.data.service);
      console.log('   Status:', response.data.status);
      console.log('   Network:', response.data.network);
      console.log('   Contract initialized:', response.data.contractInitialized);
      console.log('   Total certificates:', response.data.totalCertificatesIssued || 'Unknown');

      return true;

    } catch (error) {
      console.error('❌ Backend status check failed:', error.message);
      return false;
    }
  }

  generateReport() {
    console.log('\n📊 Integration Test Report');
    console.log('=' .repeat(50));
    
    const results = this.testResults;
    const totalTests = Object.keys(results).filter(key => key !== 'errors').length;
    const passedTests = Object.values(results).filter(result => result === true).length;
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    console.log('\nTest Results:');
    console.log(`  Contract Connection: ${results.contractConnection ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Certificate Minting: ${results.certificateMinting ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  API Verification: ${results.apiVerification ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Frontend Integration: ${results.frontendIntegration ? '✅ PASS' : '❌ FAIL'}`);
    
    if (results.errors.length > 0) {
      console.log('\nErrors:');
      results.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    console.log('\nRecommendations:');
    if (!results.contractConnection) {
      console.log('  - Check contract deployment and network configuration');
    }
    if (!results.apiVerification) {
      console.log('  - Ensure backend server is running on port 5000');
      console.log('  - Check contract addresses configuration');
    }
    if (!results.frontendIntegration) {
      console.log('  - Ensure frontend server is running on port 3000');
      console.log('  - Check frontend environment configuration');
    }
    
    console.log('\n' + '='.repeat(50));
  }

  async run() {
    try {
      await this.initialize();
      
      // Test contract connection
      await this.testContractConnection();
      
      // Test backend status
      await this.testBackendStatus();
      
      // Test certificate minting (if authorized)
      const tokenId = await this.testCertificateMinting();
      
      // Test API verification
      await this.testApiVerification(tokenId);
      
      // Test frontend integration
      await this.testFrontendIntegration(tokenId);
      
      // Generate report
      this.generateReport();
      
      // Exit with appropriate code
      const hasFailures = this.testResults.errors.length > 0;
      process.exit(hasFailures ? 1 : 0);
      
    } catch (error) {
      console.error('\n💥 Integration test failed:', error.message);
      this.generateReport();
      process.exit(1);
    }
  }
}

// Run the integration test
if (require.main === module) {
  const tester = new CertificateIntegrationTester();
  tester.run();
}

module.exports = CertificateIntegrationTester;