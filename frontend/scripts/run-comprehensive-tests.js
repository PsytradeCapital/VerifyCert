#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Comprehensive UI/UX Test Suite...\n');

// Test configuration
const testConfig = {
  unit: {
    command: 'npm run test:unit',
    description: 'Unit Tests for UI Components'
  },
  integration: {
    command: 'npm run test:integration',
    description: 'Integration Tests'
  },
  e2e: {
    command: 'npm run test:e2e',
    description: 'End-to-End Tests'
  },
  accessibility: {
    command: 'npm run test:a11y',
    description: 'Accessibility Tests'
  },
  performance: {
    command: 'npm run test:performance',
    description: 'Performance Tests'
  },
  visual: {
    command: 'npm run test:visual',
    description: 'Visual Regression Tests'
  }
};

// Results tracking
const results = {
  passed: [],
  failed: [],
  skipped: []
};

// Helper function to run tests
function runTest(testType, config) {
  console.log(`\n📋 Running ${config.description}...`);
  console.log(`Command: ${config.command}`);
  console.log('─'.repeat(50));

  try {
    const startTime = Date.now();
    execSync(config.command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`✅ ${config.description} passed in ${duration}s`);
    results.passed.push({
      type: testType,
      description: config.description,
      duration: duration
    });
  } catch (error) {
    console.log(`❌ ${config.description} failed`);
    results.failed.push({
      type: testType,
      description: config.description,
      error: error.message
    });
  }
}

// Helper function to check if test dependencies are available
function checkDependencies() {
  console.log('🔍 Checking test dependencies...');
  
  const requiredPackages = [
    '@testing-library/react',
    '@testing-library/jest-dom',
    'cypress'
  ];

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  const missing = requiredPackages.filter(pkg => !allDeps[pkg]);
  
  if (missing.length > 0) {
    console.log(`❌ Missing dependencies: ${missing.join(', ')}`);
    console.log('Please install missing dependencies and try again.');
    process.exit(1);
  }
  
  console.log('✅ All test dependencies are available\n');
}

// Helper function to generate test report
function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE TEST RESULTS');
  console.log('='.repeat(60));

  const totalTests = results.passed.length + results.failed.length + results.skipped.length;
  const passRate = totalTests > 0 ? ((results.passed.length / totalTests) * 100).toFixed(1) : 0;

  console.log(`\n📈 Summary:`);
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   Passed: ${results.passed.length} ✅`);
  console.log(`   Failed: ${results.failed.length} ❌`);
  console.log(`   Skipped: ${results.skipped.length} ⏭️`);
  console.log(`   Pass Rate: ${passRate}%`);

  if (results.passed.length > 0) {
    console.log(`\n✅ Passed Tests:`);
    results.passed.forEach(test => {
      console.log(`   • ${test.description} (${test.duration}s)`);
    });
  }

  if (results.failed.length > 0) {
    console.log(`\n❌ Failed Tests:`);
    results.failed.forEach(test => {
      console.log(`   • ${test.description}`);
      console.log(`     Error: ${test.error.split('\n')[0]}`);
    });
  }

  if (results.skipped.length > 0) {
    console.log(`\n⏭️ Skipped Tests:`);
    results.skipped.forEach(test => {
      console.log(`   • ${test.description} - ${test.reason}`);
    });
  }

  // Generate detailed report file
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      total: totalTests,
      passed: results.passed.length,
      failed: results.failed.length,
      skipped: results.skipped.length,
      passRate: passRate
    },
    results: results
  };

  const reportPath = path.join(process.cwd(), 'test-reports', 'comprehensive-test-report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  return results.failed.length === 0;
}

// Helper function to setup test environment
function setupTestEnvironment() {
  console.log('🔧 Setting up test environment...');
  
  // Create test reports directory
  const reportsDir = path.join(process.cwd(), 'test-reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.CI = 'true';
  
  console.log('✅ Test environment ready\n');
}

// Main execution function
async function runComprehensiveTests() {
  try {
    setupTestEnvironment();
    checkDependencies();

    // Parse command line arguments
    const args = process.argv.slice(2);
    const testTypes = args.length > 0 ? args : Object.keys(testConfig);

    console.log(`🎯 Running test types: ${testTypes.join(', ')}\n`);

    // Run each test type
    for (const testType of testTypes) {
      if (testConfig[testType]) {
        runTest(testType, testConfig[testType]);
      } else {
        console.log(`⚠️ Unknown test type: ${testType}`);
        results.skipped.push({
          type: testType,
          description: `Unknown test type: ${testType}`,
          reason: 'Test type not configured'
        });
      }
    }

    // Generate final report
    const allTestsPassed = generateReport();

    if (allTestsPassed) {
      console.log('\n🎉 All tests passed! UI/UX enhancements are working correctly.');
      process.exit(0);
    } else {
      console.log('\n💥 Some tests failed. Please review the results above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 Test runner encountered an error:', error.message);
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n\n⏹️ Test run interrupted by user');
  generateReport();
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n\n⏹️ Test run terminated');
  generateReport();
  process.exit(1);
});

// Run the tests
runComprehensiveTests();