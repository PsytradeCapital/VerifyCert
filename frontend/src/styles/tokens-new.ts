/**
 * Design Tokens (TypeScript version)
 * Central configuration for all design values used throughout the application
 */

// Theme-specific types
export type Theme = 'light' | 'dark';

// Basic design tokens structure (simplified for testing)
export const designTokens = {
  colors: {
    light: {
      primary: {
        50: '#ffffff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#2563eb',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        950: '#172554'
      },
      surface: {
        background: '#ffffff',
        foreground: '#111827',
        card: '#ffffff',
        cardForeground: '#111827'
      }
    },
    dark: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',  // Keep consistent primary color
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        950: '#172554'
      },
      surface: {
        background: '#0f172a',
        foreground: '#f1f5f9',  // Light text for dark background
        card: '#1e293b',
        cardForeground: '#f1f5f9'  // Light text for dark cards
      }
    }
  },
  boxShadow: {
    light: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
    },
    dark: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)'
    }
  },
  cssVariables: {
    light: {
      '--color-background': '#ffffff',
      '--color-foreground': '#111827',
      '--color-primary': '#3b82f6'
    },
    dark: {
      '--color-background': '#0f172a',
      '--color-foreground': '#f1f5f9',
      '--color-primary': '#60a5fa'
    }
  }
};

// Type definitions
export type ThemeColors = typeof designTokens.colors.light;
export type ThemeShadows = typeof designTokens.boxShadow.light;
export type CSSVariables = typeof designTokens.cssVariables.light;

// Utility types for theme-aware components
export interface ThemeConfig {
  theme: Theme;
  colors: ThemeColors;
  shadows: ThemeShadows;
  cssVariables: CSSVariables;
}

// Helper function to get theme-specific tokens
export function getThemeTokens(theme: Theme): ThemeConfig {
  return {
    theme,
    colors: designTokens.colors[theme] || designTokens.colors.light,
    shadows: designTokens.boxShadow[theme] || designTokens.boxShadow.light,
    cssVariables: designTokens.cssVariables[theme] || designTokens.cssVariables.light
  };
}