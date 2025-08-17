#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Building without ESLint checks...');

try {
  process.chdir('frontend');
  
  // Build with ESLint disabled
  execSync('npx cross-env CI=false ESLINT_NO_DEV_ERRORS=true GENERATE_SOURCEMAP=false craco build', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      CI: 'false',
      ESLINT_NO_DEV_ERRORS: 'true',
      GENERATE_SOURCEMAP: 'false'
    }
  });
  
  console.log('✅ Build completed successfully!');
  console.log('🌐 Test with: npx serve -s build -l 3001');
  
} catch (error) {
  console.log('⚠️ CRACO failed, trying react-scripts...');
  
  try {
    execSync('npx cross-env CI=false ESLINT_NO_DEV_ERRORS=true react-scripts build', { 
      stdio: 'inherit',
      env: { 
        ...process.env, 
        CI: 'false',
        ESLINT_NO_DEV_ERRORS: 'true'
      }
    });
    console.log('✅ React-scripts build successful!');
  } catch (altError) {
    console.error('❌ Both builds failed');
    console.log('Try: npm install cross-env first');
    process.exit(1);
  }
}