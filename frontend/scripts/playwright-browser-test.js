#!/usr/bin/env node

/**
 * Playwright-based Cross-Browser Testing for VerifyCert
 * Tests the application across Chrome, Firefox, Safari, and Edge using Playwright
 */

const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  testTimeout: 30000,
  browsers: {
    chromium: { name: 'Chrome', engine: chromium },
    firefox: { name: 'Firefox', engine: firefox },
    webkit: { name: 'Safari', engine: webkit }
  },
  testPages: [
    { path: '/', name: 'Home Page' },
    { path: '/verify', name: 'Verify Page' },
    { path: '/layout-demo', name: 'Layout Demo' },
    { path: '/theme-demo', name: 'Theme Demo' },
    { path: '/pwa-test', name: 'PWA Test Page' }
  ],
  viewports: [
    { width: 1920, height: 1080, name: 'Desktop' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 375, height: 667, name: 'Mobile' }
  ]
};

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  browsers: {},
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

/**
 * Test page load and basic functionality
 */
async function testPageLoad(page, url, pageName) {
  const startTime = Date.now();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    // Check if page loaded successfully
    const title = await page.title();
    const hasContent = await page.locator('body').count() > 0;
    
    return {
      test: 'page-load',
      page: pageName,
      url,
      loadTime,
      status: hasContent && loadTime < 10000 ? 'passed' : 'failed',
      details: `Page loaded in ${loadTime}ms, title: "${title}"`
    };
  } catch (error) {
    return {
      test: 'page-load',
      page: pageName,
      url,
      status: 'failed',
      details: `Failed to load: ${error.message}`
    };
  }
}

/**
 * Test responsive design across different viewports
 */
async function testResponsiveDesign(page, url, pageName, viewport) {
  try {
    await page.setViewportSize(viewport);
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Check if navigation adapts to viewport
    const navigation = await page.locator('nav').first();
    const isVisible = await navigation.isVisible();
    
    // Check if content is properly sized
    const body = await page.locator('body');
    const bodyWidth = await body.evaluate(el => el.scrollWidth);
    const viewportWidth = viewport.width;
    
    const isResponsive = bodyWidth <= viewportWidth * 1.1; // Allow 10% overflow
    
    return {
      test: 'responsive-design',
      page: pageName,
      viewport: viewport.name,
      status: isResponsive ? 'passed' : 'failed',
      details: `${viewport.name} (${viewport.width}x${viewport.height}): Body width ${bodyWidth}px`
    };
  } catch (error) {
    return {
      test: 'responsive-design',
      page: pageName,
      viewport: viewport.name,
      status: 'failed',
      details: `Error: ${error.message}`
    };
  }
}

/**
 * Test form interactions and input handling
 */
async function testFormInteraction(page, url, pageName) {
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Look for form elements
    const inputs = await page.locator('input').count();
    const buttons = await page.locator('button').count();
    const forms = await page.locator('form').count();
    
    let interactionTests = 0;
    let passedInteractions = 0;
    
    // Test input focus and typing
    if (inputs > 0) {
      try {
        const firstInput = page.locator('input').first();
        await firstInput.focus();
        await firstInput.fill('test input');
        const value = await firstInput.inputValue();
        if (value === 'test input') passedInteractions++;
        interactionTests++;
      } catch (error) {
        interactionTests++;
      }
    }
    
    // Test button clicks
    if (buttons > 0) {
      try {
        const clickableButtons = await page.locator('button:not([disabled])').count();
        if (clickableButtons > 0) {
          // Just check if button is clickable, don't actually click to avoid side effects
          const firstButton = page.locator('button:not([disabled])').first();
          const isEnabled = await firstButton.isEnabled();
          if (isEnabled) passedInteractions++;
        }
        interactionTests++;
      } catch (error) {
        interactionTests++;
      }
    }
    
    const successRate = interactionTests > 0 ? passedInteractions / interactionTests : 1;
    
    return {
      test: 'form-interaction',
      page: pageName,
      status: successRate >= 0.8 ? 'passed' : 'failed',
      details: `${passedInteractions}/${interactionTests} interactions working. Found ${inputs} inputs, ${buttons} buttons, ${forms} forms`
    };
  } catch (error) {
    return {
      test: 'form-interaction',
      page: pageName,
      status: 'failed',
      details: `Error: ${error.message}`
    };
  }
}

