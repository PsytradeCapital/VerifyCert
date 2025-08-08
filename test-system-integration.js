#!/usr/bin/env node

/**
 * Complete Certificate System Integration Test
 * Tests all components working together on Polygon Amoy testnet
 */

const { ethers } = require('ethers');
const fs = require('fs');

// Configuration
const CONTRACT_ADDRESS = '0x6c9D554C721dA0CEA1b975982eAEe1f924271F50';
const RPC_URL = 'https://rpc-amoy.polygon.technology/';
const BACKEND_URL = 'http://localhost:4000';
const FRONTEND_URL = 'http://localhost:3000';

// Contract ABI (minimal for testing)
const CONTRACT_ABI = [
  "function totalSupply() view returns (uint256)",
  "function owner() view returns (address)",
  "function getCertificate(uint256 tokenId) view returns (tuple(string recipientName, string courseName, string institutionName, uint256 issueDate, uint256 expiryDate, bool isRevoked, address issuer, string metadataURI, bytes32 certificateHash))",
  "function isValidCertificate(uint256 tokenId) view returns (bool)",
  "function isAuthorizedIssuer(address issuer) view returns (bool)"
];

async function testSystemIntegration() {
  console.log('🧪 Testing Complete Certificate System Integration...\n');

  try {
    // 1. Test Blockchain Connectivity
    console.log('1️⃣ Testing blockchain connectivity...');
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const network = await provider.getNetwork();
    console.log(`✅ Connected to ${network.name} (Chain ID: ${network.chainId})`);

    // 2. Test Smart Contract
    console.log('\n2️⃣ Testing smart contract...');
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    const totalSupply = await contract.totalSupply();
    const owner = await contract.owner();
    console.log(`✅ Contract loaded: ${CONTRACT_ADDRESS}`);
    console.log(`   Total certificates: ${totalSupply}`);
    console.log(`   Contract owner: ${owner}`);

    // 3. Test Certificate Verification (if certificates exist)
    if (totalSupply > 0) {
      console.log('\n3️⃣ Testing certificate verification...');
      try {
        const certificateData = await contract.getCertificate(1);
        const isValid = await contract.isValidCertificate(1);
        
        console.log('✅ Certificate #1 verification:');
        console.log(`   Recipient: ${certificateData.recipientName}`);
        console.log(`   Course: ${certificateData.courseName}`);
        console.log(`   Institution: ${certificateData.institutionName}`);
        console.log(`   Valid: ${isValid}`);
        console.log(`   Revoked: ${certificateData.isRevoked}`);
      } catch (error) {
        console.log('ℹ️  No certificate #1 found (normal for new deployment)');
      }
    }

    // 4. Test Backend API (if running)
    console.log('\n4️⃣ Testing backend API...');
    try {
      const fetch = (await import('node-fetch')).default;
      
      // Test stats endpoint
      const statsResponse = await fetch(`${BACKEND_URL}/api/verify-certificate/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('✅ Backend API responding');
        console.log(`   API reports ${statsData.data?.totalCertificates || 0} certificates`);
      } else {
        console.log('⚠️  Backend API not responding (may not be running)');
      }

      // Test verification endpoint
      if (totalSupply > 0) {
        const verifyResponse = await fetch(`${BACKEND_URL}/api/verify-certificate/1`);
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          console.log('✅ Certificate verification API working');
          console.log(`   Certificate exists: ${verifyData.data?.exists}`);
          console.log(`   Certificate valid: ${verifyData.data?.isValid}`);
        }
      }
    } catch (error) {
      console.log('⚠️  Backend API tests skipped (not available or not running)');
    }

    // 5. Test Frontend Accessibility (if running)
    console.log('\n5️⃣ Testing frontend accessibility...');
    try {
      const fetch = (await import('node-fetch')).default;
      const frontendResponse = await fetch(FRONTEND_URL);
      if (frontendResponse.ok) {
        console.log('✅ Frontend application responding');
        console.log(`   Available at: ${FRONTEND_URL}`);
      } else {
        console.log('⚠️  Frontend not responding (may not be running)');
      }
    } catch (error) {
      console.log('⚠️  Frontend tests skipped (not running)');
    }

    // 6. Test Configuration Files
    console.log('\n6️⃣ Testing configuration consistency...');
    
    // Check contract addresses files
    const configFiles = [
      'contract-addresses.json',
      'frontend/contract-addresses.json',
      'backend/contract-addresses.json'
    ];

    let configConsistent = true;
    for (const configFile of configFiles) {
      try {
        if (fs.existsSync(configFile)) {
          const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
          const contractAddr = config.amoy?.Certificate;
          if (contractAddr === CONTRACT_ADDRESS) {
            console.log(`✅ ${configFile} - correct contract address`);
          } else {
            console.log(`❌ ${configFile} - incorrect contract address: ${contractAddr}`);
            configConsistent = false;
          }
        } else {
          console.log(`⚠️  ${configFile} - file not found`);
        }
      } catch (error) {
        console.log(`❌ ${configFile} - error reading file: ${error.message}`);
        configConsistent = false;
      }
    }

    // 7. Summary
    console.log('\n📋 Integration Test Summary:');
    console.log('✅ Smart contract deployed and accessible');
    console.log('✅ Blockchain connectivity working');
    console.log(configConsistent ? '✅ Configuration files consistent' : '⚠️  Configuration inconsistencies found');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Start backend: cd backend && npm start');
    console.log('2. Start frontend: cd frontend && npm start');
    console.log('3. Visit http://localhost:3000/verify to test certificate verification');
    console.log('4. Use the minting API to create test certificates');

    console.log('\n🔗 Useful Links:');
    console.log(`- Contract on Amoy: https://amoy.polygonscan.com/address/${CONTRACT_ADDRESS}`);
    console.log(`- Frontend: ${FRONTEND_URL}`);
    console.log(`- Backend API: ${BACKEND_URL}/api`);

  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Check internet connection');
    console.log('- Verify contract address is correct');
    console.log('- Ensure Polygon Amoy RPC is accessible');
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testSystemIntegration();
}

module.exports = { testSystemIntegration };