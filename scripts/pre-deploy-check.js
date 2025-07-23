const { ethers, network } = require("hardhat");
const fs = require('fs');
require('dotenv').config();

async function main() {
  console.log("🔍 Pre-deployment checklist for", network.name);
  console.log("=".repeat(50));

  let allChecksPass = true;

  // Check 1: Environment variables
  console.log("1. Checking environment variables...");
  const requiredEnvVars = ['PRIVATE_KEY', 'POLYGON_MUMBAI_RPC_URL'];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.log(`   ❌ Missing ${envVar}`);
      allChecksPass = false;
    } else {
      console.log(`   ✅ ${envVar} is set`);
    }
  }

  // Check 2: Network connection
  console.log("\n2. Checking network connection...");
  try {
    const provider = ethers.provider;
    const blockNumber = await provider.getBlockNumber();
    console.log(`   ✅ Connected to ${network.name} (block: ${blockNumber})`);
  } catch (error) {
    console.log(`   ❌ Failed to connect to ${network.name}:`, error.message);
    allChecksPass = false;
  }

  // Check 3: Account balance
  console.log("\n3. Checking deployer account balance...");
  try {
    const [deployer] = await ethers.getSigners();
    const balance = await deployer.getBalance();
    const balanceInMatic = ethers.utils.formatEther(balance);
    
    console.log(`   Account: ${deployer.address}`);
    console.log(`   Balance: ${balanceInMatic} MATIC`);
    
    if (balance.lt(ethers.utils.parseEther("0.01"))) {
      console.log(`   ⚠️  Low balance! You may need more MATIC for deployment.`);
      console.log(`   💰 Get testnet MATIC from: https://faucet.polygon.technology/`);
    } else {
      console.log(`   ✅ Sufficient balance for deployment`);
    }
  } catch (error) {
    console.log(`   ❌ Failed to check balance:`, error.message);
    allChecksPass = false;
  }

  // Check 4: Contract compilation
  console.log("\n4. Checking contract compilation...");
  try {
    const Certificate = await ethers.getContractFactory("Certificate");
    console.log(`   ✅ Certificate contract compiled successfully`);
  } catch (error) {
    console.log(`   ❌ Contract compilation failed:`, error.message);
    allChecksPass = false;
  }

  // Check 5: Verification API key (optional)
  console.log("\n5. Checking verification setup...");
  if (process.env.POLYGONSCAN_API_KEY) {
    console.log(`   ✅ PolygonScan API key is set (verification enabled)`);
  } else {
    console.log(`   ⚠️  PolygonScan API key not set (verification will be skipped)`);
    console.log(`   📝 Get API key from: https://polygonscan.com/apis`);
  }

  console.log("\n" + "=".repeat(50));
  
  if (allChecksPass) {
    console.log("✅ All checks passed! Ready for deployment.");
    console.log("\n🚀 To deploy, run: npm run deploy");
  } else {
    console.log("❌ Some checks failed. Please fix the issues above before deploying.");
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });