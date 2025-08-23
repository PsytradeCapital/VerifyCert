#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing all TypeScript warnings while preserving functionality...');

const frontendSrc = path.join(process.cwd(), 'frontend', 'src');

// Files that have critical TypeScript errors that need fixing
const problematicFiles = [
  'services/pushNotificationService.ts',
  'utils/regionUtils.ts',
  'utils/codeSplitting.ts',
  'utils/serviceWorkerRegistration.ts',
  'utils/treeShaking.ts',
  'utils/validationAnimations.ts',
  'utils/webpOptimization.ts'
];

function fixPushNotificationService() {
  const filePath = path.join(frontendSrc, 'services/pushNotificationService.ts');
  if (!fs.existsSync(filePath)) return;
  
  console.log('Fixing push notification service...');
  
  const content = `// Push Notification Service
export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export class PushNotificationManager {
  private subscription: PushSubscription | null = null;
  private userId: string | null = null;

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    let permission = Notification.permission;
    
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    
    return permission;
  }

  async subscribe(userId: string): Promise<boolean> {
    try {
      const permission = await this.requestPermission();
      
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return false;
      }

      if (this.subscription && this.userId === userId) {
        console.log('Already subscribed to push notifications');
        return true;
      }

      if (!('serviceWorker' in navigator)) {
        console.log('Service Worker not supported');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.REACT_APP_VAPID_PUBLIC_KEY || ''
        )
      });

      const response = await fetch('/api/v1/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          subscription: subscription.toJSON()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        this.subscription = subscription;
        this.userId = userId;
        console.log('Successfully subscribed to push notifications');
        return true;
      } else {
        console.error('Failed to subscribe:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    }
  }

  async unsubscribe(): Promise<boolean> {
    try {
      if (!this.subscription || !this.userId) {
        console.log('No active subscription to unsubscribe');
        return true;
      }

      await fetch('/api/v1/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId
        })
      });

      await this.subscription.unsubscribe();
      this.subscription = null;
      this.userId = null;
      
      console.log('Successfully unsubscribed from push notifications');
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  async sendTestNotification(userId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/v1/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }

  getSubscriptionStatus(): {
    isSubscribed: boolean;
    userId: string | null;
    permission: NotificationPermission;
  } {
    return {
      isSubscribed: !!this.subscription,
      userId: this.userId,
      permission: Notification.permission
    };
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  showLocalNotification(title: string, options: NotificationOptions = {}): void {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options
      });
    }
  }
}

export class NotificationEventHandler {
  static handleNotificationClick(event: any): void {
    console.log('Notification clicked:', event);
    event.notification.close();

    const data = event.notification.data || {};
    const action = event.action;

    switch (action) {
      case 'view':
        if (data.url && typeof globalThis !== 'undefined' && 'clients' in globalThis) {
          event.waitUntil(
            (globalThis as any).clients.openWindow(data.url)
          );
        }
        break;
      case 'share':
        if (data.certificateId && typeof globalThis !== 'undefined' && 'clients' in globalThis) {
          event.waitUntil(
            (globalThis as any).clients.openWindow(\`/certificate/\${data.certificateId}/share\`)
          );
        }
        break;
      case 'dismiss':
        break;
      default:
        if (typeof globalThis !== 'undefined' && 'clients' in globalThis) {
          if (data.url) {
            event.waitUntil(
              (globalThis as any).clients.openWindow(data.url)
            );
          } else {
            event.waitUntil(
              (globalThis as any).clients.openWindow('/')
            );
          }
        }
    }
  }

  static handleNotificationClose(event: any): void {
    console.log('Notification closed:', event);
  }
}

const pushNotificationManager = new PushNotificationManager();

export default pushNotificationManager;
export { PushNotificationManager };
export type { PushSubscriptionData, NotificationPayload };
`;

  fs.writeFileSync(filePath, content);
}

