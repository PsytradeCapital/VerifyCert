import React from 'react';
/**
 * PWA Test Runner Script
 * Automated testing script for PWA functionality across browsers
 * Can be run in browser console or as part of automated testing
 */

class PWATestRunner {
  constructor() {
    this.results = [];
    this.browserInfo = this.getBrowserInfo();
  }

  getBrowserInfo() {
    const ua = navigator.userAgent;
    const platform = navigator.platform;
    
    let name = 'Unknown';
    let version = 'Unknown';
    
    if (ua.includes('Chrome') && !ua.includes('Edge')) {
      name = 'Chrome';
      const match = ua.match(/Chrome\/(\d+\.\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (ua.includes('Firefox')) {
      name = 'Firefox';
      const match = ua.match(/Firefox\/(\d+\.\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      name = 'Safari';
      const match = ua.match(/Version\/(\d+\.\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (ua.includes('Edge')) {
      name = 'Edge';
      const match = ua.match(/Edge\/(\d+\.\d+)/);
      version = match ? match[1] : 'Unknown';
    }

    return {
      name,
      version,
      platform,
      userAgent: ua,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    };
  }

  async runAllTests() {
    console.log('🚀 Starting PWA Test Suite...');
    console.log(`Browser: ${this.browserInfo.name} ${this.browserInfo.version}`);
    console.log(`Platform: ${this.browserInfo.platform}`);
    console.log(`Mobile: ${this.browserInfo.isMobile ? 'Yes' : 'No'}`);
    console.log('─'.repeat(50));

    const tests = [
      { name: 'Service Worker Support', test: this.testServiceWorkerSupport.bind(this) },
      { name: 'Service Worker Registration', test: this.testServiceWorkerRegistration.bind(this) },
      { name: 'Web App Manifest', test: this.testWebAppManifest.bind(this) },
      { name: 'Cache API', test: this.testCacheAPI.bind(this) },
      { name: 'Install Prompt', test: this.testInstallPrompt.bind(this) },
      { name: 'Standalone Mode', test: this.testStandaloneMode.bind(this) },
      { name: 'Push Notifications', test: this.testPushNotifications.bind(this) },
      { name: 'Background Sync', test: this.testBackgroundSync.bind(this) },
      { name: 'Offline Support', test: this.testOfflineSupport.bind(this) },
      { name: 'Web Share API', test: this.testWebShareAPI.bind(this) },
      { name: 'Storage Quota', test: this.testStorageQuota.bind(this) }
    ];

    for (const { name, test } of tests) {
      try {
        console.log(`Testing ${name}...`);
        const result = await test();
        this.results.push({ name, ...result });
        
        const status = result.passed ? '✅ PASS' : result.supported ? '⚠️  PARTIAL' : '❌ FAIL';
        console.log(`${status} ${name}`);
        
        if (result.details) {
          console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
        }
        
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
        
      } catch (error) {
        console.error(`❌ FAIL ${name}: ${error.message}`);
        this.results.push({
          name,
          passed: false,
          supported: false,
          error: error.message
        });
      }
    }

    this.generateReport();
    return this.results;
  }

  async testServiceWorkerSupport() {
    const supported = 'serviceWorker' in navigator;
    return {
      passed: supported,
      supported,
      details: { supported }
    };
  }

  async testServiceWorkerRegistration() {
    if (!('serviceWorker' in navigator)) {
      return { passed: false, supported: false, error: 'Service Worker not supported' };
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const isActive = registration.active !== null;
      
      return {
        passed: isActive,
        supported: true,
        details: {
          scope: registration.scope,
          state: registration.active?.state || 'not active'
        }
      };
    } catch (error) {
      return {
        passed: false,
        supported: true,
        error: error.message
      };
    }
  }

  async testWebAppManifest() {
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      return { passed: false, supported: false, error: 'Manifest link not found' };
    }

    try {
      const response = await fetch(manifestLink.href);
      const manifest = await response.json();
      
      const hasRequiredFields = manifest.name && manifest.start_url && manifest.display;
      
      return {
        passed: hasRequiredFields,
        supported: true,
        details: {
          name: manifest.name,
          shortName: manifest.short_name,
          display: manifest.display,
          themeColor: manifest.theme_color,
          icons: manifest.icons?.length || 0
        }
      };
    } catch (error) {
      return {
        passed: false,
        supported: true,
        error: error.message
      };
    }
  }

  async testCacheAPI() {
    const supported = 'caches' in window;
    if (!supported) {
      return { passed: false, supported: false, error: 'Cache API not supported' };
    }

    try {
      const testCacheName = 'pwa-test-cache';
      const cache = await caches.open(testCacheName);
      await cache.put('/test', new Response('test'));
      const cached = await cache.match('/test');
      await caches.delete(testCacheName);
      
      return {
        passed: !!cached,
        supported: true,
        details: { canCache: !!cached }
      };
    } catch (error) {
      return {
        passed: false,
        supported: true,
        error: error.message
      };
    }
  }

  async testInstallPrompt() {
    const supported = 'BeforeInstallPromptEvent' in window;
    
    return new Promise((resolve) => {
      if (!supported) {
        resolve({ passed: false, supported: false, error: 'BeforeInstallPromptEvent not supported' });
        return;
      }

      const timeout = setTimeout(() => {
        resolve({
          passed: false,
          supported: true,
          error: 'Install prompt event not fired within 3 seconds'
        });
      }, 3000);

      const handler = (e) => {
        clearTimeout(timeout);
        window.removeEventListener('beforeinstallprompt', handler);
        resolve({
          passed: true,
          supported: true,
          details: { eventFired: true }
        });
      };

      window.addEventListener('beforeinstallprompt', handler);
    });
  }

  testStandaloneMode() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        navigator.standalone === true;
    
    return {
      passed: true,
      supported: true,
      details: {
        isStandalone,
        displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'
      }
    };
  }

  testPushNotifications() {
    const supported = 'Notification' in window && 'PushManager' in window;
    if (!supported) {
      return { passed: false, supported: false, error: 'Push notifications not supported' };
    }

    const permission = Notification.permission;
    
    return {
      passed: permission === 'granted',
      supported: true,
      details: {
        permission,
        maxActions: Notification.maxActions || 0
      }
    };
  }

  async testBackgroundSync() {
    if (!('serviceWorker' in navigator)) {
      return { passed: false, supported: false, error: 'Service Worker required for Background Sync' };
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const supported = 'sync' in registration;
      
      if (!supported) {
        return { passed: false, supported: false, error: 'Background Sync not supported' };
      }

      await registration.sync.register('test-sync');
      
      return {
        passed: true,
        supported: true,
        details: { canRegisterSync: true }
      };
    } catch (error) {
      return {
        passed: false,
        supported: true,
        error: error.message
      };
    }
  }

  async testOfflineSupport() {
    if (!('serviceWorker' in navigator)) {
      return { passed: false, supported: false, error: 'Service Worker required for offline support' };
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const isActive = registration.active !== null;
      
      if (!isActive) {
        return { passed: false, supported: true, error: 'Service Worker not active' };
      }

      const cacheNames = await caches.keys();
      const hasCache = cacheNames.length > 0;
      
      return {
        passed: hasCache,
        supported: true,
        details: {
          serviceWorkerActive: isActive,
          cacheCount: cacheNames.length
        }
      };
    } catch (error) {
      return {
        passed: false,
        supported: true,
        error: error.message
      };
    }
  }

  testWebShareAPI() {
    const supported = 'share' in navigator;
    
    return {
      passed: supported,
      supported,
      details: { supported }
    };
  }

  async testStorageQuota() {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      return { passed: false, supported: false, error: 'Storage API not supported' };
    }

    try {
      const estimate = await navigator.storage.estimate();
      
      return {
        passed: true,
        supported: true,
        details: {
          quota: estimate.quota,
          usage: estimate.usage,
          usagePercentage: estimate.quota ? Math.round((estimate.usage / estimate.quota) * 100) : 0
        }
      };
    } catch (error) {
      return {
        passed: false,
        supported: true,
        error: error.message
      };
    }
  }

  generateReport() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const supportedTests = this.results.filter(r => r.supported).length;
    const score = Math.round((passedTests / totalTests) * 100);

    console.log('\n' + '='.repeat(50));
    console.log('📊 PWA TEST REPORT');
    console.log('='.repeat(50));
    console.log(`Browser: ${this.browserInfo.name} ${this.browserInfo.version}`);
    console.log(`Platform: ${this.browserInfo.platform}`);
    console.log(`Mobile: ${this.browserInfo.isMobile ? 'Yes' : 'No'}`);
    console.log(`Overall Score: ${score}% (${passedTests}/${totalTests} tests passed)`);
    console.log(`Supported Features: ${supportedTests}/${totalTests}`);
    console.log('─'.repeat(50));

    this.results.forEach(result => {
      const status = result.passed ? '✅ PASS' : result.supported ? '⚠️  PARTIAL' : '❌ FAIL';
      console.log(`${status} ${result.name}`);
    });

    console.log('='.repeat(50));

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (score < 70) {
      console.log('• Consider using a more modern browser for better PWA support');
    }
    if (!this.results.find(r => r.name === 'Service Worker Registration')?.passed) {
      console.log('• Ensure HTTPS is enabled and service worker file is accessible');
    }
    if (!this.results.find(r => r.name === 'Web App Manifest')?.passed) {
      console.log('• Check that manifest.json is properly configured and linked');
    }
    if (score >= 80) {
      console.log('• Great PWA support! Your app should work well on this browser');
    }

    return {
      browserInfo: this.browserInfo,
      score,
      totalTests,
      passedTests,
      supportedTests,
      results: this.results
    };
  }

  // Export results as JSON
  exportResults() {
    const report = {
      timestamp: new Date().toISOString(),
      browserInfo: this.browserInfo,
      results: this.results,
      summary: {
        totalTests: this.results.length,
        passedTests: this.results.filter(r => r.passed).length,
        supportedTests: this.results.filter(r => r.supported).length,
        score: Math.round((this.results.filter(r => r.passed).length / this.results.length) * 100)
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pwa-test-results-${this.browserInfo.name}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return report;
  }
}

// Make it available globally for console usage
window.PWATestRunner = PWATestRunner;

// Auto-run if script is loaded directly
if (typeof module === 'undefined') {
  console.log('PWA Test Runner loaded. Use: new PWATestRunner().runAllTests()');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PWATestRunner;
}