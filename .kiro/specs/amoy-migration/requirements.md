# Requirements Document

## Introduction

This feature involves migrating the VerifyCert system from Polygon Mumbai testnet to Polygon Amoy testnet. The migration is necessary because Polygon Mumbai testnet is being deprecated, and Amoy is the new official testnet for Polygon. The migration will involve updating network configurations, redeploying smart contracts, and updating all related configuration files to use the new testnet with the user's MetaMask address `0xc9519223859E1A9f6cd94B655Aa409A697F550b2`.

## Requirements

### Requirement 1

**User Story:** As a developer, I want to migrate the VerifyCert system from Polygon Mumbai to Polygon Amoy testnet, so that the system continues to work on a supported testnet.

#### Acceptance Criteria

1. WHEN the migration is initiated THEN the system SHALL update all network configurations to use Polygon Amoy testnet (Chain ID: 80002)
2. WHEN smart contracts are redeployed THEN they SHALL be deployed to Polygon Amoy testnet using the provided MetaMask address
3. WHEN the deployment is complete THEN all contract addresses SHALL be updated across all services (backend, frontend, root)
4. WHEN the migration is complete THEN the system SHALL maintain all existing functionality on the new network

### Requirement 2

**User Story:** As a developer, I want all configuration files updated for Amoy testnet, so that the entire system points to the correct network.

#### Acceptance Criteria

1. WHEN configuration files are updated THEN hardhat.config.js SHALL include Amoy network configuration with correct RPC URL and Chain ID
2. WHEN deployment configuration is updated THEN deployment-config.json SHALL contain Amoy network details
3. WHEN environment files are updated THEN all .env.example files SHALL reference Amoy RPC URLs and explorer URLs
4. WHEN the update is complete THEN all services SHALL use consistent Amoy network configuration

### Requirement 3

**User Story:** As a developer, I want the smart contract redeployed on Amoy testnet, so that the certificate system works on the new network.

#### Acceptance Criteria

1. WHEN the contract is deployed THEN it SHALL be deployed using the MetaMask address 0xc9519223859E1A9f6cd94B655Aa409A697F550b2
2. WHEN deployment is successful THEN the contract SHALL be verified on Amoy PolygonScan
3. WHEN deployment completes THEN contract-addresses.json files SHALL be updated with new Amoy contract address
4. WHEN the deployment is verified THEN the system SHALL confirm all contract functionality works on Amoy

### Requirement 4

**User Story:** As a developer, I want all services (backend and frontend) updated to use the new Amoy deployment, so that the entire application works seamlessly.

#### Acceptance Criteria

1. WHEN backend configuration is updated THEN it SHALL connect to the Amoy-deployed contract
2. WHEN frontend configuration is updated THEN it SHALL interact with the Amoy network and contract
3. WHEN services are updated THEN they SHALL use the correct Amoy RPC endpoints
4. WHEN the migration is complete THEN end-to-end functionality SHALL work on Amoy testnet

### Requirement 5

**User Story:** As a developer, I want deployment scripts updated for Amoy testnet, so that future deployments use the correct network.

#### Acceptance Criteria

1. WHEN deployment scripts are updated THEN they SHALL target Amoy testnet by default
2. WHEN verification scripts are updated THEN they SHALL use Amoy PolygonScan for contract verification
3. WHEN scripts are executed THEN they SHALL successfully deploy and verify contracts on Amoy
4. WHEN the update is complete THEN all deployment documentation SHALL reflect Amoy network usage