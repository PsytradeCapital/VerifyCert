#!/usr/bin/env node

/**
 * Test build after React import fixes
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🧪 Testing build after React import fixes...');

try {
  // Change to frontend directory
  process.chdir('frontend');
  
  console.log('🔨 Building with CRACO...');
  execSync('npx craco build', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Check if build was successful
  if (fs.existsSync('build')) {
    console.log('✅ Build successful! React import fixes worked.');
    console.log('📁 Build directory created successfully.');
  } else {
    throw new Error('Build directory not found');
  }

} catch (error) {
  console.error('❌ Build still failing:', error.message);
  console.log('\n🔧 Try running:');
  console.log('cd frontend');
  console.log('npx craco build');
  process.exit(1);
}