const { expect } = require("chai");
const { ethers } = require("hardhat");
const request = require("supertest");
const path = require("path");

// Import backend app
const app = require("../../backend/src/server");

describe("Certificate Workflow Integration Tests", function () {
  let certificate;
  let owner, issuer, recipient, verifier;
  let certificateService;
  let server;

  before(async function () {
    // Get signers
    [owner, issuer, recipient, verifier] = await ethers.getSigners();

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
    
    // Start server for testing
    server = app.listen(0);
  });

  after(async function () {
    if (server) {
      server.close();
    }
  });

  describe("Complete Certificate Issuance Workflow", function () {
    let tokenId;
    let certificateData;

    it("should complete full certificate issuance workflow", async function () {
      // Step 1: Prepare certificate data
      certificateData = {
        recipient: recipient.address,
        recipientName: "John Doe",
        courseName: "Blockchain Development",
        institutionName: "Tech University",
        issueDate: Math.floor(Date.now() / 1000),
        metadataURI: "https://ipfs.io/ipfs/QmTest123"
      };

      // Step 2: Mint certificate through backend API
      const mintResponse = await request(server)
        .post("/api/v1/certificates/mint")
        .send({
          ...certificateData,
          issuerAddress: issuer.address
        })
        .expect(201);

      expect(mintResponse.body.success).to.be.true;
      expect(mintResponse.body.data.tokenId).to.exist;
      tokenId = mintResponse.body.data.tokenId;

      // Step 3: Verify certificate was minted on blockchain
      const onChainCert = await certificate.getCertificate(tokenId);
      expect(onChainCert.issuer).to.equal(issuer.address);
      expect(onChainCert.recipient).to.equal(recipient.address);
      expect(onChainCert.recipientName).to.equal(certificateData.recipientName);
      expect(onChainCert.courseName).to.equal(certificateData.courseName);
      expect(onChainCert.institutionName).to.equal(certificateData.institutionName);
      expect(onChainCert.isValid).to.be.true;

      // Step 4: Verify QR code was generated
      expect(mintResponse.body.data.qrCodeURL).to.exist;
      expect(mintResponse.body.data.verificationURL).to.exist;

      // Step 5: Test certificate retrieval through API
      const getResponse = await request(server)
        .get(`/api/v1/certificates/${tokenId}`)
        .expect(200);

      expect(getResponse.body.success).to.be.true;
      expect(getResponse.body.data.tokenId).to.equal(tokenId);
      expect(getResponse.body.data.recipientName).to.equal(certificateData.recipientName);
    });

    it("should handle certificate verification workflow", async function () {
      // Step 1: Verify certificate through API
      const verifyResponse = await request(server)
        .post(`/api/v1/certificates/verify/${tokenId}`)
        .expect(200);

      expect(verifyResponse.body.success).to.be.true;
      expect(verifyResponse.body.data.isValid).to.be.true;
      expect(verifyResponse.body.data.certificate).to.exist;

      // Step 2: Verify certificate directly on blockchain
      const isValid = await certificate.verifyCertificate(tokenId);
      expect(isValid).to.be.true;

      // Step 3: Test public verification (no auth required)
      const publicVerifyResponse = await request(server)
        .get(`/api/v1/certificates/verify/${tokenId}`)
        .expect(200);

      expect(publicVerifyResponse.body.success).to.be.true;
      expect(publicVerifyResponse.body.data.isValid).to.be.true;
    });

    it("should handle issuer dashboard workflow", async function () {
      // Step 1: Get issuer's certificates
      const dashboardResponse = await request(server)
        .get(`/api/v1/certificates/issuer/${issuer.address}`)
        .expect(200);

      expect(dashboardResponse.body.success).to.be.true;
      expect(dashboardResponse.body.data.certificates).to.be.an('array');
      expect(dashboardResponse.body.data.certificates.length).to.be.greaterThan(0);

      // Step 2: Verify certificate appears in issuer's list
      const issuedCert = dashboardResponse.body.data.certificates.find(
        cert => cert.tokenId === tokenId
      );
      expect(issuedCert).to.exist;
      expect(issuedCert.recipientName).to.equal(certificateData.recipientName);

      // Step 3: Verify statistics
      expect(dashboardResponse.body.data.totalCertificates).to.be.greaterThan(0);
    });
  });

  describe("Error Scenarios and Edge Cases", function () {
    it("should handle unauthorized issuer minting attempt", async function () {
      const unauthorizedData = {
        recipient: recipient.address,
        recipientName: "Jane Doe",
        courseName: "Test Course",
        institutionName: "Test Institution",
        issueDate: Math.floor(Date.now() / 1000),
        metadataURI: "https://ipfs.io/ipfs/QmTest456",
        issuerAddress: verifier.address // Unauthorized issuer
      };

      const response = await request(server)
        .post("/api/v1/certificates/mint")
        .send(unauthorizedData)
        .expect(403);

      expect(response.body.success).to.be.false;
      expect(response.body.error.code).to.equal("UNAUTHORIZED_ISSUER");
    });

    it("should handle invalid certificate verification", async function () {
      const invalidTokenId = "999999";

      const response = await request(server)
        .post(`/api/v1/certificates/verify/${invalidTokenId}`)
        .expect(404);

      expect(response.body.success).to.be.false;
      expect(response.body.error.code).to.equal("CERTIFICATE_NOT_FOUND");
    });

    it("should handle malformed certificate data", async function () {
      const malformedData = {
        recipient: "invalid-address",
        recipientName: "",
        courseName: "Test Course",
        institutionName: "Test Institution",
        issuerAddress: issuer.address
      };

      const response = await request(server)
        .post("/api/v1/certificates/mint")
        .send(malformedData)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.error.code).to.equal("VALIDATION_ERROR");
    });

    it("should handle network connectivity issues", async function () {
      // Temporarily set invalid RPC URL
      const originalRPC = process.env.RPC_URL;
      process.env.RPC_URL = "http://invalid-url:8545";

      const certificateData = {
        recipient: recipient.address,
        recipientName: "Network Test",
        courseName: "Test Course",
        institutionName: "Test Institution",
        issueDate: Math.floor(Date.now() / 1000),
        metadataURI: "https://ipfs.io/ipfs/QmTest789",
        issuerAddress: issuer.address
      };

      const response = await request(server)
        .post("/api/v1/certificates/mint")
        .send(certificateData)
        .expect(500);

      expect(response.body.success).to.be.false;
      expect(response.body.error.code).to.equal("NETWORK_ERROR");

      // Restore original RPC URL
      process.env.RPC_URL = originalRPC;
    });

    it("should handle certificate revocation workflow", async function () {
      // First mint a certificate
      const certificateData = {
        recipient: recipient.address,
        recipientName: "Revoke Test",
        courseName: "Test Course",
        institutionName: "Test Institution",
        issueDate: Math.floor(Date.now() / 1000),
        metadataURI: "https://ipfs.io/ipfs/QmRevoke123",
        issuerAddress: issuer.address
      };

      const mintResponse = await request(server)
        .post("/api/v1/certificates/mint")
        .send(certificateData)
        .expect(201);

      const tokenId = mintResponse.body.data.tokenId;

      // Revoke the certificate
      await certificate.connect(issuer).revokeCertificate(tokenId);

      // Verify certificate is no longer valid
      const verifyResponse = await request(server)
        .post(`/api/v1/certificates/verify/${tokenId}`)
        .expect(200);

      expect(verifyResponse.body.data.isValid).to.be.false;
    });
  });

  describe("Blockchain Interaction Integration Tests", function () {
    it("should handle gas estimation and transaction failures", async function () {
      // Test with extremely low gas limit (should fail)
      const certificateData = {
        recipient: recipient.address,
        recipientName: "Gas Test",
        courseName: "Test Course",
        institutionName: "Test Institution",
        issueDate: Math.floor(Date.now() / 1000),
        metadataURI: "https://ipfs.io/ipfs/QmGasTest123",
        issuerAddress: issuer.address,
        gasLimit: 21000 // Too low for contract interaction
      };

      const response = await request(server)
        .post("/api/v1/certificates/mint")
        .send(certificateData)
        .expect(500);

      expect(response.body.success).to.be.false;
      expect(response.body.error.code).to.equal("TRANSACTION_FAILED");
    });

    it("should handle concurrent certificate minting", async function () {
      const promises = [];
      
      // Create 5 concurrent minting requests
      for (let i = 0; i < 5; i++) {
        const certificateData = {
          recipient: recipient.address,
          recipientName: `Concurrent Test ${i}`,
          courseName: "Concurrent Course",
          institutionName: "Test Institution",
          issueDate: Math.floor(Date.now() / 1000),
          metadataURI: `https://ipfs.io/ipfs/QmConcurrent${i}`,
          issuerAddress: issuer.address
        };

        promises.push(
          request(server)
            .post("/api/v1/certificates/mint")
            .send(certificateData)
        );
      }

      const responses = await Promise.all(promises);

      // All should succeed
      responses.forEach((response, index) => {
        expect(response.status).to.equal(201);
        expect(response.body.success).to.be.true;
        expect(response.body.data.tokenId).to.exist;
      });

      // Verify all certificates exist on blockchain
      for (const response of responses) {
        const tokenId = response.body.data.tokenId;
        const onChainCert = await certificate.getCertificate(tokenId);
        expect(onChainCert.isValid).to.be.true;
      }
    });

    it("should handle large certificate data", async function () {
      const largeCertificateData = {
        recipient: recipient.address,
        recipientName: "A".repeat(100), // Long name
        courseName: "B".repeat(200), // Long course name
        institutionName: "C".repeat(150), // Long institution name
        issueDate: Math.floor(Date.now() / 1000),
        metadataURI: "https://ipfs.io/ipfs/" + "D".repeat(100), // Long URI
        issuerAddress: issuer.address
      };

      const response = await request(server)
        .post("/api/v1/certificates/mint")
        .send(largeCertificateData)
        .expect(201);

      expect(response.body.success).to.be.true;
      
      const tokenId = response.body.data.tokenId;
      const onChainCert = await certificate.getCertificate(tokenId);
      expect(onChainCert.recipientName).to.equal(largeCertificateData.recipientName);
    });
  });

  describe("Performance and Load Testing", function () {
    it("should handle rapid sequential certificate queries", async function () {
      // First mint a certificate
      const certificateData = {
        recipient: recipient.address,
        recipientName: "Performance Test",
        courseName: "Test Course",
        institutionName: "Test Institution",
        issueDate: Math.floor(Date.now() / 1000),
        metadataURI: "https://ipfs.io/ipfs/QmPerf123",
        issuerAddress: issuer.address
      };

      const mintResponse = await request(server)
        .post("/api/v1/certificates/mint")
        .send(certificateData)
        .expect(201);

      const tokenId = mintResponse.body.data.tokenId;

      // Perform 20 rapid queries
      const queryPromises = [];
      for (let i = 0; i < 20; i++) {
        queryPromises.push(
          request(server)
            .get(`/api/v1/certificates/${tokenId}`)
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(queryPromises);
      const endTime = Date.now();

      // All queries should succeed
      responses.forEach(response => {
        expect(response.status).to.equal(200);
        expect(response.body.success).to.be.true;
      });

      // Should complete within reasonable time (5 seconds)
      expect(endTime - startTime).to.be.lessThan(5000);
    });
  });
});