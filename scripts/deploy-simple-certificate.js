const { ethers, network } = require("hardhat");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  console.log("🚀 Deploying SimpleCertificate to Polygon Amoy Testnet...");
  console.log("=".repeat(60));

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  
  console.log("📋 Deployment Details:");
  console.log(`   Network: ${network.name}`);
  console.log(`   Chain ID: ${network.config.chainId}`);
  console.log(`   Deployer: ${deployer.address}`);
  
  const balance = await deployer.getBalance();
  console.log(`   Balance: ${ethers.utils.formatEther(balance)} MATIC`);

  // Deploy SimpleCertificate contract
  console.log("\n🔨 Deploying SimpleCertificate contract...");
  
  try {
    const SimpleCertificate = await ethers.getContractFactory("SimpleCertificate");
    const certificate = await SimpleCertificate.deploy();
    
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
    
    // Check if deployer is already authorized (should be from constructor)
    const isAuthorized = await certificate.authorizedIssuers(deployer.address);
    console.log(`   Deployer authorized: ${isAuthorized}`);

    // Test contract name and symbol
    const name = await certificate.name();
    const symbol = await certificate.symbol();
    console.log(`   Contract name: ${name}`);
    console.log(`   Contract symbol: ${symbol}`);

    // Save deployment information
    console.log("\n💾 Saving deployment information...");
    
    const deploymentInfo = {
      contractAddress: certificate.address,
      contractName: "SimpleCertificate",
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
    
    // Update root .env if it exists
    if (fs.existsSync('.env')) {
      let envContent = fs.readFileSync('.env', 'utf8');
      envContent = envContent.replace(
        /REACT_APP_CONTRACT_ADDRESS=.*/,
        `REACT_APP_CONTRACT_ADDRESS=${certificate.address}`
      );
      fs.writeFileSync('.env', envContent);
      console.log("   ✅ Updated .env file");
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 AMOY DEPLOYMENT SUCCESSFUL!");
    console.log("=".repeat(60));
    console.log(`📍 Contract Address: ${certificate.address}`);
    console.log(`🌐 Network: ${network.name} (Chain ID: ${network.config.chainId})`);
    console.log(`👤 Deployer: ${deployer.address}`);
    console.log(`📦 Transaction: ${certificate.deployTransaction.hash}`);
    console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(`💰 Gas Price: ${ethers.utils.formatUnits(receipt.effectiveGasPrice, 'gwei')} gwei`);
    console.log(`🔗 Block: ${receipt.blockNumber}`);
    console.log("=".repeat(60));
    
    console.log("\n🔍 View on Amoy PolygonScan:");
    console.log(`https://amoy.polygonscan.com/address/${certificate.address}`);
    console.log(`https://amoy.polygonscan.com/tx/${certificate.deployTransaction.hash}`);
    
    console.log("\n📝 To verify the contract source code:");
    console.log(`npx hardhat verify --network amoy ${certificate.address}`);
    
    console.log("\n💡 Next Steps:");
    console.log("1. Verify contract source code on Amoy PolygonScan");
    console.log("2. Update backend services to use new contract address");
    console.log("3. Update frontend to connect to Amoy network");
    console.log("4. Test end-to-end functionality on Amoy testnet");
    
    console.log("\n✅ Amoy deployment completed successfully!");
    
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