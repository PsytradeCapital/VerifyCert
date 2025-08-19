/**
 * PWA Browser Compatibility Tests
 * Tests PWA functionality across different browsers and devices
 */

interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  platform: string;
  isMobile: boolean;

interface PWATestResult {
  feature: string;
  supported: boolean;
  working: boolean;
  error?: string;
  details?: any;

export interface PWATestSuite {
  browser: BrowserInfo;
  timestamp: number;
  results: PWATestResult[];
  overallScore: number;

export class PWABrowserTester {
  constructor() {
    // Initialize tester

  /**
   * Get detailed browser information
   */
  getBrowserInfo(): BrowserInfo {
    const ua = navigator.userAgent;
    
    let name = 'Unknown';
    let version = 'Unknown';
    let engine = 'Unknown';
    
    // Detect browser
    if (ua.includes('Chrome') && !ua.includes('Edge')) {
      name = 'Chrome';
      const match = ua.match(/Chrome\/(\d+\.\d+)/);
      version = match ? match[1] : 'Unknown';
      engine = 'Blink';
    } else if (ua.includes('Firefox')) {
      name = 'Firefox';
      const match = ua.match(/Firefox\/(\d+\.\d+)/);
      version = match ? match[1] : 'Unknown';
      engine = 'Gecko';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      name = 'Safari';
      const match = ua.match(/Version\/(\d+\.\d+)/);
      version = match ? match[1] : 'Unknown';
      engine = 'WebKit';
    } else if (ua.includes('Edge')) {
      name = 'Edge';
      const match = ua.match(/Edge\/(\d+\.\d+)/);
      version = match ? match[1] : 'Unknown';
      engine = 'EdgeHTML';
    } else if (ua.includes('Edg/')) {
      name = 'Edge Chromium';
      const match = ua.match(/Edg\/(\d+\.\d+)/);
      version = match ? match[1] : 'Unknown';
      engine = 'Blink';

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

    return {
      name,
      version,
      engine,
      platform: navigator.platform,
      isMobile
    };

  /**
   * Test Service Worker support and functionality
   */
  async testServiceWorker(): Promise<PWATestResult> {
    const result: PWATestResult = {
      feature: 'Service Worker',
      supported: false,
      working: false
    };

    try {
      // Check basic support
      result.supported = 'serviceWorker' in navigator;
      
      if (!result.supported) {
        result.error = 'Service Worker not supported';
        return result;

      // Test registration
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      if (registration) {
        result.working = true;
        result.details = {
          scope: registration.scope,
          state: registration.installing?.state || registration.waiting?.state || registration.active?.state
        };

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';

    return result;

  /**
   * Test Web App Manifest support
   */
  async testManifest(): Promise<PWATestResult> {
    const result: PWATestResult = {
      feature: 'Web App Manifest',
      supported: false,
      working: false
    };

    try {
      // Check if manifest link exists
      const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      result.supported = !!manifestLink;

      if (!result.supported) {
        result.error = 'Manifest link not found';
        return result;

      // Try to fetch and parse manifest
      const response = await fetch(manifestLink.href);
      const manifest = await response.json();

      if (manifest && manifest.name) {
        result.working = true;
        result.details = {
          name: manifest.name,
          shortName: manifest.short_name,
          display: manifest.display,
          themeColor: manifest.theme_color,
          icons: manifest.icons?.length || 0
        };

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';

    return result;

  /**
   * Test Install Prompt (beforeinstallprompt)
   */
  async testInstallPrompt(): Promise<PWATestResult> {
    const result: PWATestResult = {
      feature: 'Install Prompt',
      supported: false,
      working: false
    };

    return new Promise((resolve) => {
      // Check if BeforeInstallPromptEvent is supported
      result.supported = 'BeforeInstallPromptEvent' in window;

      if (!result.supported) {
        result.error = 'BeforeInstallPromptEvent not supported';
        resolve(result);
        return;

      // Listen for beforeinstallprompt event
      const timeout = setTimeout(() => {
        result.error = 'Install prompt event not fired within 5 seconds';
        resolve(result);
      }, 5000);

      const handleBeforeInstallPrompt = (e: Event) => {
        clearTimeout(timeout);
        result.working = true;
        result.details = {
          eventType: e.type,
          platforms: (e as any).platforms || []
        };
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        resolve(result);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    });

  /**
   * Test Standalone Mode Detection
   */
  testStandaloneMode(): PWATestResult {
    const result: PWATestResult = {
      feature: 'Standalone Mode',
      supported: true,
      working: false
    };

    try {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;

      result.working = true;
      result.details = {
        isStandalone,
        displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
        navigatorStandalone: (window.navigator as any).standalone
      };

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';

    return result;

  /**
   * Test Cache API
   */
  async testCacheAPI(): Promise<PWATestResult> {
    const result: PWATestResult = {
      feature: 'Cache API',
      supported: false,
      working: false
    };

    try {
      result.supported = 'caches' in window;

      if (!result.supported) {
        result.error = 'Cache API not supported';
        return result;

      // Test cache operations
      const testCacheName = 'pwa-test-cache';
      const testUrl = '/test-cache-entry';
      const testResponse = new Response('test data');

      const cache = await caches.open(testCacheName);
      await cache.put(testUrl, testResponse);
      const cachedResponse = await cache.match(testUrl);
      
      if (cachedResponse) {
        result.working = true;
        result.details = {
          canOpen: true,
          canPut: true,
          canMatch: true
        };

      // Clean up
      await caches.delete(testCacheName);

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';

    return result;

  /**
   * Test Push Notifications
   */
  async testPushNotifications(): Promise<PWATestResult> {
    const result: PWATestResult = {
      feature: 'Push Notifications',
      supported: false,
      working: false
    };

    try {
      result.supported = 'Notification' in window && 'PushManager' in window;

      if (!result.supported) {
        result.error = 'Push notifications not supported';
        return result;

      // Check permission
      const permission = Notification.permission;
      
      result.details = {
        permission,
        maxActions: (Notification as any).maxActions || 0
      };

      if (permission === 'granted') {
        result.working = true;
      } else if (permission === 'default') {
        result.working = true; // Can request permission
        result.details.canRequest = true;

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';

    return result;

  /**
   * Test Background Sync
   */
  async testBackgroundSync(): Promise<PWATestResult> {
    const result: PWATestResult = {
      feature: 'Background Sync',
      supported: false,
      working: false
    };

    try {
      const registration = await navigator.serviceWorker.ready;
      result.supported = 'sync' in registration;

      if (!result.supported) {
        result.error = 'Background Sync not supported';
        return result;

      // Test sync registration
      await (registration as any).sync.register('test-sync');
      result.working = true;

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';

    return result;

  /**
   * Test Offline Functionality
   */
  async testOfflineSupport(): Promise<PWATestResult> {
    const result: PWATestResult = {
      feature: 'Offline Support',
      supported: true,
      working: false
    };

    try {
      // Check if service worker is active
      const registration = await navigator.serviceWorker.ready;
      const isActive = registration.active !== null;

      if (!isActive) {
        result.error = 'Service worker not active';
        return result;

      // Test cache availability
      const cacheNames = await caches.keys();
      const hasCache = cacheNames.length > 0;

      result.working = hasCache;
      result.details = {
        serviceWorkerActive: isActive,
        cacheCount: cacheNames.length,
        cacheNames: cacheNames
      };

      if (!hasCache) {
        result.error = 'No caches found for offline support';

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';

    return result;

  /**
   * Run all PWA tests
   */
  async runAllTests(): Promise<PWATestSuite> {
    console.log('Starting PWA browser compatibility tests...');
    
    const browser = this.getBrowserInfo();
    const timestamp = Date.now();

    // Run all tests
    const tests = [
      this.testServiceWorker(),
      this.testManifest(),
      this.testInstallPrompt(),
      this.testStandaloneMode(),
      this.testCacheAPI(),
      this.testPushNotifications(),
      this.testBackgroundSync(),
      this.testOfflineSupport()
    ];

    const results = await Promise.all(tests);

    // Calculate overall score
    const totalTests = results.length;
    const workingTests = results.filter(r => r.working).length;
    const overallScore = Math.round((workingTests / totalTests) * 100);

    const testSuite: PWATestSuite = {
      browser,
      timestamp,
      results,
      overallScore
    };

    // Log results
    console.log('PWA Test Results:', testSuite);
    
    return testSuite;

  /**
   * Generate test report
   */
  generateReport(testSuite: PWATestSuite): string {
    const { browser, results, overallScore } = testSuite;
    
    let report = `PWA Compatibility Report\n`;
    report += `========================\n\n`;
    report += `Browser: ${browser.name} ${browser.version}\n`;
    report += `Engine: ${browser.engine}\n`;
    report += `Platform: ${browser.platform}\n`;
    report += `Mobile: ${browser.isMobile ? 'Yes' : 'No'}\n`;
    report += `Overall Score: ${overallScore}%\n\n`;
    
    report += `Feature Test Results:\n`;
    report += `---------------------\n`;
    
    results.forEach(result => {
      const status = result.working ? '✅ PASS' : result.supported ? '⚠️  PARTIAL' : '❌ FAIL';
      report += `${status} ${result.feature}\n`;
      
      if (result.error) {
        report += `   Error: ${result.error}\n`;
      
      if (result.details) {
        report += `   Details: ${JSON.stringify(result.details, null, 2)}\n`;
      
      report += `\n`;
    });
    
    return report;

// Export singleton instance
export const pwaBrowserTester = new PWABrowserTester();