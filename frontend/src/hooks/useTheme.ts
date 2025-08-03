/**
 * Theme Hook
 * Provides theme management functionality for React components
 */

import { useState, useEffect, useCallback } from 'react';
import { Theme, getThemeTokens, ThemeConfig } from '../styles/tokens';

// Theme storage key
const THEME_STORAGE_KEY = 'verifycert-theme';

// Theme context type
export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  tokens: any;
  isDark: boolean;
  isLight: boolean;
}

/**
 * Custom hook for theme management
 * Handles theme switching, persistence, and system preference detection
 */
export const useTheme = (): ThemeContextType => {
  // Get initial theme from localStorage or system preference
  const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light';
    
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (stored && (stored === 'light' || stored === 'dark')) {
      return stored;
    }
    
    // Check system preference
    try {
      if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        if (mediaQuery && mediaQuery.matches) {
          return 'dark';
        }
      }
    } catch (error) {
      // Fallback for environments where matchMedia is not available or throws
      console.warn('matchMedia not available, defaulting to light theme');
    }
    
    return 'light';
  };

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Apply theme to document
  const applyTheme = useCallback((newTheme: Theme) => {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    
    // Remove existing theme attributes
    root.removeAttribute('data-theme');
    
    // Apply new theme
    if (newTheme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    }
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content', 
        newTheme === 'dark' ? '#0f172a' : '#ffffff'
      );
    }
  }, []);

  // Set theme with persistence
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    applyTheme(newTheme);
  }, [applyTheme]);

  // Toggle between light and dark themes
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        // Only update if no theme is stored (user hasn't made a choice)
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (!stored) {
          const newTheme = e.matches ? 'dark' : 'light';
          setThemeState(newTheme);
          applyTheme(newTheme);
        }
      };

      if (mediaQuery && mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        
        return () => {
          mediaQuery.removeEventListener('change', handleChange);
        };
      }
    } catch (error) {
      // Fallback for environments where matchMedia is not available
      console.warn('matchMedia not available for theme change detection');
    }
  }, [applyTheme]);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Get theme tokens
  const tokens = getThemeTokens(theme);

  return {
    theme,
    setTheme,
    toggleTheme,
    tokens,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };
};

/**
 * Utility function to get current theme from DOM
 */
export const getCurrentTheme = (): Theme => {
  if (typeof document === 'undefined') return 'light';
  
  const root = document.documentElement;
  return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
};

/**
 * Utility function to check if dark mode is preferred by system
 */
export const isSystemDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      return mediaQuery && mediaQuery.matches;
    }
  } catch (error) {
    console.warn('matchMedia not available for system theme detection');
  }
  
  return false;
};

/**
 * Utility function to get theme-aware class names
 */
export const getThemeClasses = (theme: Theme) => ({
  background: theme === 'dark' ? 'bg-slate-900' : 'bg-white',
  foreground: theme === 'dark' ? 'text-slate-100' : 'text-slate-900',
  card: theme === 'dark' ? 'bg-slate-800' : 'bg-white',
  cardForeground: theme === 'dark' ? 'text-slate-100' : 'text-slate-900',
  muted: theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100',
  mutedForeground: theme === 'dark' ? 'text-slate-400' : 'text-slate-600',
  border: theme === 'dark' ? 'border-slate-700' : 'border-slate-200',
  input: theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200',
  primary: theme === 'dark' ? 'bg-blue-400' : 'bg-blue-600',
  primaryForeground: theme === 'dark' ? 'text-slate-900' : 'text-white',
  secondary: theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100',
  secondaryForeground: theme === 'dark' ? 'text-slate-100' : 'text-slate-900',
  accent: theme === 'dark' ? 'bg-yellow-400' : 'bg-yellow-500',
  accentForeground: theme === 'dark' ? 'text-slate-900' : 'text-slate-900',
  destructive: theme === 'dark' ? 'bg-red-400' : 'bg-red-600',
  destructiveForeground: theme === 'dark' ? 'text-slate-900' : 'text-white',
  ring: theme === 'dark' ? 'ring-blue-400' : 'ring-blue-600',
  shadow: theme === 'dark' ? 'shadow-2xl shadow-black/50' : 'shadow-lg'
});