#!/usr/bin/env node

/**
 * Color Contrast Audit Script
 * Validates all color combinations and generates a report
 */

const fs = require('fs');
const path = require('path');

// Import design tokens
const { designTokens } = require('../src/styles/tokens.js');

// WCAG contrast ratio requirements
const WCAG_LEVELS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3,
  AAA_NORMAL: 7,
  AAA_LARGE: 4.5,
};

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate relative luminance of a color
 */
function getRelativeLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const { r, g, b } = rgb;
  
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(foreground, background) {
  const l1 = getRelativeLuminance(foreground);
  const l2 = getRelativeLuminance(background);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get contrast grade for a color combination
 */
function getContrastGrade(foreground, background) {
  const ratio = getContrastRatio(foreground, background);
  
  const passes = {
    AA_NORMAL: ratio >= WCAG_LEVELS.AA_NORMAL,
    AA_LARGE: ratio >= WCAG_LEVELS.AA_LARGE,
    AAA_NORMAL: ratio >= WCAG_LEVELS.AAA_NORMAL,
    AAA_LARGE: ratio >= WCAG_LEVELS.AAA_LARGE,
  };

  let grade = 'FAIL';
  if (passes.AAA_NORMAL) {
    grade = 'AAA';
  } else if (passes.AA_NORMAL) {
    grade = 'AA';
  }

  return { ratio: Math.round(ratio * 100) / 100, grade, passes };
}

/**
 * Get all critical color combinations for validation
 */
function getCriticalColorCombinations(theme = 'light') {
  const colors = designTokens.colors[theme];
  
  return [
    // Primary combinations
    {
      name: 'Primary Button',
      foreground: colors.primary[50],
      background: colors.primary[500],
      usage: 'Primary button text on primary background',
      theme,
    },
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
  ];
}

/**
 * Validate all color combinations for a theme
 */
function validateThemeContrast(theme = 'light') {
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
}

/**
 * Generate contrast report for both themes
 */
function generateContrastReport() {
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
}

/**
 * Format report as markdown
 */
function formatReportAsMarkdown(report) {
  const { light, dark, summary } = report;
  
  let markdown = `# Color Contrast Audit Report

Generated on: ${new Date().toISOString()}

## Summary

- **Total Combinations Tested**: ${summary.totalCombinations}
- **Passed**: ${summary.totalPassed} (${Math.round((summary.totalPassed / summary.totalCombinations) * 100)}%)
- **Failed**: ${summary.totalFailed} (${Math.round((summary.totalFailed / summary.totalCombinations) * 100)}%)
- **Overall Grade**: ${summary.overallGrade}

## Light Theme Results

**Passed**: ${light.passed}/${light.totalCombinations} combinations

### Passing Combinations

| Name | Foreground | Background | Ratio | Grade | Usage |
|------|------------|------------|-------|-------|-------|
`;

  light.results
    .filter(r => r.contrast.grade !== 'FAIL')
    .forEach(result => {
      markdown += `| ${result.name} | ${result.foreground} | ${result.background} | ${result.contrast.ratio}:1 | ${result.contrast.grade} | ${result.usage} |\n`;
    });

  const lightFailed = light.results.filter(r => r.contrast.grade === 'FAIL');
  if (lightFailed.length > 0) {
    markdown += `\n### Failed Combinations\n\n| Name | Foreground | Background | Ratio | Grade | Usage |\n|------|------------|------------|-------|-------|-------|\n`;
    
    lightFailed.forEach(result => {
      markdown += `| ${result.name} | ${result.foreground} | ${result.background} | ${result.contrast.ratio}:1 | ${result.contrast.grade} | ${result.usage} |\n`;
    });
  }

  markdown += `\n## Dark Theme Results\n\n**Passed**: ${dark.passed}/${dark.totalCombinations} combinations\n\n### Passing Combinations\n\n| Name | Foreground | Background | Ratio | Grade | Usage |\n|------|------------|------------|-------|-------|-------|\n`;

  dark.results
    .filter(r => r.contrast.grade !== 'FAIL')
    .forEach(result => {
      markdown += `| ${result.name} | ${result.foreground} | ${result.background} | ${result.contrast.ratio}:1 | ${result.contrast.grade} | ${result.usage} |\n`;
    });

  const darkFailed = dark.results.filter(r => r.contrast.grade === 'FAIL');
  if (darkFailed.length > 0) {
    markdown += `\n### Failed Combinations\n\n| Name | Foreground | Background | Ratio | Grade | Usage |\n|------|------------|------------|-------|-------|-------|\n`;
    
    darkFailed.forEach(result => {
      markdown += `| ${result.name} | ${result.foreground} | ${result.background} | ${result.contrast.ratio}:1 | ${result.contrast.grade} | ${result.usage} |\n`;
    });
  }

  markdown += `\n## WCAG Requirements\n\n- **AA Normal Text**: 4.5:1 minimum contrast ratio\n- **AA Large Text**: 3:1 minimum contrast ratio\n- **AAA Normal Text**: 7:1 minimum contrast ratio\n- **AAA Large Text**: 4.5:1 minimum contrast ratio\n\n## Recommendations\n\n`;

  if (summary.totalFailed > 0) {
    markdown += `⚠️ **${summary.totalFailed} color combinations failed WCAG AA requirements.**\n\nPlease review the failed combinations above and adjust colors to meet accessibility standards.\n\n`;
  } else {
    markdown += `✅ **All color combinations pass WCAG AA requirements.**\n\nGreat job! Your color system is accessible.\n\n`;
  }

  markdown += `## Next Steps\n\n1. Review failed combinations and adjust colors\n2. Test with real users who have visual impairments\n3. Use automated accessibility testing tools\n4. Consider AAA compliance for critical UI elements\n`;

  return markdown;
}

/**
 * Main execution
 */
function main() {
  console.log('🎨 Running color contrast audit...\n');
  
  const report = generateContrastReport();
  const markdown = formatReportAsMarkdown(report);
  
  // Write report to file
  const reportPath = path.join(__dirname, '../src/docs/COLOR_CONTRAST_AUDIT.md');
  fs.writeFileSync(reportPath, markdown);
  
  console.log(`📊 Audit Results:`);
  console.log(`   Total combinations: ${report.summary.totalCombinations}`);
  console.log(`   Passed: ${report.summary.totalPassed}`);
  console.log(`   Failed: ${report.summary.totalFailed}`);
  console.log(`   Overall grade: ${report.summary.overallGrade}`);
  console.log(`\n📄 Full report saved to: ${reportPath}`);
  
  if (report.summary.totalFailed > 0) {
    console.log(`\n⚠️  ${report.summary.totalFailed} color combinations need attention!`);
    process.exit(1);
  } else {
    console.log(`\n✅ All color combinations pass WCAG AA requirements!`);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generateContrastReport,
  validateThemeContrast,
  getContrastRatio,
  getContrastGrade,
};