# Certificate System Integration Guide

This document provides a comprehensive guide for integrating and testing the complete VerifyCert certificate system, including smart contracts, backend API, and frontend components.

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │ Smart Contract  │
│   (React)       │◄──►│   (Express)     │◄──►│   (Solidity)    │
│                 │    │                 │    │                 │
│ - Verify Page   │    │ - Mint Route    │    │ - Certificate   │
│ - Certificate   │    │ - Verify Route  │    │   NFT Logic     │
│   Card          │    │ - Rate Limiting │    │ - Access Control│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Core Components

### 1. Smart Contract (`smart_contracts/certificate.sol`)
- **Purpose**: ERC721 non-transferable certificate NFTs on Polygon Amoy
- **Key Features**:
  - Certificate issuance with metadata
  - Role-based access control
  - Certificate revocation
  - Non-transferable tokens
  - Metadata integrity verification

### 2. Backend API Routes

#### Minting Route (`backend/routes/mintCertificate.js`)
- **Endpoint**: `POST /api/mint-certificate`
- **Purpose**: Issue new certificates on the blockchain
- **Features**:
  - Input validation with Joi
  - Rate limiting (10 requests per 15 minutes)
  - Gas estimation and optimization
  - QR code generation
  - Transaction monitoring

#### Verification Route (`backend/routes/verifyCertificate.js`)
- **Endpoint**: `GET /api/verify-certificate/:certificateId`
- **Purpose**: Verify certificate authenticity
- **Features**:
  - Rate limiting (30 requests per minute)
  - Batch verification support
  - Metadata retrieval
  - Service status monitoring

### 3. Frontend Components

#### Verification Page (`frontend/pages/verify.jsx`)
- **Purpose**: User interface for certificate verification
- **Features**:
  - Multiple verification methods (ID, file upload, QR scan)
  - Real-time verification status
  - Error handling and user feedback
  - Responsive design

#### Certificate Card (`frontend/components/CertificateCard.jsx`)
- **Purpose**: Display certificate information
- **Features**:
  - Certificate details presentation
  - QR code display
  - Download and share functionality
  - Blockchain information display

## Integration Testing

### Automated Integration Test

Run the comprehensive integration test:

```bash
npm run test:certificate-integration
```

This test covers:
1. **Contract Connection**: Verifies smart contract connectivity
2. **Certificate Minting**: Tests certificate issuance (if authorized)
3. **API Verification**: Tests backend verification endpoints
4. **Frontend Integration**: Verifies frontend accessibility

### Manual Testing Steps

#### 1. Environment Setup

```bash
# Install dependencies
npm run install:all

# Set up environment variables
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Configure your environment variables:
# - PRIVATE_KEY: Your wallet private key
# - POLYGON_AMOY_RPC_URL: Polygon Amoy RPC endpoint
# - Contract addresses in contract-addresses.json
```

#### 2. Start All Services

```bash
# Terminal 1: Start local Hardhat node (optional for testing)
npm run node

# Terminal 2: Start backend server
npm run backend:dev

# Terminal 3: Start frontend development server
npm run frontend:dev
```

#### 3. Deploy Contracts (if needed)

```bash
# Deploy to Polygon Amoy testnet
npm run deploy:amoy

# Verify contract on PolygonScan
npm run verify:amoy
```

#### 4. Test Certificate Workflow

1. **Issue Certificate** (requires authorized wallet):
   ```bash
   curl -X POST http://localhost:5000/api/mint-certificate \
     -H "Content-Type: application/json" \
     -d '{
       "recipientAddress": "0x742d35Cc6634C0532925a3b8D0C9C0E3C5d5c8eF",
       "recipientName": "John Doe",
       "courseName": "Blockchain Development",
       "institutionName": "VerifyCert Academy"
     }'
   ```

2. **Verify Certificate**:
   ```bash
   curl http://localhost:5000/api/verify-certificate/1
   ```

3. **Test Frontend**:
   - Navigate to `http://localhost:3000/verify`
   - Enter certificate ID
   - Verify the certificate displays correctly

