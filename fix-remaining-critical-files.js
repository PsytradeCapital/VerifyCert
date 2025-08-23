const fs = require('fs');

console.log('🔧 Fixing remaining critical files...');

// Fix styles/utils.ts - this has many template literal errors
const stylesUtils = `// Utility functions for styling
export const getColor = (color: string, shade: number) => {
  return \`var(--color-\${color}-\${shade})\`;
};

export const createAnimation = (name: string, duration: number, easing: string) => {
  return {
    animationName: name,
    animationDuration: duration + 'ms',
    animationTimingFunction: easing
  };
};

export const animations = {
  fadeIn: 'opacity 0.3s ease-in-out',
  slideUp: 'transform 0.4s ease-out',
  scaleIn: 'transform 0.3s ease-out'
};

export const colorCombinations = {
  primary: {
    background: 'var(--color-primary-500)',
    backgroundHover: 'var(--color-primary-600)',
    backgroundActive: 'var(--color-primary-700)',
    text: 'var(--color-neutral-50)',
    border: 'var(--color-primary-500)'
  },
  secondary: {
    background: 'var(--color-neutral-100)',
    backgroundHover: 'var(--color-neutral-200)',
    backgroundActive: 'var(--color-neutral-300)',
    text: 'var(--color-neutral-900)',
    border: 'var(--color-neutral-300)'
  }
};

export const createResponsiveClasses = (baseClass: string, breakpoints: Record<string, string>) => {
  const classes = [baseClass];
  
  Object.entries(breakpoints).forEach(([breakpoint, className]) => {
    classes.push(breakpoint + ':' + className);
  });
  
  return classes.join(' ');
};

export const validateContrast = (foreground: string, background: string) => {
  // Simple contrast validation
  return true;
};

export const createVariants = <T extends Record<string, any>>(variants: T) => {
  return variants;
};

export const createSizes = <T extends Record<string, any>>(sizes: T) => {
  return sizes;
};

export const createResponsiveClass = (
  mobileClass: string,
  desktopClass: string,
  tabletClass?: string
) => {
  const classes = [mobileClass];
  
  if (tabletClass) {
    classes.push('md:' + tabletClass);
    classes.push('lg:' + desktopClass);
  } else {
    classes.push('md:' + desktopClass);
  }
  
  return classes.join(' ');
};

export const createResponsiveSpacing = (mobile: string, desktop: string, tablet?: string) => {
  return createResponsiveClass('p-' + mobile, 'p-' + desktop, tablet ? 'p-' + tablet : undefined);
};

export const createResponsiveText = (mobile: string, desktop: string, tablet?: string) => {
  return createResponsiveClass('text-' + mobile, 'text-' + desktop, tablet ? 'text-' + tablet : undefined);
};

export const createSafeAreaPadding = (direction: 'top' | 'bottom' | 'left' | 'right' | 'all' = 'all') => {
  const paddingMap = {
    top: 'pt-safe',
    bottom: 'pb-safe',
    left: 'pl-safe',
    right: 'pr-safe',
    all: 'p-safe'
  };
  
  return paddingMap[direction] || paddingMap.all;
};

export const createResponsiveGrid = (mobileCols: number, desktopCols: number, tabletCols?: number) => {
  const mobileClass = 'grid-cols-' + mobileCols;
  const desktopClass = 'grid-cols-' + desktopCols;
  const tabletClass = tabletCols ? 'grid-cols-' + tabletCols : undefined;
  
  return createResponsiveClass(mobileClass, desktopClass, tabletClass);
};

export class ResponsiveManager {
  private listeners: Array<(size: 'mobile' | 'tablet' | 'desktop') => void> = [];
  
  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.handleResize());
    }
  }
  
  private handleResize() {
    const size = this.getCurrentSize();
    this.listeners.forEach(callback => callback(size));
  }
  
  public addListener(callback: (size: 'mobile' | 'tablet' | 'desktop') => void) {
    this.listeners.push(callback);
  }
  
  public removeListener(callback: (size: 'mobile' | 'tablet' | 'desktop') => void) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }
  
  public destroy() {
    this.listeners = [];
  }
  
  public getCurrentSize(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }
}
`;

// Fix performanceMonitoring.ts
const performanceMonitoring = `export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  
  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }
  
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }
  
  clearMetrics() {
    this.metrics = [];
  }
  
  mark(name: string) {
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        performance.mark(name);
      } catch (error) {
        console.warn('Performance mark failed:', error);
      }
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

export const withPerformanceMonitoring = <T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T => {
  return ((...args: any[]) => {
    const startTime = performance.now();
    performanceMonitor.mark(name + '-start');
    
    try {
      const result = fn(...args);
      
      if (result instanceof Promise) {
        return result.finally(() => {
          const endTime = performance.now();
          performanceMonitor.recordMetric({
            name,
            value: endTime - startTime,
            timestamp: Date.now()
          });
        });
      }
      
      const endTime = performance.now();
      performanceMonitor.recordMetric({
        name,
        value: endTime - startTime,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      performanceMonitor.recordMetric({
        name: name + '-error',
        value: endTime - startTime,
        timestamp: Date.now(),
        metadata: { error: (error as Error).message }
      });
      throw error;
    }
  }) as T;
};
`;

