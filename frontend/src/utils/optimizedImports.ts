/**
 * Optimized Imports Configuration
 * Ensures tree shaking works properly for all dependencies
 */

// Tree-shakable React imports
export {
  memo,
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
  useContext,
  createContext,
  forwardRef,
  lazy,
  Suspense
} from 'react';

// Tree-shakable React Router imports
export {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
  Link,
  NavLink
} from 'react-router-dom';

// Tree-shakable Framer Motion imports
export {
  motion,
  AnimatePresence,
  useAnimation,
  useMotionValue,
  useTransform,
  useSpring
} from 'framer-motion';

// Tree-shakable Ethers imports
export {
  ethers,
  Contract,
  BrowserProvider,
  formatEther,
  parseEther,
  isAddress
} from 'ethers';

// Tree-shakable utility functions
export const optimizedUtils = {
  // Date utilities
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => 
    new Intl.DateTimeFormat('en-US', options).format(date),
  
  // String utilities
  truncateAddress: (address: string, start = 6, end = 4) =>
    `${address.slice(0, start)}...${address.slice(-end)}`,
  
  // Validation utilities
  isValidEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  isValidUrl: (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  // Array utilities
  groupBy: <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },
  
  // Object utilities
  deepMerge: <T extends Record<string, any>>(target: T, source: Partial<T>): T => {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key] as T[Extract<keyof T, string>];
      }
    }
    return result;
  }
};

// Tree-shakable constants
export const APP_CONSTANTS = {
  NETWORK: {
    CHAIN_ID: 80001,
    NAME: 'Polygon Mumbai',
    RPC_URL: 'https://rpc-mumbai.maticvigil.com',
  },
  STORAGE_KEYS: {
    THEME: 'verifycert-theme',
    WALLET: 'verifycert-wallet',
    SETTINGS: 'verifycert-settings',
  },
  API_ENDPOINTS: {
    CERTIFICATES: '/api/certificates',
    VERIFY: '/api/verify',
    MINT: '/api/mint',
  }
} as const;

// Tree-shakable type definitions
export interface OptimizedComponent {
  displayName?: string;
  defaultProps?: Record<string, any>;
}

export type TreeShakableHook<T = any> = () => T;

export interface BundleOptimization {
  chunkName: string;
  priority: number;
  test: RegExp;
}