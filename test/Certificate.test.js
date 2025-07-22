const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Certificate Contract", function () {
  let certificate;
  let owner;
  let issuer;
  let recipient;
  let other;

  beforeEach(async function () {
    [owner, issuer, recipient, other] = await ethers.getSigners();
    
    const Certificate = await ethers.getContractFactory("Certificate");
    certificate = await Certificate.deploy();
    await certificate.deployed();
    
    // Authorize issuer
    await certificate.authorizeIssuer(issuer.address);
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(certificate.address).to.not.be.undefined;
    });

    it("Should set the correct name and symbol", async function () {
      expect(await certificate.name()).to.equal("VerifyCert");
      expect(await certificate.symbol()).to.equal("VCERT");
    });

    it("Should set the deployer as owner", async function () {
      expect(await certificate.owner()).to.equal(owner.address);
    });
  });

  describe("Non-transferable NFT functionality", function () {
    let tokenId;

    beforeEach(async function () {
      // Mint a certificate for testing
      const tx = await certificate.connect(issuer).mintCertificate(
        recipient.address,
        "John Doe",
        "Blockchain Development",
        "Tech University",
        "ipfs://metadata-uri"
      );
      const receipt = await tx.wait();
      tokenId = receipt.events[0].args.tokenId;
    });

    it("Should prevent transferFrom", async function () {
      await expect(
        certificate.connect(recipient).transferFrom(recipient.address, other.address, tokenId)
      ).to.be.revertedWithCustomError(certificate, "TransferNotAllowed");
    });

    it("Should prevent safeTransferFrom without data", async function () {
      await expect(
        certificate.connect(recipient)["safeTransferFrom(address,address,uint256)"](
          recipient.address, 
          other.address, 
          tokenId
        )
      ).to.be.revertedWithCustomError(certificate, "TransferNotAllowed");
    });

    it("Should prevent safeTransferFrom with data", async function () {
      await expect(
        certificate.connect(recipient)["safeTransferFrom(address,address,uint256,bytes)"](
          recipient.address, 
          other.address, 
          tokenId,
          "0x"
        )
      ).to.be.revertedWithCustomError(certificate, "TransferNotAllowed");
    });

    it("Should prevent transfers even when called by owner", async function () {
      await expect(
        certificate.connect(owner).transferFrom(recipient.address, other.address, tokenId)
      ).to.be.revertedWithCustomError(certificate, "TransferNotAllowed");
    });

    it("Should prevent transfers even when called by approved address", async function () {
      // Since approvals are now blocked, we can't test this scenario
      // This test verifies that even if someone tries to use approval-based transfers,
      // the transfer itself will fail
      await expect(
        certificate.connect(other).transferFrom(recipient.address, other.address, tokenId)
      ).to.be.revertedWithCustomError(certificate, "TransferNotAllowed");
    });

    it("Should prevent approve function", async function () {
      await expect(
        certificate.connect(recipient).approve(other.address, tokenId)
      ).to.be.revertedWithCustomError(certificate, "TransferNotAllowed");
    });

    it("Should prevent setApprovalForAll function", async function () {
      await expect(
        certificate.connect(recipient).setApprovalForAll(other.address, true)
      ).to.be.revertedWithCustomError(certificate, "TransferNotAllowed");
    });

    it("Should maintain ownership after failed transfer attempts", async function () {
      // Verify initial ownership
      expect(await certificate.ownerOf(tokenId)).to.equal(recipient.address);

      // Attempt transfer
      await expect(
        certificate.connect(recipient).transferFrom(recipient.address, other.address, tokenId)
      ).to.be.revertedWithCustomError(certificate, "TransferNotAllowed");

      // Verify ownership unchanged
      expect(await certificate.ownerOf(tokenId)).to.equal(recipient.address);
    });

    it("Should prevent approval to zero address", async function () {
      await expect(
        certificate.connect(recipient).approve(ethers.constants.AddressZero, tokenId)
      ).to.be.revertedWithCustomError(certificate, "TransferNotAllowed");
    });

    it("Should prevent setApprovalForAll with false value", async function () {
      await expect(
        certificate.connect(recipient).setApprovalForAll(other.address, false)
      ).to.be.revertedWithCustomError(certificate, "TransferNotAllowed");
    });

    it("Should prevent transfers to zero address", async function () {
      await expect(
        certificate.connect(recipient).transferFrom(recipient.address, ethers.constants.AddressZero, tokenId)
      ).to.be.revertedWithCustomError(certificate, "TransferNotAllowed");
    });

    it("Should prevent transfers from zero address", async function () {
      await expect(
        certificate.connect(recipient).transferFrom(ethers.constants.AddressZero, other.address, tokenId)
      ).to.be.revertedWithCustomError(certificate, "TransferNotAllowed");
    });

    it("Should prevent self-transfers", async function () {
      await expect(
        certificate.connect(recipient).transferFrom(recipient.address, recipient.address, tokenId)
      ).to.be.revertedWithCustomError(certificate, "TransferNotAllowed");
    });
  });

  describe("Certificate minting functionality", function () {
    it("Should allow authorized issuer to mint certificate", async function () {
      const tx = await certificate.connect(issuer).mintCertificate(
        recipient.address,
        "Jane Smith",
        "Web Development",
        "Code Academy",
        "ipfs://test-metadata"
      );

      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "CertificateMinted");
      
      expect(event).to.not.be.undefined;
      expect(event.args.issuer).to.equal(issuer.address);
      expect(event.args.recipient).to.equal(recipient.address);
      
      const tokenId = event.args.tokenId;
      expect(await certificate.ownerOf(tokenId)).to.equal(recipient.address);
    });

    it("Should allow owner to mint certificate without authorization", async function () {
      const tx = await certificate.connect(owner).mintCertificate(
        recipient.address,
        "Owner Certificate",
        "Admin Course",
        "Owner Institution",
        "ipfs://owner-metadata"
      );

      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "CertificateMinted");
      
      expect(event).to.not.be.undefined;
      expect(event.args.issuer).to.equal(owner.address);
    });

    it("Should prevent unauthorized address from minting", async function () {
      await expect(
        certificate.connect(other).mintCertificate(
          recipient.address,
          "Unauthorized Certificate",
          "Fake Course",
          "Fake Institution",
          "ipfs://fake-metadata"
        )
      ).to.be.revertedWithCustomError(certificate, "UnauthorizedIssuer");
    });

    it("Should prevent minting to zero address", async function () {
      await expect(
        certificate.connect(issuer).mintCertificate(
          ethers.constants.AddressZero,
          "Invalid Certificate",
          "Test Course",
          "Test Institution",
          "ipfs://test-metadata"
        )
      ).to.be.revertedWithCustomError(certificate, "InvalidRecipient");
    });

    it("Should store certificate data correctly", async function () {
      const recipientName = "Alice Johnson";
      const courseName = "Smart Contract Development";
      const institutionName = "Blockchain University";
      const metadataURI = "ipfs://alice-certificate";

      const tx = await certificate.connect(issuer).mintCertificate(
        recipient.address,
        recipientName,
        courseName,
        institutionName,
        metadataURI
      );

      const receipt = await tx.wait();
      const tokenId = receipt.events[0].args.tokenId;

      const certData = await certificate.getCertificate(tokenId);
      
      expect(certData.issuer).to.equal(issuer.address);
      expect(certData.recipient).to.equal(recipient.address);
      expect(certData.recipientName).to.equal(recipientName);
      expect(certData.courseName).to.equal(courseName);
      expect(certData.institutionName).to.equal(institutionName);
      expect(certData.metadataURI).to.equal(metadataURI);
      expect(certData.isValid).to.be.true;
      expect(certData.issueDate).to.be.greaterThan(0);
    });

    it("Should increment token IDs correctly", async function () {
      const tx1 = await certificate.connect(issuer).mintCertificate(
        recipient.address,
        "First Certificate",
        "Course 1",
        "Institution 1",
        "ipfs://cert1"
      );
      const receipt1 = await tx1.wait();
      const tokenId1 = receipt1.events[0].args.tokenId;

      const tx2 = await certificate.connect(issuer).mintCertificate(
        other.address,
        "Second Certificate",
        "Course 2",
        "Institution 2",
        "ipfs://cert2"
      );
      const receipt2 = await tx2.wait();
      const tokenId2 = receipt2.events[0].args.tokenId;

      expect(tokenId2).to.equal(tokenId1.add(1));
    });

    it("Should emit CertificateMinted event with correct parameters", async function () {
      await expect(
        certificate.connect(issuer).mintCertificate(
          recipient.address,
          "Event Test Certificate",
          "Event Course",
          "Event Institution",
          "ipfs://event-metadata"
        )
      ).to.emit(certificate, "CertificateMinted")
       .withArgs(1, issuer.address, recipient.address);
    });

    it("Should handle empty strings in certificate data", async function () {
      const tx = await certificate.connect(issuer).mintCertificate(
        recipient.address,
        "",
        "",
        "",
        ""
      );

      const receipt = await tx.wait();
      const tokenId = receipt.events[0].args.tokenId;
      const certData = await certificate.getCertificate(tokenId);

      expect(certData.recipientName).to.equal("");
      expect(certData.courseName).to.equal("");
      expect(certData.institutionName).to.equal("");
      expect(certData.metadataURI).to.equal("");
    });
  });

  describe("Certificate verification and querying", function () {
    let tokenId;

    beforeEach(async function () {
      const tx = await certificate.connect(issuer).mintCertificate(
        recipient.address,
        "Test Certificate",
        "Test Course",
        "Test Institution",
        "ipfs://test-metadata"
      );
      const receipt = await tx.wait();
      tokenId = receipt.events[0].args.tokenId;
    });

    describe("getCertificate function", function () {
      it("Should return certificate data for valid token ID", async function () {
        const certData = await certificate.getCertificate(tokenId);
        
        expect(certData.issuer).to.equal(issuer.address);
        expect(certData.recipient).to.equal(recipient.address);
        expect(certData.recipientName).to.equal("Test Certificate");
        expect(certData.courseName).to.equal("Test Course");
        expect(certData.institutionName).to.equal("Test Institution");
        expect(certData.metadataURI).to.equal("ipfs://test-metadata");
        expect(certData.isValid).to.be.true;
      });

      it("Should revert for non-existent token ID", async function () {
        await expect(
          certificate.getCertificate(999)
        ).to.be.revertedWithCustomError(certificate, "CertificateNotFound");
      });
    });

    describe("verifyCertificate function", function () {
      it("Should return true for valid certificate", async function () {
        const isValid = await certificate.verifyCertificate(tokenId);
        expect(isValid).to.be.true;
      });

      it("Should return false for non-existent certificate", async function () {
        const isValid = await certificate.verifyCertificate(999);
        expect(isValid).to.be.false;
      });

      it("Should return false for revoked certificate", async function () {
        // Revoke the certificate
        await certificate.connect(issuer).revokeCertificate(tokenId);
        
        const isValid = await certificate.verifyCertificate(tokenId);
        expect(isValid).to.be.false;
      });
    });

    describe("Certificate revocation", function () {
      it("Should allow issuer to revoke their certificate", async function () {
        await expect(
          certificate.connect(issuer).revokeCertificate(tokenId)
        ).to.emit(certificate, "CertificateRevoked")
         .withArgs(tokenId);

        const certData = await certificate.getCertificate(tokenId);
        expect(certData.isValid).to.be.false;
      });

      it("Should allow owner to revoke any certificate", async function () {
        await expect(
          certificate.connect(owner).revokeCertificate(tokenId)
        ).to.emit(certificate, "CertificateRevoked")
         .withArgs(tokenId);

        const certData = await certificate.getCertificate(tokenId);
        expect(certData.isValid).to.be.false;
      });

      it("Should prevent unauthorized revocation", async function () {
        await expect(
          certificate.connect(other).revokeCertificate(tokenId)
        ).to.be.revertedWithCustomError(certificate, "UnauthorizedIssuer");
      });

      it("Should prevent revoking non-existent certificate", async function () {
        await expect(
          certificate.connect(issuer).revokeCertificate(999)
        ).to.be.revertedWithCustomError(certificate, "CertificateNotFound");
      });

      it("Should prevent revoking already revoked certificate", async function () {
        // First revocation
        await certificate.connect(issuer).revokeCertificate(tokenId);
        
        // Second revocation should fail
        await expect(
          certificate.connect(issuer).revokeCertificate(tokenId)
        ).to.be.revertedWithCustomError(certificate, "CertificateAlreadyRevoked");
      });

      it("Should not prevent recipient from revoking", async function () {
        await expect(
          certificate.connect(recipient).revokeCertificate(tokenId)
        ).to.be.revertedWithCustomError(certificate, "UnauthorizedIssuer");
      });
    });

    describe("Issuer authorization management", function () {
      it("Should allow owner to authorize new issuer", async function () {
        await expect(
          certificate.connect(owner).authorizeIssuer(other.address)
        ).to.emit(certificate, "IssuerAuthorized")
         .withArgs(other.address);

        expect(await certificate.authorizedIssuers(other.address)).to.be.true;
      });

      it("Should allow owner to revoke issuer authorization", async function () {
        // First authorize
        await certificate.connect(owner).authorizeIssuer(other.address);
        
        // Then revoke
        await expect(
          certificate.connect(owner).revokeIssuer(other.address)
        ).to.emit(certificate, "IssuerRevoked")
         .withArgs(other.address);

        expect(await certificate.authorizedIssuers(other.address)).to.be.false;
      });

      it("Should prevent non-owner from authorizing issuer", async function () {
        await expect(
          certificate.connect(issuer).authorizeIssuer(other.address)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should prevent non-owner from revoking issuer", async function () {
        await expect(
          certificate.connect(issuer).revokeIssuer(other.address)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should allow newly authorized issuer to mint certificates", async function () {
        // Authorize new issuer
        await certificate.connect(owner).authorizeIssuer(other.address);
        
        // New issuer should be able to mint
        await expect(
          certificate.connect(other).mintCertificate(
            recipient.address,
            "New Issuer Certificate",
            "New Course",
            "New Institution",
            "ipfs://new-metadata"
          )
        ).to.not.be.reverted;
      });

      it("Should prevent revoked issuer from minting certificates", async function () {
        // Revoke existing issuer
        await certificate.connect(owner).revokeIssuer(issuer.address);
        
        // Revoked issuer should not be able to mint
        await expect(
          certificate.connect(issuer).mintCertificate(
            recipient.address,
            "Revoked Issuer Certificate",
            "Revoked Course",
            "Revoked Institution",
            "ipfs://revoked-metadata"
          )
        ).to.be.revertedWithCustomError(certificate, "UnauthorizedIssuer");
      });

      it("Should check issuer authorization status correctly", async function () {
        // Initially authorized
        expect(await certificate.authorizedIssuers(issuer.address)).to.be.true;
        
        // Not authorized
        expect(await certificate.authorizedIssuers(other.address)).to.be.false;
        
        // Authorize and check
        await certificate.connect(owner).authorizeIssuer(other.address);
        expect(await certificate.authorizedIssuers(other.address)).to.be.true;
        
        // Revoke and check
        await certificate.connect(owner).revokeIssuer(other.address);
        expect(await certificate.authorizedIssuers(other.address)).to.be.false;
      });
    });
  });
});