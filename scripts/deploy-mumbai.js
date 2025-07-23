const { ethers, network } = require("hardhat");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  console.log("🚀 Starting deployment to Polygon Mumbai...");
  console.log("=".repeat(60));

  // Validate environment
  if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === 'your_private_key_here') {
    console.error("❌ PRIVATE_KEY not set in .env file");
    console.log("Please set your private key in the .env file");
    process.exit(1);
  }

  if (network.name !== 'mumbai') {
    console.error(`❌ Wrong network: ${network.name}. Expected: mumbai`);
    console.log("Run with: --network mumbai");
    process.exit(1);
  }

  try {
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📋 Deployment Details:");
    console.log(`   Network: ${network.name}`);
    console.log(`   Deployer: ${deployer.address}`);
    
    // Check balance
    const balance = await deployer.getBalance();
    const balanceInMatic = ethers.utils.formatEther(balance);
    console.log(`   Balance: ${balanceInMatic} MATIC`);
    
    if (balance.lt(ethers.utils.parseEther("0.01"))) {
      console.log("⚠️  Warning: Low balance detected!");
      console.log("💰 Get testnet MATIC from: https://faucet.polygon.technology/");
    }

    // Get contract factory
    console.log("\n📦 Preparing contract deployment...");
    const Certificate = await ethers.getContractFactory("Certificate");
    
    // Estimate gas
    const deploymentData = Certificate.getDeployTransaction();
    const estimatedGas = await ethers.provider.estimateGas(deploymentData);
    console.log(`   Estimated gas: ${estimatedGas.toString()}`);

    // Deploy contract
    console.log("\n🔨 Deploying Certificate contract...");
    const certificate = await Certificate.deploy({
      gasLimit: estimatedGas.mul(120).div(100) // Add 20% buffer
    });
    
    console.log(`   Transaction hash: ${certificate.deployTransaction.hash}`);
    console.log("   Waiting for deployment confirmation...");
    
    await certificate.deployed();
    console.log(`✅ Contract deployed to: ${certificate.address}`);

    // Wait for confirmations
    console.log("⏳ Waiting for block confirmations...");
    const receipt = await certificate.deployTransaction.wait(5);
    console.log(`   Confirmed in block: ${receipt.blockNumber}`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}`);

    // Test basic functionality
    console.log("\n🧪 Testing deployed contract...");
    
    // Test owner function
    const owner = await certificate.owner();
    console.log(`   Contract owner: ${owner}`);
    
    if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
      throw new Error("Owner mismatch!");
    }
    
    // Test authorizing deployer as issuer
    console.log("   Authorizing deployer as issuer...");
    const authTx = await certificate.authorizeIssuer(deployer.address);
    await authTx.wait(2);
    
    const isAuthorized = await certificate.authorizedIssuers(deployer.address);
    console.log(`   Deployer authorized: ${isAuthorized}`);
    
    if (!isAuthorized) {
      throw new Error("Authorization failed!");
    }

    // Save deployment information
    console.log("\n💾 Saving deployment information...");
    
    const deploymentInfo = {
      contractAddress: certificate.address,
      network: network.name,
      chainId: network.config.chainId,
      deployedAt: new Date().toISOString(),
      deployer: deployer.address,
      transactionHash: certificate.deployTransaction.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      verified: false
    };
    
    // Save to root
    fs.writeFileSync('./contract-addresses.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("   ✅ Saved to contract-addresses.json");
    
    // Save to frontend
    const frontendDir = path.join(__dirname, '../frontend');
    if (fs.existsSync(frontendDir)) {
      fs.writeFileSync(
        path.join(frontendDir, 'contract-addresses.json'),
        JSON.stringify(deploymentInfo, null, 2)
      );
      console.log("   ✅ Saved to frontend/contract-addresses.json");
    }
    
    // Save to backend
    const backendDir = path.join(__dirname, '../backend');
    if (fs.existsSync(backendDir)) {
      fs.writeFileSync(
        path.join(backendDir, 'contract-addresses.json'),
        JSON.stringify(deploymentInfo, null, 2)
      );
      console.log("   ✅ Saved to backend/contract-addresses.json");
    }

    // Update environment files
    console.log("\n🔧 Updating environment configuration...");
    
    // Update root .env
    let envContent = fs.readFileSync('.env', 'utf8');
    envContent = envContent.replace(
      /REACT_APP_CONTRACT_ADDRESS=.*/,
      `REACT_APP_CONTRACT_ADDRESS=${certificate.address}`
    );
    fs.writeFileSync('.env', envContent);
    console.log("   ✅ Updated .env file");
    
    // Update frontend .env if it exists
    const frontendEnvPath = path.join(frontendDir, '.env');
    if (fs.existsSync(frontendEnvPath)) {
      let frontendEnvContent = fs.readFileSync(frontendEnvPath, 'utf8');
      frontendEnvContent = frontendEnvContent.replace(
        /REACT_APP_CONTRACT_ADDRESS=.*/,
        `REACT_APP_CONTRACT_ADDRESS=${certificate.address}`
      );
      fs.writeFileSync(frontendEnvPath, frontendEnvContent);
      console.log("   ✅ Updated frontend/.env file");
    }

    // Final summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("=".repeat(60));
    console.log(`📍 Contract Address: ${certificate.address}`);
    console.log(`🌐 Network: ${network.name} (Chain ID: ${network.config.chainId})`);
    console.log(`👤 Deployer: ${deployer.address}`);
    console.log(`📦 Transaction: ${certificate.deployTransaction.hash}`);
    console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(`🔗 Block: ${receipt.blockNumber}`);
    console.log("=".repeat(60));
    
    console.log("\n🔍 View on PolygonScan:");
    console.log(`https://mumbai.polygonscan.com/address/${certificate.address}`);
    
    if (process.env.POLYGONSCAN_API_KEY && process.env.POLYGONSCAN_API_KEY !== 'your_polygonscan_api_key') {
      console.log("\n📝 To verify the contract source code:");
      console.log(`npx hardhat verify --network mumbai ${certificate.address}`);
    } else {
      console.log("\n⚠️  Set POLYGONSCAN_API_KEY in .env to enable contract verification");
    }
    
    console.log("\n✅ Deployment completed successfully!");
    
  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Solution: Get more MATIC from https://faucet.polygon.technology/");
    } else if (error.message.includes("nonce")) {
      console.log("\n💡 Solution: Wait a moment and try again, or reset MetaMask account");
    } else if (error.message.includes("network")) {
      console.log("\n💡 Solution: Check your internet connection and RPC URL");
    }
    
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;