## API Endpoints Reference

### Minting Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mint-certificate` | Issue new certificate |
| GET | `/api/mint-certificate/status` | Get minting service status |

### Verification Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/verify-certificate/:id` | Verify certificate by ID |
| POST | `/api/verify-certificate` | Verify certificate (legacy) |
| POST | `/api/verify-certificate/batch` | Batch verify certificates |
| GET | `/api/verify-certificate/status` | Get verification service status |
| GET | `/api/verify-certificate/:id/metadata` | Get certificate metadata |

## Error Handling

### Common Error Scenarios

1. **Contract Not Initialized**
   - **Cause**: Missing contract address or RPC connection
   - **Solution**: Check environment variables and contract deployment

2. **Unauthorized Issuer**
   - **Cause**: Wallet not authorized to mint certificates
   - **Solution**: Add wallet to authorized issuers list

3. **Certificate Not Found**
   - **Cause**: Invalid certificate ID or certificate doesn't exist
   - **Solution**: Verify certificate ID and check blockchain

4. **Network Errors**
   - **Cause**: RPC connection issues or network congestion
   - **Solution**: Check RPC endpoint and retry

### Error Response Format

```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message",
  "details": "Additional error details (development only)"
}
```

## Security Considerations

### Rate Limiting
- **Minting**: 10 requests per 15 minutes per IP
- **Verification**: 30 requests per minute per IP
- **Batch Verification**: Maximum 10 certificates per request

### Input Validation
- All inputs validated using Joi schemas
- Ethereum address format validation
- File type and size restrictions
- SQL injection prevention

### Access Control
- Only authorized wallets can mint certificates
- Contract owner can manage authorized issuers
- Non-transferable certificates prevent unauthorized transfers

## Performance Optimization

### Backend Optimizations
- Connection pooling for blockchain RPC
- Caching for frequently accessed data
- Gas optimization for contract interactions
- Batch processing for multiple operations

### Frontend Optimizations
- Lazy loading for components
- Image optimization for QR codes
- Responsive design for mobile devices
- Error boundary implementation

## Monitoring and Logging

### Backend Logging
```javascript
// Example log format
console.log('✅ Certificate verified successfully:', tokenId);
console.error('❌ Certificate verification error:', error);
```

### Service Status Monitoring
- Health check endpoints for all services
- Blockchain connectivity monitoring
- Contract interaction success rates
- Response time tracking

## Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Contract deployed and verified
- [ ] Rate limiting configured
- [ ] Security headers enabled

### Post-deployment
- [ ] Service status endpoints responding
- [ ] Certificate minting working
- [ ] Certificate verification working
- [ ] Frontend integration working
- [ ] Monitoring alerts configured

## Troubleshooting

### Common Issues

1. **"Contract not initialized" error**
   ```bash
   # Check contract addresses
   cat contract-addresses.json
   
   # Verify RPC connection
   curl -X POST https://rpc-amoy.polygon.technology/ \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```

2. **"Unauthorized issuer" error**
   ```bash
   # Check if wallet is authorized
   npx hardhat console --network amoy
   > const contract = await ethers.getContractAt("Certificate", "CONTRACT_ADDRESS");
   > await contract.isAuthorizedIssuer("YOUR_WALLET_ADDRESS");
   ```

3. **Frontend not connecting to backend**
   ```bash
   # Check backend is running
   curl http://localhost:5000/api/verify-certificate/status
   
   # Check frontend environment
   cat frontend/.env
   ```

### Debug Commands

```bash
# Check all services status
npm run test:certificate-integration

# Test specific components
node scripts/test-certificate-workflow.js
node scripts/verify-deployment.js

# Check contract deployment
npm run deployment-status
```

## Support and Resources

- **Documentation**: See individual component README files
- **Smart Contract**: `contracts/Certificate.sol`
- **API Documentation**: Backend route files
- **Frontend Components**: `frontend/components/` directory
- **Test Scripts**: `scripts/` directory

For additional support, check the troubleshooting section or run the integration test to identify specific issues.