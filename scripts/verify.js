const { run, network } = require("hardhat");
const fs = require('fs');
require('dotenv').config();

async function main() {
  console.log("🔍 Starting contract verification...");
  console.log("=".repeat(50));

  // Check if API key is available
  if (!process.env.POLYGONSCAN_API_KEY || process.env.POLYGONSCAN_API_KEY === 'your_polygonscan_api_key') {
    console.error("❌ POLYGONSCAN_API_KEY not set in .env file");
    console.log("Get your API key from: https://polygonscan.com/apis");
    console.log("Note: The same API key works for both Mumbai and Amoy testnets");
    process.exit(1);
  }

  // Get contract address from command line arguments or contract-addresses.json
  let contractAddress = process.argv[2];
  
  if (!contractAddress) {
    try {
      const deploymentInfo = JSON.parse(fs.readFileSync('./contract-addresses.json', 'utf8'));
      contractAddress = deploymentInfo.contractAddress;
      console.log(`📋 Using contract address from deployment: ${contractAddress}`);
      console.log(`   Network: ${deploymentInfo.network}`);
      console.log(`   Deployed at: ${deploymentInfo.deployedAt}`);
    } catch (error) {
      console.error("❌ No contract address provided and contract-addresses.json not found");
      console.log("Usage: npm run verify <contract-address>");
      console.log("Or deploy first to generate contract-addresses.json");
      process.exit(1);
    }
  }

  if (!contractAddress) {
    console.error("❌ Contract address is required");
    process.exit(1);
  }

  console.log(`\n🔨 Verifying contract ${contractAddress} on ${network.name}...`);

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [], // Certificate contract has no constructor arguments
    });
    
    console.log("✅ Contract verified successfully!");
    
    // Update deployment info to mark as verified
    try {
      const deploymentInfo = JSON.parse(fs.readFileSync('./contract-addresses.json', 'utf8'));
      deploymentInfo.verified = true;
      deploymentInfo.verifiedAt = new Date().toISOString();
      fs.writeFileSync('./contract-addresses.json', JSON.stringify(deploymentInfo, null, 2));
      console.log("📝 Updated deployment info with verification status");
    } catch (error) {
      console.log("⚠️  Could not update deployment info file");
    }
    
    // Display appropriate block explorer link based on network
    if (network.name === 'mumbai') {
      console.log(`\n🔍 View verified contract: https://mumbai.polygonscan.com/address/${contractAddress}#code`);
    } else if (network.name === 'amoy') {
      console.log(`\n🔍 View verified contract: https://amoy.polygonscan.com/address/${contractAddress}#code`);
    }
    
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("✅ Contract is already verified!");
      
      // Still update the deployment info
      try {
        const deploymentInfo = JSON.parse(fs.readFileSync('./contract-addresses.json', 'utf8'));
        deploymentInfo.verified = true;
        deploymentInfo.verifiedAt = new Date().toISOString();
        fs.writeFileSync('./contract-addresses.json', JSON.stringify(deploymentInfo, null, 2));
      } catch (e) {
        // Ignore if file doesn't exist
      }
      
    } else {
      console.error("❌ Verification failed:", error.message);
      
      if (error.message.includes("API key")) {
        console.log("💡 Check your POLYGONSCAN_API_KEY in .env file");
      } else if (error.message.includes("rate limit")) {
        console.log("💡 Wait a moment and try again (API rate limit)");
      }
      
      process.exit(1);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });