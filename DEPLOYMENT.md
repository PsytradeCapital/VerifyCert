# Deployment Guide for VerifyCert

## Prerequisites

1. **Node.js and npm** installed
2. **MetaMask wallet** with some MATIC tokens on Polygon Mumbai
3. **PolygonScan API key** (optional, for contract verification)

## Environment Setup

1. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your environment variables in `.env`:
   ```bash
   # Blockchain Configuration
   POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
   PRIVATE_KEY=your_private_key_here
   POLYGONSCAN_API_KEY=your_polygonscan_api_key
   ```

   **⚠️ Security Note:** Never commit your `.env` file or share your private key!

## Getting Test MATIC

1. Visit the [Polygon Faucet](https://faucet.polygon.technology/)
2. Enter your wallet address
3. Request test MATIC tokens
4. Wait for the transaction to confirm

## Deployment Steps

### Step 1: Pre-deployment Check
```bash
npm run pre-deploy
```
This will verify:
- Environment variables are set
- Network connection is working
- Account has sufficient balance
- Contract compiles successfully

### Step 2: Deploy Contract
```bash
npm run deploy
```
This will:
- Deploy the Certificate contract to Polygon Mumbai
- Save contract addresses to `contract-addresses.json`
- Test basic contract functionality
- Display deployment summary

### Step 3: Verify Contract (Optional)
```bash
npm run verify
```
This will verify the contract source code on PolygonScan.

## Post-Deployment

After successful deployment, you'll have:

1. **Contract Address**: Saved in `contract-addresses.json`
2. **Verified Contract**: Viewable on [Mumbai PolygonScan](https://mumbai.polygonscan.com)
3. **Ready for Integration**: Frontend and backend can now use the deployed contract

## Configuration Files Generated

- `contract-addresses.json` - Contains deployed contract addresses
- `frontend/contract-addresses.json` - Copy for React app
- `backend/contract-addresses.json` - Copy for API server

## Troubleshooting

### Common Issues

1. **"Insufficient funds" error**
   - Get more test MATIC from the faucet
   - Check your wallet balance

2. **"Network connection failed"**
   - Check your RPC URL in `.env`
   - Try alternative RPC endpoints

3. **"Contract verification failed"**
   - Ensure POLYGONSCAN_API_KEY is set
   - Wait a few minutes and try again

### Network Information

- **Network Name**: Polygon Mumbai
- **Chain ID**: 80001
- **RPC URL**: https://rpc-mumbai.maticvigil.com
- **Block Explorer**: https://mumbai.polygonscan.com
- **Faucet**: https://faucet.polygon.technology/

## Next Steps

After deployment:
1. Update frontend environment variables with contract address
2. Update backend configuration
3. Test the complete application flow
4. Deploy frontend and backend to production