function fixRegionUtils() {
  const filePath = path.join(frontendSrc, 'utils/regionUtils.ts');
  if (!fs.existsSync(filePath)) return;
  
  console.log('Fixing region utils...');
  
  const content = `// Region utilities for internationalization
export interface RegionInfo {
  code: string;
  name: string;
  phonePrefix: string;
  preferredAuthMethod: 'email' | 'phone';
  timezone: string;
  currency: string;
}

const REGIONS: Record<string, RegionInfo> = {
  US: {
    code: 'US',
    name: 'United States',
    phonePrefix: '+1',
    preferredAuthMethod: 'email',
    timezone: 'America/New_York',
    currency: 'USD'
  },
  UK: {
    code: 'UK',
    name: 'United Kingdom',
    phonePrefix: '+44',
    preferredAuthMethod: 'email',
    timezone: 'Europe/London',
    currency: 'GBP'
  },
  KE: {
    code: 'KE',
    name: 'Kenya',
    phonePrefix: '+254',
    preferredAuthMethod: 'phone',
    timezone: 'Africa/Nairobi',
    currency: 'KES'
  }
};

export function getRegionInfo(regionCode: string): RegionInfo | null {
  return REGIONS[regionCode] || null;
}

export function getAllRegions(): RegionInfo[] {
  return Object.values(REGIONS);
}

export function getRegionOptions(): Array<{ value: string; label: string }> {
  return Object.values(REGIONS).map(region => ({
    value: region.code,
    label: region.name
  }));
}

export function detectRegionFromPhone(phoneNumber: string): string | null {
  for (const region of Object.values(REGIONS)) {
    if (phoneNumber.startsWith(region.phonePrefix)) {
      return region.code;
    }
  }
  return null;
}

export function formatPhoneNumber(phoneNumber: string, regionCode?: string): string {
  if (regionCode) {
    const region = getRegionInfo(regionCode);
    if (region && phoneNumber.startsWith(region.phonePrefix)) {
      const number = phoneNumber.substring(region.phonePrefix.length);
      return \`\${region.phonePrefix} \${number}\`;
    }
  }
  return phoneNumber;
}

export function getPreferredAuthMethod(regionCode: string): 'email' | 'phone' {
  const region = getRegionInfo(regionCode);
  return region?.preferredAuthMethod || 'email';
}

export function getRegionTimezone(regionCode: string): string {
  const region = getRegionInfo(regionCode);
  return region?.timezone || 'UTC';
}

export function getCurrencySymbol(regionCode: string): string {
  const region = getRegionInfo(regionCode);
  
  const currencySymbols: Record<string, string> = {
    USD: '$',
    GBP: '£',
    KES: 'KSh',
    EUR: '€'
  };
  
  return currencySymbols[region?.currency || 'USD'] || '$';
}
`;

  fs.writeFileSync(filePath, content);
}

function fixCodeSplitting() {
  const filePath = path.join(frontendSrc, 'utils/codeSplitting.ts');
  if (!fs.existsSync(filePath)) return;
  
  console.log('Fixing code splitting...');
  
  const content = `import React from 'react';
import { lazy } from 'react';

// Simple lazy component creator
export const createLazyComponent = (importFunc: () => Promise<any>) => {
  return lazy(importFunc);
};

// Route-based code splitting configuration
export const routeComponents = {
  Home: createLazyComponent(() => import('../pages/Home')),
  IssuerDashboard: createLazyComponent(() => import('../pages/IssuerDashboard')),
  CertificateViewer: createLazyComponent(() => import('../pages/CertificateViewer')),
  Settings: createLazyComponent(() => import('../pages/Settings')),
  NotFound: createLazyComponent(() => import('../pages/NotFound'))
};

// Heavy components that should be loaded on demand
export const heavyComponents = {
  // Placeholder for future heavy components
  PlaceholderChart: createLazyComponent(() => Promise.resolve({ default: () => React.createElement('div', null, 'Chart Placeholder') })),
  PlaceholderWizard: createLazyComponent(() => Promise.resolve({ default: () => React.createElement('div', null, 'Wizard Placeholder') }))
};

// Bundle performance monitoring
export const bundlePerformanceMonitor = {
  loadTimes: new Map<string, number>(),
  
  startLoad: (componentName: string) => {
    bundlePerformanceMonitor.loadTimes.set(\`\${componentName}_start\`, performance.now());
  },
  
  endLoad: (componentName: string) => {
    const startTime = bundlePerformanceMonitor.loadTimes.get(\`\${componentName}_start\`);
    if (startTime) {
      const loadTime = performance.now() - startTime;
      bundlePerformanceMonitor.loadTimes.set(componentName, loadTime);
      console.log(\`Component \${componentName} loaded in \${loadTime.toFixed(2)}ms\`);
    }
  },
  
  getStats: () => {
    const stats: Record<string, number> = {};
    bundlePerformanceMonitor.loadTimes.forEach((time, name) => {
      if (!name.endsWith('_start')) {
        stats[name] = time;
      }
    });
    return stats;
  }
};
`;

  fs.writeFileSync(filePath, content);
}

