/**
 * Browser Detection and Compatibility Utilities
 * Helps identify browser-specific features and compatibility issues
 */

export interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  platform: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  features: BrowserFeatures;
}

export interface BrowserFeatures {
  serviceWorker: boolean;
  webp: boolean;
  avif: boolean;
  webgl: boolean;
  webgl2: boolean;
  indexedDB: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  geolocation: boolean;
  notifications: boolean;
  camera: boolean;
  microphone: boolean;
  bluetooth: boolean;
  nfc: boolean;
  vibration: boolean;
  fullscreen: boolean;
  pictureInPicture: boolean;
  webShare: boolean;
  clipboardAPI: boolean;
  intersectionObserver: boolean;
  resizeObserver: boolean;
  mutationObserver: boolean;
  customElements: boolean;
  shadowDOM: boolean;
  modules: boolean;
  dynamicImport: boolean;
  webAssembly: boolean;
  bigInt: boolean;
  optionalChaining: boolean;
  nullishCoalescing: boolean;
  css: {
    grid: boolean;
    flexbox: boolean;
    customProperties: boolean;
    containerQueries: boolean;
    subgrid: boolean;
    aspectRatio: boolean;
    gap: boolean;
  };
}

/**
 * Detect current browser information
 */
export function detectBrowser(): BrowserInfo {
  const userAgent = navigator.userAgent;
  // Use userAgentData when available, fallback to deprecated platform
  const platform = (navigator as any).userAgentData?.platform || navigator.platform || 'Unknown';
  
  // Browser detection
  let name = 'Unknown';
  let version = 'Unknown';
  let engine = 'Unknown';
  
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    name = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    version = match ? match[1] : 'Unknown';
    engine = 'Blink';
  } else if (userAgent.includes('Firefox')) {
    name = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    version = match ? match[1] : 'Unknown';
    engine = 'Gecko';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    name = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    version = match ? match[1] : 'Unknown';
    engine = 'WebKit';
  } else if (userAgent.includes('Edg')) {
    name = 'Edge';
    const match = userAgent.match(/Edg\/(\d+)/);
    version = match ? match[1] : 'Unknown';
    engine = 'Blink';
  }
  
  // Device type detection
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?=.*Mobile)/i.test(userAgent);
  const isDesktop = !isMobile && !isTablet;
  
  // Feature detection
  const features = detectFeatures();
  
  return {
    name,
    version,
    engine,
    platform,
    isMobile,
    isTablet,
    isDesktop,
    features
  };
}

/**
 * Detect browser features and capabilities
 */
export function detectFeatures(): BrowserFeatures {
  return {
    // Service Worker
    serviceWorker: 'serviceWorker' in navigator,
    
    // Image formats
    webp: checkImageFormat('webp'),
    avif: checkImageFormat('avif'),
    
    // Graphics
    webgl: checkWebGL(),
    webgl2: checkWebGL2(),
    
    // Storage
    indexedDB: 'indexedDB' in window,
    localStorage: checkStorage('localStorage'),
    sessionStorage: checkStorage('sessionStorage'),
    
    // Device APIs
    geolocation: 'geolocation' in navigator,
    notifications: 'Notification' in window,
    camera: checkMediaDevices(),
    microphone: checkMediaDevices(),
    bluetooth: 'bluetooth' in navigator,
    nfc: 'nfc' in navigator,
    vibration: 'vibrate' in navigator,
    
    // Display APIs
    fullscreen: checkFullscreen(),
    pictureInPicture: 'pictureInPictureEnabled' in document,
    
    // Sharing APIs
    webShare: 'share' in navigator,
    clipboardAPI: 'clipboard' in navigator,
    
    // Observers
    intersectionObserver: 'IntersectionObserver' in window,
    resizeObserver: 'ResizeObserver' in window,
    mutationObserver: 'MutationObserver' in window,
    
    // Web Components
    customElements: 'customElements' in window,
    shadowDOM: 'attachShadow' in Element.prototype,
    
    // JavaScript features
    modules: checkModules(),
    dynamicImport: checkDynamicImport(),
    webAssembly: 'WebAssembly' in window,
    bigInt: typeof BigInt !== 'undefined',
    optionalChaining: checkOptionalChaining(),
    nullishCoalescing: checkNullishCoalescing(),
    
    // CSS features
    css: {
      grid: checkCSS('display', 'grid'),
      flexbox: checkCSS('display', 'flex'),
      customProperties: checkCSS('--test', 'test'),
      containerQueries: checkCSS('@container'),
      subgrid: checkCSS('grid-template-rows', 'subgrid'),
      aspectRatio: checkCSS('aspect-ratio', '1'),
      gap: checkCSS('gap', '10px')
    }
  };
}

/**
 * Check if image format is supported
 */
function checkImageFormat(format: string): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  try {
    const dataURL = canvas.toDataURL(`image/${format}`);
    return dataURL.startsWith(`data:image/${format}`);
  } catch {
    return false;
  }
}

/**
 * Check WebGL support
 */
function checkWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

/**
 * Check WebGL2 support
 */
function checkWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl2');
  } catch {
    return false;
  }
}

/**
 * Check storage availability
 */
