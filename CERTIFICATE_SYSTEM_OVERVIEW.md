# VerifyCert Certificate System Overview

This document provides a comprehensive overview of the VerifyCert certificate system, including all the key components that work together to create a decentralized, blockchain-based certificate verification platform.

## System Architecture

The VerifyCert system consists of three main components:

1. **Smart Contract** (`smart_contracts/certificate.sol`) - Blockchain logic for certificate NFTs
2. **Backend API** (`backend/routes/`) - Server-side certificate management
3. **Frontend Application** (`frontend/`) - User interface for certificate interaction

## Core Components

### 1. Smart Contract (`smart_contracts/certificate.sol`)

**Purpose**: Non-transferable ERC721 NFT contract for blockchain-secured certificates

**Key Features**:
- Non-transferable certificate NFTs
- Role-based access control for authorized issuers
- Certificate revocation capability
- Metadata integrity verification
- Gas-optimized operations

**Main Functions**:
```solidity
function issueCertificate(
    address recipient,
    string memory recipientName,
    string memory courseName,
    string memory institutionName,
    string memory metadataURI,
    string memory metadataHash
) public returns (uint256)

function getCertificate(uint256 tokenId) public view returns (CertificateData memory)
function isValidCertificate(uint256 tokenId) public view returns (bool)
function revokeCertificate(uint256 tokenId) public
```

**Security Features**:
- ReentrancyGuard protection
- Pausable functionality for emergencies
- Authorized issuer system
- Duplicate prevention via metadata hashing

### 2. Backend API Routes

#### Certificate Minting (`backend/routes/mintCertificate.js`)

**Purpose**: API endpoint for issuing new certificates

**Key Features**:
- Input validation with Joi schemas
- Gas estimation and optimization
- Metadata generation and IPFS storage simulation
- QR code generation for verification
- Rate limiting and security middleware

**Main Endpoints**:
- `POST /api/mint-certificate` - Mint new certificate
- `POST /api/mint-certificate/gas-estimate` - Get gas estimates
- `GET /api/mint-certificate/issuer-status/:address` - Check issuer authorization

**Request Format**:
```json
{
  "recipientAddress": "0x...",
  "recipientName": "John Doe",
  "courseName": "Blockchain Development",
  "institutionName": "Tech University",
  "issuerPrivateKey": "0x...",
  "additionalMetadata": {},
  "skills": ["Solidity", "Web3"],
  "grade": "A+",
  "credits": 3
}
```

#### Certificate Verification (`backend/routes/verifyCertificate.js`)

**Purpose**: API endpoints for verifying certificate authenticity

**Key Features**:
- Multiple verification methods (ID, file upload, batch)
- Blockchain data retrieval and validation
- Comprehensive error handling
- Rate limiting for security
- Detailed verification reports

**Main Endpoints**:
- `GET /api/