/**
 * Test navigation functionality
 */
async function testNavigation(page, url, pageName) {
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Check for navigation elements
    const navLinks = await page.locator('nav a, [role="navigation"] a').count();
    const menuButtons = await page.locator('[aria-label*="menu"], [aria-label*="Menu"]').count();
    
    let navigationScore = 0;
    let maxScore = 0;
    
    // Test navigation visibility
    if (navLinks > 0) {
      const firstLink = page.locator('nav a, [role="navigation"] a').first();
      const isVisible = await firstLink.isVisible();
      if (isVisible) navigationScore++;
      maxScore++;
    }
    
    // Test menu functionality (if present)
    if (menuButtons > 0) {
      try {
        const menuButton = page.locator('[aria-label*="menu"], [aria-label*="Menu"]').first();
        const isClickable = await menuButton.isEnabled();
        if (isClickable) navigationScore++;
      } catch (error) {
        // Menu button test failed
      }
      maxScore++;
    }
    
    // If no specific navigation found, check for any links
    if (maxScore === 0) {
      const anyLinks = await page.locator('a').count();
      navigationScore = anyLinks > 0 ? 1 : 0;
      maxScore = 1;
    }
    
    const successRate = maxScore > 0 ? navigationScore / maxScore : 1;
    
    return {
      test: 'navigation',
      page: pageName,
      status: successRate >= 0.5 ? 'passed' : 'failed',
      details: `Navigation score: ${navigationScore}/${maxScore}. Found ${navLinks} nav links, ${menuButtons} menu buttons`
    };
  } catch (error) {
    return {
      test: 'navigation',
      page: pageName,
      status: 'failed',
      details: `Error: ${error.message}`
    };
  }
}

/**
 * Test PWA features
 */
async function testPWAFeatures(page, url, pageName) {
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    
    let pwaScore = 0;
    let maxScore = 0;
    const details = [];
    
    // Check for service worker
    try {
      const hasServiceWorker = await page.evaluate(() => {
        return 'serviceWorker' in navigator;
      });
      if (hasServiceWorker) {
        pwaScore++;
        details.push('Service Worker API available');
      }
      maxScore++;
    } catch (error) {
      maxScore++;
      details.push('Service Worker check failed');
    }
    
    // Check for manifest
    try {
      const manifestLink = await page.locator('link[rel="manifest"]').count();
      if (manifestLink > 0) {
        pwaScore++;
        details.push('Web App Manifest found');
      }
      maxScore++;
    } catch (error) {
      maxScore++;
      details.push('Manifest check failed');
    }
    
    // Check for offline capability indicators
    try {
      const offlineIndicators = await page.locator('[class*="offline"], [id*="offline"]').count();
      if (offlineIndicators > 0) {
        pwaScore++;
        details.push('Offline indicators found');
      }
      maxScore++;
    } catch (error) {
      maxScore++;
    }
    
    const successRate = maxScore > 0 ? pwaScore / maxScore : 1;
    
    return {
      test: 'pwa-features',
      page: pageName,
      status: successRate >= 0.6 ? 'passed' : 'warning',
      details: `PWA score: ${pwaScore}/${maxScore}. ${details.join(', ')}`
    };
  } catch (error) {
    return {
      test: 'pwa-features',
      page: pageName,
      status: 'failed',
      details: `Error: ${error.message}`
    };
  }
}

/**
 * Test accessibility features
 */
