const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Building with TypeScript fix...');

try {
  // Clean build directory first
  console.log('🧹 Cleaning build directory...');
  if (fs.existsSync('build')) {
    fs.rmSync('build', { recursive: true, force: true });
  }
  
  console.log('🔨 Building with react-scripts...');
  execSync('npx react-scripts build', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      CI: 'false',
      GENERATE_SOURCEMAP: 'false'
    }
  });
  
  // Verify build completed
  if (!fs.existsSync('build/index.html')) {
    throw new Error('Build failed - index.html not created');
  }
  
  if (!fs.existsSync('build/static')) {
    throw new Error('Build failed - static folder not created');
  }
  
  console.log('✅ Build completed successfully!');
  console.log('📁 Build ready for deployment!');
  console.log('🌐 Test: npx serve -s build -l 3001');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}