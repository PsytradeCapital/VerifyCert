#!/usr/bin/env node

/**
 * Comprehensive app diagnostics
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Running comprehensive app diagnostics...\n');

// Check critical files
const criticalFiles = [
  'frontend/src/App.tsx',
  'frontend/src/index.tsx',
  'frontend/src/pages/Home.tsx',
  'frontend/src/pages/Verify.tsx',
  'frontend/src/pages/NotFound.tsx',
  'frontend/src/utils/browserCompatibilityFixes.ts',
  'frontend/src/utils/lazyLoading.tsx',
  'frontend/src/utils/performanceMonitoring.ts',
  'frontend/src/utils/performanceSetup.ts',
  'frontend/src/utils/monitoredFetch.ts',
  'frontend/src/contexts/NavigationContext.tsx',
  'frontend/src/contexts/AuthContext.tsx',
  'frontend/src/contexts/ThemeContext.tsx',
  'frontend/src/contexts/FeedbackContext.tsx'
];

console.log('📁 Checking critical files:');
const missingFiles = [];
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log('\n⚠️  Missing files detected. This is likely causing the white screen.');
  console.log('   Missing files:', missingFiles.join(', '));
}

// Check package.json dependencies
console.log('\n📦 Checking dependencies:');
const packagePath = path.join(__dirname, 'frontend', 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const criticalDeps = [
    'react',
    'react-dom',
    'react-router-dom',
    'react-hot-toast',
    'ethers',
    'framer-motion'
  ];
  
  criticalDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log(`   ✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`   ❌ ${dep} - MISSING`);
    }
  });
} else {
  console.log('   ❌ frontend/package.json not found');
}

// Check build output
console.log('\n🏗️  Checking build output:');
const buildPath = path.join(__dirname, 'frontend', 'build');
if (fs.existsSync(buildPath)) {
  const indexHtmlPath = path.join(buildPath, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    const indexContent = fs.readFileSync(indexHtmlPath, 'utf8');
    
    // Check for script tags
    const scriptMatches = indexContent.match(/<script[^>]*src="[^"]*"[^>]*>/g);
    if (scriptMatches) {
      console.log(`   ✅ Found ${scriptMatches.length} script tags in index.html`);
    } else {
      console.log('   ❌ No script tags found in index.html');
    }
    
    // Check for CSS links
    const cssMatches = indexContent.match(/<link[^>]*href="[^"]*\.css"[^>]*>/g);
    if (cssMatches) {
      console.log(`   ✅ Found ${cssMatches.length} CSS links in index.html`);
    } else {
      console.log('   ❌ No CSS links found in index.html');
    }
    
    // Check for root div
    if (indexContent.includes('<div id="root">')) {
      console.log('   ✅ Root div found in index.html');
    } else {
      console.log('   ❌ Root div not found in index.html');
    }
  } else {
    console.log('   ❌ index.html not found in build directory');
  }
} else {
  console.log('   ❌ Build directory not found');
}

// Provide recommendations
console.log('\n💡 Recommendations:');

if (missingFiles.length > 0) {
  console.log('1. 🔧 Run: node fix-white-screen.js (to use simplified app)');
  console.log('2. 🏗️  Rebuild: cd frontend && npm run build');
  console.log('3. 🧪 Test: npx serve -s frontend/build -l 3001');
  console.log('4. 🔍 Check browser console for errors');
} else {
  console.log('1. 🔍 Open browser console and check for JavaScript errors');
  console.log('2. 🧪 Test with simplified app: node fix-white-screen.js');
  console.log('3. 🔄 Clear browser cache completely');
  console.log('4. 🌐 Try different browser');
}

console.log('\n🛠️  Quick fixes to try:');
console.log('• node fix-white-screen.js (use simplified app)');
console.log('• Open check-console-errors.html in browser');
console.log('• Check browser console at http://localhost:3001');
console.log('• Try incognito/private browsing mode');

console.log('\n📋 Next steps:');
console.log('1. Apply the simplified app fix');
console.log('2. If that works, gradually add back features');
console.log('3. If it still fails, check browser console errors');
console.log('4. Report specific error messages for further help');