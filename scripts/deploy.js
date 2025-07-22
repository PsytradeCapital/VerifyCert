const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Certificate contract to Polygon Mumbai...");

  // Get the ContractFactory and Signers
  const Certificate = await ethers.getContractFactory("Certificate");
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy the contract
  const certificate = await Certificate.deploy();
  await certificate.deployed();

  console.log("Certificate contract deployed to:", certificate.address);
  console.log("Transaction hash:", certificate.deployTransaction.hash);

  // Save the contract address for frontend use
  const fs = require('fs');
  const contractAddress = {
    Certificate: certificate.address
  };
  
  fs.writeFileSync(
    './contract-addresses.json',
    JSON.stringify(contractAddress, null, 2)
  );
  
  console.log("Contract address saved to contract-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });