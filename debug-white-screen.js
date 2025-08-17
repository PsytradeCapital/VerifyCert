#!/usr/bin/env node

/**
 * Debug script to identify white screen issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging white screen issue...\n');

// Check if build exists
const buildPath = path.join(__dirname, 'frontend', 'build');
if (!fs.existsSync(buildPath)) {
  console.log('❌ Build directory does not exist');
  console.log('   Run: npm run build');
  process.exit(1);
}

// Check build contents
const buildContents = fs.readdirSync(buildPath);
console.log('📁 Build directory contents:');
buildContents.forEach(item => {
  console.log(`   - ${item}`);
});

// Check if index.html exists
const indexPath = path.join(buildPath, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.log('❌ index.html not found in build');
  process.exit(1);
}

// Check index.html content
const indexContent = fs.readFileSync(indexPath, 'utf8');
console.log('\n📄 index.html content preview:');
console.log(indexContent.substring(0, 500) + '...');

// Check for JavaScript files
const staticPath = path.join(buildPath, 'static', 'js');
if (fs.existsSync(staticPath)) {
  const jsFiles = fs.readdirSync(staticPath).filter(f => f.endsWith('.js'));
  console.log('\n📦 JavaScript files:');
  jsFiles.forEach(file => {
    const filePath = path.join(staticPath, file);
    const stats = fs.statSync(filePath);
    console.log(`   - ${file} (${Math.round(stats.size / 1024)}KB)`);
  });
} else {
  console.log('❌ No static/js directory found');
}

// Check for CSS files
const cssPath = path.join(buildPath, 'static', 'css');
if (fs.existsSync(cssPath)) {
  const cssFiles = fs.readdirSync(cssPath).filter(f => f.endsWith('.css'));
  console.log('\n🎨 CSS files:');
  cssFiles.forEach(file => {
    const filePath = path.join(cssPath, file);
    const stats = fs.statSync(filePath);
    console.log(`   - ${file} (${Math.round(stats.size / 1024)}KB)`);
  });
} else {
  console.log('❌ No static/css directory found');
}

// Check package.json for potential issues
const frontendPackagePath = path.join(__dirname, 'frontend', 'package.json');
if (fs.existsSync(frontendPackagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(frontendPackagePath, 'utf8'));
  console.log('\n📋 Frontend package info:');
  console.log(`   - React version: ${packageJson.dependencies?.react || 'Not found'}`);
  console.log(`   - React-scripts version: ${packageJson.dependencies?.['react-scripts'] || 'Not found'}`);
  console.log(`   - Homepage: ${packageJson.homepage || 'Not set'}`);
}

console.log('\n🔧 Common white screen fixes:');
console.log('1. Check browser console for JavaScript errors');
console.log('2. Verify all imports are correct');
console.log('3. Check if homepage is set correctly in package.json');
console.log('4. Ensure all required dependencies are installed');
console.log('5. Try clearing browser cache');
console.log('6. Check if service worker is causing issues');

console.log('\n🌐 To test locally:');
console.log('   cd frontend && npm run preview');
console.log('   or');
console.log('   npx serve -s frontend/build');