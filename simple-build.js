const { execSync } = require('child_process');

console.log('🔨 Simple React build...');

try {
  process.chdir('frontend');
  
  // Use react-scripts directly
  execSync('npx react-scripts build', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      CI: 'false',
      GENERATE_SOURCEMAP: 'false'
    }
  });
  
  console.log('✅ Build completed!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}