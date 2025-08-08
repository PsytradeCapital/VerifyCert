/**
 * Design Tokens (TypeScript version)
 * Central configuration for all design values used throughout the application
 */

// Import the JavaScript version to ensure consistency
import { designTokens as jsTokens } from './tokens.js';

// Theme-specific types
export type Theme = 'light' | 'dark';

// Type definitions for better TypeScript support
export type ColorScale = typeof jsTokens.colors.primary;
export type SpacingValue = keyof typeof jsTokens.spacing;
export type FontSize = keyof typeof jsTokens.typography.fontSize;
export type FontWeight = keyof typeof jsTokens.typography.fontWeight;
export type BorderRadius = keyof typeof jsTokens.borderRadius;
export type BoxShadow = keyof typeof jsTokens.boxShadow;

// Theme-specific types
export type ThemeColors = typeof jsTokens.colors.light;
export type ThemeShadows = typeof jsTokens.boxShadow.light;
export type CSSVariables = typeof jsTokens.cssVariables.light;

// Utility types for theme-aware components
export interface ThemeConfig {
  theme: Theme;
  colors: ThemeColors;
  shadows: ThemeShadows;
  cssVariables: CSSVariables;
}

// Color utility types
export type ColorVariant = 'primary' | 'accent' | 'neutral' | 'success' | 'error' | 'warning' | 'info';
export type ColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
export type SurfaceColor = keyof typeof jsTokens.colors.light.surface;

// Helper function to get theme-specific tokens
export function getThemeTokens(theme: Theme): ThemeConfig {
  return {
    theme,
    colors: jsTokens.colors[theme] || jsTokens.colors.light,
    shadows: jsTokens.boxShadow[theme] || jsTokens.boxShadow.light,
    cssVariables: jsTokens.cssVariables[theme] || jsTokens.cssVariables.light
  };
}

// Export with proper TypeScript typing
export const designTokens = jsTokens;

// Also export a default to ensure module compatibility
export default designTokens;