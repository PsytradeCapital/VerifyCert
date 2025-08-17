import { execSync } from 'child_process';
import { existsSync, rmSync, readdirSync } from 'fs';

console.log('🔧 Fixing incomplete build...');

try {
  process.chdir('frontend');

  // Clean build directory first
  console.log('🧹 Cleaning build directory...');
  if (existsSync('build')) {
    rmSync('build', { recursive: true, force: true });
  }

  console.log('🔨 Building with react-scripts directly...');
  execSync('npx react-scripts build', {
    stdio: 'inherit',
    env: {
      ...process.env,
      CI: 'false',
      GENERATE_SOURCEMAP: 'false'
    }
  });

  // Verify build completed
  if (!existsSync('build/index.html')) {
    throw new Error('Build failed - index.html not created');
  }

  if (!existsSync('build/static')) {
    throw new Error('Build failed - static folder not created');
  }

  console.log('✅ Build completed successfully!');
  console.log('📁 Build contents:');

  const buildFiles = readdirSync('build');
  buildFiles.forEach(file => {
    console.log(`   - ${file}`);
  });

  console.log('\n🌐 Ready for deployment!');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}