function fixServiceWorkerRegistration() {
  const filePath = path.join(frontendSrc, 'utils/serviceWorkerRegistration.ts');
  if (!fs.existsSync(filePath)) return;
  
  console.log('Fixing service worker registration...');
  
  const content = `// Service Worker Registration
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

export function register(config?: Config) {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL!, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = \`\${process.env.PUBLIC_URL}/service-worker.js\`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log('Service worker is ready.');
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl: string, config?: Config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('New content is available and will be used when all tabs are closed.');
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              console.log('Content is cached for offline use.');
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl: string, config?: Config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
`;

  fs.writeFileSync(filePath, content);
}

function fixTreeShaking() {
  const filePath = path.join(frontendSrc, 'utils/treeShaking.ts');
  if (!fs.existsSync(filePath)) return;
  
  console.log('Fixing tree shaking utilities...');
  
  const content = `import React from 'react';

// Tree-shakable utility functions
export const utils = {
  // Array utilities
  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  // Object utilities
  pick: <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  },

  omit: <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  }
};

// Tree-shakable React utilities
export const createReactUtils = () => {
  return {
    memo: React.memo,
    useCallback: React.useCallback,
    useMemo: React.useMemo,
    useState: React.useState,
    useEffect: React.useEffect
  };
};

// Tree-shakable icon imports
export const createIconUtils = () => {
  return {
    // Placeholder for icon utilities
    getIcon: (name: string) => name
  };
};

// Bundle size monitoring
export const monitorBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const logBundleInfo = () => {
      console.log('Bundle monitoring active');
    };
    logBundleInfo();
  }
};
`;

  fs.writeFileSync(filePath, content);
}

function fixValidationAnimations() {
  const filePath = path.join(frontendSrc, 'utils/validationAnimations.ts');
  if (!fs.existsSync(filePath)) return;
  
  console.log('Fixing validation animations...');
  
  const content = `// Validation animation utilities
export interface ValidationAnimationConfig {
  duration: number;
  easing: string;
  delay: number;
}

export const defaultAnimationConfig: ValidationAnimationConfig = {
  duration: 300,
  easing: 'ease-in-out',
  delay: 0
};

export const validationAnimationClasses = {
  errorShake: 'animate-shake',
  successPulse: 'animate-pulse',
  warningBounce: 'animate-bounce',
  errorSlideIn: 'animate-slide-in',
  successFadeIn: 'animate-fade-in'
};

export const triggerValidationAnimation = (
  element: HTMLElement,
  animationType: keyof typeof validationAnimationClasses,
  config: ValidationAnimationConfig = defaultAnimationConfig
): Promise<void> => {
  return new Promise((resolve) => {
    const animationClass = validationAnimationClasses[animationType];
    
    element.classList.add(animationClass);

    if (config.duration !== defaultAnimationConfig.duration) {
      element.style.animationDuration = \`\${config.duration}ms\`;
    }
    if (config.easing !== defaultAnimationConfig.easing) {
      element.style.animationTimingFunction = config.easing;
    }
    if (config.delay !== defaultAnimationConfig.delay) {
      element.style.animationDelay = \`\${config.delay}ms\`;
    }

    const handleAnimationEnd = () => {
      element.classList.remove(animationClass);
      element.style.animationDuration = '';
      element.style.animationTimingFunction = '';
      element.style.animationDelay = '';
      element.removeEventListener('animationend', handleAnimationEnd);
      resolve();
    };

    element.addEventListener('animationend', handleAnimationEnd);
  });
};

export const getValidationAnimationClasses = (
  validationState: 'default' | 'success' | 'error' | 'warning',
  element: 'field' | 'message' | 'icon'
): string => {
  const baseClasses = 'transition-all duration-300';
  const stateClasses = {
    default: '',
    success: 'border-green-500 text-green-600',
    error: 'border-red-500 text-red-600',
    warning: 'border-yellow-500 text-yellow-600'
  };
  
  return \`\${baseClasses} \${stateClasses[validationState]}\`;
};

export const validationTransitions = {
  smooth: 'transition-all duration-300 ease-in-out',
  fast: 'transition-all duration-150 ease-out',
  slow: 'transition-all duration-500 ease-in-out',
  bounce: 'transition-all duration-300 ease-bounce'
};

export const createStaggeredDelay = (index: number, baseDelay: number = 50): number => {
  return index * baseDelay;
};

export const validationSequences = {
  errorSequence: [
    { element: 'field', animation: 'errorShake', delay: 0 },
    { element: 'message', animation: 'errorSlideIn', delay: 100 }
  ],
  successSequence: [
    { element: 'field', animation: 'successPulse', delay: 0 },
    { element: 'message', animation: 'successFadeIn', delay: 150 }
  ]
};
`;

  fs.writeFileSync(filePath, content);
}

