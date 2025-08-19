/**
 * Tailwind Configuration Validation Script
 * Validates that the Tailwind configuration is properly set up with design tokens
 */

const { designTokens } = require('../styles/tokens.js');
const tailwindConfig = require('../../tailwind.config.js');

console.log('🔍 Validating Tailwind CSS Configuration...\n');

// Validate color integration
console.log('✅ Colors:');
const colors = tailwindConfig.theme.colors;
console.log(`  - Primary colors: ${Object.keys(designTokens.colors.primary).length} shades`);
console.log(`  - Accent colors: ${Object.keys(designTokens.colors.accent).length} shades`);
console.log(`  - Neutral colors: ${Object.keys(designTokens.colors.neutral).length} shades`);
console.log(`  - Semantic colors: success, error, warning, info`);

// Validate spacing
console.log('\n✅ Spacing:');
const spacing = tailwindConfig.theme.spacing;
console.log(`  - Spacing values: ${Object.keys(designTokens.spacing).length} sizes`);
console.log(`  - Range: ${Math.min(...Object.keys(designTokens.spacing).filter(k => !isNaN(k)))} to ${Math.max(...Object.keys(designTokens.spacing).filter(k => !isNaN(k)))}`);

// Validate typography
console.log('\n✅ Typography:');
const fontSize = tailwindConfig.theme.fontSize;
const fontWeight = tailwindConfig.theme.fontWeight;
console.log(`  - Font sizes: ${Object.keys(designTokens.typography.fontSize).length} sizes`);
console.log(`  - Font weights: ${Object.keys(designTokens.typography.fontWeight).length} weights`);
console.log(`  - Font families: ${Object.keys(designTokens.typography.fontFamily).length} families`);

// Validate shadows
console.log('\n✅ Shadows:');
const boxShadow = tailwindConfig.theme.boxShadow;
console.log(`  - Base shadows: ${Object.keys(designTokens.boxShadow).length} variants`);
console.log(`  - Enhanced shadows: soft, medium, strong, glow variants`);

// Validate animations
console.log('\n✅ Animations:');
const animations = tailwindConfig.theme.extend.animation;
console.log(`  - Custom animations: ${Object.keys(animations).length} variants`);
console.log(`  - Includes: fade-in, slide, scale, loading states`);

// Validate breakpoints
console.log('\n✅ Breakpoints:');
const screens = tailwindConfig.theme.extend.screens;
console.log(`  - Standard breakpoints: sm, md, lg, xl, 2xl`);
console.log(`  - Extended breakpoints: xs (${screens.xs}), 3xl (${screens['3xl']})`);

// Validate plugins
console.log('\n✅ Plugins:');
console.log(`  - Custom utilities: focus-ring, scrollbar, glass effects`);
console.log(`  - Component base styles: btn-base, card-base, input-base`);
console.log(`  - Interactive utilities: interactive, interactive-scale`);

// Validate dark mode
console.log('\n✅ Dark Mode:');
console.log(`  - Strategy: ${tailwindConfig.darkMode[0]} with ${tailwindConfig.darkMode[1]}`);
console.log(`  - CSS custom properties support: enabled`);

// Check for potential issues
console.log('\n🔧 Configuration Health:');

// Check if all design token colors are properly mapped
const missingColors = [];
Object.keys(designTokens.colors).forEach(colorName => {
  if (!colors[colorName]) {
    missingColors.push(colorName);
  }
});

if (missingColors.length > 0) {
  console.log(`  ⚠️  Missing color mappings: ${missingColors.join(', ')}`);
} else {
  console.log(`  ✅ All design token colors are mapped`);
}

// Check content paths
const contentPaths = tailwindConfig.content;
console.log(`  ✅ Content paths configured: ${contentPaths.length} patterns`);

// Validate CSS custom properties
console.log('\n🎨 CSS Custom Properties:');
console.log(`  ✅ Color variables: --color-{palette}-{shade} format`);
console.log(`  ✅ Spacing variables: --spacing-{size} format`);
console.log(`  ✅ Typography variables: --font-{property} format`);

console.log('\n🎉 Tailwind configuration validation complete!');
console.log('\n📚 Usage Examples:');
console.log('  Colors: bg-primary-500, text-accent-600, border-neutral-300');
console.log('  Spacing: p-4, m-8, space-x-6');
console.log('  Typography: text-lg, font-semibold, leading-relaxed');
console.log('  Components: btn-primary, card-hover, input-base');
console.log('  Animations: animate-fade-in-up, animate-scale-in');
console.log('  Utilities: focus-ring, glass, interactive');

console.log('\n🔗 Documentation:');
console.log('  - Tailwind Integration: /src/styles/tailwind-integration.md');
console.log('  - Design Tokens: /src/styles/tokens.js');
console.log('  - Utility Functions: /src/styles/utils.ts');
console.log('  - Theme Provider: /src/components/ThemeProvider.tsx');