/**
 * Theme Utilities
 * Helper functions for theme management and styling
 */

import { Theme, designTokens, getThemeTokens } from '../styles';

/**
 * Get theme-specific color value
 */
export const getThemeColor = (
  theme: Theme,
  colorVariant: keyof typeof designTokens.colors.light,
  shade?: keyof typeof designTokens.colors.light.primary
): string => {
  const themeColors = designTokens.colors[theme];
  const colorGroup = themeColors[colorVariant];
  
  if (typeof colorGroup === 'string') {
    return colorGroup;
  
  if (shade && typeof colorGroup === 'object') {
    return colorGroup[shade] || colorGroup[500];
  
  return typeof colorGroup === 'object' ? colorGroup[500] : colorGroup;
};

/**
 * Get theme-specific shadow value
 */
export const getThemeShadow = (
  theme: Theme,
  shadowSize: keyof typeof designTokens.boxShadow.light
): string => {
  return designTokens.boxShadow[theme][shadowSize];
};

/**
 * Generate theme-aware CSS classes
 */
export const getThemeClasses = (theme: Theme) => {
  const isDark = theme === 'dark';
  
  return {
    // Background classes
    background: isDark ? 'bg-slate-900' : 'bg-white',
    backgroundSecondary: isDark ? 'bg-slate-800' : 'bg-gray-50',
    backgroundTertiary: isDark ? 'bg-slate-700' : 'bg-gray-100',
    
    // Text classes
    text: isDark ? 'text-slate-100' : 'text-slate-900',
    textSecondary: isDark ? 'text-slate-300' : 'text-slate-600',
    textTertiary: isDark ? 'text-slate-400' : 'text-slate-500',
    textMuted: isDark ? 'text-slate-500' : 'text-slate-400',
    
    // Border classes
    border: isDark ? 'border-slate-700' : 'border-slate-200',
    borderSecondary: isDark ? 'border-slate-600' : 'border-slate-300',
    
    // Card classes
    card: isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200',
    cardHover: isDark ? 'hover:bg-slate-750' : 'hover:bg-gray-50',
    
    // Input classes
    input: isDark 
      ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400' 
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400',
    inputFocus: isDark 
      ? 'focus:border-blue-400 focus:ring-blue-400' 
      : 'focus:border-blue-500 focus:ring-blue-500',
    
    // Button classes
    buttonPrimary: isDark 
      ? 'bg-blue-500 hover:bg-blue-400 text-white' 
      : 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonSecondary: isDark 
      ? 'bg-slate-700 hover:bg-slate-600 text-slate-100 border-slate-600' 
      : 'bg-white hover:bg-gray-50 text-slate-900 border-slate-300',
    buttonGhost: isDark 
      ? 'hover:bg-slate-800 text-slate-300' 
      : 'hover:bg-gray-100 text-slate-600',
    
    // Shadow classes
    shadow: isDark ? 'shadow-2xl shadow-black/50' : 'shadow-lg',
    shadowHover: isDark ? 'hover:shadow-2xl hover:shadow-black/60' : 'hover:shadow-xl',
    
    // Ring classes for focus states
    ring: isDark ? 'ring-blue-400' : 'ring-blue-500',
    ringOffset: isDark ? 'ring-offset-slate-900' : 'ring-offset-white',
  };
};

/**
 * Generate CSS custom properties for a theme
 */
export const generateThemeCSS = (theme: Theme): string => {
  const tokens = getThemeTokens(theme);
  const cssVars = Object.entries(tokens.cssVariables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');
  
  const selector = theme === 'dark' ? '[data-theme="dark"]' : ':root';
  
  return `${selector} {\n${cssVars}\n}`;
};

/**
 * Apply theme to document
 */
export const applyThemeToDocument = (theme: Theme): void => {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Remove existing theme attributes
  root.removeAttribute('data-theme');
  
  // Apply new theme
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      'content',
      theme === 'dark' ? '#0f172a' : '#ffffff'
    );
  
  // Update manifest theme colors if available
  const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
  if (manifestLink) {
    // This would require dynamic manifest generation
    // For now, we'll just update the meta tag
};

/**
 * Get system theme preference
 */
export const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Create theme-aware style object for inline styles
 */
export const createThemeStyles = (theme: Theme) => {
  const tokens = getThemeTokens(theme);
  
  return {
    backgroundColor: tokens.colors.surface.background,
    color: tokens.colors.surface.foreground,
    borderColor: tokens.colors.surface.border,
  };
};

/**
 * Get contrast color for accessibility
 */
export const getContrastColor = (backgroundColor: string): 'light' | 'dark' => {
  // Simple contrast calculation - in a real app you might want a more sophisticated algorithm
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? 'dark' : 'light';
};

/**
 * Validate theme value
 */
export const isValidTheme = (value: any): value is Theme => {
  return value === 'light' || value === 'dark';
};

/**
 * Theme transition utilities
 */
export const themeTransition = {
  duration: '200ms',
  easing: 'ease-in-out',
  properties: [
    'background-color',
    'border-color',
    'color',
    'box-shadow',
    'opacity'
  ].join(', ')
};

/**
 * Create theme-aware gradient
 */
export const createThemeGradient = (
  theme: Theme,
  direction: string = '135deg',
  colors: string[] = ['primary', 'accent']
): string => {
  const themeColors = designTokens.colors[theme];
  const gradientColors = colors.map(color => {
    if (color === 'primary') return themeColors.primary[500];
    if (color === 'accent') return themeColors.accent[500];
    return color;
  });
  
  return `linear-gradient(${direction}, ${gradientColors.join(', ')})`;
};
}}}}}