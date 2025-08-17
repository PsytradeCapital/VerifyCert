#!/usr/bin/env node

/**
 * Simple build script for Vercel deployment
 * Builds only the frontend without complex dependencies
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting VerifyCert frontend build...');

try {
  // Check if frontend directory exists
  if (!fs.existsSync('frontend')) {
    throw new Error('Frontend directory not found');
  }

  // Change to frontend directory and build
  process.chdir('frontend');
  
  console.log('📦 Installing frontend dependencies...');
  execSync('npm install --legacy-peer-deps', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  console.log('🔨 Building frontend...');
  execSync('npm run build', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Check if build was successful
  if (!fs.existsSync('build')) {
    throw new Error('Build failed - build directory not created');
  }

  console.log('✅ Frontend build completed successfully!');
  console.log('📁 Build output available in build/');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}