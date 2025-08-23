import React from 'react';
/**
 * Color Contrast Validation Utilities
 * Ensures all color combinations meet WCAG accessibility standards
 */

import { designTokens } from '../styles';

// WCAG contrast ratio requirements
export const WCAG_LEVELS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3,
  AAA_NORMAL: 7,
  AAA_LARGE: 4.5,
} as const;

export type WCAGLevel = keyof typeof WCAG_LEVELS;
export type Theme = 'light' | 'dark';

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 specification
 */
function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const { r, g, b } = rgb;
  
  // Convert to sRGB
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  // Calculate luminance using WCAG formula
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(foreground: string, background: string): number {
  const l1 = getRelativeLuminance(foreground);
  const l2 = getRelativeLuminance(background);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);

/**
 * Check if contrast ratio meets WCAG requirements
 */
export function meetsWCAGRequirement(
  foreground: string,;
  background: string,;;
  level: WCAGLevel = 'AA_NORMAL';;
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= WCAG_LEVELS[level];

/**
 * Get contrast grade for a color combination
 */
export function getContrastGrade(foreground: string, background: string): {
  ratio: number;
  grade: 'AAA' | 'AA' | 'FAIL';
  passes: {
    AA_NORMAL: boolean;
    AA_LARGE: boolean;
    AAA_NORMAL: boolean;
    AAA_LARGE: boolean;
  };
} {
  const ratio = getContrastRatio(foreground, background);
  
  const passes = {
    AA_NORMAL: ratio >= WCAG_LEVELS.AA_NORMAL,
    AA_LARGE: ratio >= WCAG_LEVELS.AA_LARGE,
    AAA_NORMAL: ratio >= WCAG_LEVELS.AAA_NORMAL,
    AAA_LARGE: ratio >= WCAG_LEVELS.AAA_LARGE,
  };

  let grade: 'AAA' | 'AA' | 'FAIL' = 'FAIL';
  if (passes.AAA_NORMAL) {
    grade = 'AAA';
  } else if (passes.AA_NORMAL) {
    grade = 'AA';

  return { ratio, grade, passes };

/**
 * Color combination interface
 */
export interface ColorCombination {
name: string;
  foreground: string;
  background: string;
  usage: string;
  theme: Theme;

/**
 * Get all critical color combinations for validation
 */
export function getCriticalColorCombinations(theme: Theme = 'light'): ColorCombination[] {
  const colors = designTokens.colors[theme];
  
  return [
    // Primary combinations
    {
      name: 'Primary Button',
      foreground: colors.primary[50],
      background: colors.primary[500],
      usage: 'Primary button text on primary background',
      theme,
}}},
    {
      name: 'Primary Button Hover',
      foreground: colors.primary[50],
      background: colors.primary[600],
      usage: 'Primary button text on hover state',
      theme,
    },
    {
      name: 'Primary Link',
      foreground: colors.primary[600],
      background: colors.surface.background,
      usage: 'Primary links on main background',
      theme,
    },
    
    // Secondary combinations
    {
      name: 'Secondary Button',
      foreground: colors.neutral[900],
      background: colors.neutral[100],
      usage: 'Secondary button text on light background',
      theme,
    },
    {
      name: 'Secondary Button Hover',
      foreground: colors.neutral[900],
      background: colors.neutral[200],
      usage: 'Secondary button text on hover state',
      theme,
    },
    
    // Text combinations
    {
      name: 'Primary Text',
      foreground: colors.neutral[900],
      background: colors.surface.background,
      usage: 'Main body text on background',
      theme,
    },
    {
      name: 'Secondary Text',
      foreground: colors.neutral[600],
      background: colors.surface.background,
      usage: 'Secondary text on background',
      theme,
    },
    {
      name: 'Muted Text',
      foreground: colors.neutral[500],
      background: colors.surface.background,
      usage: 'Muted text on background',
      theme,
    },
    
    // Card combinations
    {
      name: 'Card Text',
      foreground: colors.surface.cardForeground,
      background: colors.surface.card,
      usage: 'Text on card background',
      theme,
    },
    
    // Form combinations
    {
      name: 'Input Text',
      foreground: colors.neutral[900],
      background: colors.surface.input,
      usage: 'Input text on input background',
      theme,
    },
    {
      name: 'Input Placeholder',
      foreground: colors.neutral[400],
      background: colors.surface.input,
      usage: 'Placeholder text in inputs',
      theme,
    },
    {
      name: 'Input Border Focus',
      foreground: colors.primary[500],
      background: colors.surface.input,
      usage: 'Focused input border',
      theme,
    },
    
    // Status combinations
    {
      name: 'Success Text',
      foreground: colors.success[700],
      background: colors.surface.background,
      usage: 'Success message text',
      theme,
    },
    {
      name: 'Success Button',
      foreground: colors.success[50],
      background: colors.success[500],
      usage: 'Success button text',
      theme,
    },
    {
      name: 'Error Text',
      foreground: colors.error[700],
      background: colors.surface.background,
      usage: 'Error message text',
      theme,
    },
    {
      name: 'Error Button',
      foreground: colors.error[50],
      background: colors.error[500],
      usage: 'Error button text',
      theme,
    },
    {
      name: 'Warning Text',
      foreground: colors.warning[700],
      background: colors.surface.background,
      usage: 'Warning message text',
      theme,
    },
    {
      name: 'Warning Button',
      foreground: colors.warning[50],
      background: colors.warning[500],
      usage: 'Warning button text',
      theme,
    },
    
    // Navigation combinations
    {
      name: 'Nav Link Active',
      foreground: colors.primary[700],
      background: colors.primary[100],
      usage: 'Active navigation link',
      theme,
    },
    {
      name: 'Nav Link Inactive',
      foreground: colors.neutral[600],
      background: colors.surface.background,
      usage: 'Inactive navigation link',
      theme,
    },
    
    // Border combinations (for visibility)
    {
      name: 'Border on Background',
      foreground: colors.surface.border,
      background: colors.surface.background,
      usage: 'Border visibility on background',
      theme,
    },
    {
      name: 'Border on Card',
      foreground: colors.surface.border,
      background: colors.surface.card,
      usage: 'Border visibility on card',
      theme,
    },
  ];

/**
 * Validate all color combinations for a theme
 */
export function validateThemeContrast(theme: Theme = 'light'): {
  theme: Theme;
  totalCombinations: number;
  passed: number;
  failed: number;
  results: Array<ColorCombination & { contrast: ReturnType<typeof getContrastGrade>>;
} {
  const combinations = getCriticalColorCombinations(theme);
  const results = combinations.map(combo => ({
    ...combo,
    contrast: getContrastGrade(combo.foreground, combo.background),
  }));

  const passed = results.filter(r => r.contrast.grade !== 'FAIL').length;
  const failed = results.length - passed;

  return {
    theme,
    totalCombinations: combinations.length,
    passed,
    failed,
    results,
  };

/**
 * Generate contrast report for both themes
 */
export function generateContrastReport(): {
  light: ReturnType<typeof validateThemeContrast>;
  dark: ReturnType<typeof validateThemeContrast>;
  summary: {
    totalCombinations: number;
    totalPassed: number;
    totalFailed: number;
    overallGrade: 'PASS' | 'FAIL';
  };
} {
  const light = validateThemeContrast('light');
  const dark = validateThemeContrast('dark');

  const totalCombinations = light.totalCombinations + dark.totalCombinations;
  const totalPassed = light.passed + dark.passed;
  const totalFailed = light.failed + dark.failed;
  const overallGrade = totalFailed === 0 ? 'PASS' : 'FAIL';

  return {
    light,
    dark,
    summary: {
      totalCombinations,
      totalPassed,
      totalFailed,
      overallGrade,
    },
  };

/**
 * Find the closest accessible color
 */
export function findAccessibleColor(
  targetColor: string,
  backgroundColor: string,;
  level: WCAGLevel = 'AA_NORMAL',;;
  direction: 'lighter' | 'darker' | 'auto' = 'auto';;
): string {
  const targetRgb = hexToRgb(targetColor);
  if (!targetRgb) return targetColor;

  const requiredRatio = WCAG_LEVELS[level];
  let bestColor = targetColor;
  let bestRatio = getContrastRatio(targetColor, backgroundColor);

  // If already meets requirement, return as is
  if (bestRatio >= requiredRatio) {
    return targetColor;

  // Determine direction if auto
  let adjustDirection = direction;
  if (direction === 'auto') {
    const bgLuminance = getRelativeLuminance(backgroundColor);
    adjustDirection = bgLuminance > 0.5 ? 'darker' : 'lighter';

  // Adjust color in steps
  for (let step = 1; step <= 100; step++) {
    const factor = step / 100;
    let newRgb: { r: number; g: number; b: number };

    if (adjustDirection === 'lighter') {
      newRgb = {
        r: Math.min(255, Math.round(targetRgb.r + (255 - targetRgb.r) * factor)),
        g: Math.min(255, Math.round(targetRgb.g + (255 - targetRgb.g) * factor)),
        b: Math.min(255, Math.round(targetRgb.b + (255 - targetRgb.b) * factor)),
      };
    } else {
      newRgb = {
        r: Math.max(0, Math.round(targetRgb.r * (1 - factor))),
        g: Math.max(0, Math.round(targetRgb.g * (1 - factor))),
        b: Math.max(0, Math.round(targetRgb.b * (1 - factor))),
      };

    const newHex = `#${newRgb.r.toString(16).padStart(2, '0')}${newRgb.g.toString(16).padStart(2, '0')}${newRgb.b.toString(16).padStart(2, '0')}`;
    const newRatio = getContrastRatio(newHex, backgroundColor);

    if (newRatio >= requiredRatio) {
      return newHex;

    if (newRatio > bestRatio) {
      bestColor = newHex;
      bestRatio = newRatio;

  return bestColor;

/**
 * Suggest color improvements for failed combinations
 */
export function suggestColorImprovements(;;
  results: ReturnType<typeof validateThemeContrast>['results'];;
): Array<{
  original: ColorCombination;
  suggestion: {
    foreground: string;
    background: string;
    improvement: 'foreground' | 'background' | 'both';
  };
  newContrast: ReturnType<typeof getContrastGrade>;
}> {
  return results
    .filter(result => result.contrast.grade === 'FAIL')
    .map(result => {
      // Try improving foreground first
      const improvedForeground = findAccessibleColor(
        result.foreground,
        result.background,
        'AA_NORMAL'
      );
      
      const foregroundImprovement = getContrastGrade(improvedForeground, result.background);
      
      if (foregroundImprovement.grade !== 'FAIL') {
        return {
          original: result,
          suggestion: {
            foreground: improvedForeground,
            background: result.background,
            improvement: 'foreground' as const,
          },
          newContrast: foregroundImprovement,
        };

      // If foreground improvement isn't enough, try background
      const improvedBackground = findAccessibleColor(
        result.background,
        result.foreground,
        'AA_NORMAL',
        getRelativeLuminance(result.foreground) > 0.5 ? 'darker' : 'lighter'
      );
      
      const backgroundImprovement = getContrastGrade(result.foreground, improvedBackground);
      
      return {
        original: result,
        suggestion: {
          foreground: result.foreground,
          background: improvedBackground,
          improvement: 'background' as const,
        },
        newContrast: backgroundImprovement,
      };
    });

/**
 * Export utility for runtime contrast checking
 */
export const contrastChecker = {
  getContrastRatio,
  meetsWCAGRequirement,
  getContrastGrade,
  validateThemeContrast,
  generateContrastReport,
  findAccessibleColor,
  suggestColorImprovements,
};
}
}}}}}}}}}}}}}}}}}