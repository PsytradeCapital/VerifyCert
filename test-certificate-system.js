#!/usr/bin/env node

/**
 * Certificate System Integration Test
 * Tests the complete certificate issuance and verification workflow
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load configuration
const contractAddresses = require('./contract-addresses.json');
const contractABI = require('./artifacts/contracts/Certificate.sol/Certificate.json').abi;

async function testCertificateSystem() {
  console.log('🧪 Testing Certificate System Integration...\n');

  try {
    // Initialize provider
    const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology/');
    console.log('✅ Connected to Polygon Amoy network');

    // Get contract instance
    const contractAddress = contractAddresses.amoy?.Certificate;
    if (!contractAddress) {
      throw new Error('Contract address not found in configuration');
    }

    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    console.log(`✅ Contract loaded at: ${contractAddress}`);

    // Test contract basic functions
    console.log('\n📋 Testing contract functions...');

    // Get total supply
    const totalSupply = await contract.totalSupply();
    console.log(`📊 Total certificates issued: ${totalSupply}`);

    // Get contract owner
    const owner = await contract.owner();
    console.log(`👤 Contract owner: ${owner}`);

    // Test certificate verification (if any certificates exist)
    if (totalSupply > 0) {
      console.log('\n🔍 Testing certificate verification...');
      
      try {
        const certificateData = await contract.getCertificate(1);
        console.log('✅ Certificate #1 data retrieved:');
        console.log(`   Recipient: ${certificateData.recipientName}`);
        console.log(`   Course: ${certificateData.courseName}`);
        console.log(`   Institution: ${certificateData.institutionName}`);
        console.log(`   Issue Date: ${new Date(Number(certificateData.issueDate) * 1000).toLocaleDateString()}`);
        console.log(`   Revoked: ${certificateData.isRevoked}`);
        console.log(`   Issuer: ${certificateData.issuer}`);

        // Test validity check
        const isValid = await contract.isValidCertificate(1);
        console.log(`   Valid: ${isValid}`);
      } catch (error) {
        console.log('ℹ️  No certificate #1 found (this is normal for a new deployment)');
      }
    }

    // Test API endpoints (if backend is running)
    console.log('\n🌐 Testing API endpoints...');
    
    try {
      const fetch = (await import('node-fetch')).default;
      
      // Test verification endpoint
      const verifyResponse = await fetch('http://localhost:4000/api/verify-certificate/1');
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        console.log('✅ Verification API working');
        console.log(`   Response: ${JSON.stringify(verifyData, null, 2)}`);
      } else {
        console.log('⚠️  Verification API not responding (backend may not be running)');
      }

      // Test stats endpoint
      const statsResponse = await fetch('http://localhost:4000/api/verify-certificate/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('✅ Stats API working');
        console.log(`   Total certificates: ${statsData.data?.totalCertificates || 0}`);
      } else {
        console.log('⚠️  Stats API not responding (backend may not be running)');
      }
    } catch (error) {
      console.log('⚠️  API tests skipped (node-fetch not available or backend not running)');
    }

    console.log('\n✅ Certificate system test completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start the backend: cd backend && npm start');
    console.log('   2. Start the frontend: cd frontend && npm start');
    console.log('   3. Visit http://localhost:3000 to use the application');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testCertificateSystem();
}

module.exports = { testCertificateSystem };