function checkStorage(type: 'localStorage' | 'sessionStorage'): boolean {
  try {
    const storage = window[type];
    const test = '__storage_test__';
    storage.setItem(test, test);
    storage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check media devices
 */
function checkMediaDevices(): boolean {
  return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
}

/**
 * Check fullscreen API
 */
function checkFullscreen(): boolean {
  return !!(
    document.fullscreenEnabled ||
    (document as any).webkitFullscreenEnabled ||
    (document as any).mozFullScreenEnabled ||
    (document as any).msFullscreenEnabled
  );
}

/**
 * Check ES modules support
 */
function checkModules(): boolean {
  const script = document.createElement('script');
  return 'noModule' in script;
}

/**
 * Check dynamic import support
 */
function checkDynamicImport(): boolean {
  try {
    new Function('import("")');
    return true;
  } catch {
    return false;
  }
}

/**
 * Check optional chaining support
 */
function checkOptionalChaining(): boolean {
  try {
    new Function('const obj = {}; return obj?.prop;');
    return true;
  } catch {
    return false;
  }
}

/**
 * Check nullish coalescing support
 */
function checkNullishCoalescing(): boolean {
  try {
    new Function('return null ?? "default";');
    return true;
  } catch {
    return false;
  }
}

/**
 * Check CSS feature support
 */
function checkCSS(property: string, value?: string): boolean {
  if (property.startsWith('@')) {
    // Check CSS at-rule support
    return CSS.supports(property, '');
  }
  
  if (value) {
    return CSS.supports(property, value);
  }
  
  // Check if property exists
  const element = document.createElement('div');
  return property in element.style;
}

/**
 * Get browser compatibility score (0-100)
 */
export function getBrowserCompatibilityScore(browserInfo: BrowserInfo): number {
  const features = browserInfo.features;
  const totalFeatures = Object.keys(features).length + Object.keys(features.css).length;
  
  let supportedFeatures = 0;
  
  // Count supported features
  Object.entries(features).forEach(([key, value]) => {
    if (key === 'css') {
      Object.values(value).forEach(cssFeature => {
        if (cssFeature) supportedFeatures++;
      });
    } else if (value) {
      supportedFeatures++;
    }
  });
  
  return Math.round((supportedFeatures / totalFeatures) * 100);
}

/**
 * Get browser-specific recommendations
 */
export function getBrowserRecommendations(browserInfo: BrowserInfo): string[] {
  const recommendations: string[] = [];
  const { name, version, features } = browserInfo;
  
  // Service Worker recommendations
  if (!features.serviceWorker) {
    recommendations.push('Service Worker not supported - PWA features will be limited');
  }
  
  // Image format recommendations
  if (!features.webp) {
    recommendations.push('WebP not supported - consider fallback images');
  }
  
  // Storage recommendations
  if (!features.localStorage) {
    recommendations.push('Local Storage not available - user preferences cannot be saved');
  }
  
  // CSS recommendations
  if (!features.css.grid) {
    recommendations.push('CSS Grid not supported - layout may use flexbox fallbacks');
  }
  
  if (!features.css.customProperties) {
    recommendations.push('CSS Custom Properties not supported - theming may be limited');
  }
  
  // Browser-specific recommendations
  if (name === 'Safari' && parseInt(version) < 14) {
    recommendations.push('Safari version is outdated - some modern features may not work');
  }
  
  if (name === 'Firefox' && parseInt(version) < 90) {
    recommendations.push('Firefox version is outdated - consider updating for better performance');
  }
  
  if (name === 'Chrome' && parseInt(version) < 90) {
    recommendations.push('Chrome version is outdated - some features may not be available');
  }
  
  return recommendations;
}

/**
 * Log browser information for debugging
 */
export function logBrowserInfo(): void {
  const browserInfo = detectBrowser();
  const compatibilityScore = getBrowserCompatibilityScore(browserInfo);
  const recommendations = getBrowserRecommendations(browserInfo);
  
  console.group('🌐 Browser Information');
  console.log('Browser:', `${browserInfo.name} ${browserInfo.version}`);
  console.log('Engine:', browserInfo.engine);
  console.log('Platform:', browserInfo.platform);
  console.log('Device Type:', browserInfo.isMobile ? 'Mobile' : browserInfo.isTablet ? 'Tablet' : 'Desktop');
  console.log('Compatibility Score:', `${compatibilityScore}%`);
  
  if (recommendations.length > 0) {
    console.group('⚠️ Recommendations');
    recommendations.forEach(rec => console.warn(rec));
    console.groupEnd();
  }
  
  console.group('🔧 Feature Support');
  console.table(browserInfo.features);
  console.groupEnd();
  
  console.groupEnd();
}

/**
 * Initialize browser detection and logging
 */
export function initializeBrowserDetection(): BrowserInfo {
  const browserInfo = detectBrowser();
  
  // Log browser info in development
  if (process.env.NODE_ENV === 'development') {
    logBrowserInfo();
  }
  
  // Add browser class to document for CSS targeting
  document.documentElement.classList.add(
    `browser-${browserInfo.name.toLowerCase()}`,
    `engine-${browserInfo.engine.toLowerCase()}`,
    browserInfo.isMobile ? 'device-mobile' : browserInfo.isTablet ? 'device-tablet' : 'device-desktop'
  );
  
  return browserInfo;
}