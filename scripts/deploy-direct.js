const { ethers, network } = require("hardhat");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  console.log("🚀 Direct deployment to Polygon Amoy Testnet...");
  console.log("=".repeat(60));

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  
  console.log("📋 Deployment Details:");
  console.log(`   Network: ${network.name}`);
  console.log(`   Chain ID: ${network.config.chainId}`);
  console.log(`   Deployer: ${deployer.address}`);
  
  const balance = await deployer.getBalance();
  console.log(`   Balance: ${ethers.utils.formatEther(balance)} MATIC`);

  // Deploy contract directly with bytecode
  console.log("\n🔨 Deploying Certificate contract...");
  
  try {
    const Certificate = await ethers.getContractFactory("Certificate");
    const certificate = await Certificate.deploy();
    
    console.log(`   Transaction hash: ${certificate.deployTransaction.hash}`);
    console.log("   Waiting for deployment confirmation...");
    
    await certificate.deployed();
    console.log(`✅ Contract deployed to: ${certificate.address}`);

    // Wait for confirmations
    const receipt = await certificate.deployTransaction.wait(3);
    console.log(`   Confirmed in block: ${receipt.blockNumber}`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}`);

    // Test basic functionality
    console.log("\n🧪 Testing deployed contract...");
    
    const owner = await certificate.owner();
    console.log(`   Contract owner: ${owner}`);
    
    // Test authorizing deployer as issuer
    const authTx = await certificate.authorizeIssuer(deployer.address);
    await authTx.wait(2);
    
    const isAuthorized = await certificate.authorizedIssuers(deployer.address);
    console.log(`   Deployer authorized: ${isAuthorized}`);

    // Save deployment information
    const deploymentInfo = {
      contractAddress: certificate.address,
      network: network.name,
      chainId: network.config.chainId,
      deployedAt: new Date().toISOString(),
      deployer: deployer.address,
      transactionHash: certificate.deployTransaction.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      effectiveGasPrice: receipt.effectiveGasPrice.toString(),
      verified: false,
      rpcUrl: network.config.url,
      blockExplorer: "https://amoy.polygonscan.com"
    };
    
    // Save to root
    fs.writeFileSync('./contract-addresses.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("   ✅ Saved to contract-addresses.json");
    
    console.log("\n" + "=".repeat(60));
    console.log("🎉 AMOY DEPLOYMENT SUCCESSFUL!");
    console.log("=".repeat(60));
    console.log(`📍 Contract Address: ${certificate.address}`);
    console.log(`🌐 Network: ${network.name} (Chain ID: ${network.config.chainId})`);
    console.log(`👤 Deployer: ${deployer.address}`);
    console.log(`📦 Transaction: ${certificate.deployTransaction.hash}`);
    console.log("=".repeat(60));
    
    console.log("\n🔍 View on Amoy PolygonScan:");
    console.log(`https://amoy.polygonscan.com/address/${certificate.address}`);
    
    return certificate.address;
    
  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error.message);
    throw error;
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;