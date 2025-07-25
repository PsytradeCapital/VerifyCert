const { ethers, network } = require("hardhat");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Validation functions
function validateEnvironment() {
  console.log("🔍 Validating environment configuration...");
  
  // Check private key
  if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === 'your_private_key_here') {
    console.error("❌ PRIVATE_KEY not set in .env file");
    console.log("Please set your private key in the .env file");
    console.log("💡 Make sure to use the private key for address: 0xc9519223859E1A9f6cd94B655Aa409A697F550b2");
    throw new Error("Missing or invalid PRIVATE_KEY");
  }
  
  // Validate private key format
  if (!process.env.PRIVATE_KEY.startsWith('0x') || process.env.PRIVATE_KEY.length !== 66) {
    console.error("❌ Invalid PRIVATE_KEY format");
    console.log("Private key should start with '0x' and be 64 characters long (66 total)");
    throw new Error("Invalid PRIVATE_KEY format");
  }
  
  // Check RPC URL
  if (!process.env.POLYGON_AMOY_RPC_URL) {
    console.log("⚠️  POLYGON_AMOY_RPC_URL not set, using default");
  }
  
  console.log("✅ Environment validation passed");
}

function validateNetwork() {
  console.log("🌐 Validating network configuration...");
  
  // Validate network name
  if (network.name !== 'amoy') {
    console.error(`❌ Wrong network: ${network.name}. Expected: amoy`);
    console.log("Run with: --network amoy");
    console.log("Example: npx hardhat run scripts/deploy-amoy.js --network amoy");
    throw new Error(`Invalid network: ${network.name}`);
  }
  
  // Validate chain ID
  if (network.config.chainId !== 80002) {
    console.error(`❌ Wrong chain ID: ${network.config.chainId}. Expected: 80002 (Amoy)`);
    console.log("Check your hardhat.config.js Amoy network configuration");
    throw new Error(`Invalid chain ID: ${network.config.chainId}`);
  }
  
  // Validate RPC URL
  const expectedRpcUrl = "https://rpc-amoy.polygon.technology/";
  if (!network.config.url.includes("amoy")) {
    console.error(`❌ RPC URL doesn't appear to be for Amoy network: ${network.config.url}`);
    console.log(`Expected URL containing 'amoy', got: ${network.config.url}`);
    throw new Error("Invalid RPC URL for Amoy network");
  }
  
  console.log("✅ Network validation passed");
}

async function validateDeployerAddress(deployer) {
  console.log("👤 Validating deployer address...");
  
  const expectedAddress = "0xc9519223859E1A9f6cd94B655Aa409A697F550b2";
  
  if (deployer.address.toLowerCase() !== expectedAddress.toLowerCase()) {
    console.error(`❌ Deployer address mismatch!`);
    console.error(`   Expected: ${expectedAddress}`);
    console.error(`   Got: ${deployer.address}`);
    console.log("💡 Make sure you're using the correct private key in .env file");
    console.log("💡 The private key should correspond to the MetaMask address provided");
    throw new Error("Deployer address validation failed");
  }
  
  console.log("✅ Deployer address validated");
}

async function validateNetworkConnection() {
  console.log("🔗 Validating network connection...");
  
  try {
    // Test network connection
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log(`   Current block number: ${blockNumber}`);
    
    // Test if we can get network info
    const networkInfo = await ethers.provider.getNetwork();
    if (networkInfo.chainId !== 80002) {
      throw new Error(`Connected to wrong network. Chain ID: ${networkInfo.chainId}, expected: 80002`);
    }
    
    console.log("✅ Network connection validated");
  } catch (error) {
    console.error("❌ Network connection failed");
    console.error(`   Error: ${error.message}`);
    console.log("💡 Check your internet connection and RPC URL");
    console.log("💡 Amoy RPC URL: https://rpc-amoy.polygon.technology/");
    throw new Error("Network connection validation failed");
  }
}

async function validateBalance(deployer) {
  console.log("💰 Validating account balance...");
  
  const balance = await deployer.getBalance();
  const balanceInMatic = ethers.utils.formatEther(balance);
  console.log(`   Balance: ${balanceInMatic} MATIC`);
  
  // Check minimum balance for deployment
  const minBalance = ethers.utils.parseEther("0.01");
  if (balance.lt(minBalance)) {
    console.error("❌ Insufficient balance for deployment!");
    console.log(`   Current: ${balanceInMatic} MATIC`);
    console.log(`   Required: 0.01 MATIC (minimum)`);
    console.log("💰 Get testnet MATIC from Polygon Amoy faucet:");
    console.log("   🔗 https://faucet.polygon.technology/");
    console.log("   📝 Select 'Polygon Amoy' network");
    console.log(`   📋 Use address: ${deployer.address}`);
    throw new Error("Insufficient balance for deployment");
  }
  
  if (balance.lt(ethers.utils.parseEther("0.05"))) {
    console.log("⚠️  Warning: Low balance detected!");
    console.log("💰 Consider getting more MATIC from: https://faucet.polygon.technology/");
    console.log("   This ensures successful deployment and contract interactions");
  }
  
  console.log("✅ Balance validation passed");
}

