const { run, network } = require("hardhat");
require('dotenv').config();

async function verifyAmoyContract() {
  console.log("🔍 Verifying contract on Amoy PolygonScan...");
  console.log("=".repeat(50));

  try {
    // Verify we're on Amoy network
    if (network.name !== 'amoy') {
      throw new Error(`Wrong network: ${network.name}. Expected: amoy`);
    }

    const contractAddress = "0x6c9D554C721dA0CEA1b975982eAEe1f924271F50";
    
    console.log(`📍 Contract address: ${contractAddress}`);
    console.log(`🌐 Network: ${network.name} (Chain ID: ${network.config.chainId})`);
    
    // Verify the contract
    console.log("\n🔨 Starting verification process...");
    
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [], // SimpleCertificate has no constructor arguments
    });

    console.log("\n✅ Contract verification completed!");
    console.log(`🔗 View verified contract: https://amoy.polygonscan.com/address/${contractAddress}#code`);
    
    return true;

  } catch (error) {
    console.error("\n❌ Contract verification failed:");
    console.error(error.message);
    
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified on Amoy PolygonScan!");
      return true;
    }
    
    if (error.message.includes("Invalid API Key")) {
      console.log("💡 Solution: Update POLYGONSCAN_API_KEY in .env file");
      console.log("   Get API key from: https://polygonscan.com/apis");
    }
    
    return false;
  }
}

// Run verification
if (require.main === module) {
  verifyAmoyContract()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = verifyAmoyContract;