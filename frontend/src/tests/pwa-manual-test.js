/**
 * PWA Manual Test Script
 * Simple browser console script to test PWA functionality
 * Run this in browser console: copy and paste the entire script
 */

(function() {
  'use strict';

  console.log('🚀 Starting PWA Manual Test...');
  console.log('Browser:', navigator.userAgent);
  console.log('─'.repeat(50));

  const results = [];

  // Test 1: Service Worker Support
  function testServiceWorkerSupport() {
    const supported = 'serviceWorker' in navigator;
    console.log(`✓ Service Worker Support: ${supported ? 'YES' : 'NO'}`);
    results.push({ test: 'Service Worker Support', passed: supported });
    return supported;
  }

  // Test 2: Service Worker Registration
  async function testServiceWorkerRegistration() {
    if (!('serviceWorker' in navigator)) {
      console.log('❌ Service Worker Registration: SKIPPED (not supported)');
      results.push({ test: 'Service Worker Registration', passed: false, reason: 'Not supported' });
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const isActive = registration.active !== null;
      console.log(`✓ Service Worker Registration: ${isActive ? 'ACTIVE' : 'REGISTERED'}`);
      results.push({ test: 'Service Worker Registration', passed: true });
      return true;
    } catch (error) {
      console.log(`❌ Service Worker Registration: FAILED (${error.message})`);
      results.push({ test: 'Service Worker Registration', passed: false, reason: error.message });
      return false;
    }
  }

  // Test 3: Web App Manifest
  async function testWebAppManifest() {
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      console.log('❌ Web App Manifest: NO LINK FOUND');
      results.push({ test: 'Web App Manifest', passed: false, reason: 'No manifest link' });
      return false;
    }

    try {
      const response = await fetch(manifestLink.href);
      const manifest = await response.json();
      const hasRequired = manifest.name && manifest.start_url && manifest.display;
      console.log(`✓ Web App Manifest: ${hasRequired ? 'VALID' : 'INCOMPLETE'}`);
      console.log(`  Name: ${manifest.name || 'Missing'}`);
      console.log(`  Start URL: ${manifest.start_url || 'Missing'}`);
      console.log(`  Display: ${manifest.display || 'Missing'}`);
      results.push({ test: 'Web App Manifest', passed: hasRequired });
      return hasRequired;
    } catch (error) {
      console.log(`❌ Web App Manifest: FAILED (${error.message})`);
      results.push({ test: 'Web App Manifest', passed: false, reason: error.message });
      return false;
    }
  }

  // Test 4: Cache API
  async function testCacheAPI() {
    const supported = 'caches' in window;
    if (!supported) {
      console.log('❌ Cache API: NOT SUPPORTED');
      results.push({ test: 'Cache API', passed: false, reason: 'Not supported' });
      return false;
    }

    try {
      const testCacheName = 'pwa-manual-test';
      const cache = await caches.open(testCacheName);
      await cache.put('/test', new Response('test'));
      const cached = await cache.match('/test');
      await caches.delete(testCacheName);
      
      console.log(`✓ Cache API: ${cached ? 'WORKING' : 'FAILED'}`);
      results.push({ test: 'Cache API', passed: !!cached });
      return !!cached;
    } catch (error) {
      console.log(`❌ Cache API: FAILED (${error.message})`);
      results.push({ test: 'Cache API', passed: false, reason: error.message });
      return false;
    }
  }

  // Test 5: Install Prompt
  function testInstallPrompt() {
    const supported = 'BeforeInstallPromptEvent' in window;
    console.log(`✓ Install Prompt Support: ${supported ? 'YES' : 'NO'}`);
    results.push({ test: 'Install Prompt Support', passed: supported });
    
    if (supported) {
      console.log('  Note: Install prompt event may not fire immediately');
    }
    
    return supported;
  }

  // Test 6: Standalone Mode
  function testStandaloneMode() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        navigator.standalone === true;
    console.log(`✓ Standalone Mode: ${isStandalone ? 'YES' : 'NO'}`);
    results.push({ test: 'Standalone Mode', passed: true, info: isStandalone ? 'Running as PWA' : 'Running in browser' });
    return true;
  }

  // Test 7: Push Notifications
  function testPushNotifications() {
    const supported = 'Notification' in window && 'PushManager' in window;
    if (!supported) {
      console.log('❌ Push Notifications: NOT SUPPORTED');
      results.push({ test: 'Push Notifications', passed: false, reason: 'Not supported' });
      return false;
    }

    const permission = Notification.permission;
    console.log(`✓ Push Notifications: SUPPORTED (Permission: ${permission})`);
    results.push({ test: 'Push Notifications', passed: true, info: `Permission: ${permission}` });
    return true;
  }

  // Test 8: Offline Support
  async function testOfflineSupport() {
    if (!('serviceWorker' in navigator)) {
      console.log('❌ Offline Support: NO SERVICE WORKER');
      results.push({ test: 'Offline Support', passed: false, reason: 'No service worker' });
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const isActive = registration.active !== null;
      
      if (!isActive) {
        console.log('❌ Offline Support: SERVICE WORKER NOT ACTIVE');
        results.push({ test: 'Offline Support', passed: false, reason: 'Service worker not active' });
        return false;
      }

      const cacheNames = await caches.keys();
      const hasCache = cacheNames.length > 0;
      
      console.log(`✓ Offline Support: ${hasCache ? 'READY' : 'LIMITED'}`);
      console.log(`  Caches: ${cacheNames.length} found`);
      results.push({ test: 'Offline Support', passed: hasCache, info: `${cacheNames.length} caches` });
      return hasCache;
    } catch (error) {
      console.log(`❌ Offline Support: FAILED (${error.message})`);
      results.push({ test: 'Offline Support', passed: false, reason: error.message });
      return false;
    }
  }

  // Test 9: Web Share API
  function testWebShareAPI() {
    const supported = 'share' in navigator;
    console.log(`✓ Web Share API: ${supported ? 'SUPPORTED' : 'NOT SUPPORTED'}`);
    results.push({ test: 'Web Share API', passed: supported });
    return supported;
  }

  // Test 10: Storage Quota
  async function testStorageQuota() {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      console.log('❌ Storage Quota: NOT SUPPORTED');
      results.push({ test: 'Storage Quota', passed: false, reason: 'Not supported' });
      return false;
    }

    try {
      const estimate = await navigator.storage.estimate();
      const quota = estimate.quota || 0;
      const usage = estimate.usage || 0;
      const percentage = quota > 0 ? Math.round((usage / quota) * 100) : 0;
      
      console.log(`✓ Storage Quota: ${formatBytes(quota)} available, ${formatBytes(usage)} used (${percentage}%)`);
      results.push({ test: 'Storage Quota', passed: true, info: `${percentage}% used` });
      return true;
    } catch (error) {
      console.log(`❌ Storage Quota: FAILED (${error.message})`);
      results.push({ test: 'Storage Quota', passed: false, reason: error.message });
      return false;
    }
  }

  // Helper function to format bytes
  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Generate summary report
  function generateSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 PWA TEST SUMMARY');
    console.log('='.repeat(50));
    
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const score = Math.round((passedTests / totalTests) * 100);
    
    console.log(`Overall Score: ${score}% (${passedTests}/${totalTests} tests passed)`);
    console.log('─'.repeat(50));
    
    results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      let line = `${status} ${result.test}`;
      
      if (result.info) {
        line += ` (${result.info})`;
      }
      
      if (result.reason) {
        line += ` - ${result.reason}`;
      }
      
      console.log(line);
    });
    
    console.log('='.repeat(50));
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (score < 70) {
      console.log('• Consider using a more modern browser for better PWA support');
    }
    if (!results.find(r => r.test === 'Service Worker Registration')?.passed) {
      console.log('• Ensure HTTPS is enabled and service worker file is accessible');
    }
    if (!results.find(r => r.test === 'Web App Manifest')?.passed) {
      console.log('• Check that manifest.json is properly configured and linked');
    }
    if (score >= 80) {
      console.log('• Great PWA support! Your app should work well on this browser');
    }
    
    return { score, totalTests, passedTests, results };
  }

  // Run all tests
  async function runAllTests() {
    try {
      testServiceWorkerSupport();
      await testServiceWorkerRegistration();
      await testWebAppManifest();
      await testCacheAPI();
      testInstallPrompt();
      testStandaloneMode();
      testPushNotifications();
      await testOfflineSupport();
      testWebShareAPI();
      await testStorageQuota();
      
      const summary = generateSummary();
      
      // Store results for later access
      window.pwaTestResults = summary;
      
      console.log('\n🎉 Test completed! Results stored in window.pwaTestResults');
      
      return summary;
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      return null;
    }
  }

  // Start the tests
  runAllTests();

})();