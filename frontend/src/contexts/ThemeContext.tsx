/**
 * Theme Context
 * Provides theme state management across the application
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useTheme, ThemeContextType } from '../hooks/useTheme';

// Create theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme Provider Component
 * Wraps the application to provide theme context
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themeValue = useTheme();

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use theme context
 * Must be used within ThemeProvider
 */
export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  
  return context;
};

/**
 * Higher-order component for theme-aware components
 */
export const withTheme = <P extends object>(
  Component: React.ComponentType<P & { theme: ThemeContextType }>
) => {
  const WrappedComponent = (props: P) => {
    const theme = useThemeContext();
    return <Component {...props} theme={theme} />;
  };
  
  WrappedComponent.displayName = `withTheme(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};