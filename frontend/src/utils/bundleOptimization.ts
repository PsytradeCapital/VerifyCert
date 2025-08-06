/**
 * Bundle Optimization Utilities
 * Provides utilities for tree shaking and dynamic imports
 */

// Tree shaking helper for conditional imports
export const conditionalImport = async <T>(
  condition: boolean,
  importFn: () => Promise<T>
): Promise<T | null> => {
  if (condition) {
    return await importFn();
  }
  return null;
};

// Dynamic import with error handling
export const safeImport = async <T>(
  importFn: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> => {
  try {
    return await importFn();
  } catch (error) {
    console.warn('Dynamic import failed:', error);
    return fallback;
  }
};

// Lazy load utility with preloading
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  preload = false
) => {
  const LazyComponent = React.lazy(importFn);
  
  if (preload) {
    // Preload the component
    importFn().catch(() => {
      // Ignore preload errors
    });
  }
  
  return LazyComponent;
};

// Bundle size monitoring
export const logBundleInfo = () => {
  if (process.env.NODE_ENV === 'development') {
    const performanceEntries = performance.getEntriesByType('navigation');
    if (performanceEntries.length > 0) {
      const entry = performanceEntries[0] as PerformanceNavigationTiming;
      console.log('Bundle Performance Metrics:', {
        loadTime: entry.loadEventEnd - entry.loadEventStart,
        domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
        transferSize: entry.transferSize,
        encodedBodySize: entry.encodedBodySize,
        decodedBodySize: entry.decodedBodySize
      });
    }
  }
};

// Tree shaking verification
export const verifyTreeShaking = () => {
  if (process.env.NODE_ENV === 'development') {
    // Check if unused exports are being included
    const unusedExports = [];
    
    // This would be populated by a build-time analysis
    if (unusedExports.length > 0) {
      console.warn('Potential tree shaking issues detected:', unusedExports);
    }
  }
};

// Bundle size monitoring
export const monitorBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    logBundleInfo();
    verifyTreeShaking();
  }
};

import * as React from 'react';