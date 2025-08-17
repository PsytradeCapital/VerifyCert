const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Building for production...');

try {
  if (fs.existsSync('frontend/build')) {
    fs.rmSync('frontend/build', { recursive: true, force: true });
  }
  
  console.log('🔨 Building...');
  execSync('cd frontend && npx react-scripts build', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      CI: 'false',
      GENERATE_SOURCEMAP: 'false'
    }
  });
  
  if (!fs.existsSync('frontend/build/index.html')) {
    throw new Error('Build failed - no index.html');
  }
  
  console.log('✅ Build ready for deployment!');
  console.log('📁 Location: frontend/build');
  console.log('🌐 Deploy: Drag build folder to Netlify');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}