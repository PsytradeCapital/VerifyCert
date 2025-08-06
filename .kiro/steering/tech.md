# Technology Stack & Build System

## Core Technologies

### Smart Contracts
- **Solidity**: v0.8.19 with optimizer enabled (200 runs)
- **Hardhat**: Development environment and testing framework
- **OpenZeppelin**: ERC721, Ownable, and Counters contracts
- **Ethers.js**: Blockchain interaction library

### Backend (Node.js/Express)
- **Node.js**: Runtime environment
- **Express**: Web framework with CORS, Helmet, rate limiting
- **Ethers.js**: Smart contract interaction
- **Additional**: Joi validation, Nodemailer, QRCode generation, PM2 process management

### Frontend (React/TypeScript)
- **React**: v18.2.0 with TypeScript
- **TailwindCSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Ethers.js**: Web3 wallet integration
- **Additional**: React Hot Toast, Lucide React icons

### Testing & Quality
- **Smart Contracts**: Hardhat with Chai assertions
- **Backend**: Jest with Supertest
- **Frontend**: React Testing Library, Jest
- **E2E**: Cypress with MetaMask integration

## Common Commands

### Development Setup
```bash
npm run install:all          # Install all dependencies
npm run dev:all              # Start all services (node, backend, frontend)
```

### Smart Contract Development
```bash
npm run compile              # Compile contracts
npm test                     # Run contract tests
npm run deploy               # Deploy to Amoy testnet
npm run verify               # Verify contract on PolygonScan
```

### Backend Development
```bash
npm run backend:dev          # Start backend in development mode
cd backend && npm test       # Run backend tests
```

### Frontend Development
```bash
npm run frontend:dev         # Start React development server
cd frontend && npm test      # Run frontend tests
npm run test:e2e            # Run Cypress E2E tests
```

### Testing Suite
```bash
npm run test:all            # Run all tests (contracts, backend, frontend, e2e)
npm run test:ci             # CI-optimized test suite
```

## Environment Configuration

- Root `.env`: Blockchain RPC URLs, private keys, API URLs
- Backend `.env`: Port, SMTP config, CORS settings
- Frontend `.env`: API endpoints, contract addresses, network config
- All environments use Polygon Amoy testnet (Chain ID: 80002)

## Deployment Patterns

- **Smart Contracts**: Hardhat deployment scripts with verification
- **Backend**: PM2 process management or Docker containers
- **Frontend**: Vercel deployment with production builds
- **Integration**: Contract addresses automatically synced across services