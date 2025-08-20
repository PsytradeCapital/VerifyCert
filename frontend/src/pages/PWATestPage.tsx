import React, { useState } from 'react';
import PWATestRunner from '../components/PWATestRunner';
import PWAInstallTest from '../components/PWAInstallTest';
import { useServiceWorker, useOfflineStatus } from '../hooks/useServiceWorker';
import { PWATestSuite } from '../tests/pwa-browser-tests';

const PWATestPage: React.FC = () => {
  const [swState, swActions] = useServiceWorker();
  const isOffline = useOfflineStatus();
  const [testResults, setTestResults] = useState<PWATestSuite | null>(null);
  const [networkTest, setNetworkTest] = useState<'idle' | 'testing' | 'online' | 'offline'>('idle');

  // Test network connectivity
  const testNetworkConnectivity = async () => {
    setNetworkTest('testing');
    
    try {
      const response = await fetch('/api/health', { 
        method: 'GET',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        setNetworkTest('online');
      } else {
        setNetworkTest('offline');
    } catch (error) {
      setNetworkTest('offline');
    
    setTimeout(() => setNetworkTest('idle'), 3000);
  };

  // Test cache functionality
  const testCacheStorage = async () => {
    try {
      const testCache = await caches.open('test-cache');
      const testResponse = new Response('Test data');
      await testCache.put('/test', testResponse);
      
      const cachedResponse = await testCache.match('/test');
      const success = !!cachedResponse;
      
      await caches.delete('test-cache');
      
      return success;
    } catch (error) {
      console.error('Cache test failed:', error);
      return false;
  };

  // Test notification permission
  const testNotificationPermission = async () => {
    if (!('Notification' in window)) {
      return { supported: false, permission: 'not-supported' };

    const permission = Notification.permission;
    
    if (permission === 'default') {
      try {
        const result = await Notification.requestPermission();
        return { supported: true, permission: result };
      } catch (error) {
        return { supported: true, permission: 'denied', error: error instanceof Error ? error.message : 'Unknown error' };
    
    return { supported: true, permission };
  };

  const handleTestComplete = (results: PWATestSuite) => {
    setTestResults(results);
    
    // Store results in localStorage for comparison
    const storedResults = JSON.parse(localStorage.getItem('pwa-test-history') || '[]');
    storedResults.push(results);
    
    // Keep only last 10 test results
    if (storedResults.length > 10) {
      storedResults.splice(0, storedResults.length - 10);
    
    localStorage.setItem('pwa-test-history', JSON.stringify(storedResults));
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">PWA Testing Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive testing suite for Progressive Web App functionality across different browsers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Status Cards */}
          <div className="space-y-6">
            {/* Service Worker Status */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Worker Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Supported:</span>
                  <span className={swState.isSupported ? 'text-green-600' : 'text-red-600'}>
                    {swState.isSupported ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Registered:</span>
                  <span className={swState.isRegistered ? 'text-green-600' : 'text-red-600'}>
                    {swState.isRegistered ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Update Available:</span>
                  <span className={swState.hasUpdate ? 'text-yellow-600' : 'text-green-600'}>
                    {swState.hasUpdate ? '⚠️ Yes' : '✅ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cache Size:</span>
                  <span className="text-gray-900">{formatBytes(swState.cacheSize)}</span>
                </div>
                
                {swState.error && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    {swState.error}
                  </div>
                )}
                
                <div className="flex space-x-2 mt-4">
                  {swState.hasUpdate && (
                    <button
                      onClick={swActions.update}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Update SW
                    </button>
                  )}
                  <button
                    onClick={swActions.clearCache}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                  >
                    Clear Cache
                  </button>
                </div>
              </div>
            </div>

            {/* Network Status */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Connection:</span>
                  <span className={isOffline ? 'text-red-600' : 'text-green-600'}>
                    {isOffline ? '❌ Offline' : '✅ Online'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">API Test:</span>
                  <span className={
                    networkTest === 'testing' ? 'text-yellow-600' :
                    networkTest === 'online' ? 'text-green-600' :
                    networkTest === 'offline' ? 'text-red-600' : 'text-gray-600'
                  }>
                    {networkTest === 'testing' ? '⏳ Testing...' :
                     networkTest === 'online' ? '✅ Connected' :
                     networkTest === 'offline' ? '❌ Failed' : '⚪ Not tested'}
                  </span>
                </div>
                
                <button
                  onClick={testNetworkConnectivity}
                  disabled={networkTest === 'testing'}
                  className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Test API Connection
                </button>
              </div>
            </div>

            {/* PWA Installation Status */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">PWA Installation</h3>
              <PWAInstallTest />
            </div>

            {/* Quick Tests */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Tests</h3>
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    const result = await testCacheStorage();
                    alert(`Cache Storage Test: ${result ? 'PASSED' : 'FAILED'}`);
                  }}
                  className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Test Cache Storage
                </button>
                
                <button
                  onClick={async () => {
                    const result = await testNotificationPermission();
                    alert(`Notification Test: ${JSON.stringify(result, null, 2)}`);
                  }}
                  className="w-full px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                >
                  Test Notifications
                </button>
                
                <button
                  onClick={() => {
                    if ('share' in navigator) {
                      navigator.share({
                        title: 'VerifyCert PWA Test',
                        text: 'Testing PWA functionality',
                        url: window.location.href
                      }).then(() => {
                        alert('Web Share API: PASSED');
                      }).catch(() => {
                        alert('Web Share API: FAILED');
                      });
                    } else {
                      alert('Web Share API: NOT SUPPORTED');
                  }}
                  className="w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                >
                  Test Web Share
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Test Runner */}
          <div className="lg:col-span-2">
            <PWATestRunner onTestComplete={handleTestComplete} />
          </div>
        </div>

        {/* Test History */}
        {testResults && (
          <div className="mt-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Browser Compatibility Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{testResults.overallScore}%</div>
                  <div className="text-sm text-gray-600">Overall Score</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {testResults.results.filter((r: any) => r.working).length}
                  </div>
                  <div className="text-sm text-gray-600">Features Working</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {testResults.results.filter((r: any) => r.supported && !r.working).length}
                  </div>
                  <div className="text-sm text-gray-600">Partial Support</div>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>
                  <strong>Browser:</strong> {testResults.browser.name} {testResults.browser.version} 
                  ({testResults.browser.engine}) on {testResults.browser.platform}
                </p>
                <p>
                  <strong>Device Type:</strong> {testResults.browser.isMobile ? 'Mobile' : 'Desktop'}
                </p>
                <p>
                  <strong>Test Date:</strong> {new Date(testResults.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Testing Instructions</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>1. Run Full Test Suite:</strong> Click "Run PWA Tests" to test all PWA features</p>
            <p><strong>2. Test Different Browsers:</strong> Open this page in Chrome, Firefox, Safari, and Edge</p>
            <p><strong>3. Test Mobile Devices:</strong> Test on both iOS and Android devices</p>
            <p><strong>4. Test Offline Mode:</strong> Disconnect internet and test offline functionality</p>
            <p><strong>5. Test Installation:</strong> Try installing the PWA on different devices</p>
            <p><strong>6. Compare Results:</strong> Download reports and compare across browsers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWATestPage;
}}}}}}}}