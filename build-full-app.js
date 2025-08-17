const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Building full VerifyCert app...');

try {
  process.chdir('frontend');
  
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('🔨 Building...');
  execSync('set "CI=false" && set "GENERATE_SOURCEMAP=false" && craco build', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      CI: 'false',
      GENERATE_SOURCEMAP: 'false',
      ESLINT_NO_DEV_ERRORS: 'true'
    }
  });
  
  console.log('✅ Build completed!');
  console.log('🌐 Test: npx serve -s build -l 3001');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.log('Try: node build-no-lint.js');
  process.exit(1);
}