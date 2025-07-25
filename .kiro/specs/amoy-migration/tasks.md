# Implementation Plan

- [x] 1. Update network configuration files for Amoy testnet





  - Update hardhat.config.js to include Amoy network configuration with Chain ID 80002 and RPC URL
  - Update deployment-config.json with Amoy network specifications and block explorer URLs
  - Update root .env.example with Amoy RPC URL references
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2. Update environment configuration files across all services






  - [x] 2.1 Update backend .env.example with Amoy network configuration











    - Modify backend/.env.example to reference Amoy RPC URLs and contract addresses
    - Update API configuration to work with Amoy testnet
    - _Requirements: 2.2, 2.4_

  - [x] 2.2 Update frontend .env.example with Amoy network settings


    - Modify frontend/.env.example to include Amoy network configuration
    - Update React app environment variables for Amoy testnet
    - _Requirements: 2.2, 2.4_

- [ ] 3. Create Amoy-specific deployment script





  - [x] 3.1 Create scripts/deploy-amoy.js deployment script


    - Write deployment script specifically for Amoy testnet using Chain ID 80002
    - Include proper gas estimation and confirmation logic for Amoy network
    - Add balance checking and faucet guidance for Amoy testnet MATIC
    - _Requirements: 5.1, 5.3_

  - [x] 3.2 Add Amoy network validation and error handling


    - Implement network validation to ensure deployment targets Amoy (Chain ID 80002)
    - Add error handling for common Amoy deployment issues
    - Include deployer address validation for the provided MetaMask address
    - _Requirements: 1.2, 5.3_

- [x] 4. Update contract verification for Amoy PolygonScan





  - [x] 4.1 Update verification script for Amoy network


    - Modify scripts/verify.js to support Amoy PolygonScan verification
    - Update API endpoints and configuration for Amoy block explorer
    - _Requirements: 3.2, 5.2_

  - [x] 4.2 Update hardhat verification configuration


    - Add Amoy network configuration to etherscan verification settings
    - Configure proper API key handling for Amoy PolygonScan
    - _Requirements: 3.2, 5.2_

- [-] 5. Deploy Certificate contract to Amoy testnet





  - [ ] 5.1 Execute contract deployment on Amoy network








    - Run deployment script using the MetaMask address 0xc9519223859E1A9f6cd94B655Aa409A697F550b2
    - Verify successful deployment and contract functionality
    - Test basic contract operations (owner, authorization) on Amoy
    - _Requirements: 1.1, 1.2, 3.1, 3.4_

  - [ ] 5.2 Verify deployed contract on Amoy PolygonScan
    - Execute contract verification script for Amoy network
    - Confirm source code verification on Amoy block explorer
    - _Requirements: 3.2, 3.4_

- [ ] 6. Update contract address configuration across all services
  - [ ] 6.1 Update contract address files with Amoy deployment
    - Update root contract-addresses.json with new Amoy contract address
    - Update frontend/contract-addresses.json with Amoy deployment information
    - Update backend/contract-addresses.json with Amoy contract details
    - _Requirements: 1.3, 3.3_

  - [ ] 6.2 Update environment files with new contract address
    - Update root .env file with Amoy contract address
    - Update frontend .env files with new contract address
    - Update backend .env files with Amoy contract configuration
    - _Requirements: 1.3, 4.1, 4.2_

- [ ] 7. Update backend service for Amoy integration
  - [ ] 7.1 Update backend contract interaction configuration
    - Modify backend services to connect to Amoy-deployed contract
    - Update RPC endpoint configuration for Amoy network
    - Test backend API endpoints with Amoy contract
    - _Requirements: 4.1, 4.3_

  - [ ] 7.2 Update backend network validation and error handling
    - Implement Amoy network validation in backend services
    - Update error handling for Amoy-specific network issues
    - Test backend functionality with Amoy testnet
    - _Requirements: 4.1, 4.4_

- [ ] 8. Update frontend application for Amoy network
  - [ ] 8.1 Update frontend network configuration
    - Modify frontend to interact with Amoy network (Chain ID 80002)
    - Update MetaMask network switching logic for Amoy
    - Update contract interaction components for Amoy deployment
    - _Requirements: 4.2, 4.3_

  - [ ] 8.2 Update frontend UI for Amoy network display
    - Update network display information to show Amoy testnet
    - Update block explorer links to point to Amoy PolygonScan
    - Update faucet links and network guidance for Amoy
    - _Requirements: 4.2, 4.4_

- [ ] 9. Update deployment and utility scripts
  - [ ] 9.1 Update main deployment scripts to default to Amoy
    - Modify deploy-contract.js to use Amoy as default network
    - Update deployment status and verification scripts for Amoy
    - _Requirements: 5.1, 5.4_

  - [ ] 9.2 Update package.json scripts for Amoy deployment
    - Add npm scripts for Amoy deployment and verification
    - Update existing scripts to reference Amoy network
    - _Requirements: 5.1, 5.4_

- [ ] 10. Test complete system functionality on Amoy
  - [ ] 10.1 Test end-to-end certificate issuance workflow
    - Test complete certificate issuance process on Amoy network
    - Verify certificate verification functionality works on Amoy
    - Test QR code generation and verification with Amoy contract
    - _Requirements: 1.4, 4.4_

  - [ ] 10.2 Validate cross-service integration on Amoy
    - Test backend-frontend integration with Amoy deployment
    - Verify all services use consistent Amoy configuration
    - Test MetaMask integration and network switching to Amoy
    - _Requirements: 1.4, 4.4_