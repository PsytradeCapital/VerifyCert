/**
 * Design Token Utilities
 * Helper functions for working with design tokens in TypeScript/JavaScript
 */

import React from 'react';
import { designTokens } from './tokens-new';

/**
 * Utility function for combining class names
 * Similar to clsx but simplified for our needs
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Type definitions for better TypeScript support
export type ColorScale = typeof designTokens.colors.primary;
export type ColorName = keyof typeof designTokens.colors;
export type ColorShade = keyof ColorScale;
export type SpacingValue = keyof typeof designTokens.spacing;
export type FontSize = keyof typeof designTokens.typography.fontSize;
export type FontWeight = keyof typeof designTokens.typography.fontWeight;
export type BorderRadius = keyof typeof designTokens.borderRadius;
export type BoxShadow = keyof typeof designTokens.boxShadow;
export type ZIndex = keyof typeof designTokens.zIndex;

/**
 * Get a color value from the design tokens
 * @param colorName - The color name (e.g., 'primary', 'accent', 'neutral')
 * @param shade - The color shade (e.g., 50, 100, 500, 900)
 * @returns The hex color value
 */
export function getColor(colorName: ColorName, shade: ColorShade): string {
  return designTokens.colors[colorName][shade];
}

/**
 * Get a spacing value from the design tokens
 * @param size - The spacing size key
 * @returns The spacing value in rem/px
 */
export function getSpacing(size: SpacingValue): string {
  return designTokens.spacing[size];
}

/**
 * Get a font size configuration from the design tokens
 * @param size - The font size key
 * @returns The font size configuration [size, { lineHeight }]
 */
export function getFontSize(size: FontSize): [string, { lineHeight: string }] | string {
  return designTokens.typography.fontSize[size];
}

/**
 * Get a font weight value from the design tokens
 * @param weight - The font weight key
 * @returns The font weight value
 */
export function getFontWeight(weight: FontWeight): string {
  return designTokens.typography.fontWeight[weight];
}

/**
 * Get a border radius value from the design tokens
 * @param radius - The border radius key
 * @returns The border radius value
 */
export function getBorderRadius(radius: BorderRadius): string {
  return designTokens.borderRadius[radius];
}

/**
 * Get a box shadow value from the design tokens
 * @param shadow - The box shadow key
 * @returns The box shadow value
 */
export function getBoxShadow(shadow: BoxShadow): string {
  return designTokens.boxShadow[shadow];
}

/**
 * Get a z-index value from the design tokens
 * @param layer - The z-index layer key
 * @returns The z-index value
 */
export function getZIndex(layer: ZIndex): string {
  return designTokens.zIndex[layer];
}

/**
 * Create a CSS custom property name for a color
 * @param colorName - The color name
 * @param shade - The color shade
 * @returns The CSS custom property name
 */
export function getColorCSSVar(colorName: ColorName, shade: ColorShade): string {
  return `--color-${colorName}-${shade}`;
}

/**
 * Create a CSS custom property name for spacing
 * @param size - The spacing size
 * @returns The CSS custom property name
 */
export function getSpacingCSSVar(size: SpacingValue): string {
  return `--spacing-${size.toString().replace('.', '-')}`;
}

/**
 * Generate CSS-in-JS styles using design tokens
 * @param styles - Style object with token references
 * @returns Resolved CSS-in-JS styles
 */
export function createStyles<T extends Record<string, any>>(styles: T): T {
  return styles;
}

/**
 * Enhanced responsive breakpoint utilities
 */
