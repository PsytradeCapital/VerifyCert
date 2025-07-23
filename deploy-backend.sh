#!/bin/bash
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