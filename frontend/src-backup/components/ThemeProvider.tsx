/**
 * Theme Provider Component
 * Manages theme state and provides theme switching functionality
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initializeTheme, toggleTheme as utilToggleTheme, getCurrentTheme } from '../styles/utils';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark';

export function ThemeProvider({ children, defaultTheme = 'light' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<'light' | 'dark'>(defaultTheme);

  useEffect(() => {
    // Initialize theme on mount
    initializeTheme();
    setThemeState(getCurrentTheme());

    // Listen for theme changes
    const handleThemeChange = (event: CustomEvent) => {
      setThemeState(event.detail.theme);
    };

    window.addEventListener('theme-changed', handleThemeChange as EventListener);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme-preference')) {
        const newTheme = e.matches ? 'dark' : 'light';
        setThemeState(newTheme);
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      window.removeEventListener('theme-changed', handleThemeChange as EventListener);
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    utilToggleTheme();
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme-preference', newTheme);
    setThemeState(newTheme);
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: newTheme } }));
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );

/**
 * Hook to use theme context
 * @returns Theme context value
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  return context;

/**
 * Theme Toggle Button Component
 */
interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';

export function ThemeToggle({ className = '', size = 'md' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        btn-ghost
        rounded-full
        flex items-center justify-center
        transition-all duration-200
        hover:bg-neutral-100 dark:hover:bg-neutral-800
        focus-ring
        ${className}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
    </button>
  );

/**
 * Theme-aware component wrapper
 * Automatically applies theme-specific classes
 */
interface ThemeAwareProps {
  children: ReactNode;
  lightClass?: string;
  darkClass?: string;
  className?: string;

export function ThemeAware({ 
  children, 
  lightClass = '', 
  darkClass = '', 
  className = '' 
}: ThemeAwareProps) {
  const { theme } = useTheme();
  
  const themeClass = theme === 'light' ? lightClass : darkClass;
  const combinedClassName = `${className} ${themeClass}`.trim();

  return (
    <div className={combinedClassName}>
      {children}
    </div>
  );

/**
 * Hook to get theme-specific values
 * @param lightValue - Value for light theme
 * @param darkValue - Value for dark theme
 * @returns Current theme value
 */
export function useThemeValue<T>(lightValue: T, darkValue: T): T {
  const { theme } = useTheme();
  return theme === 'light' ? lightValue : darkValue;

/**
 * System theme detection hook
 * @returns Boolean indicating if system prefers dark mode
 */
export function useSystemTheme(): boolean {
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return systemPrefersDark;