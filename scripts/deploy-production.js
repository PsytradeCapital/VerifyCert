const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Production deployment script for VerifyCert
async function main() {
  console.log("🚀 VerifyCert Production Deployment");
  console.log("=".repeat(60));

  // Check if contract is deployed
  if (!fs.existsSync('./contract-addresses.json')) {
    console.error("❌ Smart contract not deployed. Run 'npm run deploy' first.");
    process.exit(1);
  }

  const contractInfo = JSON.parse(fs.readFileSync('./contract-addresses.json', 'utf8'));
  console.log(`📋 Using contract: ${contractInfo.contractAddress}`);
  console.log(`   Network: ${contractInfo.network}`);
  console.log(`   Deployed: ${contractInfo.deployedAt}`);

  // Step 1: Prepare Backend Deployment
  console.log("\n🔧 Preparing Backend Deployment...");
  
  // Create production environment file for backend
  const backendEnvProduction = `# Production Environment - Auto-generated
NODE_ENV=production
PORT=3001

# Blockchain Configuration
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=\${PRIVATE_KEY}
CONTRACT_ADDRESS=${contractInfo.contractAddress}

# Email Configuration (SMTP)
SMTP_HOST=\${SMTP_HOST}
SMTP_PORT=\${SMTP_PORT}
SMTP_SECURE=\${SMTP_SECURE}
SMTP_USER=\${SMTP_USER}
SMTP_PASS=\${SMTP_PASS}

# Email Sender Information
FROM_NAME=VerifyCert
FROM_EMAIL=\${FROM_EMAIL}

# CORS Configuration
FRONTEND_URL=\${FRONTEND_URL}

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Deployment Info
DEPLOYED_AT=${new Date().toISOString()}
CONTRACT_NETWORK=${contractInfo.network}
CONTRACT_CHAIN_ID=${contractInfo.chainId}
`;

  fs.writeFileSync('./backend/.env.production', backendEnvProduction);
  console.log("✅ Created backend/.env.production");

  // Create Docker deployment configuration
  const dockerComposeProduction = `version: '3.8'

services:
  verify-cert-backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: verify-cert-backend
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
      - CONTRACT_ADDRESS=${contractInfo.contractAddress}
      - PRIVATE_KEY=\${PRIVATE_KEY}
      - SMTP_HOST=\${SMTP_HOST}
      - SMTP_PORT=\${SMTP_PORT}
      - SMTP_SECURE=\${SMTP_SECURE}
      - SMTP_USER=\${SMTP_USER}
      - SMTP_PASS=\${SMTP_PASS}
      - FROM_NAME=VerifyCert
      - FROM_EMAIL=\${FROM_EMAIL}
      - FRONTEND_URL=\${FRONTEND_URL}
    volumes:
      - ./backend/logs:/app/logs
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - verify-cert-network

networks:
  verify-cert-network:
    driver: bridge
`;

  fs.writeFileSync('./docker-compose.production.yml', dockerComposeProduction);
  console.log("✅ Created docker-compose.production.yml");

  // Step 2: Prepare Frontend Deployment
  console.log("\n🎨 Preparing Frontend Deployment...");

  // Create frontend environment file
  const frontendEnvProduction = `# Frontend Production Environment - Auto-generated
REACT_APP_API_URL=https://api.verifycert.com
REACT_APP_CONTRACT_ADDRESS=${contractInfo.contractAddress}
REACT_APP_POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
REACT_APP_CHAIN_ID=${contractInfo.chainId}
REACT_APP_NETWORK_NAME=${contractInfo.network}
REACT_APP_NODE_ENV=production

# Deployment Info
REACT_APP_DEPLOYED_AT=${new Date().toISOString()}
REACT_APP_CONTRACT_NETWORK=${contractInfo.network}
`;

  fs.writeFileSync('./frontend/.env.production', frontendEnvProduction);
  console.log("✅ Created frontend/.env.production");

  // Update Vercel configuration with actual values
  const vercelConfig = {
    "version": 2,
    "name": "verify-cert-frontend",
    "builds": [
      {
        "src": "package.json",
        "use": "@vercel/static-build",
        "config": {
          "distDir": "build"
        }
      }
    ],
    "routes": [
      {
        "src": "/static/(.*)",
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      {
        "src": "/(.*)",
        "dest": "/index.html"
      }
    ],
    "env": {
      "REACT_APP_API_URL": "https://api.verifycert.com",
      "REACT_APP_CONTRACT_ADDRESS": contractInfo.contractAddress,
      "REACT_APP_POLYGON_MUMBAI_RPC_URL": "https://rpc-mumbai.maticvigil.com",
      "REACT_APP_CHAIN_ID": contractInfo.chainId.toString(),
      "REACT_APP_NETWORK_NAME": contractInfo.network
    },
    "build": {
      "env": {
        "REACT_APP_API_URL": "https://api.verifycert.com",
        "REACT_APP_CONTRACT_ADDRESS": contractInfo.contractAddress,
        "REACT_APP_POLYGON_MUMBAI_RPC_URL": "https://rpc-mumbai.maticvigil.com",
        "REACT_APP_CHAIN_ID": contractInfo.chainId.toString(),
        "REACT_APP_NETWORK_NAME": contractInfo.network
      }
    },
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          },
          {
            "key": "Referrer-Policy",
            "value": "strict-origin-when-cross-origin"
          },
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://rpc-mumbai.maticvigil.com https://mumbai.polygonscan.com wss://rpc-mumbai.maticvigil.com https://api.verifycert.com;"
          }
        ]
      }
    ]
  };

  fs.writeFileSync('./frontend/vercel.json', JSON.stringify(vercelConfig, null, 2));
  console.log("✅ Updated frontend/vercel.json with production config");

  // Step 3: Create deployment scripts
  console.log("\n📝 Creating Deployment Scripts...");

  // Backend deployment script
  const backendDeployScript = `#!/bin/bash
# Backend Deployment Script

echo "🚀 Deploying VerifyCert Backend..."

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "📦 Using Docker deployment..."
    
    # Build and start with Docker Compose
    docker-compose -f docker-compose.production.yml up -d --build
    
    echo "✅ Backend deployed with Docker"
    echo "🔍 Check status: docker-compose -f docker-compose.production.yml ps"
    echo "📋 View logs: docker-compose -f docker-compose.production.yml logs -f"
    
elif command -v pm2 &> /dev/null; then
    echo "⚡ Using PM2 deployment..."
    
    # Install dependencies
    cd backend
    npm ci --only=production
    
    # Start with PM2
    pm2 start ecosystem.config.js --env production
    
    echo "✅ Backend deployed with PM2"
    echo "🔍 Check status: pm2 status"
    echo "📋 View logs: pm2 logs verify-cert-backend"
    
else
    echo "🔧 Using Node.js deployment..."
    
    # Install dependencies
    cd backend
    npm ci --only=production
    
    # Start application
    NODE_ENV=production npm start
    
    echo "✅ Backend started with Node.js"
fi
`;

  fs.writeFileSync('./deploy-backend.sh', backendDeployScript);
  console.log("✅ Created deploy-backend.sh");

  // Frontend deployment script
  const frontendDeployScript = `#!/bin/bash
# Frontend Deployment Script

echo "🎨 Deploying VerifyCert Frontend..."

cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build for production
echo "🔨 Building for production..."
REACT_APP_NODE_ENV=production npm run build

# Check if Vercel CLI is available
if command -v vercel &> /dev/null; then
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    
    echo "✅ Frontend deployed to Vercel"
    
else
    echo "📦 Vercel CLI not found. Install with: npm i -g vercel"
    echo "💡 Alternative: Upload build folder to your hosting provider"
    echo "📁 Build files are in: frontend/build/"
fi
`;

  fs.writeFileSync('./deploy-frontend.sh', frontendDeployScript);
  console.log("✅ Created deploy-frontend.sh");

  // Make scripts executable (on Unix systems)
  try {
    execSync('chmod +x deploy-backend.sh deploy-frontend.sh', { stdio: 'ignore' });
  } catch (error) {
    // Ignore on Windows
  }

  // Step 4: Create deployment documentation
  console.log("\n📚 Creating Deployment Documentation...");

  const deploymentDoc = `# Production Deployment Guide

## Overview

This guide covers deploying the VerifyCert application to production environments.

## Prerequisites

- Smart contract deployed to Polygon Mumbai
- Domain names configured (api.verifycert.com, verifycert.com)
- SSL certificates set up
- Environment variables configured

## Backend Deployment Options

### Option 1: Docker Deployment (Recommended)

\`\`\`bash
# Deploy with Docker Compose
docker-compose -f docker-compose.production.yml up -d --build

# Check status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f
\`\`\`

### Option 2: PM2 Deployment

\`\`\`bash
cd backend
npm ci --only=production
pm2 start ecosystem.config.js --env production
\`\`\`

### Option 3: Direct Node.js

\`\`\`bash
cd backend
npm ci --only=production
NODE_ENV=production npm start
\`\`\`

## Frontend Deployment

### Vercel Deployment (Recommended)

\`\`\`bash
cd frontend
npm ci
npm run build
vercel --prod
\`\`\`

### Alternative Hosting

Build the frontend and upload to your hosting provider:

\`\`\`bash
cd frontend
npm ci
REACT_APP_NODE_ENV=production npm run build
# Upload contents of build/ folder to your web server
\`\`\`

## Environment Variables

### Backend Environment Variables

Set these in your production environment:

\`\`\`bash
PRIVATE_KEY=your_wallet_private_key
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@domain.com
SMTP_PASS=your_email_password
FROM_EMAIL=noreply@verifycert.com
FRONTEND_URL=https://verifycert.com
\`\`\`

### Frontend Environment Variables

These are built into the application:

- REACT_APP_API_URL: ${vercelConfig.env.REACT_APP_API_URL}
- REACT_APP_CONTRACT_ADDRESS: ${vercelConfig.env.REACT_APP_CONTRACT_ADDRESS}
- REACT_APP_POLYGON_MUMBAI_RPC_URL: ${vercelConfig.env.REACT_APP_POLYGON_MUMBAI_RPC_URL}

## Security Configuration

### CORS Setup

Backend is configured to accept requests from:
- Production frontend URL
- Development localhost (in dev mode)

### Security Headers

Frontend includes security headers:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- XSS Protection

## Monitoring and Maintenance

### Health Checks

Backend includes health check endpoint: \`GET /health\`

### Logging

- Docker: Use \`docker-compose logs\`
- PM2: Use \`pm2 logs\`
- Direct: Logs to console

### Updates

1. Update code repository
2. Rebuild and redeploy backend
3. Rebuild and redeploy frontend
4. Test functionality

## Troubleshooting

### Common Issues

1. **Contract Connection Issues**
   - Verify contract address is correct
   - Check RPC URL is accessible
   - Ensure private key has proper format

2. **CORS Errors**
   - Verify FRONTEND_URL environment variable
   - Check domain configuration

3. **Email Issues**
   - Verify SMTP credentials
   - Check firewall settings
   - Test email configuration

### Rollback Procedure

1. **Backend Rollback**
   \`\`\`bash
   # Docker
   docker-compose -f docker-compose.production.yml down
   # Deploy previous version
   
   # PM2
   pm2 stop verify-cert-backend
   # Deploy previous version
   pm2 start ecosystem.config.js --env production
   \`\`\`

2. **Frontend Rollback**
   \`\`\`bash
   # Vercel
   vercel rollback
   \`\`\`

## Performance Optimization

### Backend Optimization

- Use PM2 cluster mode for multiple instances
- Configure proper memory limits
- Set up load balancing if needed

### Frontend Optimization

- Static assets are cached for 1 year
- Gzip compression enabled
- CDN distribution via Vercel

## Deployment Checklist

- [ ] Smart contract deployed and verified
- [ ] Environment variables configured
- [ ] Domain names pointing to correct servers
- [ ] SSL certificates installed
- [ ] Backend deployed and responding
- [ ] Frontend deployed and accessible
- [ ] Email functionality tested
- [ ] Certificate minting tested
- [ ] Certificate verification tested
- [ ] Monitoring set up
- [ ] Backup procedures in place

## Support

For deployment issues:
- Check application logs
- Verify environment configuration
- Test individual components
- Review network connectivity
`;

  fs.writeFileSync('./PRODUCTION_DEPLOYMENT.md', deploymentDoc);
  console.log("✅ Created PRODUCTION_DEPLOYMENT.md");

  // Step 5: Create deployment summary
  const deploymentSummary = {
    timestamp: new Date().toISOString(),
    contract: {
      address: contractInfo.contractAddress,
      network: contractInfo.network,
      chainId: contractInfo.chainId
    },
    backend: {
      deploymentOptions: ['Docker', 'PM2', 'Node.js'],
      port: 3001,
      healthCheck: '/health',
      configFiles: [
        'backend/.env.production',
        'docker-compose.production.yml',
        'backend/ecosystem.config.js'
      ]
    },
    frontend: {
      platform: 'Vercel',
      buildCommand: 'npm run build',
      outputDirectory: 'build',
      configFiles: [
        'frontend/.env.production',
        'frontend/vercel.json'
      ]
    },
    scripts: [
      'deploy-backend.sh',
      'deploy-frontend.sh'
    ],
    documentation: [
      'PRODUCTION_DEPLOYMENT.md'
    ]
  };

  fs.writeFileSync('./DEPLOYMENT_SUMMARY.md', `# Deployment Summary

Generated: ${deploymentSummary.timestamp}

## Smart Contract
- Address: ${deploymentSummary.contract.address}
- Network: ${deploymentSummary.contract.network}
- Chain ID: ${deploymentSummary.contract.chainId}

## Backend Deployment
- Options: ${deploymentSummary.backend.deploymentOptions.join(', ')}
- Port: ${deploymentSummary.backend.port}
- Health Check: ${deploymentSummary.backend.healthCheck}

## Frontend Deployment
- Platform: ${deploymentSummary.frontend.platform}
- Build Command: ${deploymentSummary.frontend.buildCommand}
- Output Directory: ${deploymentSummary.frontend.outputDirectory}

## Generated Files
### Configuration Files
${deploymentSummary.backend.configFiles.concat(deploymentSummary.frontend.configFiles).map(f => `- ${f}`).join('\n')}

### Deployment Scripts
${deploymentSummary.scripts.map(f => `- ${f}`).join('\n')}

### Documentation
${deploymentSummary.documentation.map(f => `- ${f}`).join('\n')}

## Quick Start

### Deploy Backend
\`\`\`bash
# Option 1: Docker
docker-compose -f docker-compose.production.yml up -d --build

# Option 2: PM2
cd backend && pm2 start ecosystem.config.js --env production

# Option 3: Node.js
cd backend && NODE_ENV=production npm start
\`\`\`

### Deploy Frontend
\`\`\`bash
cd frontend
npm run build
vercel --prod
\`\`\`

## Environment Variables Required

### Backend
- PRIVATE_KEY
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
- FROM_EMAIL
- FRONTEND_URL

### Frontend
Environment variables are built into the application during build time.

## Next Steps
1. Configure environment variables
2. Set up domain names and SSL
3. Run deployment scripts
4. Test functionality
5. Set up monitoring
`);

  console.log("✅ Created DEPLOYMENT_SUMMARY.md");

  // Final summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 PRODUCTION DEPLOYMENT PREPARATION COMPLETE!");
  console.log("=".repeat(60));
  console.log("📋 Generated Files:");
  console.log("   ✅ backend/.env.production");
  console.log("   ✅ frontend/.env.production");
  console.log("   ✅ docker-compose.production.yml");
  console.log("   ✅ frontend/vercel.json (updated)");
  console.log("   ✅ deploy-backend.sh");
  console.log("   ✅ deploy-frontend.sh");
  console.log("   ✅ PRODUCTION_DEPLOYMENT.md");
  console.log("   ✅ DEPLOYMENT_SUMMARY.md");
  
  console.log("\n🚀 Next Steps:");
  console.log("1. Configure environment variables");
  console.log("2. Set up domain names and SSL certificates");
  console.log("3. Run deployment scripts:");
  console.log("   - Backend: ./deploy-backend.sh");
  console.log("   - Frontend: ./deploy-frontend.sh");
  console.log("4. Test deployed application");
  console.log("5. Set up monitoring and alerts");
  
  console.log("\n📚 Documentation:");
  console.log("- Read PRODUCTION_DEPLOYMENT.md for detailed instructions");
  console.log("- Check DEPLOYMENT_SUMMARY.md for quick reference");
  
  console.log("\n✅ Production deployment configuration completed!");
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment preparation failed:", error);
      process.exit(1);
    });
}

module.exports = main;