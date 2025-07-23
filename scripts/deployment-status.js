const fs = require('fs');
const { ethers, network } = require("hardhat");

async function main() {
  console.log("📊 Deployment Status Check");
  console.log("=".repeat(50));

  // Check if contract addresses file exists
  if (!fs.existsSync('./contract-addresses.json')) {
    console.log("❌ No deployment found. Run 'npm run deploy' first.");
    return;
  }

  // Read contract addresses
  const contractAddresses = JSON.parse(fs.readFileSync('./contract-addresses.json', 'utf8'));
  
  console.log("📋 Deployment Information:");
  console.log(`   Network: ${contractAddresses.network}`);
  console.log(`   Chain ID: ${contractAddresses.chainId}`);
  console.log(`   Contract Address: ${contractAddresses.Certificate}`);
  console.log(`   Deployed At: ${contractAddresses.deployedAt}`);
  console.log(`   Deployer: ${contractAddresses.deployer}`);
  console.log(`   Transaction: ${contractAddresses.transactionHash}`);

  // Check if contract is live on the network
  try {
    const Certificate = await ethers.getContractFactory("Certificate");
    const certificate = Certificate.attach(contractAddresses.Certificate);
    
    console.log("\n🔍 Contract Status:");
    
    // Check basic contract functions
    const owner = await certificate.owner();
    console.log(`   Owner: ${owner}`);
    
    const name = await certificate.name();
    const symbol = await certificate.symbol();
    console.log(`   Token: ${name} (${symbol})`);
    
    console.log("   ✅ Contract is live and responding");
    
    // Check if deployer is authorized as issuer
    const isAuthorized = await certificate.authorizedIssuers(contractAddresses.deployer);
    console.log(`   Deployer authorized as issuer: ${isAuthorized ? '✅' : '❌'}`);
    
  } catch (error) {
    console.log("   ❌ Contract not responding:", error.message);
  }

  // Check file distribution
  console.log("\n📁 Configuration Files:");
  const files = [
    './contract-addresses.json',
    './frontend/contract-addresses.json',
    './backend/contract-addresses.json'
  ];
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} (missing)`);
    }
  });

  if (contractAddresses.network === 'mumbai') {
    console.log("\n🔗 Useful Links:");
    console.log(`   Contract on PolygonScan: https://mumbai.polygonscan.com/address/${contractAddresses.Certificate}`);
    console.log(`   Transaction: https://mumbai.polygonscan.com/tx/${contractAddresses.transactionHash}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });