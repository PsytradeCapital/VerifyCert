import React, { createContext, useContext } from 'react';
import { useTheme } from '../hooks/useTheme';

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themeValue = useTheme();

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

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