export const breakpoints = {
  xs: `@media (min-width: ${designTokens.breakpoints.xs})`,
  sm: `@media (min-width: ${designTokens.breakpoints.sm})`,
  md: `@media (min-width: ${designTokens.breakpoints.md})`,
  lg: `@media (min-width: ${designTokens.breakpoints.lg})`,
  xl: `@media (min-width: ${designTokens.breakpoints.xl})`,
  '2xl': `@media (min-width: ${designTokens.breakpoints['2xl']})`,
  '3xl': `@media (min-width: ${designTokens.breakpoints['3xl']})`,
  
  // Max-width breakpoints for mobile-first approach
  'max-xs': `@media (max-width: calc(${designTokens.breakpoints.xs} - 1px))`,
  'max-sm': `@media (max-width: calc(${designTokens.breakpoints.sm} - 1px))`,
  'max-md': `@media (max-width: calc(${designTokens.breakpoints.md} - 1px))`,
  'max-lg': `@media (max-width: calc(${designTokens.breakpoints.lg} - 1px))`,
  'max-xl': `@media (max-width: calc(${designTokens.breakpoints.xl} - 1px))`,
  'max-2xl': `@media (max-width: calc(${designTokens.breakpoints['2xl']} - 1px))`,
  
  // Range breakpoints
  'mobile': '@media (max-width: 767px)',
  'tablet': '@media (min-width: 768px) and (max-width: 1023px)',
  'desktop': '@media (min-width: 1024px)',
  'touch': '@media (max-width: 1023px)',
  
  // Feature-based breakpoints
  'hover': '@media (hover: hover)',
  'no-hover': '@media (hover: none)',
  'portrait': '@media (orientation: portrait)',
  'landscape': '@media (orientation: landscape)',
  'motion': '@media (prefers-reduced-motion: no-preference)',
  'no-motion': '@media (prefers-reduced-motion: reduce)',
  'dark': '@media (prefers-color-scheme: dark)',
  'light': '@media (prefers-color-scheme: light)',
  'high-contrast': '@media (prefers-contrast: high)',
  'print': '@media print',
};

/**
 * Animation utilities
 */
export const animations = {
  duration: designTokens.animation.duration,
  easing: designTokens.animation.easing,
  
  // Common animation presets
  fadeIn: `opacity 0 to 1 ${designTokens.animation.duration[300]} ${designTokens.animation.easing.out}`,
  slideUp: `transform translateY(20px) to translateY(0) ${designTokens.animation.duration[300]} ${designTokens.animation.easing.out}`,
  scaleIn: `transform scale(0.95) to scale(1) ${designTokens.animation.duration[200]} ${designTokens.animation.easing.out}`,
};

/**
 * Common color combinations for different UI states
 */
export const colorCombinations = {
  primary: {
    background: getColor('primary', 500),
    backgroundHover: getColor('primary', 600),
    backgroundActive: getColor('primary', 700),
    text: getColor('neutral', 50),
    border: getColor('primary', 500),
  },
  secondary: {
    background: getColor('neutral', 100),
    backgroundHover: getColor('neutral', 200),
    backgroundActive: getColor('neutral', 300),
    text: getColor('neutral', 900),
    border: getColor('neutral', 300),
  },
  success: {
    background: getColor('success', 500),
    backgroundHover: getColor('success', 600),
    backgroundActive: getColor('success', 700),
    text: getColor('neutral', 50),
    border: getColor('success', 500),
  },
  error: {
    background: getColor('error', 500),
    backgroundHover: getColor('error', 600),
    backgroundActive: getColor('error', 700),
    text: getColor('neutral', 50),
    border: getColor('error', 500),
  },
  warning: {
    background: getColor('warning', 500),
    backgroundHover: getColor('warning', 600),
    backgroundActive: getColor('warning', 700),
    text: getColor('neutral', 50),
    border: getColor('warning', 500),
  },
};

/**
 * Theme management utilities
 */

/**
 * Check if dark mode is currently active
 * @returns Boolean indicating if dark mode is active
 */
export function isDarkMode(): boolean {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

/**
 * Get the current theme
 * @returns Current theme ('light' or 'dark')
 */
export function getCurrentTheme(): 'light' | 'dark' {
  return document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'light';
}

/**
 * Toggle between light and dark themes
 */
export function toggleTheme(): void {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  
  // Store preference in localStorage
  localStorage.setItem('theme-preference', newTheme);
  
  // Dispatch custom event for theme change
  window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: newTheme } }));
}

/**
 * Initialize theme based on user preference or system preference
 */
export function initializeTheme(): void {
  const storedTheme = localStorage.getItem('theme-preference');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const theme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme-preference')) {
      const newTheme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: newTheme } }));
    }
  });
}

/**
 * CSS Custom Property utilities
 */

/**
 * Get a CSS custom property value
 * @param property - CSS custom property name (with or without --)
 * @returns The computed value of the CSS custom property
 */
export function getCSSCustomProperty(property: string): string {
  const propName = property.startsWith('--') ? property : `--${property}`;
  return getComputedStyle(document.documentElement).getPropertyValue(propName).trim();
}

