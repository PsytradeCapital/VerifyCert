const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Certificate Contract", function () {
  // Placeholder test - will be implemented in later tasks
  it("Should deploy successfully", async function () {
    const Certificate = await ethers.getContractFactory("Certificate");
    const certificate = await Certificate.deploy();
    await certificate.deployed();
    
    expect(certificate.address).to.not.be.undefined;
  });
});