#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 Quick build fix...');

try {
  process.chdir('frontend');
  
  console.log('📦 Installing cross-env...');
  execSync('npm install --save-dev cross-env', { stdio: 'inherit' });
  
  console.log('🔨 Building...');
  execSync('npx cross-env CI=false GENERATE_SOURCEMAP=false craco build', { 
    stdio: 'inherit',
    env: { ...process.env, CI: 'false', GENERATE_SOURCEMAP: 'false' }
  });
  
  console.log('✅ Build completed!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}