async function testAccessibility(page, url, pageName) {
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    
    let a11yScore = 0;
    let maxScore = 0;
    const details = [];
    
    // Check for ARIA labels
    const ariaLabels = await page.locator('[aria-label]').count();
    const ariaDescriptions = await page.locator('[aria-describedby]').count();
    if (ariaLabels > 0 || ariaDescriptions > 0) {
      a11yScore++;
      details.push(`${ariaLabels} ARIA labels, ${ariaDescriptions} descriptions`);
    }
    maxScore++;
    
    // Check for semantic HTML
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
    const landmarks = await page.locator('main, nav, header, footer, aside, section').count();
    if (headings > 0 && landmarks > 0) {
      a11yScore++;
      details.push(`${headings} headings, ${landmarks} landmarks`);
    }
    maxScore++;
    
    // Check for keyboard navigation support
    const focusableElements = await page.locator('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])').count();
    if (focusableElements > 0) {
      a11yScore++;
      details.push(`${focusableElements} focusable elements`);
    }
    maxScore++;
    
    // Check for alt text on images
    const images = await page.locator('img').count();
    const imagesWithAlt = await page.locator('img[alt]').count();
    if (images === 0 || imagesWithAlt / images >= 0.8) {
      a11yScore++;
      details.push(`${imagesWithAlt}/${images} images have alt text`);
    }
    maxScore++;
    
    const successRate = maxScore > 0 ? a11yScore / maxScore : 1;
    
    return {
      test: 'accessibility',
      page: pageName,
      status: successRate >= 0.75 ? 'passed' : successRate >= 0.5 ? 'warning' : 'failed',
      details: `A11y score: ${a11yScore}/${maxScore}. ${details.join(', ')}`
    };
  } catch (error) {
    return {
      test: 'accessibility',
      page: pageName,
      status: 'failed',
      details: `Error: ${error.message}`
    };
  }
}

/**
 * Test JavaScript errors and console warnings
 */
async function testConsoleErrors(page, url, pageName) {
  const errors = [];
  const warnings = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    } else if (msg.type() === 'warning') {
      warnings.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Wait a bit for any async errors
    await page.waitForTimeout(2000);
    
    const status = errors.length === 0 ? 'passed' : warnings.length > errors.length ? 'warning' : 'failed';
    
    return {
      test: 'console-errors',
      page: pageName,
      status,
      details: `${errors.length} errors, ${warnings.length} warnings`
    };
  } catch (error) {
    return {
      test: 'console-errors',
      page: pageName,
      status: 'failed',
      details: `Navigation error: ${error.message}`
    };
  }
}

/**
 * Run all tests for a specific browser
 */
async function runBrowserTests(browserKey, browserConfig) {
  console.log(`\n🔍 Testing ${browserConfig.name}...`);
  
  const browserResults = {
    name: browserConfig.name,
    available: true,
    tests: [],
    summary: { passed: 0, failed: 0, warnings: 0 }
  };

  let browser;
  let context;
  
  try {
    // Launch browser
    browser = await browserConfig.engine.launch({
      headless: true, // Set to false for debugging
      args: ['--no-sandbox', '--disable-web-security']
    });
    
    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    console.log(`✅ ${browserConfig.name} launched successfully`);

    // Test each page
    for (const pageConfig of CONFIG.testPages) {
      const url = `${CONFIG.baseUrl}${pageConfig.path}`;
      console.log(`  📄 Testing page: ${pageConfig.name}`);

      const page = await context.newPage();
      
      try {
        // Run all test scenarios
        const pageTests = await Promise.all([
          testPageLoad(page, url, pageConfig.name),
          testFormInteraction(page, url, pageConfig.name),
          testNavigation(page, url, pageConfig.name),
          testPWAFeatures(page, url, pageConfig.name),
          testAccessibility(page, url, pageConfig.name),
          testConsoleErrors(page, url, pageConfig.name)
        ]);

        // Test responsive design for each viewport
        for (const viewport of CONFIG.viewports) {
          const responsiveTest = await testResponsiveDesign(page, url, pageConfig.name, viewport);
          pageTests.push(responsiveTest);
        }

        browserResults.tests.push(...pageTests);

        // Update summary
        pageTests.forEach(test => {
          if (test.status === 'passed') {
            browserResults.summary.passed++;
          } else if (test.status === 'warning') {
            browserResults.summary.warnings++;
          } else {
            browserResults.summary.failed++;
          }
        });

      } catch (error) {
        console.log(`    ❌ Error testing ${pageConfig.name}: ${error.message}`);
        browserResults.summary.failed += 6 + CONFIG.viewports.length; // 6 base tests + responsive tests
      } finally {
        await page.close();
      }
    }

  } catch (error) {
    console.log(`❌ Failed to launch ${browserConfig.name}: ${error.message}`);
    browserResults.available = false;
    browserResults.summary.failed = CONFIG.testPages.length * (6 + CONFIG.viewports.length);
  } finally {
    if (context) await context.close();
    if (browser) await browser.close();
  }

  return browserResults;
}

