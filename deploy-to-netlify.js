const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Preparing for Netlify deployment...');

try {
  process.chdir('frontend');
  
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('🔨 Building...');
  execSync('npm run build:no-lint', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      CI: 'false',
      ESLINT_NO_DEV_ERRORS: 'true'
    }
  });
  
  console.log('✅ Build ready for deployment!');
  console.log('📁 Drag the "build" folder to Netlify');
  console.log('🧪 Test: npx serve -s build -l 3001');
  
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}