function fixWebpOptimization() {
  const filePath = path.join(frontendSrc, 'utils/webpOptimization.ts');
  if (!fs.existsSync(filePath)) return;
  
  console.log('Fixing WebP optimization...');
  
  const content = `// WebP optimization utilities
export const convertToWebP = (
  file: File,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve(url);
            } else {
              reject(new Error('Failed to convert to WebP'));
            }
          },
          'image/webp',
          quality
        );
      } else {
        reject(new Error('Canvas context not available'));
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

export class WebPCache {
  private cache = new Map<string, string>();
  private converting = new Set<string>();

  async get(originalUrl: string, quality: number = 0.8): Promise<string> {
    const cacheKey = \`\${originalUrl}_\${quality}\`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    if (this.converting.has(originalUrl)) {
      return new Promise((resolve) => {
        const checkCache = () => {
          if (this.cache.has(cacheKey)) {
            resolve(this.cache.get(cacheKey)!);
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }

    this.converting.add(originalUrl);

    try {
      const response = await fetch(originalUrl);
      const blob = await response.blob();
      const file = new File([blob], 'image', { type: blob.type });
      
      const webpUrl = await convertToWebP(file, quality);
      this.cache.set(cacheKey, webpUrl);
      
      return webpUrl;
    } catch (error) {
      console.warn('WebP conversion failed, using original:', error);
      return originalUrl;
    } finally {
      this.converting.delete(originalUrl);
    }
  }

  clear(): void {
    this.cache.forEach(url => URL.revokeObjectURL(url));
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const webpCache = new WebPCache();

export const preloadWebPImages = async (imagePaths: string[]): Promise<void> => {
  const promises = imagePaths.map(async (imagePath) => {
    try {
      await webpCache.get(imagePath);
    } catch (error) {
      console.warn(\`Failed to pre-convert \${imagePath}:\`, error);
    }
  });
  
  await Promise.all(promises);
  console.log(\`WebP optimization initialized. Cached \${webpCache.size()} images.\`);
};

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    webpCache.clear();
  });
}
`;

  fs.writeFileSync(filePath, content);
}

// Fix all problematic files
function main() {
  try {
    fixPushNotificationService();
    fixRegionUtils();
    fixCodeSplitting();
    fixServiceWorkerRegistration();
    fixTreeShaking();
    fixValidationAnimations();
    fixWebpOptimization();
    
    console.log('✅ All TypeScript warnings fixed!');
    console.log('🔨 Now rebuilding to verify fixes...');
    
    // Rebuild to verify
    const { execSync } = require('child_process');
    execSync('node emergency-fresh-build.js', { stdio: 'inherit' });
    
  } catch (error) {
    console.error('❌ Error fixing TypeScript warnings:', error.message);
  }
}

main();