/**
 * Generate comprehensive HTML report
 */
function generateHTMLReport() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VerifyCert Cross-Browser Test Report</title>
    <style>
        * { box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; padding: 20px; background: #f5f5f5; line-height: 1.6;
        }
        .container { max-width: 1400px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { 
            background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
            color: white; padding: 30px; border-radius: 12px 12px 0 0; 
        }
        .header h1 { margin: 0 0 10px 0; font-size: 2.5em; }
        .header p { margin: 0; opacity: 0.9; font-size: 1.1em; }
        .content { padding: 30px; }
        .summary { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin-bottom: 40px; 
        }
        .summary-card { 
            background: #f8fafc; 
            padding: 25px; 
            border-radius: 12px; 
            border-left: 5px solid #3b82f6; 
            text-align: center;
        }
        .summary-card h3 { margin: 0 0 10px 0; color: #374151; font-size: 1.1em; }
        .summary-card .number { font-size: 2.5em; font-weight: bold; margin: 10px 0; }
        .summary-card .percentage { font-size: 0.9em; color: #6b7280; }
        .passed { color: #10b981; }
        .failed { color: #ef4444; }
        .warning { color: #f59e0b; }
        .browser-section { 
            margin-bottom: 40px; 
            border: 1px solid #e5e7eb; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .browser-header { 
            background: #f9fafb; 
            padding: 20px; 
            border-bottom: 1px solid #e5e7eb; 
            font-weight: 600; 
            font-size: 1.2em;
        }
        .browser-stats { 
            display: flex; 
            gap: 20px; 
            margin-top: 10px; 
            font-size: 0.9em; 
        }
        .test-table { width: 100%; border-collapse: collapse; }
        .test-table th { 
            background: #f3f4f6; 
            padding: 15px; 
            text-align: left; 
            font-weight: 600; 
            border-bottom: 2px solid #e5e7eb;
        }
        .test-table td { 
            padding: 12px 15px; 
            border-bottom: 1px solid #f3f4f6; 
            vertical-align: top;
        }
        .test-table tr:hover { background: #f9fafb; }
        .status-badge { 
            padding: 4px 12px; 
            border-radius: 20px; 
            font-size: 0.85em; 
            font-weight: 600; 
            text-transform: uppercase;
        }
        .status-passed { background: #d1fae5; color: #065f46; }
        .status-failed { background: #fee2e2; color: #991b1b; }
        .status-warning { background: #fef3c7; color: #92400e; }
        .browser-unavailable { opacity: 0.6; }
        .test-details { font-size: 0.9em; color: #6b7280; max-width: 400px; }
        .viewport-tag { 
            background: #e0e7ff; 
            color: #3730a3; 
            padding: 2px 8px; 
            border-radius: 12px; 
            font-size: 0.8em; 
            margin-left: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌐 VerifyCert Cross-Browser Test Report</h1>
            <p>Comprehensive testing across Chrome, Firefox, and Safari • Generated on ${new Date(testResults.timestamp).toLocaleString()}</p>
        </div>
        <div class="content">
            <div class="summary">
                <div class="summary-card">
                    <h3>Total Tests</h3>
                    <div class="number">${testResults.summary.total}</div>
                    <div class="percentage">Across ${Object.keys(testResults.browsers).length} browsers</div>
                </div>
                <div class="summary-card">
                    <h3>Passed</h3>
                    <div class="number passed">${testResults.summary.passed}</div>
                    <div class="percentage">${Math.round((testResults.summary.passed / testResults.summary.total) * 100)}% success rate</div>
                </div>
                <div class="summary-card">
                    <h3>Failed</h3>
                    <div class="number failed">${testResults.summary.failed}</div>
                    <div class="percentage">${Math.round((testResults.summary.failed / testResults.summary.total) * 100)}% failure rate</div>
                </div>
                <div class="summary-card">
                    <h3>Warnings</h3>
                    <div class="number warning">${testResults.summary.warnings}</div>
                    <div class="percentage">${Math.round((testResults.summary.warnings / testResults.summary.total) * 100)}% warning rate</div>
                </div>
            </div>
            
            ${Object.entries(testResults.browsers).map(([browserKey, browserResult]) => `
                <div class="browser-section ${!browserResult.available ? 'browser-unavailable' : ''}">
                    <div class="browser-header">
                        ${browserResult.name} ${!browserResult.available ? '(Not Available)' : ''}
                        <div class="browser-stats">
                            <span class="passed">✅ ${browserResult.summary.passed} Passed</span>
                            <span class="failed">❌ ${browserResult.summary.failed} Failed</span>
                            <span class="warning">⚠️ ${browserResult.summary.warnings} Warnings</span>
                        </div>
                    </div>
                    <table class="test-table">
                        <thead>
                            <tr>
                                <th>Page</th>
                                <th>Test</th>
                                <th>Status</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${browserResult.tests.map(test => `
                                <tr>
                                    <td><strong>${test.page}</strong></td>
                                    <td>
                                        ${test.test.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        ${test.viewport ? `<span class="viewport-tag">${test.viewport}</span>` : ''}
                                    </td>
                                    <td><span class="status-badge status-${test.status}">${test.status}</span></td>
                                    <td class="test-details">${test.details}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
  `;

  const reportPath = path.join(__dirname, '..', 'test-reports', 'cross-browser-report.html');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, html);
  return reportPath;
}

/**
 * Check if development server is running
 */
async function checkServer() {
  try {
    const response = await fetch(CONFIG.baseUrl);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Main test runner
 */
async function runCrossBrowserTests() {
  console.log('🚀 Starting Playwright Cross-Browser Testing for VerifyCert');
  console.log(`📊 Testing ${CONFIG.testPages.length} pages across ${Object.keys(CONFIG.browsers).length} browsers`);
  
  // Check if development server is running
  console.log('\n🔍 Checking if development server is running...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Development server is not running. Please start it with: npm start');
    process.exit(1);
  }
  console.log('✅ Development server is running');

  // Run tests for each browser
  for (const [browserKey, browserConfig] of Object.entries(CONFIG.browsers)) {
    const browserResult = await runBrowserTests(browserKey, browserConfig);
    testResults.browsers[browserKey] = browserResult;
    
    // Update global summary
    testResults.summary.total += browserResult.summary.passed + browserResult.summary.failed + browserResult.summary.warnings;
    testResults.summary.passed += browserResult.summary.passed;
    testResults.summary.failed += browserResult.summary.failed;
    testResults.summary.warnings += browserResult.summary.warnings;
  }

  // Generate reports
  console.log('\n📊 Generating test reports...');
  
  // JSON report
  const jsonReportPath = path.join(__dirname, '..', 'test-reports', 'cross-browser-results.json');
  const jsonReportDir = path.dirname(jsonReportPath);
  if (!fs.existsSync(jsonReportDir)) {
    fs.mkdirSync(jsonReportDir, { recursive: true });
  }
  fs.writeFileSync(jsonReportPath, JSON.stringify(testResults, null, 2));
  
  // HTML report
  const htmlReportPath = generateHTMLReport();
  
  // Console summary
  console.log('\n📋 Test Summary:');
  console.log(`   Total: ${testResults.summary.total}`);
  console.log(`   ✅ Passed: ${testResults.summary.passed}`);
  console.log(`   ❌ Failed: ${testResults.summary.failed}`);
  console.log(`   ⚠️  Warnings: ${testResults.summary.warnings}`);
  
  console.log('\n📄 Reports generated:');
  console.log(`   JSON: ${jsonReportPath}`);
  console.log(`   HTML: ${htmlReportPath}`);
  
  // Browser-specific summary
  console.log('\n🌐 Browser Results:');
  Object.entries(testResults.browsers).forEach(([key, result]) => {
    const total = result.summary.passed + result.summary.failed + result.summary.warnings;
    const passRate = total > 0 ? Math.round((result.summary.passed / total) * 100) : 0;
    console.log(`   ${result.name}: ${passRate}% pass rate (${result.summary.passed}/${total})`);
  });
  
  // Exit with appropriate code
  const exitCode = testResults.summary.failed > 0 ? 1 : 0;
  process.exit(exitCode);
}

// Add fetch polyfill for Node.js
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

// Run the tests
runCrossBrowserTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});