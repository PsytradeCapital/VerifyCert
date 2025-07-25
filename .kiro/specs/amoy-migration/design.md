# Design Document: Polygon Amoy Migration

## Overview

This design outlines the migration of the VerifyCert system from Polygon Mumbai testnet to Polygon Amoy testnet. The migration involves updating network configurations, redeploying smart contracts, and ensuring all services work seamlessly on the new testnet. Polygon Amoy (Chain ID: 80002) is the new official testnet replacing Mumbai (Chain ID: 80001).

## Architecture

The migration follows a systematic approach to update all components:

```
Migration Architecture:
┌─────────────────────────────────────────────────────────────┐
│                    Configuration Layer                      │
├─────────────────────────────────────────────────────────────┤
│ • hardhat.config.js (network config)                       │
│ • deployment-config.json (network details)                 │
│ • .env files (RPC URLs, contract addresses)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Smart Contract Layer                      │
├─────────────────────────────────────────────────────────────┤
│ • Certificate.sol (redeploy on Amoy)                       │
│ • Deployment scripts (updated for Amoy)                    │
│ • Verification scripts (Amoy PolygonScan)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
├─────────────────────────────────────────────────────────────┤
│ • Backend API (Amoy contract integration)                  │
│ • Frontend React App (Amoy network config)                 │
│ • Contract address synchronization                         │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Network Configuration Component

**Purpose**: Update all network-related configurations to use Polygon Amoy

**Key Files**:
- `hardhat.config.js`: Add Amoy network configuration
- `deployment-config.json`: Update network details for Amoy
- `.env.example` files: Update RPC URLs and explorer references

**Amoy Network Specifications**:
- Chain ID: 80002
- RPC URL: `https://rpc-amoy.polygon.technology/`
- Block Explorer: `https://amoy.polygonscan.com/`
- Faucet: `https://faucet.polygon.technology/`
- Native Currency: MATIC (18 decimals)

### 2. Smart Contract Deployment Component

**Purpose**: Redeploy Certificate contract on Amoy testnet

**Deployment Process**:
1. Compile contracts with existing Solidity 0.8.19 configuration
2. Deploy using provided MetaMask address `0xc9519223859E1A9f6cd94B655Aa409A697F550b2`
3. Verify contract on Amoy PolygonScan
4. Test basic functionality (owner, authorization)

**Contract Specifications**:
- Same Certificate.sol implementation
- ERC721 non-transferable NFT functionality
- Role-based access control maintained
- Gas optimization settings preserved (200 runs)

### 3. Configuration Synchronization Component

**Purpose**: Update contract addresses across all services

**Address Distribution**:
- Root `contract-addresses.json`
- Frontend `contract-addresses.json`
- Backend `contract-addresses.json`
- Environment variables in `.env` files

**Address Format**:
```json
{
  "contractAddress": "0x...",
  "network": "amoy",
  "chainId": 80002,
  "deployedAt": "ISO timestamp",
  "deployer": "0xc9519223859E1A9f6cd94B655Aa409A697F550b2",
  "transactionHash": "0x...",
  "blockNumber": 12345,
  "gasUsed": "2500000",
  "verified": true
}
```

### 4. Service Integration Component

**Purpose**: Update backend and frontend to use Amoy deployment

**Backend Updates**:
- Contract interaction via Amoy RPC
- Updated contract address references
- Amoy network validation

**Frontend Updates**:
- MetaMask network switching to Amoy
- Contract interaction via Amoy provider
- Updated network display information

## Data Models

### Network Configuration Model
```javascript
{
  name: "Polygon Amoy Testnet",
  chainId: 80002,
  rpcUrl: "https://rpc-amoy.polygon.technology/",
  blockExplorer: "https://amoy.polygonscan.com",
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18
  },
  faucet: "https://faucet.polygon.technology/"
}
```

### Deployment Information Model
```javascript
{
  contractAddress: string,
  network: "amoy",
  chainId: 80002,
  deployedAt: string (ISO),
  deployer: "0xc9519223859E1A9f6cd94B655Aa409A697F550b2",
  transactionHash: string,
  blockNumber: number,
  gasUsed: string,
  verified: boolean
}
```

## Error Handling

### Deployment Errors
- **Insufficient Balance**: Check MATIC balance, provide faucet link
- **Network Mismatch**: Validate correct network selection
- **Gas Estimation**: Handle gas limit and price fluctuations
- **RPC Failures**: Implement retry logic with fallback RPC URLs

### Configuration Errors
- **Missing Environment Variables**: Validate required variables
- **Invalid Private Key**: Provide clear error messages
- **File Permission Issues**: Handle file system errors gracefully

### Service Integration Errors
- **Contract Address Mismatch**: Validate address format and network
- **Network Connection**: Handle RPC endpoint failures
- **MetaMask Integration**: Guide users through network addition

## Testing Strategy

### Pre-Migration Testing
1. Backup current Mumbai deployment information
2. Validate all environment configurations
3. Test compilation and deployment scripts locally

### Deployment Testing
1. Deploy contract to Amoy testnet
2. Verify contract functionality (owner, authorization)
3. Test contract verification on Amoy PolygonScan
4. Validate gas usage and transaction costs

### Integration Testing
1. Test backend API with Amoy contract
2. Test frontend MetaMask integration with Amoy
3. End-to-end certificate issuance and verification
4. Cross-service contract address consistency

### Post-Migration Validation
1. Verify all services use Amoy configuration
2. Test complete certificate workflow
3. Validate block explorer links and verification
4. Performance comparison with Mumbai deployment

## Migration Rollback Plan

In case of issues, maintain ability to rollback:
1. Keep Mumbai configuration as backup
2. Preserve original contract addresses
3. Document all changed files for easy reversion
4. Test rollback procedure before migration

## Security Considerations

1. **Private Key Security**: Ensure secure handling of deployment key
2. **Contract Verification**: Verify source code on Amoy PolygonScan
3. **Network Validation**: Prevent accidental mainnet deployments
4. **Access Control**: Maintain proper issuer authorization
5. **Configuration Validation**: Validate all network parameters

## Performance Considerations

1. **Gas Optimization**: Maintain existing optimizer settings
2. **RPC Performance**: Use reliable Amoy RPC endpoints
3. **Block Confirmation**: Adjust confirmation requirements for Amoy
4. **Faucet Limitations**: Account for testnet MATIC availability