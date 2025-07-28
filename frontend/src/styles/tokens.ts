/**
 * Design Tokens (TypeScript version)
 * Central configuration for all design values used throughout the application
 * This file imports from the JavaScript version to maintain consistency with Tailwind
 */

// Import the JavaScript version to ensure consistency
const { designTokens: jsTokens } = require('./tokens.js');

// Export with proper TypeScript typing
export const designTokens = jsTokens as const;

// Type definitions for better TypeScript support
export type ColorScale = typeof designTokens.colors.primary;
export type SpacingValue = keyof typeof designTokens.spacing;
export type FontSize = keyof typeof designTokens.typography.fontSize;
export type FontWeight = keyof typeof designTokens.typography.fontWeight;
export type BorderRadius = keyof typeof designTokens.borderRadius;
export type BoxShadow = keyof typeof designTokens.boxShadow;