/**
 * Set a CSS custom property value
 * @param property - CSS custom property name (with or without --)
 * @param value - The value to set
 */
export function setCSSCustomProperty(property: string, value: string): void {
  const propName = property.startsWith('--') ? property : `--${property}`;
  document.documentElement.style.setProperty(propName, value);
}

/**
 * Tailwind class generation utilities
 */

/**
 * Generate Tailwind class names from design token values
 * @param tokenPath - Path to the design token (e.g., 'primary.500')
 * @param prefix - Tailwind utility prefix (e.g., 'bg', 'text', 'border')
 * @returns Tailwind class name
 */
export function generateTailwindClass(tokenPath: string, prefix: string): string {
  const parts = tokenPath.split('.');
  if (parts.length >= 2) {
    const [category, variant] = parts;
    return `${prefix}-${category}-${variant}`;
  }
  return `${prefix}-${tokenPath}`;
}

/**
 * Create responsive utility classes
 * @param baseClass - Base Tailwind class
 * @param breakpoints - Object with breakpoint keys and class values
 * @returns Space-separated string of responsive classes
 */
export function createResponsiveClasses(
  baseClass: string,
  breakpoints: Record<string, string>
): string {
  const classes = [baseClass];
  
  for (const [breakpoint, className] of Object.entries(breakpoints)) {
    classes.push(`${breakpoint}:${className}`);
  }
  
  return classes.join(' ');
}

/**
 * Accessibility utilities
 */

/**
 * Validate if a color meets WCAG contrast requirements
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @param level - WCAG level ('AA' or 'AAA')
 * @returns Boolean indicating if contrast is sufficient
 */
export function validateContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const requiredRatio = level === 'AAA' ? 7 : 4.5;
  
  // Convert hex to RGB and calculate luminance
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  return ratio >= requiredRatio;
}

/**
 * Component styling utilities
 */

/**
 * Create component variant styles
 * @param baseStyles - Base styles for the component
 * @param variants - Object with variant names and their styles
 * @param defaultVariant - Default variant name
 * @returns Function that returns styles for a given variant
 */
export function createVariants<T extends Record<string, any>>(
  baseStyles: T,
  variants: Record<string, Partial<T>>,
  defaultVariant: string
) {
  return (variant: string = defaultVariant): T => {
    return {
      ...baseStyles,
      ...variants[variant],
    };
  };
}

/**
 * Create size-based styles
 * @param sizes - Object with size names and their styles
 * @param defaultSize - Default size name
 * @returns Function that returns styles for a given size
 */
export function createSizes<T extends Record<string, any>>(
  sizes: Record<string, T>,
  defaultSize: string
) {
  return (size: string = defaultSize): T => {
    return sizes[size] || sizes[defaultSize];
  };
}

/**
 * Mobile-specific utilities
 */

/**
 * Check if the current device is likely a mobile device
 * @returns Boolean indicating if device is mobile
 */
export function isMobileDevice(): boolean {
  return window.innerWidth < 768;
}

/**
 * Check if the current device is likely a tablet
 * @returns Boolean indicating if device is tablet
 */
export function isTabletDevice(): boolean {
  return window.innerWidth >= 768 && window.innerWidth < 1024;
}

/**
 * Check if the current device is likely a desktop
 * @returns Boolean indicating if device is desktop
 */
export function isDesktopDevice(): boolean {
  return window.innerWidth >= 1024;
}

/**
 * Check if the current device supports touch
 * @returns Boolean indicating if device supports touch
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Check if the current device supports hover
 * @returns Boolean indicating if device supports hover
 */
export function isHoverDevice(): boolean {
  return window.matchMedia('(hover: hover)').matches;
}

/**
 * Get the current viewport size category
 * @returns Viewport size category
 */
