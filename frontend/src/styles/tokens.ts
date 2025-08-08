/**
 * Design Tokens (TypeScript version)
 * Central configuration for all design values used throughout the application
 */

// Import the JavaScript version to ensure consistency
import { designTokens as jsTokens } from './tokens.js';

// Export with proper TypeScript typing
export const designTokens = jsTokens;

// Also export a default to ensure module compatibility
export default designTokens;

// Theme-specific types
export type Theme = 'light' | 'dark';

// Type definitions for better TypeScript support
export type ColorScale = typeof designTokens.colors.primary;
export type SpacingValue = keyof typeof designTokens.spacing;
export type FontSize = keyof typeof designTokens.typography.fontSize;
export type FontWeight = keyof typeof designTokens.typography.fontWeight;
export type BorderRadius = keyof typeof designTokens.borderRadius;
export type BoxShadow = keyof typeof designTokens.boxShadow;

// Theme-specific types
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

// Color utility types
export type ColorVariant = 'primary' | 'accent' | 'neutral' | 'success' | 'error' | 'warning' | 'info';
export type ColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
export type SurfaceColor = keyof typeof designTokens.colors.light.surface;

// Helper function to get theme-specific tokens
export function getThemeTokens(theme: Theme): ThemeConfig {
  return {
    theme,
    colors: designTokens.colors[theme] || designTokens.colors.light,
    shadows: designTokens.boxShadow[theme] || designTokens.boxShadow.light,
    cssVariables: designTokens.cssVariables[theme] || designTokens.cssVariables.light
  };
}

// Explicit export list to ensure all exports are recognized
export {
  designTokens,
  getThemeTokens,
  type Theme,
  type ThemeConfig,
  type ColorScale,
  type SpacingValue,
  type FontSize,
  type FontWeight,
  type BorderRadius,
  type BoxShadow,
  type ThemeColors,
  type ThemeShadows,
  type CSSVariables,
  type ColorVariant,
  type ColorShade,
  type SurfaceColor
};