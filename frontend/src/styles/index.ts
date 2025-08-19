/**
 * Design System Exports
 * Central export point for all design system utilities and tokens
 */

// Import CSS tokens for side effects (CSS custom properties)
import './tokens.css';

// Export design tokens
export { designTokens, getThemeTokens, type Theme, type ThemeConfig } from './tokens-new';

// Export utility functions and types
export {
  getColor,
  getSpacing,
  getFontSize,
  getFontWeight,
  getBorderRadius,
  getBoxShadow,
  getZIndex,
  getColorCSSVar,
  getSpacingCSSVar,
  createStyles,
  breakpoints,
  animations,
  colorCombinations,
  // Theme utilities
  isDarkMode,
  getCurrentTheme,
  toggleTheme,
  initializeTheme,
  getCSSCustomProperty,
  setCSSCustomProperty,
  generateTailwindClass,
  createResponsiveClasses,
  validateContrast,
  createVariants,
  createSizes,
  // Types
  type ColorScale,
  type ColorName,
  type ColorShade,
  type SpacingValue,
  type FontSize,
  type FontWeight,
  type BorderRadius,
  type BoxShadow,
  type ZIndex,
} from './utils';