export function getViewportSize(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Create responsive class names based on viewport
 * @param mobileClass - Class for mobile devices
 * @param tabletClass - Class for tablet devices (optional)
 * @param desktopClass - Class for desktop devices
 * @returns Responsive class string
 */
export function createResponsiveClass(
  mobileClass: string,
  desktopClass: string,
  tabletClass?: string
): string {
  const classes = [mobileClass];
  
  if (tabletClass) {
    classes.push(`md:${tabletClass}`);
    classes.push(`lg:${desktopClass}`);
  } else {
    classes.push(`md:${desktopClass}`);
  }
  
  return classes.join(' ');
}

/**
 * Create mobile-first responsive spacing
 * @param mobile - Mobile spacing value
 * @param desktop - Desktop spacing value
 * @param tablet - Optional tablet spacing value
 * @returns Responsive spacing classes
 */
export function createResponsiveSpacing(
  mobile: string,
  desktop: string,
  tablet?: string
): string {
  return createResponsiveClass(mobile, desktop, tablet);
}

/**
 * Create mobile-first responsive text sizes
 * @param mobile - Mobile text size
 * @param desktop - Desktop text size
 * @param tablet - Optional tablet text size
 * @returns Responsive text size classes
 */
export function createResponsiveText(
  mobile: string,
  desktop: string,
  tablet?: string
): string {
  return createResponsiveClass(`text-${mobile}`, `text-${desktop}`, tablet ? `text-${tablet}` : undefined);
}

/**
 * Create touch-friendly button classes
 * @param size - Touch target size ('sm' | 'md' | 'lg' | 'xl')
 * @returns Touch-friendly class names
 */
export function createTouchTarget(size: 'sm' | 'md' | 'lg' | 'xl' = 'md'): string {
  const sizeClasses = {
    sm: 'min-h-10 min-w-10', // 40px
    md: 'min-h-11 min-w-11', // 44px
    lg: 'min-h-12 min-w-12', // 48px
    xl: 'min-h-14 min-w-14'  // 56px
  };
  
  return cn('flex items-center justify-center', sizeClasses[size]);
}

/**
 * Create safe area padding classes
 * @param sides - Which sides to apply safe area padding ('all' | 'x' | 'y' | 'top' | 'bottom' | 'left' | 'right')
 * @returns Safe area padding classes
 */
export function createSafeAreaPadding(
  sides: 'all' | 'x' | 'y' | 'top' | 'bottom' | 'left' | 'right' = 'all'
): string {
  const sideClasses = {
    all: 'safe-area',
    x: 'safe-area-x',
    y: 'safe-area-y',
    top: 'safe-top',
    bottom: 'safe-bottom',
    left: 'safe-left',
    right: 'safe-right'
  };
  
  return sideClasses[sides];
}

/**
 * Create mobile-optimized grid classes
 * @param mobileCols - Number of columns on mobile
 * @param desktopCols - Number of columns on desktop
 * @param tabletCols - Optional number of columns on tablet
 * @returns Responsive grid classes
 */
export function createResponsiveGrid(
  mobileCols: number,
  desktopCols: number,
  tabletCols?: number
): string {
  const mobileClass = `grid-cols-${mobileCols}`;
  const desktopClass = `grid-cols-${desktopCols}`;
  const tabletClass = tabletCols ? `grid-cols-${tabletCols}` : undefined;
  
  return createResponsiveClass(mobileClass, desktopClass, tabletClass);
}

/**
 * Viewport change listener utility
 */
export class ViewportListener {
  private listeners: Array<(size: 'mobile' | 'tablet' | 'desktop') => void> = [];
  private currentSize: 'mobile' | 'tablet' | 'desktop';
  
  constructor() {
    this.currentSize = getViewportSize();
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }
  
  private handleResize() {
    const newSize = getViewportSize();
    if (newSize !== this.currentSize) {
      this.currentSize = newSize;
      this.listeners.forEach(listener => listener(newSize));
    }
  }
  
  public addListener(callback: (size: 'mobile' | 'tablet' | 'desktop') => void) {
    this.listeners.push(callback);
    // Call immediately with current size
    callback(this.currentSize);
  }
  
  public removeListener(callback: (size: 'mobile' | 'tablet' | 'desktop') => void) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }
  
  public destroy() {
    window.removeEventListener('resize', this.handleResize);
    this.listeners = [];
  }
  
  public getCurrentSize(): 'mobile' | 'tablet' | 'desktop' {
    return this.currentSize;
  }
}

/**
 * React hook for viewport size (if using React)
 */
export function useViewportSize() {
  const [viewportSize, setViewportSize] = React.useState<'mobile' | 'tablet' | 'desktop'>(getViewportSize());
  
  React.useEffect(() => {
    const listener = new ViewportListener();
    listener.addListener(setViewportSize);
    
    return () => listener.destroy();
  }, []);
  
  return viewportSize;
}

/**
 * Export all design tokens for direct access
 */
export { designTokens };