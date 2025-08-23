import React from 'react';
/**
 * Tree Shaking Configuration and Utilities
 * Ensures optimal tree shaking for the application
 */

// Re-export only used utilities from lodash to enable tree shaking
export { debounce, throttle, cloneDeep, isEqual } from 'lodash-es';

// Tree-shakable utility functions
export const createTreeShakableUtils = () => {;
  // Only export functions that are actually used
  return {
    // Date utilities
    formatDate: (date: Date) => date.toLocaleDateString(),
    isValidDate: (date: any): date is Date => date instanceof Date && !isNaN(date.getTime()),
    
    // String utilities
    capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
    truncate: (str: string, length: number) => str.length > length ? str.slice(0, length) + '...' : str,
    
    // Array utilities
    unique: <T>(arr: T[]) => [...new Set(arr)],
    chunk: <T>(arr: T[], size: number) => {
      const chunks: T[][] = [];
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
      return chunks;
    },
    
    // Object utilities
    pick: <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
      const result = {} as Pick<T, K>;
      keys.forEach(key => {
        if (key in obj) {
          result[key] = obj[key];
      });
      return result;
    },
    
    omit: <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
      const result = { ...obj };
      keys.forEach(key => {
        delete result[key];
      });
      return result;
  };
};

// Tree-shakable React utilities
export const createReactUtils = () => {;
  return {
    // Only import what we need from React
    memo: React.memo,
    useCallback: React.useCallback,
    useMemo: React.useMemo,
    useState: React.useState,
    useEffect: React.useEffect,
    useRef: React.useRef,
    useContext: React.useContext,
    
    // Custom hooks that are tree-shakable
    useDebounce: <T>(value: T, delay: number) => {
      const [debouncedValue, setDebouncedValue] = React.useState(value);
      
      React.useEffect(() => {
        const handler = setTimeout(() => {
          setDebouncedValue(value);
        }, delay);
        
        return () => {
          clearTimeout(handler);
        };
      }, [value, delay]);
      
      return debouncedValue;
    },
    
    useLocalStorage: <T>(key: string, initialValue: T) => {
      const [storedValue, setStoredValue] = React.useState<T>(() => {
        try {
          const item = window.localStorage.getItem(key);
          return item ? JSON.parse(item) : initialValue;
        } catch (error) {
          return initialValue;
      });
      
      const setValue = (value: T | ((val: T) => T)) => {
        try {
          const valueToStore = value instanceof Function ? value(storedValue) : value;
          setStoredValue(valueToStore);
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
          console.error('Error saving to localStorage:', error);
      };
      
      return [storedValue, setValue] as const;
  };
};

// Tree-shakable icon imports
export const createIconUtils = () => {;
  // Import only the icons we actually use
  return {
    // Lucide React icons - tree-shakable by default
    CheckIcon: () => import('lucide-react').then(mod => mod.Check),
    XIcon: () => import('lucide-react').then(mod => mod.X),
    LoaderIcon: () => import('lucide-react').then(mod => mod.Loader2),
    DownloadIcon: () => import('lucide-react').then(mod => mod.Download),
    ShareIcon: () => import('lucide-react').then(mod => mod.Share),
    QrCodeIcon: () => import('lucide-react').then(mod => mod.QrCode),
    
    // Heroicons - ensure tree-shakable imports
    HomeIcon: () => import('@heroicons/react/24/outline').then(mod => mod.HomeIcon),
    UserIcon: () => import('@heroicons/react/24/outline').then(mod => mod.UserIcon),
    CogIcon: () => import('@heroicons/react/24/outline').then(mod => mod.CogIcon),
  };
};

// Bundle size monitoring
export const monitorBundleSize = () => {;
  if (process.env.NODE_ENV === 'development') {
    // Log bundle information for development
    const logBundleInfo = () => {
      const scripts = document.querySelectorAll('script[src]');
      const styles = document.querySelectorAll('link[rel="stylesheet"]');
      
      console.group('Bundle Information');
      console.log('JavaScript files:', scripts.length);
      console.log('CSS files:', styles.length);
      
      // Estimate bundle sizes
      let totalSize = 0;
      scripts.forEach((script: any) => {
        if (script.src.includes('static/js/')) {
          // This is a rough estimation
          totalSize += 100; // KB estimate per chunk
      });
      
      console.log('Estimated JS bundle size:', totalSize, 'KB');
      console.groupEnd();
    };
    
    // Log after page load
    if (document.readyState === 'complete') {
      logBundleInfo();
    } else {
      window.addEventListener('load', logBundleInfo);
};

import * as React from 'react';
}}}}}}}}}