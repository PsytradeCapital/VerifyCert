const { execSync } = require('child_process');
const path = require('path');

process.env.CI = 'false';
process.env.GENERATE_SOURCEMAP = 'false';
process.env.ESLINT_NO_DEV_ERRORS = 'true';
process.env.TSC_COMPILE_ON_ERROR = 'true';

try {
    console.log('Building with react-scripts...');
    execSync('npx react-scripts build', { 
        stdio: 'inherit',
        cwd: __dirname,
        env: process.env
    });
    console.log('✅ Build successful!');
} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}