const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing critical syntax errors in utils directory...');

const utilsDir = path.join(__dirname, 'frontend', 'src', 'utils');

// Files with critical syntax errors that need fixing
const criticalFiles = [
  'pushNotifications.ts',
  'pwaUtils.ts',
  'regionUtils.ts',
  'routeCodeSplitting.ts',
  'serviceWorker.ts',
  'theme.ts',
  'treeShaking.ts',
  'validationAnimations.ts',
  'webpGenerator.ts'
];

// Fix pushNotifications.ts
const pushNotificationsContent = `export interface PushNotificationConfig {
  vapidPublicKey: string;
  apiEndpoint: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
}

export class PushNotificationManager {
  private subscription: PushSubscription | null = null;
  private userId: string | null = null;
  private config: PushNotificationConfig;

  constructor(config: PushNotificationConfig) {
    this.config = config;
  }

  async initialize(userId: string): Promise<boolean> {
    try {
      this.userId = userId;
      
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications not supported');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        this.subscription = subscription;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  async subscribe(): Promise<boolean> {
    try {
      const permission = await this.requestPermission();
      
      if (permission !== 'granted') {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.config.vapidPublicKey)
      });

      this.subscription = subscription;
      
      // Send subscription to server
      const response = await fetch(\`\${this.config.apiEndpoint}/subscribe\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          subscription: subscription.toJSON()
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
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
}
`;

// Fix pwaUtils.ts
const pwaUtilsContent = `export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  platform: string;
}

export function getDeviceInfo(): DeviceInfo {
  const userAgent = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?=.*\\bMobile\\b)(?=.*\\bSafari\\b)|KFAPWI/i.test(userAgent);
  
  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    platform: navigator.platform
  };
}
`;

// Fix regionUtils.ts
const regionUtilsContent = `export interface RegionInfo {
  code: string;
  name: string;
  currency: string;
  timezone: string;
}

const REGIONS: Record<string, RegionInfo> = {
  'US': {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    timezone: 'America/New_York'
  },
  'GB': {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    timezone: 'Europe/London'
  },
  'CA': {
    code: 'CA',
    name: 'Canada',
    currency: 'CAD',
    timezone: 'America/Toronto'
  }
};

export function getRegionInfo(regionCode: string): RegionInfo | null {
  return REGIONS[regionCode] || null;
}

export function getCurrentRegion(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone.split('/')[0] || 'US';
  } catch {
    return 'US';
  }
}
`;

// Fix theme.ts
const themeContent = `export const themes = {
  light: {
    primary: '#3b82f6',
    secondary: '#64748b',
    background: '#ffffff',
    text: '#1f2937'
  },
  dark: {
    primary: '#60a5fa',
    secondary: '#94a3b8',
    background: '#1f2937',
    text: '#f9fafb'
  }
};

export function applyTheme(theme: keyof typeof themes) {
  const root = document.documentElement;
  const themeColors = themes[theme];
  
  Object.entries(themeColors).forEach(([key, value]) => {
    root.style.setProperty(\`--color-\${key}\`, value);
  });
}
`;

// Fix treeShaking.ts
const treeShakingContent = `export const utils = {
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
`;

// Fix validationAnimations.ts
const validationAnimationsContent = `export interface ValidationAnimationConfig {
  duration: number;
  easing: string;
}

export const defaultAnimationConfig: ValidationAnimationConfig = {
  duration: 300,
  easing: 'ease-in-out'
};

export const validationAnimationClasses = {
  success: 'animate-pulse text-green-600',
  error: 'animate-shake text-red-600',
  warning: 'animate-bounce text-yellow-600',
  default: 'text-gray-600'
};

export const animateValidation = (
  element: HTMLElement,
  animationType: keyof typeof validationAnimationClasses
): Promise<void> => {
  return new Promise((resolve) => {
    const className = validationAnimationClasses[animationType];
    element.className = className;
    
    setTimeout(() => {
      resolve();
    }, defaultAnimationConfig.duration);
  });
};
`;

// Fix webpGenerator.ts
const webpGeneratorContent = `export interface WebPOptions {
  quality: number;
  width?: number;
  height?: number;
}

export const convertToWebP = (
  file: File,
  options: WebPOptions = { quality: 0.8 }
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = options.width || img.width;
      canvas.height = options.height || img.height;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert to WebP'));
            }
          },
          'image/webp',
          options.quality
        );
      } else {
        reject(new Error('Canvas context not available'));
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};
`;

// Fix serviceWorker.ts
const serviceWorkerContent = `export interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
}

export function registerSW(config?: ServiceWorkerConfig) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        if (config?.onSuccess) {
          config.onSuccess(registration);
        }
      })
      .catch((error) => {
        console.error('SW registration failed:', error);
      });
  }
}

export function unregisterSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error('SW unregistration failed:', error);
      });
  }
}
`;

// Fix routeCodeSplitting.ts
const routeCodeSplittingContent = `import { lazy } from 'react';

export const lazyLoad = (importFunc: () => Promise<any>) => {
  return lazy(importFunc);
};

export const preloadRoute = (importFunc: () => Promise<any>) => {
  importFunc().catch(() => {
    // Ignore preload errors
  });
};
`;

// Write all fixed files
const fixes = [
  { file: 'pushNotifications.ts', content: pushNotificationsContent },
  { file: 'pwaUtils.ts', content: pwaUtilsContent },
  { file: 'regionUtils.ts', content: regionUtilsContent },
  { file: 'theme.ts', content: themeContent },
  { file: 'treeShaking.ts', content: treeShakingContent },
  { file: 'validationAnimations.ts', content: validationAnimationsContent },
  { file: 'webpGenerator.ts', content: webpGeneratorContent },
  { file: 'serviceWorker.ts', content: serviceWorkerContent },
  { file: 'routeCodeSplitting.ts', content: routeCodeSplittingContent }
];

fixes.forEach(({ file, content }) => {
  const filePath = path.join(utilsDir, file);
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${file}`);
  } catch (error) {
    console.error(`❌ Failed to fix ${file}:`, error.message);
  }
});

console.log('🎉 Critical syntax fixes completed!');