async function main() {
  console.log("🚀 Starting deployment to Polygon Amoy Testnet...");
  console.log("=".repeat(60));

  try {
    // Run all validations
    validateEnvironment();
    validateNetwork();
    await validateNetworkConnection();
  } catch (error) {
    console.error(`\n❌ Pre-deployment validation failed: ${error.message}`);
    process.exit(1);
  }

  try {
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    
    // Run deployer-specific validations
    await validateDeployerAddress(deployer);
    await validateBalance(deployer);
    
    console.log("\n📋 Deployment Details:");
    console.log(`   Network: ${network.name}`);
    console.log(`   Chain ID: ${network.config.chainId}`);
    console.log(`   Deployer: ${deployer.address}`);

    // Get contract factory
    console.log("\n📦 Preparing contract deployment...");
    const Certificate = await ethers.getContractFactory("Certificate");
    
    // Estimate gas for Amoy network
    console.log("⛽ Estimating gas for Amoy network...");
    const deploymentData = Certificate.getDeployTransaction();
    const estimatedGas = await ethers.provider.estimateGas(deploymentData);
    console.log(`   Estimated gas: ${estimatedGas.toString()}`);
    
    // Get current gas price
    const gasPrice = await ethers.provider.getGasPrice();
    console.log(`   Gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`);
    
    // Calculate estimated cost
    const estimatedCost = estimatedGas.mul(gasPrice);
    console.log(`   Estimated cost: ${ethers.utils.formatEther(estimatedCost)} MATIC`);

    // Deploy contract with gas buffer for Amoy network
    console.log("\n🔨 Deploying Certificate contract to Amoy...");
    const gasLimit = estimatedGas.mul(120).div(100); // Add 20% buffer for Amoy
    console.log(`   Using gas limit: ${gasLimit.toString()}`);
    
    const certificate = await Certificate.deploy({
      gasLimit: gasLimit,
      gasPrice: gasPrice
    });
    
    console.log(`   Transaction hash: ${certificate.deployTransaction.hash}`);
    console.log("   Waiting for deployment confirmation...");
    
    await certificate.deployed();
    console.log(`✅ Contract deployed to: ${certificate.address}`);

    // Wait for confirmations on Amoy network
    console.log("⏳ Waiting for block confirmations on Amoy...");
    const receipt = await certificate.deployTransaction.wait(3); // 3 confirmations for Amoy
    console.log(`   Confirmed in block: ${receipt.blockNumber}`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
    console.log(`   Effective gas price: ${ethers.utils.formatUnits(receipt.effectiveGasPrice, 'gwei')} gwei`);

    // Test basic functionality
    console.log("\n🧪 Testing deployed contract on Amoy...");
    
    // Test owner function
    const owner = await certificate.owner();
    console.log(`   Contract owner: ${owner}`);
    
    if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
      throw new Error("Owner mismatch! Contract deployment may have failed.");
    }
    
    // Test authorizing deployer as issuer
    console.log("   Authorizing deployer as issuer...");
    const authTx = await certificate.authorizeIssuer(deployer.address, {
      gasLimit: 100000 // Explicit gas limit for Amoy
    });
    await authTx.wait(2); // Wait for 2 confirmations
    
    const isAuthorized = await certificate.authorizedIssuers(deployer.address);
    console.log(`   Deployer authorized: ${isAuthorized}`);
    
    if (!isAuthorized) {
      throw new Error("Authorization failed! Contract may not be working properly.");
    }

    // Test contract name and symbol
    console.log("   Testing contract metadata...");
    const name = await certificate.name();
    const symbol = await certificate.symbol();
    console.log(`   Contract name: ${name}`);
    console.log(`   Contract symbol: ${symbol}`);

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

    // Update environment files with new contract address
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
    
    if (process.env.POLYGONSCAN_API_KEY && process.env.POLYGONSCAN_API_KEY !== 'your_polygonscan_api_key') {
      console.log("\n📝 To verify the contract source code:");
      console.log(`npx hardhat verify --network amoy ${certificate.address}`);
    } else {
      console.log("\n⚠️  Set POLYGONSCAN_API_KEY in .env to enable contract verification");
      console.log("   Get API key from: https://polygonscan.com/apis");
    }
    
    console.log("\n💡 Next Steps:");
    console.log("1. Verify contract source code on Amoy PolygonScan");
    console.log("2. Update backend services to use new contract address");
    console.log("3. Update frontend to connect to Amoy network");
    console.log("4. Test end-to-end functionality on Amoy testnet");
    
    console.log("\n🎯 Faucet Information:");
    console.log("   🔗 Polygon Amoy Faucet: https://faucet.polygon.technology/");
    console.log(`   📋 Your Address: ${deployer.address}`);
    console.log("   💧 Select 'Polygon Amoy' network to get testnet MATIC");
    
    console.log("\n✅ Amoy deployment completed successfully!");
    
  } catch (error) {
    console.error("\n❌ Amoy deployment failed:");
    console.error(error.message);
    
    // Provide specific error guidance for Amoy network
    if (error.message.includes("insufficient funds") || error.message.includes("sender doesn't have enough funds")) {
      console.log("\n💡 Solution: Get more MATIC from Amoy faucet");
      console.log("   🔗 https://faucet.polygon.technology/");
      console.log("   📝 Select 'Polygon Amoy' network");
      console.log(`   📋 Use address: ${deployer?.address || 'your_address'}`);
      console.log("   ⏰ Faucet provides 0.5 MATIC per request");
      console.log("   🔄 You can request again after 24 hours");
    } else if (error.message.includes("nonce") || error.message.includes("transaction underpriced")) {
      console.log("\n💡 Solution: Nonce or transaction pricing issue");
      console.log("   - Wait a moment and try again");
      console.log("   - Reset MetaMask account if using MetaMask");
      console.log("   - Check if another transaction is pending");
      console.log("   - Clear pending transactions in MetaMask");
    } else if (error.message.includes("network") || error.message.includes("connection") || error.message.includes("timeout")) {
      console.log("\n💡 Solution: Network connection issue");
      console.log("   - Check your internet connection");
      console.log("   - Verify Amoy RPC URL is accessible");
      console.log("   - Try again in a few moments");
      console.log("   - Consider using alternative RPC: https://polygon-amoy.drpc.org");
    } else if (error.message.includes("gas") || error.message.includes("out of gas")) {
      console.log("\n💡 Solution: Gas-related issue");
      console.log("   - Gas price may be too low for Amoy network");
      console.log("   - Try increasing gas limit or gas price");
      console.log("   - Check network congestion");
      console.log("   - Current gas limit includes 20% buffer");
    } else if (error.message.includes("revert") || error.message.includes("execution reverted")) {
      console.log("\n💡 Solution: Contract deployment reverted");
      console.log("   - Check contract code for issues");
      console.log("   - Verify constructor parameters");
      console.log("   - Check for any deployment restrictions");
      console.log("   - Ensure contract compiles successfully");
    } else if (error.message.includes("replacement transaction underpriced")) {
      console.log("\n💡 Solution: Transaction replacement issue");
      console.log("   - Previous transaction may still be pending");
      console.log("   - Wait for previous transaction to complete");
      console.log("   - Increase gas price for faster processing");
    } else if (error.message.includes("already known") || error.message.includes("known transaction")) {
      console.log("\n💡 Solution: Duplicate transaction");
      console.log("   - Transaction already submitted to network");
      console.log("   - Check transaction status on Amoy PolygonScan");
      console.log("   - Wait for confirmation or try with different nonce");
    } else if (error.message.includes("invalid sender") || error.message.includes("invalid signature")) {
      console.log("\n💡 Solution: Invalid private key or signature");
      console.log("   - Verify PRIVATE_KEY in .env file is correct");
      console.log("   - Ensure private key corresponds to expected address");
      console.log(`   - Expected address: 0xc9519223859E1A9f6cd94B655Aa409A697F550b2`);
      console.log("   - Private key should be 64 characters (66 with 0x prefix)");
    } else if (error.message.includes("chain id") || error.message.includes("chainId")) {
      console.log("\n💡 Solution: Chain ID mismatch");
      console.log("   - Ensure you're connected to Amoy network (Chain ID: 80002)");
      console.log("   - Check hardhat.config.js network configuration");
      console.log("   - Verify RPC URL points to Amoy network");
    } else if (error.message.includes("rate limit") || error.message.includes("too many requests")) {
      console.log("\n💡 Solution: RPC rate limiting");
      console.log("   - Wait a moment before retrying");
      console.log("   - Consider using a different RPC endpoint");
      console.log("   - Reduce concurrent requests");
    } else if (error.message.includes("Owner mismatch") || error.message.includes("Authorization failed")) {
      console.log("\n💡 Solution: Contract functionality test failed");
      console.log("   - Contract deployed but basic functions not working");
      console.log("   - Check contract code for issues");
      console.log("   - Verify contract state after deployment");
    } else {
      console.log("\n💡 General troubleshooting steps:");
      console.log("   1. Check your internet connection");
      console.log("   2. Verify all environment variables are set correctly");
      console.log("   3. Ensure you have sufficient MATIC balance");
      console.log("   4. Try deploying again after a few minutes");
      console.log("   5. Check Amoy network status and RPC availability");
    }
    
    console.log("\n🔗 Useful Resources:");
    console.log("   📖 Amoy Testnet Info: https://polygon.technology/blog/introducing-the-amoy-testnet-for-polygon-pos");
    console.log("   💰 Amoy Faucet: https://faucet.polygon.technology/");
    console.log("   🔍 Amoy Explorer: https://amoy.polygonscan.com/");
    console.log("   📊 Network Status: https://status.polygon.technology/");
    
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