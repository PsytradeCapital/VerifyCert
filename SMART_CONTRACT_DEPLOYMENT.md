# Smart Contract Deployment Guide

## Overview

This document provides comprehensive instructions for deploying the VerifyCert Certificate smart contract to Polygon Mumbai testnet.

## Prerequisites

### 1. Environment Setup

Ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- MetaMask wallet extension

### 2. Required Configuration

Create a `.env` file in the root directory with:

```bash
# Blockchain Configuration
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_private_key_here
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# Contract Address (populated after deployment)
REACT_APP_CONTRACT_ADDRESS=

# API Configuration
REACT_APP_API_URL=http://localhost:3001
```

### 3. Get Testnet MATIC

1. Visit [Polygon Faucet](https://faucet.polygon.technology/)
2. Connect your MetaMask wallet
3. Switch to Mumbai testnet
4. Request testnet MATIC tokens

## Deployment Process

### Step 1: Pre-deployment Check

Run the pre-deployment checklist:

```bash
npm run pre-deploy
```

This will verify:
- Environment variables are set
- Network connectivity
- Account balance
- Contract compilation
- API keys for verification

### Step 2: Deploy Contract

Deploy to Mumbai testnet:

```bash
npm run deploy
```

Or use the specific Mumbai deployment script:

```bash
npx hardhat run scripts/deploy-mumbai.js --network mumbai
```

### Step 3: Verify Contract (Optional)

If you have a PolygonScan API key:

```bash
npm run verify
```

Or:

```bash
npx hardhat run scripts/verify.js --network mumbai
```

### Step 4: Check Deployment Status

Verify the deployment:

```bash
npm run deployment-status
```

## Deployment Scripts

### Main Deployment Script (`scripts/deploy-mumbai.js`)

Features:
- Environment validation
- Balance checking
- Gas estimation
- Contract deployment
- Basic functionality testing
- Configuration file generation
- Environment file updates

### Verification Script (`scripts/verify.js`)

Features:
- Contract source code verification on PolygonScan
- Automatic API key validation
- Deployment info updates

### Status Check Script (`scripts/deployment-status.js`)

Features:
- Deployment verification
- Contract interaction testing
- Configuration file validation
- Network status checking

## Generated Files

After successful deployment, the following files are created/updated:

### 1. `contract-addresses.json`
```json
{
  "contractAddress": "0x...",
  "network": "mumbai",
  "chainId": 80001,
  "deployedAt": "2025-01-23T10:30:00.000Z",
  "deployer": "0x...",
  "transactionHash": "0x...",
  "blockNumber": 45123456,
  "gasUsed": "2847392",
  "verified": false
}
```

### 2. Frontend Configuration
- `frontend/contract-addresses.json` - Contract info for React app
- Updated environment variables

### 3. Backend Configuration
- `backend/contract-addresses.json` - Contract info for API
- Updated environment variables

## Contract Features

### Core Functionality

1. **Non-transferable NFTs**: Certificates cannot be transferred between addresses
2. **Issuer Authorization**: Only authorized addresses can mint certificates
3. **Certificate Verification**: Public verification of certificate authenticity
4. **Revocation System**: Issuers can revoke certificates if needed

### Smart Contract Structure

```solidity
contract Certificate is ERC721, Ownable {
    struct CertificateData {
        address issuer;
        address recipient;
        string recipientName;
        string courseName;
        string institutionName;
        uint256 issueDate;
        string metadataURI;
        bool isValid;
    }
    
    // Key functions
    function mintCertificate(...) external onlyAuthorizedIssuer
    function getCertificate(uint256 tokenId) external view
    function verifyCertificate(uint256 tokenId) external view
    function authorizeIssuer(address issuer) external onlyOwner
    function revokeCertificate(uint256 tokenId) external
}
```

## Testing Deployment

### Run Deployment Tests

```bash
npm test test/deployment.test.js
```

### Manual Testing

1. **Check Contract on PolygonScan**:
   - Visit: `https://mumbai.polygonscan.com/address/CONTRACT_ADDRESS`
   - Verify contract is deployed and verified

2. **Test Contract Functions**:
   - Use Hardhat console: `npx hardhat console --network mumbai`
   - Interact with deployed contract

3. **Frontend Integration**:
   - Ensure contract address is in frontend config
   - Test wallet connection to Mumbai network

## Troubleshooting

### Common Issues

1. **Insufficient Balance**:
   - Get more testnet MATIC from faucet
   - Check gas prices and adjust

2. **Network Issues**:
   - Verify RPC URL is working
   - Try alternative RPC endpoints

3. **Private Key Issues**:
   - Ensure private key is correct format (without 0x prefix)
   - Check account has sufficient balance

4. **Verification Failures**:
   - Verify API key is correct
   - Wait a few minutes after deployment
   - Check contract is fully confirmed

### Recovery Steps

If deployment fails:

1. Check error messages in console
2. Verify environment configuration
3. Ensure sufficient gas and balance
4. Try deploying again with higher gas limit

## Security Considerations

1. **Private Key Management**:
   - Never commit private keys to version control
   - Use environment variables
   - Consider using hardware wallets for mainnet

2. **Contract Security**:
   - Contract has been tested for common vulnerabilities
   - Non-transferable implementation prevents unauthorized transfers
   - Access control prevents unauthorized minting

3. **Network Security**:
   - Mumbai is a testnet - not for production use
   - For mainnet deployment, use Polygon mainnet configuration

## Next Steps

After successful deployment:

1. **Update Frontend**: Ensure React app uses correct contract address
2. **Update Backend**: Configure API to interact with deployed contract
3. **Test Integration**: Run end-to-end tests with deployed contract
4. **Monitor Contract**: Set up monitoring for contract interactions

## Mainnet Deployment

For production deployment to Polygon mainnet:

1. Update network configuration in `hardhat.config.js`
2. Use mainnet RPC URL and real MATIC tokens
3. Thoroughly test on testnet first
4. Consider multi-signature wallet for contract ownership
5. Implement proper monitoring and alerting

## Support

For deployment issues:
- Check Hardhat documentation
- Review Polygon network status
- Consult PolygonScan for transaction details
- Review contract events and logs