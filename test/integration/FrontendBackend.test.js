const { expect } = require("chai");
const { ethers } = require("hardhat");
const request = require("supertest");
const { JSDOM } = require("jsdom");

// Mock frontend components for integration testing
const mockFrontendAPI = {
  async mintCertificate(certificateData, issuerAddress) {
    const response = await fetch('/api/v1/certificates/mint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...certificateData,
        issuerAddress
      })
    });
    return response.json();
  },

  async getCertificate(tokenId) {
    const response = await fetch(`/api/v1/certificates/${tokenId}`);
    return response.json();
  },

  async verifyCertificate(tokenId) {
    const response = await fetch(`/api/v1/certificates/verify/${tokenId}`, {
      method: 'POST'
    });
    return response.json();
  },

  async getIssuerCertificates(issuerAddress) {
    const response = await fetch(`/api/v1/certificates/issuer/${issuerAddress}`);
    return response.json();
  }
};

describe("Frontend-Backend Integration Tests", function () {
  let certificate;
  let owner, issuer, recipient;
  let server;
  let app;

  before(async function () {
    // Set up DOM environment for frontend testing
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost:3000',
      pretendToBeVisual: true,
      resources: 'usable'
    });
    global.window = dom.window;
    global.document = dom.window.document;
    global.fetch = require('node-fetch');

    // Get signers
    [owner, issuer, recipient] = await ethers.getSigners();

    // Deploy Certificate contract
    const Certificate = await ethers.getContractFactory("Certificate");
    certificate = await Certificate.deploy();
    await certificate.waitForDeployment();

    // Authorize issuer
    await certificate.connect(owner).authorizeIssuer(issuer.address);

    // Set up backend server
    process.env.CONTRACT_ADDRESS = await certificate.getAddress();
    process.env.PRIVATE_KEY = owner.privateKey;
    process.env.RPC_URL = "http://localhost:8545";
    
    app = require("../../backend/src/server");
    server = app.listen(3001);
    
    // Update fetch base URL
    const originalFetch = global.fetch;
    global.fetch = (url, options) => {
      if (url.startsWith('/api/')) {
        url = `http://localhost:3001${url}`;
      }
      return originalFetch(url, options);
    };
  });

  after(async function () {
    if (server) {
      server.close();
    }
  });

  describe("Certificate Issuance Integration", function () {
    it("should integrate frontend certificate form with backend minting", async function () {
      const certificateData = {
        recipient: recipient.address,
        recipientName: "Integration Test User",
        courseName: "Full Stack Development",
        institutionName: "Integration University",
        issueDate: Math.floor(Date.now() / 1000),
        metadataURI: "https://ipfs.io/ipfs/QmIntegration123"
      };

      // Simulate frontend form submission
      const result = await mockFrontendAPI.mintCertificate(certificateData, issuer.address);

      expect(result.success).to.be.true;
      expect(result.data.tokenId).to.exist;
      expect(result.data.qrCodeURL).to.exist;
      expect(result.data.verificationURL).to.exist;

      // Verify the certificate exists on blockchain
      const tokenId = result.data.tokenId;
      const onChainCert = await certificate.getCertificate(tokenId);
      expect(onChainCert.recipientName).to.equal(certificateData.recipientName);
    });

    it("should handle frontend form validation errors", async function () {
      const invalidData = {
        recipient: "invalid-address",
        recipientName: "", // Empty name
        courseName: "Test Course",
        institutionName: "Test Institution"
        // Missing required fields
      };

      const result = await mockFrontendAPI.mintCertificate(invalidData, issuer.address);

      expect(result.success).to.be.false;
      expect(result.error.code).to.equal("VALIDATION_ERROR");
      expect(result.error.details).to.be.an('array');
    });
  });

  describe("Certificate Verification Integration", function () {
    let testTokenId;

    before(async function () {
      // Mint a test certificate
      const certificateData = {
        recipient: recipient.address,
        recipientName: "Verification Test User",
        courseName: "Blockchain Verification",
        institutionName: "Test University",
        issueDate: Math.floor(Date.now() / 1000),
        metadataURI: "https://ipfs.io/ipfs/QmVerify123"
      };

      const result = await mockFrontendAPI.mintCertificate(certificateData, issuer.address);
      testTokenId = result.data.tokenId;
    });

    it("should integrate frontend verification page with backend API", async function () {
      // Simulate frontend verification page loading
      const result = await mockFrontendAPI.verifyCertificate(testTokenId);

      expect(result.success).to.be.true;
      expect(result.data.isValid).to.be.true;
      expect(result.data.certificate).to.exist;
      expect(result.data.certificate.recipientName).to.equal("Verification Test User");
    });

    it("should handle QR code scanning workflow", async function () {
      // Simulate QR code scan leading to verification
      const certificateResult = await mockFrontendAPI.getCertificate(testTokenId);
      expect(certificateResult.success).to.be.true;

      const qrCodeURL = certificateResult.data.qrCodeURL;
      expect(qrCodeURL).to.exist;

      // Extract token ID from QR code URL and verify
      const urlParts = qrCodeURL.split('/');
      const extractedTokenId = urlParts[urlParts.length - 1];
      
      const verifyResult = await mockFrontendAPI.verifyCertificate(extractedTokenId);
      expect(verifyResult.success).to.be.true;
      expect(verifyResult.data.isValid).to.be.true;
    });
  });

  describe("Issuer Dashboard Integration", function () {
    let dashboardTokenIds = [];

    before(async function () {
      // Mint multiple certificates for dashboard testing
      const certificates = [
        {
          recipient: recipient.address,
          recipientName: "Dashboard User 1",
          courseName: "Course A",
          institutionName: "Dashboard University",
          issueDate: Math.floor(Date.now() / 1000),
          metadataURI: "https://ipfs.io/ipfs/QmDash1"
        },
        {
          recipient: recipient.address,
          recipientName: "Dashboard User 2",
          courseName: "Course B",
          institutionName: "Dashboard University",
          issueDate: Math.floor(Date.now() / 1000),
          metadataURI: "https://ipfs.io/ipfs/QmDash2"
        }
      ];

      for (const certData of certificates) {
        const result = await mockFrontendAPI.mintCertificate(certData, issuer.address);
        dashboardTokenIds.push(result.data.tokenId);
      }
    });

    it("should integrate issuer dashboard with backend certificate listing", async function () {
      const result = await mockFrontendAPI.getIssuerCertificates(issuer.address);

      expect(result.success).to.be.true;
      expect(result.data.certificates).to.be.an('array');
      expect(result.data.certificates.length).to.be.greaterThanOrEqual(2);
      expect(result.data.totalCertificates).to.be.greaterThanOrEqual(2);

      // Verify our test certificates are in the list
      const tokenIds = result.data.certificates.map(cert => cert.tokenId);
      dashboardTokenIds.forEach(tokenId => {
        expect(tokenIds).to.include(tokenId);
      });
    });

    it("should handle dashboard filtering and pagination", async function () {
      // Test with query parameters (simulating frontend filters)
      const response = await request(server)
        .get(`/api/v1/certificates/issuer/${issuer.address}`)
        .query({
          limit: 1,
          offset: 0,
          sortBy: 'issueDate',
          sortOrder: 'desc'
        })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data.certificates).to.have.length(1);
      expect(response.body.data.pagination).to.exist;
      expect(response.body.data.pagination.total).to.be.greaterThan(0);
    });
  });

  describe("Error Handling Integration", function () {
    it("should propagate blockchain errors to frontend", async function () {
      // Try to mint with unauthorized issuer
      const certificateData = {
        recipient: recipient.address,
        recipientName: "Error Test User",
        courseName: "Error Course",
        institutionName: "Error University",
        issueDate: Math.floor(Date.now() / 1000),
        metadataURI: "https://ipfs.io/ipfs/QmError123"
      };

      const result = await mockFrontendAPI.mintCertificate(certificateData, recipient.address);

      expect(result.success).to.be.false;
      expect(result.error.code).to.equal("UNAUTHORIZED_ISSUER");
      expect(result.error.message).to.include("not authorized");
    });

    it("should handle network timeouts gracefully", async function () {
      // Simulate network timeout by setting very short timeout
      const originalTimeout = process.env.NETWORK_TIMEOUT;
      process.env.NETWORK_TIMEOUT = "1"; // 1ms timeout

      const certificateData = {
        recipient: recipient.address,
        recipientName: "Timeout Test User",
        courseName: "Timeout Course",
        institutionName: "Timeout University",
        issueDate: Math.floor(Date.now() / 1000),
        metadataURI: "https://ipfs.io/ipfs/QmTimeout123"
      };

      const result = await mockFrontendAPI.mintCertificate(certificateData, issuer.address);

      expect(result.success).to.be.false;
      expect(result.error.code).to.equal("NETWORK_ERROR");

      // Restore original timeout
      process.env.NETWORK_TIMEOUT = originalTimeout;
    });
  });

  describe("Real-time Updates Integration", function () {
    it("should handle concurrent frontend operations", async function () {
      const operations = [];

      // Simulate multiple frontend operations happening simultaneously
      operations.push(mockFrontendAPI.getIssuerCertificates(issuer.address));
      operations.push(mockFrontendAPI.mintCertificate({
        recipient: recipient.address,
        recipientName: "Concurrent User 1",
        courseName: "Concurrent Course",
        institutionName: "Concurrent University",
        issueDate: Math.floor(Date.now() / 1000),
        metadataURI: "https://ipfs.io/ipfs/QmConcurrent1"
      }, issuer.address));
      operations.push(mockFrontendAPI.mintCertificate({
        recipient: recipient.address,
        recipientName: "Concurrent User 2",
        courseName: "Concurrent Course",
        institutionName: "Concurrent University",
        issueDate: Math.floor(Date.now() / 1000),
        metadataURI: "https://ipfs.io/ipfs/QmConcurrent2"
      }, issuer.address));

      const results = await Promise.all(operations);

      // First operation (get certificates) should succeed
      expect(results[0].success).to.be.true;

      // Both minting operations should succeed
      expect(results[1].success).to.be.true;
      expect(results[2].success).to.be.true;

      // Verify both certificates were minted with different token IDs
      expect(results[1].data.tokenId).to.not.equal(results[2].data.tokenId);
    });
  });

  describe("Data Consistency Integration", function () {
    it("should maintain data consistency between frontend and blockchain", async function () {
      const certificateData = {
        recipient: recipient.address,
        recipientName: "Consistency Test User",
        courseName: "Data Consistency Course",
        institutionName: "Consistency University",
        issueDate: Math.floor(Date.now() / 1000),
        metadataURI: "https://ipfs.io/ipfs/QmConsistency123"
      };

      // Mint certificate through frontend API
      const mintResult = await mockFrontendAPI.mintCertificate(certificateData, issuer.address);
      expect(mintResult.success).to.be.true;

      const tokenId = mintResult.data.tokenId;

      // Get certificate through frontend API
      const apiResult = await mockFrontendAPI.getCertificate(tokenId);
      expect(apiResult.success).to.be.true;

      // Get certificate directly from blockchain
      const blockchainResult = await certificate.getCertificate(tokenId);

      // Compare data consistency
      expect(apiResult.data.recipientName).to.equal(blockchainResult.recipientName);
      expect(apiResult.data.courseName).to.equal(blockchainResult.courseName);
      expect(apiResult.data.institutionName).to.equal(blockchainResult.institutionName);
      expect(apiResult.data.issuer).to.equal(blockchainResult.issuer);
      expect(apiResult.data.recipient).to.equal(blockchainResult.recipient);
      expect(apiResult.data.isValid).to.equal(blockchainResult.isValid);
    });
  });
});