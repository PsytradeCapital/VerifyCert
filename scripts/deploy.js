const { ethers, network } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log(`Deploying Certificate contract to ${network.name}...`);

  // Get the ContractFactory and Signers
  const Certificate = await ethers.getContractFactory("Certificate");
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance), "MATIC");

  // Check if we have enough balance for deployment
  if (balance.lt(ethers.utils.parseEther("0.01"))) {
    console.warn("Warning: Low balance. You may need more MATIC for deployment.");
  }

  // Deploy the contract
  console.log("Deploying contract...");
  const certificate = await Certificate.deploy();
  
  console.log("Waiting for deployment confirmation...");
  await certificate.deployed();

  console.log("✅ Certificate contract deployed to:", certificate.address);
  console.log("Transaction hash:", certificate.deployTransaction.hash);
  console.log("Block number:", certificate.deployTransaction.blockNumber);

  // Wait for a few confirmations
  console.log("Waiting for block confirmations...");
  await certificate.deployTransaction.wait(5);

  // Save the contract address for frontend and backend use
  const contractAddresses = {
    Certificate: certificate.address,
    network: network.name,
    chainId: network.config.chainId,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    transactionHash: certificate.deployTransaction.hash
  };
  
  // Save to root directory
  fs.writeFileSync(
    './contract-addresses.json',
    JSON.stringify(contractAddresses, null, 2)
  );
  
  // Save to frontend directory for React app
  const frontendDir = path.join(__dirname, '../frontend');
  if (fs.existsSync(frontendDir)) {
    fs.writeFileSync(
      path.join(frontendDir, 'contract-addresses.json'),
      JSON.stringify(contractAddresses, null, 2)
    );
    console.log("✅ Contract addresses saved to frontend/contract-addresses.json");
  }
  
  // Save to backend directory
  const backendDir = path.join(__dirname, '../backend');
  if (fs.existsSync(backendDir)) {
    fs.writeFileSync(
      path.join(backendDir, 'contract-addresses.json'),
      JSON.stringify(contractAddresses, null, 2)
    );
    console.log("✅ Contract addresses saved to backend/contract-addresses.json");
  }
  
  console.log("✅ Contract addresses saved to contract-addresses.json");

  // Test basic contract functionality
  console.log("\n🧪 Testing deployed contract...");
  try {
    // Test owner function
    const owner = await certificate.owner();
    console.log("Contract owner:", owner);
    
    // Test authorizing an issuer (using deployer as test issuer)
    console.log("Authorizing deployer as issuer...");
    const authTx = await certificate.authorizeIssuer(deployer.address);
    await authTx.wait();
    
    const isAuthorized = await certificate.authorizedIssuers(deployer.address);
    console.log("Deployer authorized as issuer:", isAuthorized);
    
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
  console.log(`Gas Used: ${certificate.deployTransaction.gasLimit?.toString() || 'N/A'}`);
  console.log("=".repeat(50));

  if (network.name === 'mumbai') {
    console.log("\n🔍 Verify your contract on PolygonScan:");
    console.log(`https://mumbai.polygonscan.com/address/${certificate.address}`);
    console.log("\n📝 To verify the contract source code, run:");
    console.log(`npm run verify ${certificate.address}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });