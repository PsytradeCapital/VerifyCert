#!/bin/bash
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