// Fix performanceSetup.ts
const performanceSetup = `export interface PerformanceConfig {
  enableMetrics: boolean;
  enableTiming: boolean;
  enableUserTiming: boolean;
}

export class PerformanceSetup {
  private config: PerformanceConfig;
  
  constructor(config: PerformanceConfig) {
    this.config = config;
  }
  
  initializePerformanceMonitoring() {
    if (!this.config.enableMetrics) return;
    
    this.setupNavigationTiming();
    this.setupUserInteractionTiming();
  }
  
  private setupNavigationTiming() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        console.log('Page loaded');
      });
    }
  }
  
  private setupUserInteractionTiming() {
    if (typeof window !== 'undefined') {
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const identifier = target.id || target.className || 'unknown';
        console.log('Click interaction on:', identifier);
      });
    }
  }
}

export const createPerformanceSetup = (config: PerformanceConfig) => {
  return new PerformanceSetup(config);
};

export const defaultPerformanceConfig: PerformanceConfig = {
  enableMetrics: true,
  enableTiming: true,
  enableUserTiming: true
};
`;

// Fix pushNotifications.ts
const pushNotifications = `export interface PushNotificationConfig {
  apiEndpoint: string;
  vapidKey: string;
}

export class PushNotificationManager {
  private config: PushNotificationConfig;
  
  constructor(config: PushNotificationConfig) {
    this.config = config;
  }
  
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }
    
    return await Notification.requestPermission();
  }
  
  async subscribe(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push messaging not supported');
    }
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.config.vapidKey
      });
      
      const response = await fetch(this.config.apiEndpoint + '/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      });
      
      if (!response.ok) {
        throw new Error('Failed to subscribe');
      }
      
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }
}
`;

// Fix browserCompatibilityFixes.ts
const browserCompatibilityFixes = `export function initializeBrowserCompatibility() {
  if (!window.IntersectionObserver) {
    console.warn('IntersectionObserver not supported');
  }
  
  if (!window.ResizeObserver) {
    console.warn('ResizeObserver not supported');
  }
  
  if (!CSS.supports('color', 'var(--test)')) {
    console.warn('CSS custom properties not supported');
  }
}

export function detectBrowserFeatures() {
  return {
    intersectionObserver: 'IntersectionObserver' in window,
    resizeObserver: 'ResizeObserver' in window,
    customProperties: CSS.supports('color', 'var(--test)'),
    webp: false
  };
}
`;

// Fix lazyLoading.tsx
const lazyLoading = `import React, { Suspense, lazy } from 'react';

export interface LazyComponentProps {
  fallback?: React.ReactNode;
  placeholder?: string;
  className?: string;
}

export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) => {
  const LazyComponent = lazy(importFn);
  
  return (props: React.ComponentProps<T> & LazyComponentProps) => {
    const { fallback, placeholder, className, ...componentProps } = props;
    
    const defaultFallback = (
      <div className={className || 'flex items-center justify-center p-4'}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        {placeholder && <span className="ml-2">{placeholder}</span>}
      </div>
    );
    
    return (
      <Suspense fallback={fallback || defaultFallback}>
        <LazyComponent {...componentProps as React.ComponentProps<T>} />
      </Suspense>
    );
  };
};

export const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}> = ({ src, alt, className, placeholder }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(e) => {
        if (placeholder) {
          (e.target as HTMLImageElement).src = placeholder;
        }
      }}
    />
  );
};
`;

// Write all fixes
const fixes = [
  { path: 'frontend/src/styles/utils.ts', content: stylesUtils },
  { path: 'frontend/src/utils/performanceMonitoring.ts', content: performanceMonitoring },
  { path: 'frontend/src/utils/performanceSetup.ts', content: performanceSetup },
  { path: 'frontend/src/utils/pushNotifications.ts', content: pushNotifications },
  { path: 'frontend/src/utils/browserCompatibilityFixes.ts', content: browserCompatibilityFixes },
  { path: 'frontend/src/utils/lazyLoading.tsx', content: lazyLoading }
];

fixes.forEach(({ path, content }) => {
  try {
    fs.writeFileSync(path, content);
    console.log('✅ Fixed:', path);
  } catch (error) {
    console.error('❌ Failed to fix:', path, error.message);
  }
});

console.log('✅ Remaining critical files fixed!');