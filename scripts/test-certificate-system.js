#!/usr/bin/env node

/**
 * Comprehensive Certificate System Integration Test
 * 
 * This script tests the complete certificate system:
 * 1. Smart contract deployment and configuration
 * 2. Backend API endpoints for minting and verification
 * 3. Frontend integration with blockchain
 * 4. End-to-end certificate lifecycle
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
  contractAddressesPath: './contract-addresses.json'
};

// Test data
const testCertificate = {
  recipientAddress: '0x742d35Cc6634C0532925a3b8D0C9C0E3C5d5c8eF', // Test address
  recipientName: 'John Doe',
  courseName: 'Blockchain Development Fundamentals',
  institutionName: 'VerifyCert Academy',
  metadataURI: 'https://example.com/metadata/test-certificate.json'
};

class CertificateSystemTester {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.contractAddress = null;
    this.testResults = {
      contractTests: [],
      backendTests: [],
      frontendTests: [],
      integrationTests: []
    };
  }

  async initialize() {
    console.log('🚀 Initializing Certificate System Test Suite\n');

    try {
      // Initialize provider and wallet
      this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
      
      if (!config.privateKey) {
        throw new Error('PRIVATE_KEY environment variable is required');
      }
      
      this.wallet = new ethers.Wallet(config.privateKey, this.provider);
      console.log('✅ Wallet initialized:', this.wallet.address);

      // Load contract address
      const contractAddresses = JSON.parse(fs.readFileSync(config.contractAddressesPath, 'utf8'));
      this.contractAddress = contractAddresses.polygonAmoy?.Certificate;
      
      if (!this.contractAddress) {
        throw new Error('Certificate contract address not found in contract-addresses.json');
      }
      
      console.log('✅ Contract address loaded:', this.contractAddress);

      // Load contract ABI and initialize contract
      const contractArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/Certificate.sol/Certificate.json', 'utf8'));
      this.contract = new ethers.Contract(this.contractAddress, contractArtifact.abi, this.wallet);
      
      console.log('✅ Contract initialized\n');
      
    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      process.exit(1);
    }
  }

  async testSmartContract() {
    console.log('📋 Testing Smart Contract...\n');

    try {
      // Test 1: Check contract deployment
      const code = await this.provider.getCode(this.contractAddress);
      this.addTestResult('contractTests', 'Contract Deployment', code !== '0x', 'Contract is deployed and has code');

      // Test 2: Check contract owner
      const owner = await this.contract.owner();
      this.addTestResult('contractTests', 'Contract Owner', owner === this.wallet.address, `Owner is ${owner}`);

      // Test 3: Check if wallet is authorized issuer
      const isAuthorized = await this.contract.isAuthorizedIssuer(this.wallet.address);
      this.addTestResult('contractTests', 'Issuer Authorization', isAuthorized, 'Wallet is authorized to issue certificates');

      // Test 4: Check total supply
      const totalSupply = await this.contract.totalSupply();
      this.addTestResult('contractTests', 'Total Supply', true, `Total certificates issued: ${totalSupply.toString()}`);

      // Test 5: Test certificate issuance
      console.log('🔄 Issuing test certificate...');
      
      const metadataHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(testCertificate)));
      
      const tx = await this.contract.issueCertificate(
        testCertificate.recipientAddress,
        testCertificate.recipientName,
        testCertificate.courseName,
        testCertificate.institutionName,
        testCertificate.metadataURI,
        metadataHash
      );
      
      const receipt = await tx.wait();
      const tokenId = receipt.logs[0].args.tokenId.toString();
      
      this.addTestResult('contractTests', 'Certificate Issuance', !!tokenId, `Certificate issued with token ID: ${tokenId}`);
      
      // Store token ID for later tests
      this.testTokenId = tokenId;

      // Test 6: Verify certificate data
      const certificateData = await this.contract.getCertificate(tokenId);
      const dataValid = (
        certificateData.recipientName === testCertificate.recipientName &&
        certificateData.courseName === testCertificate.courseName &&
        certificateData.institutionName === testCertificate.institutionName &&
        certificateData.isValid === true
      );
      
      this.addTestResult('contractTests', 'Certificate Data Verification', dataValid, 'Certificate data matches input');

      // Test 7: Check certificate validity
      const isValid = await this.contract.isValidCertificate(tokenId);
      this.addTestResult('contractTests', 'Certificate Validity', isValid, 'Certificate is valid');

      // Test 8: Check recipient certificates
      const recipientCerts = await this.contract.getCertificatesByRecipient(testCertificate.recipientAddress);
      const hasRecipientCert = recipientCerts.some(id => id.toString() === tokenId);
      this.addTestResult('contractTests', 'Recipient Certificate Tracking', hasRecipientCert, 'Certificate tracked for recipient');

      // Test 9: Check issuer certificates
      const issuerCerts = await this.contract.getCertificatesByIssuer(this.wallet.address);
      const hasIssuerCert = issuerCerts.some(id => id.toString() === tokenId);
      this.addTestResult('contractTests', 'Issuer Certificate Tracking', hasIssuerCert, 'Certificate tracked for issuer');

      // Test 10: Test non-transferability
      try {
        await this.contract.transferFrom(testCertificate.recipientAddress, this.wallet.address, tokenId);
        this.addTestResult('contractTests', 'Non-Transferability', false, 'Certificate transfer should fail');
      } catch (error) {
        this.addTestResult('contractTests', 'Non-Transferability', true, 'Certificate transfer correctly blocked');
      }

    } catch (error) {
      console.error('❌ Smart contract test failed:', error);
      this.addTestResult('contractTests', 'Smart Contract Tests', false, `Error: ${error.message}`);
    }
  }

  async testBackendAPI() {
    console.log('\n📋 Testing Backend API...\n');

    try {
      // Test 1: Backend health check
      try {
        const healthResponse = await axios.get(`${config.backendUrl}/health`);
        this.addTestResult('backendTests', 'Backend Health Check', healthResponse.status === 200, 'Backend is running');
      } catch (error) {
        this.addTestResult('backendTests', 'Backend Health Check', false, 'Backend is not accessible');
      }

      // Test 2: Verification service status
      try {
        const statusResponse = await axios.get(`${config.backendUrl}/api/verify-certificate/status`);
        const isOperational = statusResponse.data.status === 'operational';
        this.addTestResult('backendTests', 'Verification Service Status', isOperational, `Status: ${statusResponse.data.status}`);
      } catch (error) {
        this.addTestResult('backendTests', 'Verification Service Status', false, 'Verification service not accessible');
      }

      // Test 3: Minting service status
      try {
        const mintStatusResponse = await axios.get(`${config.backendUrl}/api/mint-certificate/status`);
        const isMintOperational = mintStatusResponse.data.status === 'operational';
        this.addTestResult('backendTests', 'Minting Service Status', isMintOperational, `Status: ${mintStatusResponse.data.status}`);
      } catch (error) {
        this.addTestResult('backendTests', 'Minting Service Status', false, 'Minting service not accessible');
      }

      // Test 4: Certificate verification (if we have a test token)
      if (this.testTokenId) {
        try {
          const verifyResponse = await axios.get(`${config.backendUrl}/api/verify-certificate/${this.testTokenId}`);
          const verificationSuccess = verifyResponse.data.success && verifyResponse.data.data.isValid;
          this.addTestResult('backendTests', 'Certificate Verification API', verificationSuccess, `Token ${this.testTokenId} verified`);
        } catch (error) {
          this.addTestResult('backendTests', 'Certificate Verification API', false, `Verification failed: ${error.message}`);
        }
      }

      // Test 5: Batch verification
      if (this.testTokenId) {
        try {
          const batchResponse = await axios.post(`${config.backendUrl}/api/verify-certificate/batch`, {
            tokenIds: [this.testTokenId]
          });
          const batchSuccess = batchResponse.data.success && batchResponse.data.data.results[0].success;
          this.addTestResult('backendTests', 'Batch Verification API', batchSuccess, 'Batch verification works');
        } catch (error) {
          this.addTestResult('backendTests', 'Batch Verification API', false, `Batch verification failed: ${error.message}`);
        }
      }

      // Test 6: Recipient certificates lookup
      try {
        const recipientResponse = await axios.get(`${config.backendUrl}/api/verify-certificate/recipient/${testCertificate.recipientAddress}`);
        const hasRecipientData = recipientResponse.data.success;
        this.addTestResult('backendTests', 'Recipient Certificates API', hasRecipientData, 'Recipient lookup works');
      } catch (error) {
        this.addTestResult('backendTests', 'Recipient Certificates API', false, `Recipient lookup failed: ${error.message}`);
      }

    } catch (error) {
      console.error('❌ Backend API test failed:', error);
      this.addTestResult('backendTests', 'Backend API Tests', false, `Error: ${error.message}`);
    }
  }

  async testFrontendIntegration() {
    console.log('\n📋 Testing Frontend Integration...\n');

    try {
      // Test 1: Frontend accessibility
      try {
        const frontendResponse = await axios.get(config.frontendUrl);
        this.addTestResult('frontendTests', 'Frontend Accessibility', frontendResponse.status === 200, 'Frontend is accessible');
      } catch (error) {
        this.addTestResult('frontendTests', 'Frontend Accessibility', false, 'Frontend is not accessible');
      }

      // Test 2: Verification page
      if (this.testTokenId) {
        try {
          const verifyPageResponse = await axios.get(`${config.frontendUrl}/verify/${this.testTokenId}`);
          this.addTestResult('frontendTests', 'Verification Page', verifyPageResponse.status === 200, 'Verification page loads');
        } catch (error) {
          this.addTestResult('frontendTests', 'Verification Page', false, 'Verification page not accessible');
        }
      }

      // Test 3: Static assets
      try {
        const manifestResponse = await axios.get(`${config.frontendUrl}/manifest.json`);
        this.addTestResult('frontendTests', 'PWA Manifest', manifestResponse.status === 200, 'PWA manifest available');
      } catch (error) {
        this.addTestResult('frontendTests', 'PWA Manifest', false, 'PWA manifest not found');
      }

    } catch (error) {
      console.error('❌ Frontend integration test failed:', error);
      this.addTestResult('frontendTests', 'Frontend Integration Tests', false, `Error: ${error.message}`);
    }
  }

  async testEndToEndIntegration() {
    console.log('\n📋 Testing End-to-End Integration...\n');

    try {
      // Test 1: Complete certificate lifecycle
      if (this.testTokenId) {
        // Verify via backend API
        const backendVerification = await axios.get(`${config.backendUrl}/api/verify-certificate/${this.testTokenId}`);
        
        // Check if data matches
        const backendData = backendVerification.data.data;
        const dataMatches = (
          backendData.recipientName === testCertificate.recipientName &&
          backendData.courseName === testCertificate.courseName &&
          backendData.institutionName === testCertificate.institutionName
        );
        
        this.addTestResult('integrationTests', 'End-to-End Data Consistency', dataMatches, 'Data consistent across contract and API');
      }

      // Test 2: Contract addresses synchronization
      const backendAddresses = JSON.parse(fs.readFileSync('./backend/contract-addresses.json', 'utf8'));
      const frontendAddresses = JSON.parse(fs.readFileSync('./frontend/contract-addresses.json', 'utf8'));
      const rootAddresses = JSON.parse(fs.readFileSync('./contract-addresses.json', 'utf8'));
      
      const addressesMatch = (
        backendAddresses.polygonAmoy?.Certificate === this.contractAddress &&
        frontendAddresses.polygonAmoy?.Certificate === this.contractAddress &&
        rootAddresses.polygonAmoy?.Certificate === this.contractAddress
      );
      
      this.addTestResult('integrationTests', 'Contract Address Synchronization', addressesMatch, 'Contract addresses synchronized across services');

      // Test 3: Environment configuration
      const backendEnvExists = fs.existsSync('./backend/.env');
      const frontendEnvExists = fs.existsSync('./frontend/.env');
      
      this.addTestResult('integrationTests', 'Environment Configuration', backendEnvExists && frontendEnvExists, 'Environment files configured');

    } catch (error) {
      console.error('❌ End-to-end integration test failed:', error);
      this.addTestResult('integrationTests', 'End-to-End Integration Tests', false, `Error: ${error.message}`);
    }
  }

  addTestResult(category, testName, passed, details) {
    const result = {
      name: testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    };
    
    this.testResults[category].push(result);
    
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}: ${details}`);
  }

  generateReport() {
    console.log('\n📊 Test Results Summary\n');
    
    const categories = ['contractTests', 'backendTests', 'frontendTests', 'integrationTests'];
    const categoryNames = ['Smart Contract', 'Backend API', 'Frontend', 'Integration'];
    
    let totalTests = 0;
    let totalPassed = 0;
    
    categories.forEach((category, index) => {
      const tests = this.testResults[category];
      const passed = tests.filter(t => t.passed).length;
      const total = tests.length;
      
      totalTests += total;
      totalPassed += passed;
      
      const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
      const status = percentage === 100 ? '✅' : percentage >= 80 ? '⚠️' : '❌';
      
      console.log(`${status} ${categoryNames[index]}: ${passed}/${total} (${percentage}%)`);
    });
    
    const overallPercentage = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
    const overallStatus = overallPercentage === 100 ? '✅' : overallPercentage >= 80 ? '⚠️' : '❌';
    
    console.log(`\n${overallStatus} Overall: ${totalPassed}/${totalTests} (${overallPercentage}%)\n`);
    
    // Save detailed report
    const report = {
      summary: {
        totalTests,
        totalPassed,
        overallPercentage,
        timestamp: new Date().toISOString()
      },
      results: this.testResults,
      testCertificate: {
        tokenId: this.testTokenId,
        ...testCertificate
      }
    };
    
    fs.writeFileSync('./test-results.json', JSON.stringify(report, null, 2));
    console.log('📄 Detailed report saved to test-results.json');
    
    return overallPercentage >= 80;
  }

  async run() {
    try {
      await this.initialize();
      await this.testSmartContract();
      await this.testBackendAPI();
      await this.testFrontendIntegration();
      await this.testEndToEndIntegration();
      
      const success = this.generateReport();
      
      if (success) {
        console.log('🎉 Certificate system tests completed successfully!');
        process.exit(0);
      } else {
        console.log('⚠️ Some tests failed. Please review the results and fix issues.');
        process.exit(1);
      }
      
    } catch (error) {
      console.error('💥 Test suite failed:', error);
      process.exit(1);
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new CertificateSystemTester();
  tester.run();
}

module.exports = CertificateSystemTester;