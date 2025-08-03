import { lazy } from 'react';
import { createLazyComponent } from './lazyLoading';

/**
 * Route-based code splitting configuration
 * This creates separate bundles for different route groups
 */

// Core application routes (loaded immediately)
export const coreRoutes = {
  Home: () => import('../pages/Home'),
  Verify: () => import('../pages/Verify'),
  NotFound: () => import('../pages/NotFound'),
};

// Dashboard routes (loaded when user accesses dashboard)
export const dashboardRoutes = {
  IssuerDashboard: createLazyComponent(() => import('../pages/IssuerDashboard')),
  Settings: createLazyComponent(() => import('../pages/Settings')),
};

// Certificate routes (loaded when viewing certificates)
export const certificateRoutes = {
  CertificateViewer: createLazyComponent(() => import('../pages/CertificateViewer')),
  VerificationPage: createLazyComponent(() => import('../pages/VerificationPage')),
};

// Demo routes (loaded only when accessing demo features)
export const demoRoutes = {
  LayoutDemo: createLazyComponent(() => import('../pages/LayoutDemo')),
  BreadcrumbsDemo: createLazyComponent(() => import('../pages/BreadcrumbsDemo')),
  NavigationDemo: createLazyComponent(() => import('../pages/NavigationDemo')),
  NavigationStateDemo: createLazyComponent(() => import('../pages/NavigationStateDemo')),
  PageTransitionDemo: createLazyComponent(() => import('../pages/PageTransitionDemo')),
  ThemeDemo: createLazyComponent(() => import('../pages/ThemeDemo')),
};

// PWA and testing routes (loaded only when needed)
export const pwaRoutes = {
  PWATestPage: createLazyComponent(() => import('../pages/PWATestPage')),
  PushNotificationDemo: createLazyComponent(() => import('../pages/PushNotificationDemo')),
};

// Component-level code splitting for heavy UI components
export const heavyComponents = {
  // Chart and visualization components
  DashboardCharts: createLazyComponent(() => import('../components/ui/Charts/DashboardCharts')),
  CertificateAnalytics: createLazyComponent(() => import('../components/ui/Analytics/CertificateAnalytics')),
  
  // Complex form components
  CertificateWizard: createLazyComponent(() => import('../components/ui/CertificateWizard/CertificateWizard')),
  AdvancedFileUpload: createLazyComponent(() => import('../components/ui/FileUpload/AdvancedFileUpload')),
  
  // Demo and testing components
  FeedbackAnimationsDemo: createLazyComponent(() => import('../components/FeedbackAnimationsDemo')),
  UIComponentsDemo: createLazyComponent(() => import('../components/UIComponentsDemo')),
  PWATestRunner: createLazyComponent(() => import('../components/PWATestRunner')),
};

/**
 * Preload routes based on user behavior
 */
export const preloadStrategies = {
  // Preload dashboard when user connects wallet
  preloadDashboard: () => {
    dashboardRoutes.IssuerDashboard;
    // Preload related components
    heavyComponents.CertificateWizard;
  },

  // Preload certificate viewer when user starts verification
  preloadCertificateViewer: () => {
    certificateRoutes.CertificateViewer;
    certificateRoutes.VerificationPage;
  },

  // Preload demo routes when user visits any demo
  preloadDemos: () => {
    Object.values(demoRoutes).forEach(route => route);
  },

  // Preload PWA features when service worker is ready
  preloadPWA: () => {
    Object.values(pwaRoutes).forEach(route => route);
  },
};

/**
 * Bundle analysis helper
 */
export const bundleInfo = {
  core: ['Home', 'Verify', 'NotFound', 'Navigation', 'ErrorBoundary'],
  dashboard: ['IssuerDashboard', 'CertificateWizard', 'Settings'],
  certificate: ['CertificateViewer', 'VerificationPage', 'CertificateCard'],
  demo: ['LayoutDemo', 'NavigationDemo', 'ThemeDemo', 'AnimationDemos'],
  pwa: ['PWATestPage', 'PushNotifications', 'ServiceWorker'],
  ui: ['Charts', 'Analytics', 'AdvancedComponents'],
};

/**
 * Dynamic import with retry logic
 */
export const importWithRetry = async (
  importFn: () => Promise<any>,
  retries = 3,
  delay = 1000
): Promise<any> => {
  try {
    return await importFn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return importWithRetry(importFn, retries - 1, delay * 2);
    }
    throw error;
  }
};

/**
 * Prefetch critical routes on app load
 */
export const prefetchCriticalRoutes = () => {
  // Prefetch likely next routes based on current page
  const currentPath = window.location.pathname;
  
  if (currentPath === '/') {
    // From home, users likely go to verify or dashboard
    importWithRetry(() => import('../pages/Verify'));
  } else if (currentPath === '/verify') {
    // From verify, users likely view certificates
    importWithRetry(() => import('../pages/CertificateViewer'));
  }
};

/**
 * Monitor bundle loading performance
 */
export const bundlePerformanceMonitor = {
  loadTimes: new Map<string, number>(),
  
  startLoad: (bundleName: string) => {
    bundlePerformanceMonitor.loadTimes.set(`${bundleName}_start`, Date.now());
  },
  
  endLoad: (bundleName: string) => {
    const startTime = bundlePerformanceMonitor.loadTimes.get(`${bundleName}_start`);
    if (startTime) {
      const loadTime = Date.now() - startTime;
      bundlePerformanceMonitor.loadTimes.set(bundleName, loadTime);
      
      // Log slow loading bundles
      if (loadTime > 2000) {
        console.warn(`Slow bundle load: ${bundleName} took ${loadTime}ms`);
      }
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
  },
};