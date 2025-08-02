#!/usr/bin/env node

/**
 * PWA Implementation Verification Script
 * Verifies that all PWA files and configurations are properly set up
 * Run with: node verify-pwa-implementation.js
 */

const fs = require('fs');
const path = require('path');

class PWAVerifier {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      'info': '📋',
      'pass': '✅',
      'warn': '⚠️',
      'error': '❌'
    }[type] || '📋';
    
    console.log(`${prefix} ${message}`);
    
    if (type === 'error') {
      this.errors.push(message);
    } else if (type === 'warn') {
      this.warnings.push(message);
    } else if (type === 'pass') {
      this.passed.push(message);
    }
  }

  fileExists(filePath) {
    try {
      return fs.existsSync(path.join(__dirname, filePath));
    } catch (error) {
      return false;
    }
  }

  readFile(filePath) {
    try {
      return fs.readFileSync(path.join(__dirname, filePath), 'utf8');
    } catch (error) {
      return null;
    }
  }

  readJSON(filePath) {
    try {
      const content = this.readFile(filePath);
      return content ? JSON.parse(content) : null;
    } catch (error) {
      return null;
    }
  }

  // Test 1: Check manifest.json
  verifyManifest() {
    this.log('Checking Web App Manifest...', 'info');
    
    if (!this.fileExists('public/manifest.json')) {
      this.log('manifest.json not found in public directory', 'error');
      return false;
    }

    const manifest = this.readJSON('public/manifest.json');
    if (!manifest) {
      this.log('manifest.json is not valid JSON', 'error');
      return false;
    }

    // Check required fields
    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'theme_color', 'background_color'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length > 0) {
      this.log(`manifest.json missing required fields: ${missingFields.join(', ')}`, 'error');
      return false;
    }

    // Check icons
    if (!manifest.icons || !Array.isArray(manifest.icons) || manifest.icons.length === 0) {
      this.log('manifest.json missing icons array', 'error');
      return false;
    }

    // Check for recommended icon sizes
    const iconSizes = manifest.icons.map(icon => icon.sizes).join(',');
    const recommendedSizes = ['192x192', '512x512'];
    const missingSizes = recommendedSizes.filter(size => !iconSizes.includes(size));
    
    if (missingSizes.length > 0) {
      this.log(`manifest.json missing recommended icon sizes: ${missingSizes.join(', ')}`, 'warn');
    }

    this.log('Web App Manifest is valid', 'pass');
    return true;
  }

  // Test 2: Check service worker
  verifyServiceWorker() {
    this.log('Checking Service Worker...', 'info');
    
    if (!this.fileExists('public/sw.js')) {
      this.log('sw.js not found in public directory', 'error');
      return false;
    }

    const swContent = this.readFile('public/sw.js');
    if (!swContent) {
      this.log('sw.js is empty or unreadable', 'error');
      return false;
    }

    // Check for essential service worker features
    const requiredFeatures = [
      'install',
      'activate', 
      'fetch',
      'caches',
      'cache.addAll',
      'cache.match'
    ];

    const missingFeatures = requiredFeatures.filter(feature => !swContent.includes(feature));
    
    if (missingFeatures.length > 0) {
      this.log(`Service Worker missing features: ${missingFeatures.join(', ')}`, 'warn');
    }

    // Check for offline support
    if (!swContent.includes('offline') && !swContent.includes('fallback')) {
      this.log('Service Worker may not have offline fallback support', 'warn');
    }

    this.log('Service Worker file exists and appears functional', 'pass');
    return true;
  }

  // Test 3: Check offline page
  verifyOfflinePage() {
    this.log('Checking Offline Page...', 'info');
    
    if (!this.fileExists('public/offline.html')) {
      this.log('offline.html not found in public directory', 'warn');
      return false;
    }

    const offlineContent = this.readFile('public/offline.html');
    if (!offlineContent) {
      this.log('offline.html is empty or unreadable', 'error');
      return false;
    }

    // Check for basic HTML structure
    if (!offlineContent.includes('<html') || !offlineContent.includes('<body')) {
      this.log('offline.html does not appear to be valid HTML', 'error');
      return false;
    }

    this.log('Offline page exists and appears valid', 'pass');
    return true;
  }

  // Test 4: Check PWA utilities
  verifyPWAUtils() {
    this.log('Checking PWA Utilities...', 'info');
    
    const utilFiles = [
      'src/utils/serviceWorker.ts',
      'src/utils/pwaUtils.ts',
      'src/hooks/useServiceWorker.ts'
    ];

    let allExist = true;
    utilFiles.forEach(file => {
      if (!this.fileExists(file)) {
        this.log(`${file} not found`, 'error');
        allExist = false;
      }
    });

    if (!allExist) {
      return false;
    }

    this.log('PWA utility files exist', 'pass');
    return true;
  }

  // Test 5: Check PWA test implementation
  verifyPWATests() {
    this.log('Checking PWA Test Implementation...', 'info');
    
    const testFiles = [
      'src/tests/pwa-browser-tests.ts',
      'src/components/PWATestRunner.tsx',
      'src/pages/PWATestPage.tsx',
      'src/tests/pwa-manual-test.js'
    ];

    let allExist = true;
    testFiles.forEach(file => {
      if (!this.fileExists(file)) {
        this.log(`${file} not found`, 'error');
        allExist = false;
      }
    });

    if (!allExist) {
      return false;
    }

    this.log('PWA test files exist', 'pass');
    return true;
  }

  // Test 6: Check index.html PWA setup
  verifyIndexHTML() {
    this.log('Checking index.html PWA setup...', 'info');
    
    if (!this.fileExists('public/index.html')) {
      this.log('index.html not found in public directory', 'error');
      return false;
    }

    const indexContent = this.readFile('public/index.html');
    if (!indexContent) {
      this.log('index.html is empty or unreadable', 'error');
      return false;
    }

    // Check for manifest link
    if (!indexContent.includes('rel="manifest"')) {
      this.log('index.html missing manifest link', 'error');
      return false;
    }

    // Check for theme color
    if (!indexContent.includes('name="theme-color"')) {
      this.log('index.html missing theme-color meta tag', 'warn');
    }

    // Check for viewport
    if (!indexContent.includes('name="viewport"')) {
      this.log('index.html missing viewport meta tag', 'warn');
    }

    this.log('index.html has proper PWA setup', 'pass');
    return true;
  }

  // Test 7: Check package.json scripts
  verifyPackageJSON() {
    this.log('Checking package.json PWA scripts...', 'info');
    
    if (!this.fileExists('package.json')) {
      this.log('package.json not found', 'error');
      return false;
    }

    const packageJSON = this.readJSON('package.json');
    if (!packageJSON) {
      this.log('package.json is not valid JSON', 'error');
      return false;
    }

    // Check for PWA test scripts
    const scripts = packageJSON.scripts || {};
    const pwaScripts = Object.keys(scripts).filter(script => script.includes('pwa'));
    
    if (pwaScripts.length === 0) {
      this.log('No PWA test scripts found in package.json', 'warn');
    } else {
      this.log(`Found PWA scripts: ${pwaScripts.join(', ')}`, 'pass');
    }

    return true;
  }

  // Test 8: Check icon files
  verifyIcons() {
    this.log('Checking PWA icon files...', 'info');
    
    const manifest = this.readJSON('public/manifest.json');
    if (!manifest || !manifest.icons) {
      this.log('Cannot verify icons without valid manifest', 'warn');
      return false;
    }

    let allIconsExist = true;
    manifest.icons.forEach(icon => {
      const iconPath = `public/${icon.src.replace(/^\//, '')}`;
      if (!this.fileExists(iconPath)) {
        this.log(`Icon file not found: ${iconPath}`, 'error');
        allIconsExist = false;
      }
    });

    if (allIconsExist) {
      this.log('All manifest icons exist', 'pass');
    }

    return allIconsExist;
  }

  // Test 9: Check HTTPS requirement
  verifyHTTPS() {
    this.log('Checking HTTPS configuration...', 'info');
    
    // Check if there's any HTTPS configuration
    const packageJSON = this.readJSON('package.json');
    if (packageJSON && packageJSON.scripts) {
      const startScript = packageJSON.scripts.start || '';
      if (startScript.includes('HTTPS=true')) {
        this.log('HTTPS enabled in start script', 'pass');
        return true;
      }
    }

    // Check for .env file with HTTPS
    if (this.fileExists('.env')) {
      const envContent = this.readFile('.env');
      if (envContent && envContent.includes('HTTPS=true')) {
        this.log('HTTPS enabled in .env file', 'pass');
        return true;
      }
    }

    this.log('HTTPS not explicitly configured - required for PWA in production', 'warn');
    return false;
  }

  // Test 10: Check documentation
  verifyDocumentation() {
    this.log('Checking PWA documentation...', 'info');
    
    const docFiles = [
      'PWA_BROWSER_TESTING.md',
      'PWA_INSTALL_IMPLEMENTATION.md'
    ];

    let docsExist = 0;
    docFiles.forEach(file => {
      if (this.fileExists(file)) {
        docsExist++;
      }
    });

    if (docsExist === 0) {
      this.log('No PWA documentation found', 'warn');
      return false;
    }

    this.log(`Found ${docsExist}/${docFiles.length} PWA documentation files`, 'pass');
    return true;
  }

  // Run all verifications
  async runAllVerifications() {
    console.log('🚀 Starting PWA Implementation Verification...');
    console.log('='.repeat(60));

    const tests = [
      { name: 'Web App Manifest', test: this.verifyManifest.bind(this) },
      { name: 'Service Worker', test: this.verifyServiceWorker.bind(this) },
      { name: 'Offline Page', test: this.verifyOfflinePage.bind(this) },
      { name: 'PWA Utilities', test: this.verifyPWAUtils.bind(this) },
      { name: 'PWA Tests', test: this.verifyPWATests.bind(this) },
      { name: 'Index HTML Setup', test: this.verifyIndexHTML.bind(this) },
      { name: 'Package.json Scripts', test: this.verifyPackageJSON.bind(this) },
      { name: 'Icon Files', test: this.verifyIcons.bind(this) },
      { name: 'HTTPS Configuration', test: this.verifyHTTPS.bind(this) },
      { name: 'Documentation', test: this.verifyDocumentation.bind(this) }
    ];

    let passedTests = 0;
    for (const { name, test } of tests) {
      console.log(`\n📋 Testing ${name}...`);
      try {
        const result = await test();
        if (result) {
          passedTests++;
        }
      } catch (error) {
        this.log(`${name} test failed with error: ${error.message}`, 'error');
      }
    }

    this.generateReport(tests.length, passedTests);
  }

  generateReport(totalTests, passedTests) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PWA IMPLEMENTATION VERIFICATION REPORT');
    console.log('='.repeat(60));

    const score = Math.round((passedTests / totalTests) * 100);
    console.log(`Overall Score: ${score}% (${passedTests}/${totalTests} tests passed)`);
    console.log(`Errors: ${this.errors.length}`);
    console.log(`Warnings: ${this.warnings.length}`);
    console.log(`Passed: ${this.passed.length}`);

    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS TO FIX:');
      this.errors.forEach(error => console.log(`  • ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
    }

    console.log('\n💡 NEXT STEPS:');
    if (score >= 90) {
      console.log('  • Excellent! Your PWA implementation is ready for testing');
      console.log('  • Run browser tests using: npm run test:pwa');
      console.log('  • Test on different devices and browsers');
    } else if (score >= 70) {
      console.log('  • Good progress! Fix the errors above to improve PWA functionality');
      console.log('  • Address warnings for better user experience');
    } else {
      console.log('  • Critical issues found. Fix errors before proceeding');
      console.log('  • Ensure all required PWA files are in place');
    }

    console.log('\n🔗 TESTING RESOURCES:');
    console.log('  • Manual test: Copy/paste frontend/src/tests/pwa-manual-test.js in browser console');
    console.log('  • Test page: Visit /pwa-test in your application');
    console.log('  • Documentation: Check PWA_BROWSER_TESTING.md for detailed testing procedures');

    console.log('='.repeat(60));

    return {
      score,
      totalTests,
      passedTests,
      errors: this.errors,
      warnings: this.warnings,
      passed: this.passed
    };
  }
}

// Run verification if called directly
if (require.main === module) {
  const verifier = new PWAVerifier();
  verifier.runAllVerifications().catch(console.error);
}

module.exports = PWAVerifier;