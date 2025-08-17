# VerifyCert - Blockchain Certificate Verification System

A decentralized certificate verification system built on Polygon Amoy that enables institutions to issue tamper-proof digital certificates as non-transferable NFTs.

## Project Structure

```
verify-cert/
├── contracts/              # Smart contracts
│   └── Certificate.sol     # Main certificate contract
├── backend/                # Node.js/Express API
│   ├── src/               # Source code
│   ├── package.json       # Backend dependencies
│   └── .env.example       # Backend environment template
├── frontend/              # React frontend
│   ├── src/               # React source code
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   └── .env.example       # Frontend environment template
├── scripts/               # Deployment scripts
│   └── deploy.js          # Contract deployment script
├── test/                  # Smart contract tests
│   └── Certificate.test.js
├── docs/                  # Documentation
│   ├── EULA.md           # End User License Agreement
│   ├── specifications.md # Complete testing specifications
│   └── demo-guide.md     # Judge evaluation guide
├── hardhat.config.js      # Hardhat configuration
├── package.json           # Root package.json
└── .env.example           # Root environment template
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask wallet
- Polygon Amoy testnet MATIC tokens

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

4. Fill in your environment variables in the `.env` files

### Development

1. Start the backend server:
   ```bash
   npm run backend:dev
   ```

2. Start the frontend development server:
   ```bash
   npm run frontend:dev
   ```

3. Compile smart contracts:
   ```bash
   npm run compile
   ```

4. Run tests:
   ```bash
   npm test
   ```

### Deployment

1. Deploy to Polygon Amoy:
   ```bash
   npm run deploy
   ```

2. Verify contract on PolygonScan:
   ```bash
   npm run verify
   ```

## Features

- **Certificate Issuance**: Authorized institutions can mint non-transferable certificate NFTs
- **Public Verification**: Anyone can verify certificate authenticity via QR codes or links
- **Issuer Dashboard**: Manage certificate issuance and view issued certificates
- **Responsive Design**: Works on desktop and mobile devices
- **Blockchain Security**: Immutable certificate storage on Polygon Amoy
- **Demo Mode**: Immediate access for judges without full account creation
- **Authentication System**: Secure user registration with email/phone verification

## Technology Stack

- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin
- **Backend**: Node.js, Express, Ethers.js
- **Frontend**: React, TypeScript, TailwindCSS
- **Blockchain**: Polygon Amoy Testnet
- **Testing**: Jest, Chai, React Testing Library

## Documentation

- **[EULA](docs/EULA.md)**: End User License Agreement with blockchain-specific terms
- **[Specifications](docs/specifications.md)**: Comprehensive testing and validation guide
- **[Demo Guide](docs/demo-guide.md)**: Quick evaluation guide for judges

## Quick Demo for Judges

1. Visit the VerifyCert platform
2. Connect your MetaMask wallet (any network)
3. Access the dashboard immediately after wallet connection
4. Explore all features with sample data
5. Test certificate creation and verification

See the [Demo Guide](docs/demo-guide.md) for detailed evaluation instructions.

## License

MIT License