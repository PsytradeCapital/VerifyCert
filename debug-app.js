#!/usr/bin/env node

/**
 * Debug script to help identify white screen issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging VerifyCert white screen issue...');

// Check if build directory exists and has files
const buildPath = 'frontend/build';
if (fs.existsSync(buildPath)) {
  console.log('✅ Build directory exists');
  
  const buildFiles = fs.readdirSync(buildPath);
  console.log('📁 Build files:', buildFiles.slice(0, 10).join(', '));
  
  // Check for index.html
  if (buildFiles.includes('index.html')) {
    console.log('✅ index.html exists');
    
    // Check index.html content
    const indexContent = fs.readFileSync(path.join(buildPath, 'index.html'), 'utf8');
    if (indexContent.includes('<div id="root">')) {
      console.log('✅ Root div found in index.html');
    } else {
      console.log('❌ Root div missing in index.html');
    }
    
    if (indexContent.includes('.js')) {
      console.log('✅ JavaScript files referenced in index.html');
    } else {
      console.log('❌ No JavaScript files found in index.html');
    }
  } else {
    console.log('❌ index.html missing from build');
  }
  
  // Check for static directory
  const staticPath = path.join(buildPath, 'static');
  if (fs.existsSync(staticPath)) {
    console.log('✅ Static directory exists');
    
    const jsPath = path.join(staticPath, 'js');
    if (fs.existsSync(jsPath)) {
      const jsFiles = fs.readdirSync(jsPath);
      console.log('📄 JS files:', jsFiles.length, 'files');
    }
    
    const cssPath = path.join(staticPath, 'css');
    if (fs.existsSync(cssPath)) {
      const cssFiles = fs.readdirSync(cssPath);
      console.log('🎨 CSS files:', cssFiles.length, 'files');
    }
  } else {
    console.log('❌ Static directory missing');
  }
  
} else {
  console.log('❌ Build directory does not exist');
  console.log('Run: node build-simple.js');
}

console.log('\n🔧 Common fixes for white screen:');
console.log('1. Check browser console for errors');
console.log('2. Verify asset paths are correct');
console.log('3. Check if homepage field is set correctly');
console.log('4. Ensure all dependencies are installed');
console.log('5. Try hard refresh (Ctrl+F5)');