const { ethers, network } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log(`Deploying Certificate contract to ${network.name}...`);

  try {
    // Get the ContractFactory and Signers
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    
    const balance = await deployer.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance), "ETH/MATIC");

    // Try to get the contract factory
    let Certificate;
    try {
      Certificate = await ethers.getContractFactory("Certificate");
    } catch (error) {
      console.error("Error getting contract factory:", error.message);
      
      // Try alternative approach - compile first
      console.log("Attempting to compile contracts...");
      await hre.run("compile");
      Certificate = await ethers.getContractFactory("Certificate");
    }

    // Deploy the contract
    console.log("Deploying contract...");
    const certificate = await Certificate.deploy();
    
    console.log("Waiting for deployment confirmation...");
    await certificate.deployed();

    console.log("✅ Certificate contract deployed to:", certificate.address);
    console.log("Transaction hash:", certificate.deployTransaction.hash);

    // Wait for confirmations
    console.log("Waiting for block confirmations...");
    await certificate.deployTransaction.wait(3);

    // Save the contract address
    const contractAddresses = {
      Certificate: certificate.address,
      network: network.name,
      chainId: network.config.chainId,
      deployedAt: new Date().toISOString(),
      deployer: deployer.address,
      transactionHash: certificate.deployTransaction.hash
    };
    
    // Save to multiple locations
    const locations = [
      './contract-addresses.json',
      './frontend/contract-addresses.json',
      './backend/contract-addresses.json'
    ];

    locations.forEach(location => {
      try {
        const dir = path.dirname(location);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(location, JSON.stringify(contractAddresses, null, 2));
        console.log(`✅ Contract addresses saved to ${location}`);
      } catch (error) {
        console.log(`⚠️ Could not save to ${location}: ${error.message}`);
      }
    });

    // Test basic functionality
    console.log("\n🧪 Testing deployed contract...");
    try {
      const owner = await certificate.owner();
      console.log("Contract owner:", owner);
      
      const totalSupply = await certificate.totalSupply();
      console.log("Total supply:", totalSupply.toString());
      
      console.log("✅ Contract functionality test passed!");
    } catch (error) {
      console.error("❌ Contract functionality test failed:", error.message);
    }

    console.log("\n📋 Deployment Summary:");
    console.log("=".repeat(50));
    console.log(`Network: ${network.name}`);
    console.log(`Contract Address: ${certificate.address}`);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Transaction Hash: ${certificate.deployTransaction.hash}`);
    console.log("=".repeat(50));

    if (network.name === 'mumbai') {
      console.log("\n🔍 Verify your contract on PolygonScan:");
      console.log(`https://mumbai.polygonscan.com/address/${certificate.address}`);
    } else if (network.name === 'amoy') {
      console.log("\n🔍 Verify your contract on PolygonScan:");
      console.log(`https://amoy.polygonscan.com/address/${certificate.address}`);
    }

    return certificate.address;

  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
}

main()
  .then((address) => {
    console.log(`\n🎉 Deployment completed successfully!`);
    console.log(`Contract address: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });