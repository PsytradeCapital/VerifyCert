const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Final build attempt...');

try {
  // Clean build directory first
  console.log('🧹 Cleaning build directory...');
  if (fs.existsSync('frontend/build')) {
    fs.rmSync('frontend/build', { recursive: true, force: true });
  }
  
  console.log('🔨 Building with react-scripts...');
  execSync('cd frontend && npx react-scripts build', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      CI: 'false',
      GENERATE_SOURCEMAP: 'false'
    }
  });
  
  // Verify build completed
  if (!fs.existsSync('frontend/build/index.html')) {
    throw new Error('Build failed - index.html not created');
  }
  
  if (!fs.existsSync('frontend/build/static')) {
    throw new Error('Build failed - static folder not created');
  }
  
  console.log('✅ Build completed successfully!');
  console.log('📁 Build ready for deployment!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}