#!/usr/bin/env node

/**
 * PWA Testing Script
 * Command-line tool to test PWA functionality
 * Usage: node test-pwa.js [options]
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class PWATestRunner {
  constructor(options = {}) {
    this.options = {
      url: options.url || 'http://localhost:3000',
      headless: options.headless !== false,
      timeout: options.timeout || 30000,
      outputDir: options.outputDir || './test-results',
      browsers: options.browsers || ['chrome']
    };
    
    this.results = [];
  }

  async runTests() {
    console.log('🚀 Starting PWA Browser Tests...');
    console.log(`URL: ${this.options.url}`);
    console.log(`Browsers: ${this.options.browsers.join(', ')}`);
    console.log('─'.repeat(50));

    // Ensure output directory exists
    if (!fs.existsSync(this.options.outputDir)) {
      fs.mkdirSync(this.options.outputDir, { recursive: true });
    }

    for (const browserName of this.options.browsers) {
      try {
        console.log(`\n📱 Testing ${browserName}...`);
        const result = await this.testBrowser(browserName);
        this.results.push(result);
        
        console.log(`✅ ${browserName} test completed`);
        console.log(`   Score: ${result.score}%`);
        console.log(`   Passed: ${result.passedTests}/${result.totalTests}`);
        
      } catch (error) {
        console.error(`❌ ${browserName} test failed:`, error.message);
        this.results.push({
          browser: browserName,
          error: error.message,
          score: 0,
          passedTests: 0,
          totalTests: 0
        });
      }
    }

    await this.generateReport();
    console.log('\n🎉 All tests completed!');
  }

  async testBrowser(browserName) {
    const browser = await puppeteer.launch({
      headless: this.options.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      // Set viewport for mobile testing
      if (browserName.includes('mobile')) {
        await page.setViewport({ width: 375, height: 667 });
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15');
      }

      // Navigate to PWA test page
      await page.goto(`${this.options.url}/pwa-test`, { 
        waitUntil: 'networkidle2',
        timeout: this.options.timeout 
      });

      // Wait for page to load
      await page.waitForSelector('[data-testid="pwa-test-runner"]', { timeout: 10000 });

      // Run PWA tests
      const testResults = await page.evaluate(async () => {
        // Import the test runner
        const { pwaBrowserTester } = await import('./src/tests/pwa-browser-tests.ts');
        
        // Run all tests
        const results = await pwaBrowserTester.runAllTests();
        
        return {
          browserInfo: results.browser,
          score: results.overallScore,
          totalTests: results.results.length,
          passedTests: results.results.filter(r => r.working).length,
          supportedTests: results.results.filter(r => r.supported).length,
          results: results.results,
          timestamp: results.timestamp
        };
      });

      // Test service worker registration
      const swRegistered = await page.evaluate(() => {
        return 'serviceWorker' in navigator;
      });

      // Test manifest
      const manifestExists = await page.evaluate(() => {
        return !!document.querySelector('link[rel="manifest"]');
      });

      // Test offline functionality
      await page.setOfflineMode(true);
      const offlineResponse = await page.goto(`${this.options.url}/offline-test`, { 
        waitUntil: 'networkidle2',
        timeout: 5000 
      }).catch(() => null);
      
      await page.setOfflineMode(false);

      // Take screenshot
      const screenshotPath = path.join(this.options.outputDir, `${browserName}-screenshot.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      return {
        browser: browserName,
        ...testResults,
        additionalTests: {
          serviceWorkerSupported: swRegistered,
          manifestExists,
          offlineHandling: !!offlineResponse
        },
        screenshot: screenshotPath
      };

    } finally {
      await browser.close();
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      testConfig: this.options,
      summary: {
        totalBrowsers: this.results.length,
        averageScore: Math.round(
          this.results.reduce((sum, r) => sum + (r.score || 0), 0) / this.results.length
        ),
        allPassed: this.results.every(r => r.score >= 80)
      },
      results: this.results
    };

    // Save JSON report
    const jsonPath = path.join(this.options.outputDir, 'pwa-test-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = path.join(this.options.outputDir, 'pwa-test-report.html');
    fs.writeFileSync(htmlPath, htmlReport);

    // Generate text summary
    const textReport = this.generateTextReport(report);
    const textPath = path.join(this.options.outputDir, 'pwa-test-summary.txt');
    fs.writeFileSync(textPath, textReport);

    console.log('\n📊 Reports generated:');
    console.log(`   JSON: ${jsonPath}`);
    console.log(`   HTML: ${htmlPath}`);
    console.log(`   Text: ${textPath}`);
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PWA Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
        .header { background: #3b82f6; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #1f2937; }
        .summary-card .value { font-size: 2em; font-weight: bold; color: #3b82f6; }
        .browser-result { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .browser-header { display: flex; justify-content: between; align-items: center; margin-bottom: 15px; }
        .score { font-size: 1.5em; font-weight: bold; }
        .score.high { color: #10b981; }
        .score.medium { color: #f59e0b; }
        .score.low { color: #ef4444; }
        .test-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px; }
        .test-item { padding: 10px; border-radius: 4px; font-size: 0.9em; }
        .test-pass { background: #d1fae5; color: #065f46; }
        .test-partial { background: #fef3c7; color: #92400e; }
        .test-fail { background: #fee2e2; color: #991b1b; }
    </style>
</head>
<body>
    <div class="header">
        <h1>PWA Browser Test Report</h1>
        <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <div class="summary-card">
            <h3>Browsers Tested</h3>
            <div class="value">${report.summary.totalBrowsers}</div>
        </div>
        <div class="summary-card">
            <h3>Average Score</h3>
            <div class="value">${report.summary.averageScore}%</div>
        </div>
        <div class="summary-card">
            <h3>All Passed</h3>
            <div class="value">${report.summary.allPassed ? '✅' : '❌'}</div>
        </div>
    </div>
    
    ${report.results.map(result => `
        <div class="browser-result">
            <div class="browser-header">
                <h2>${result.browser}</h2>
                <div class="score ${result.score >= 80 ? 'high' : result.score >= 60 ? 'medium' : 'low'}">
                    ${result.score}%
                </div>
            </div>
            
            ${result.error ? `
                <div style="background: #fee2e2; color: #991b1b; padding: 15px; border-radius: 4px;">
                    <strong>Error:</strong> ${result.error}
                </div>
            ` : `
                <p><strong>Passed:</strong> ${result.passedTests}/${result.totalTests} tests</p>
                
                <div class="test-grid">
                    ${result.results?.map(test => `
                        <div class="test-item ${test.working ? 'test-pass' : test.supported ? 'test-partial' : 'test-fail'}">
                            ${test.working ? '✅' : test.supported ? '⚠️' : '❌'} ${test.feature}
                        </div>
                    `).join('') || ''}
                </div>
            `}
        </div>
    `).join('')}
</body>
</html>`;
  }

  generateTextReport(report) {
    let text = 'PWA BROWSER TEST REPORT\n';
    text += '='.repeat(50) + '\n\n';
    text += `Generated: ${new Date(report.timestamp).toLocaleString()}\n`;
    text += `Browsers Tested: ${report.summary.totalBrowsers}\n`;
    text += `Average Score: ${report.summary.averageScore}%\n`;
    text += `All Passed: ${report.summary.allPassed ? 'Yes' : 'No'}\n\n`;

    report.results.forEach(result => {
      text += `${result.browser.toUpperCase()}\n`;
      text += '-'.repeat(30) + '\n';
      
      if (result.error) {
        text += `Error: ${result.error}\n\n`;
      } else {
        text += `Score: ${result.score}%\n`;
        text += `Passed: ${result.passedTests}/${result.totalTests}\n\n`;
        
        if (result.results) {
          result.results.forEach(test => {
            const status = test.working ? 'PASS' : test.supported ? 'PARTIAL' : 'FAIL';
            text += `  ${status.padEnd(8)} ${test.feature}\n`;
          });
        }
      }
      text += '\n';
    });

    return text;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    
    if (key === 'browsers') {
      options[key] = value.split(',');
    } else if (key === 'headless') {
      options[key] = value !== 'false';
    } else {
      options[key] = value;
    }
  }

  const runner = new PWATestRunner(options);
  runner.runTests().catch(console.error);
}

module.exports = PWATestRunner;