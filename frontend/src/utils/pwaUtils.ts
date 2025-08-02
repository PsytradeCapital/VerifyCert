/**
 * PWA Installation Utilities
 * Provides helper functions for PWA installation and mobile device detection
 */

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export interface DeviceInfo {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isIOSSafari: boolean;
  isChrome: boolean;
  isStandalone: boolean;
  canInstall: boolean;
}

/**
 * Detect device and browser information
 */
export function getDeviceInfo(): DeviceInfo {
  const ua = navigator.userAgent;
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isIOSSafari = isIOS && /WebKit/.test(ua) && /Safari/.test(ua) && !/(CriOS|FxiOS|OPiOS|mercury)/i.test(ua);
  const isChrome = /Chrome/i.test(ua) && !/Edge/i.test(ua);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
  
  // PWA can be installed on Chrome (Android/Desktop) and Safari (iOS with manual instructions)
  const canInstall = (isChrome && !isStandalone) || (isIOSSafari && !isStandalone);

  return {
    isMobile,
    isIOS,
    isAndroid,
    isIOSSafari,
    isChrome,
    isStandalone,
    canInstall
  };
}

/**
 * Check if PWA installation prompt should be shown
 */
export function shouldShowInstallPrompt(): boolean {
  const deviceInfo = getDeviceInfo();
  
  // Don't show if already installed
  if (deviceInfo.isStandalone) {
    return false;
  }
  
  // Check if user has dismissed the prompt recently
  const dismissedTime = localStorage.getItem('pwa-install-dismissed');
  if (dismissedTime) {
    const now = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    
    if ((now - parseInt(dismissedTime)) < oneDayInMs) {
      return false;
    }
  }
  
  // Check if user has seen the prompt too many times
  const promptCount = parseInt(localStorage.getItem('pwa-install-prompt-count') || '0');
  if (promptCount >= 3) {
    return false;
  }
  
  return deviceInfo.canInstall;
}

/**
 * Track PWA installation prompt events
 */
export function trackInstallPromptEvent(event: string, data?: any) {
  // Increment prompt count for certain events
  if (event === 'prompt_shown') {
    const currentCount = parseInt(localStorage.getItem('pwa-install-prompt-count') || '0');
    localStorage.setItem('pwa-install-prompt-count', (currentCount + 1).toString());
  }
  
  // Track dismissal time
  if (event === 'prompt_dismissed') {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  }
  
  // Reset counters on successful installation
  if (event === 'install_success') {
    localStorage.removeItem('pwa-install-dismissed');
    localStorage.removeItem('pwa-install-prompt-count');
  }
  
  // Send to analytics if available
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', `pwa_${event}`, {
      event_category: 'pwa_installation',
      event_label: getDeviceInfo().isMobile ? 'mobile' : 'desktop',
      ...data
    });
  }
  
  console.log(`PWA Install Event: ${event}`, data);
}

/**
 * Get installation instructions based on device
 */
export function getInstallInstructions(): string[] {
  const deviceInfo = getDeviceInfo();
  
  if (deviceInfo.isIOSSafari) {
    return [
      'Tap the Share button in Safari',
      'Select "Add to Home Screen"',
      'Tap "Add" to install VerifyCert'
    ];
  }
  
  if (deviceInfo.isChrome && deviceInfo.isAndroid) {
    return [
      'Tap the menu button (⋮) in Chrome',
      'Select "Add to Home screen"',
      'Tap "Add" to install VerifyCert'
    ];
  }
  
  if (deviceInfo.isChrome) {
    return [
      'Click the install button in the address bar',
      'Or use the menu → "Install VerifyCert"',
      'Click "Install" to add to your desktop'
    ];
  }
  
  return [
    'Use a supported browser like Chrome or Safari',
    'Look for the install option in your browser',
    'Follow the prompts to install the app'
  ];
}

/**
 * Check if device supports PWA features
 */
export function checkPWASupport(): {
  serviceWorker: boolean;
  manifest: boolean;
  installPrompt: boolean;
  notifications: boolean;
} {
  return {
    serviceWorker: 'serviceWorker' in navigator,
    manifest: 'manifest' in document.createElement('link'),
    installPrompt: 'BeforeInstallPromptEvent' in window,
    notifications: 'Notification' in window
  };
}

/**
 * Get PWA installation status
 */
export function getPWAStatus(): {
  isInstalled: boolean;
  isInstallable: boolean;
  installMethod: 'automatic' | 'manual' | 'none';
} {
  const deviceInfo = getDeviceInfo();
  const support = checkPWASupport();
  
  return {
    isInstalled: deviceInfo.isStandalone,
    isInstallable: deviceInfo.canInstall,
    installMethod: support.installPrompt ? 'automatic' : 
                   deviceInfo.isIOSSafari ? 'manual' : 'none'
  };
}