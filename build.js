#!/usr/bin/env node

/**
 * Build script for Vercel deployment
 * Handles the frontend build process from root directory
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting VerifyCert build process...');

try {
  // Check if we're in the right directory
  if (!fs.existsSync('frontend')) {
    throw new Error('Frontend directory not found. Make sure you\'re in the project root.');
  }

  console.log('📦 Installing frontend dependencies...');
  execSync('npm install', { 
    cwd: 'frontend', 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  console.log('🔨 Building frontend...');
  execSync('npm run build', { 
    cwd: 'frontend', 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Check if build was successful
  if (!fs.existsSync('frontend/build')) {
    throw new Error('Build failed - frontend/build directory not created');
  }

  console.log('✅ Build completed successfully!');
  console.log('📁 Build output available in frontend/build/');

  // List build contents for verification
  const buildFiles = fs.readdirSync('frontend/build');
  console.log('📋 Build contents:', buildFiles.join(', '));

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}