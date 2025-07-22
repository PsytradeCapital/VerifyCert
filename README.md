# VerifyCert - Blockchain Certificate Verification System

A decentralized certificate verification system built on Polygon Mumbai that enables institutions to issue tamper-proof digital certificates as non-transferable NFTs.

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
├── hardhat.config.js      # Hardhat configuration
├── package.json           # Root package.json
└── .env.example           # Root environment template
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask wallet
- Polygon Mumbai testnet MATIC tokens

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

1. Deploy to Polygon Mumbai:
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
- **Blockchain Security**: Immutable certificate storage on Polygon Mumbai

## Technology Stack

- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin
- **Backend**: Node.js, Express, Ethers.js
- **Frontend**: React, TypeScript, TailwindCSS
- **Blockchain**: Polygon Mumbai Testnet
- **Testing**: Jest, Chai, React Testing Library

## License

MIT License