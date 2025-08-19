# Tailwind CSS Integration with Design Tokens

This document explains how Tailwind CSS is configured to work seamlessly with our design token system.

## Overview

Our Tailwind configuration integrates directly with design tokens to ensure consistency across the application. The configuration includes:

- Custom color palette from design tokens
- Enhanced spacing system
- Typography scale
- Custom animations and keyframes
- Utility classes for common patterns
- Component base styles
- Dark mode support

## Configuration Structure

### Colors
```javascript
// Colors are imported from design tokens and extended with CSS custom properties
colors: {
  transparent: 'transparent',
  current: 'currentColor',
  white: 'rgb(255 255 255)',
  black: 'rgb(0 0 0)',
  ...designTokens.colors,
  // CSS custom property variants for dynamic theming
  'primary-500': 'var(--color-primary-500)',
  // ... other variants
}
```

### Enhanced Shadows
```javascript
boxShadow: {
  ...designTokens.boxShadow,
  'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
  'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  'glow': '0 0 20px rgba(59, 130, 246, 0.15)',
  'glow-accent': '0 0 20px rgba(234, 179, 8, 0.15)',
}
```

## Custom Animations

### Available Animations
- `animate-fade-in` - Simple fade in effect
- `animate-fade-in-up` - Fade in with upward movement
- `animate-fade-in-down` - Fade in with downward movement
- `animate-slide-in-left` - Slide in from left
- `animate-slide-in-right` - Slide in from right
- `animate-scale-in` - Scale in effect
- `animate-skeleton` - Loading skeleton animation
- `animate-glow` - Glowing effect
- `animate-float` - Floating animation

### Usage Examples
```jsx
<div className="animate-fade-in-up">Content</div>
<div className="animate-scale-in">Modal content</div>
<div className="skeleton animate-skeleton">Loading...</div>
```

## Custom Utilities

### Focus Ring Utilities
```css
.focus-ring - Primary focus ring
.focus-ring-accent - Accent color focus ring
.focus-ring-error - Error state focus ring
```

### Scrollbar Utilities
```css
.scrollbar-thin - Thin custom scrollbar
.scrollbar-none - Hide scrollbar
```

### Glass Morphism
```css
.glass - Light glass effect
.glass-dark - Dark glass effect
```

### Interactive States
```css
.interactive - Hover lift effect
.interactive-scale - Hover scale effect
```

### Safe Area (Mobile)
```css
.safe-top - Safe area top padding
.safe-bottom - Safe area bottom padding
.safe-left - Safe area left padding
.safe-right - Safe area right padding
```

## Component Base Styles

### Button Base
```css
.btn-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: theme('borderRadius.lg');
  font-weight: theme('fontWeight.medium');
  transition: all 0.2s ease-in-out;
}
```

### Card Base
```css
.card-base {
  background-color: theme('colors.white');
  border-radius: theme('borderRadius.xl');
  box-shadow: theme('boxShadow.soft');
  border: 1px solid theme('colors.neutral.200');
}
```

### Input Base
```css
.input-base {
  width: 100%;
  border-radius: theme('borderRadius.lg');
  border: 1px solid theme('colors.neutral.300');
  padding: theme('spacing.3') theme('spacing.4');
}
```

## Component Variants

### Button Variants
- `.btn-primary` - Primary button style
- `.btn-secondary` - Secondary button style
- `.btn-accent` - Accent button style
- `.btn-ghost` - Ghost button style
- `.btn-danger` - Danger button style

### Card Variants
- `.card` - Basic card
- `.card-hover` - Card with hover effects
- `.card-interactive` - Interactive card
- `.card-elevated` - Elevated card with stronger shadow

### Input Variants
- `.input` - Basic input
- `.input-error` - Error state input
- `.input-success` - Success state input

## Dark Mode Support

Dark mode is implemented using the `data-theme="dark"` attribute:

```css
[data-theme="dark"] {
  /* Dark mode overrides */
}
```

### Usage
```javascript
// Toggle theme
import { toggleTheme, initializeTheme } from './styles/utils';

// Initialize theme on app start
initializeTheme();

// Toggle between light and dark
toggleTheme();
```

## Responsive Design

### Breakpoints
- `xs`: 475px
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px
- `3xl`: 1600px

### Usage
```jsx
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>
```

## Accessibility Features

### High Contrast Support
```css
@media (prefers-contrast: high) {
  .card-base { border-width: 2px; }
  .btn-base { border-width: 2px; }
}
```

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Focus Management
All interactive elements include proper focus styles using the design token colors.

## Performance Optimizations

### Content Configuration
The Tailwind configuration includes optimized content paths:
```javascript
content: [
  "./src/**/*.{js,jsx,ts,tsx}",
  "./pages/**/*.{js,jsx,ts,tsx}",
  "./components/**/*.{js,jsx,ts,tsx}",
]
```

### Purging
Unused styles are automatically purged in production builds.

## Best Practices

### Using Design Tokens
1. Always use design token classes when available
2. Prefer CSS custom properties for dynamic theming
3. Use utility classes for spacing and layout
4. Use component classes for complex patterns

### Color Usage
```jsx
// Good - using design token classes
<div className="bg-primary-500 text-white">

// Good - using CSS custom properties
<div style={{ backgroundColor: 'var(--color-primary-500)' }}>

// Avoid - hardcoded colors
<div className="bg-blue-500">
```

### Animation Usage
```jsx
// Good - using predefined animations
<div className="animate-fade-in-up">

// Good - combining with delays
<div className="animate-fade-in-up delay-100">

// Consider reduced motion
<div className="motion-safe:animate-fade-in-up">
```

## Troubleshooting

### Common Issues

1. **Colors not applying**: Ensure design tokens are properly imported
2. **Animations not working**: Check if `prefers-reduced-motion` is affecting them
3. **Dark mode not switching**: Verify `data-theme` attribute is set correctly
4. **Custom utilities not available**: Ensure Tailwind is processing the configuration

### Debugging
```javascript
// Check current theme
import { getCurrentTheme } from './styles/utils';
console.log(getCurrentTheme());

// Check CSS custom property values
import { getCSSCustomProperty } from './styles/utils';
console.log(getCSSCustomProperty('color-primary-500'));
```

## Migration Guide

### From Standard Tailwind
1. Replace hardcoded colors with design token equivalents
2. Update component styles to use base classes
3. Add theme initialization to your app
4. Update animations to use new keyframes

### Example Migration
```jsx
// Before
<button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">

// After
<button className="btn-primary px-4 py-2">
```