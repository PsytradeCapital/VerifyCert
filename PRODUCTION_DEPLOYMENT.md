# Production Deployment Guide

This document provides comprehensive instructions for deploying the VerifyCert application to production environments.

## Overview

VerifyCert is deployed as a three-tier application:
1. **Smart Contract**: Deployed on Polygon Mumbai testnet
2. **Backend API**: Node.js/Express server for blockchain interaction
3. **Frontend**: React application deployed on Vercel

## Prerequisites

### Required Infrastructure
- Smart contract deployed to Polygon Mumbai
- Domain names configured (api.verifycert.com, verifycert.com)
- SSL certificates set up
- Email SMTP service configured

### Required Tools
- Docker (recommended for backend)
- Node.js 18+ and npm
- Vercel CLI (for frontend deployment)
- PM2 (alternative backend deployment)

## Smart Contract Deployment

The smart contract should already be deployed. Verify deployment:

```bash
# Check deployment status
npm run deployment-status

# Contract details
Contract Address: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4
Network: mumbai
Chain ID: 80001
```

## Backend Deployment Options

### Option 1: Docker Deployment (Recommended)

**Advantages**: Isolated environment, easy scaling, consistent deployment

```bash
# Deploy with Docker Compose
docker-compose -f docker-compose.production.yml up -d --build

# Check status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f verify-cert-backend

# Stop deployment
docker-compose -f docker-compose.production.yml down
```

### Option 2: PM2 Deployment

**Advantages**: Process management, clustering, monitoring

```bash
cd backend
npm ci --only=production
pm2 start ecosystem.config.js --env production

# Management commands
pm2 status
pm2 logs verify-cert-backend
pm2 restart verify-cert-backend
pm2 stop verify-cert-backend
```

### Option 3: Direct Node.js

**Advantages**: Simple deployment, direct control

```bash
cd backend
npm ci --only=production
NODE_ENV=production npm start
```

## Frontend Deployment

### Vercel Deployment (Recommended)

**Advantages**: CDN, automatic SSL, easy deployment

```bash
cd frontend
npm ci
npm run build
vercel --prod
```

### Alternative Static Hosting

Build and upload to any static hosting provider:

```bash
cd frontend
npm ci
REACT_APP_NODE_ENV=production npm run build
# Upload contents of build/ folder to your web server
```

## Environment Variables

### Backend Environment Variables

**Required Production Variables**:
```bash
# Blockchain
PRIVATE_KEY=your_wallet_private_key_without_0x
CONTRACT_ADDRESS=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@domain.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@verifycert.com

# CORS
FRONTEND_URL=https://verifycert.com
```

### Frontend Environment Variables

**Built into application during build**:
- `REACT_APP_API_URL`: https://api.verifycert.com
- `REACT_APP_CONTRACT_ADDRESS`: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4
- `REACT_APP_POLYGON_MUMBAI_RPC_URL`: https://rpc-mumbai.maticvigil.com
- `REACT_APP_CHAIN_ID`: 80001
- `REACT_APP_NETWORK_NAME`: mumbai

## Security Configuration

### Backend Security

1. **CORS Configuration**
   - Accepts requests from production frontend URL
   - Rejects unauthorized origins

2. **Rate Limiting**
   - 100 requests per 15 minutes per IP
   - Configurable via environment variables

3. **Input Validation**
   - Joi schema validation on all endpoints
   - Sanitization of user inputs

### Frontend Security

1. **Content Security Policy**
   - Restricts script sources
   - Allows connections to blockchain RPC and API

2. **Security Headers**
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection: enabled

## Deployment Scripts

### Automated Deployment

Use the provided deployment scripts:

```bash
# Deploy backend
./deploy-backend.sh

# Deploy frontend  
./deploy-frontend.sh

# Verify deployment
node scripts/verify-deployment.js
```

## Deployment Checklist

### Pre-deployment
- [ ] Smart contract deployed and verified
- [ ] Environment variables configured
- [ ] Domain names configured with DNS
- [ ] SSL certificates installed
- [ ] SMTP service configured and tested

### Deployment
- [ ] Backend deployed and responding to health checks
- [ ] Frontend deployed and accessible
- [ ] API endpoints responding correctly

### Post-deployment Testing
- [ ] Email functionality tested
- [ ] Certificate minting tested
- [ ] Certificate verification tested
- [ ] Wallet connection tested
- [ ] Error handling tested

### Monitoring Setup
- [ ] Health check monitoring configured
- [ ] Log aggregation set up
- [ ] Error alerting configured
- [ ] Performance monitoring enabled
- [ ] Backup procedures in place

## Support and Maintenance

For deployment issues:
- Check application logs
- Verify environment configuration
- Test individual components
- Review network connectivity