# VerifyCert Quick Start Guide

Get your VerifyCert certificate verification system up and running in minutes!

## 🚀 Quick Start (Recommended)

Run the automated setup script:

```bash
npm run quick-start
```

This script will:
- ✅ Check prerequisites (Node.js, npm)
- ✅ Set up environment files
- ✅ Install all dependencies
- ✅ Check contract deployment
- ✅ Start all services

## 📋 Manual Setup

If you prefer to set up manually:

### 1. Prerequisites

- Node.js 16+ and npm 8+
- Git
- A Polygon Amoy testnet wallet with MATIC tokens

### 2. Environment Setup

```bash
# Clone and install
git clone <repository-url>
cd verify-cert
npm run install:all

# Set up environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Configure Environment Variables

Edit `.env`:
```env
PRIVATE_KEY=your_wallet_private_key_here
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology/
```

Edit `backend/.env`:
```env
PORT=5000
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology/
PRIVATE_KEY=your_wallet_private_key_here
```

Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Deploy Smart Contracts

```bash
npm run deploy:amoy
```

### 5. Start Services

```bash
# Terminal 1: Backend API
npm run backend:dev

# Terminal 2: Frontend App
npm run frontend:dev
```

## 🔍 Verify Installation

1. **Check Services**:
   - Backend: http://localhost:5000/api/verify-certificate/status
   - Frontend: http://localhost:3000

2. **Run Integration Test**:
   ```bash
   npm run test:certificate-integration
   ```

3. **Test Certificate Verification**:
   - Visit: http://localhost:3000/verify
   - Enter a certificate ID to test

## 📖 System Overview

### Core Components

- **Smart Contract**: ERC721 non-transferable certificate NFTs on Polygon Amoy
- **Backend API**: Express.js server with certificate minting and verification
- **Frontend App**: React application for certificate verification

### Key Features

- 🔐 **Secure**: Blockchain-based certificate storage
- 🚫 **Non-transferable**: Certificates cannot be transferred between wallets
- ✅ **Verifiable**: Public verification without revealing private data
- 📱 **Responsive**: Works on desktop and mobile devices
- 🔄 **Real-time**: Instant verification against blockchain

## 🛠️ Development Commands

```bash
# Install dependencies
npm run install:all

# Start development servers
npm run dev:all

# Run tests
npm run test:all
npm run test:certificate-integration

# Deploy contracts
npm run deploy:amoy
npm run verify:amoy

# Build for production
cd frontend && npm run build
cd backend && npm run build
```

## 📚 API Endpoints

### Certificate Verification
- `GET /api/verify-certificate/:id` - Verify certificate by ID
- `GET /api/verify-certificate/status` - Service status

### Certificate Minting (Authorized wallets only)
- `POST /api/mint-certificate` - Issue new certificate
- `GET /api/mint-certificate/status` - Minting service status

## 🔧 Troubleshooting

### Common Issues

1. **"Contract not initialized"**
   - Check if contracts are deployed: `cat contract-addresses.json`
   - Deploy contracts: `npm run deploy:amoy`

2. **"Unauthorized issuer"**
   - Your wallet needs to be authorized to mint certificates
   - Contact the contract owner to add your wallet as an authorized issuer

3. **Services not starting**
   - Check if ports 3000 and 5000 are available
   - Check environment variables are set correctly

4. **Network connection issues**
   - Verify Polygon Amoy RPC URL is working
   - Check your internet connection

### Debug Commands

```bash
# Check contract deployment status
npm run deployment-status

# Test certificate workflow
node scripts/test-certificate-workflow.js

# Verify deployment
node scripts/verify-deployment.js
```

## 🌐 Network Information

- **Network**: Polygon Amoy Testnet
- **Chain ID**: 80002
- **RPC URL**: https://rpc-amoy.polygon.technology/
- **Explorer**: https://amoy.polygonscan.com/
- **Faucet**: https://faucet.polygon.technology/

## 📞 Support

- **Documentation**: See `CERTIFICATE_SYSTEM_INTEGRATION.md` for detailed integration guide
- **Issues**: Check troubleshooting section above
- **Testing**: Run `npm run test:certificate-integration` to diagnose issues

## 🎯 Next Steps

1. **Authorize Issuers**: Add wallet addresses that can mint certificates
2. **Customize Frontend**: Modify the UI to match your branding
3. **Add Features**: Implement additional certificate types or metadata
4. **Deploy Production**: Set up production deployment on your preferred platform

---

**Happy certifying! 🎓**