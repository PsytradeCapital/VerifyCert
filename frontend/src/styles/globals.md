# Global Styles Documentation

This document explains the global styles and CSS reset implemented for the VerifyCert application.

## Overview

The global styles provide a comprehensive foundation for the application's UI, including:

- Modern CSS reset
- Design token integration
- Accessibility enhancements
- Mobile optimizations
- Dark mode support
- Animation utilities
- Print styles

## File Structure

```
src/styles/
├── globals.css          # Main global styles file
├── reset.css           # Standalone CSS reset
├── tokens.css          # Design tokens as CSS custom properties
├── tokens.js           # Design tokens as JavaScript objects
├── utils.ts            # TypeScript utilities for design tokens
└── globals.md          # This documentation file
```

## CSS Reset Features

### Modern Box Model
- Universal `box-sizing: border-box`
- Margin and padding reset
- Consistent sizing behavior

### Typography Reset
- Responsive heading sizes
- Improved line heights
- Text wrapping optimization
- Font inheritance for form elements

### Form Element Reset
- Consistent styling across browsers
- Removed default appearances
- Mobile-optimized input sizes
- Accessibility improvements

### Media Element Reset
- Responsive images by default
- Block display for media elements
- SVG styling with currentColor

## Global Enhancements

### Accessibility Features
- Enhanced focus styles with `:focus-visible`
- Screen reader utilities (`.sr-only`)
- High contrast mode support
- Keyboard navigation improvements
- WCAG-compliant color contrasts

### Mobile Optimizations
- Touch-friendly target sizes (44px minimum)
- Viewport height fixes for iOS Safari
- Prevented zoom on form inputs
- Safe area inset support
- Improved scrolling behavior

### Dark Mode Support
- CSS custom property theming
- Automatic system preference detection
- Smooth theme transitions
- Consistent scrollbar styling

### Performance Features
- Hardware-accelerated animations
- Reduced motion preferences
- Optimized scrolling
- Efficient CSS custom properties

## Animation System

### Built-in Animations
- `fadeInUp` - Fade in with upward motion
- `scaleIn` - Scale in from 95% to 100%
- `slideInLeft/Right` - Slide in from sides
- `pulse` - Opacity pulsing effect
- `spin` - Rotation animation
- `bounce` - Bouncing effect

### Animation Utilities
- `.animate-fade-in-up`
- `.animate-scale-in`
- `.animate-slide-in-left`
- `.animate-slide-in-right`

## Utility Classes

### Layout Utilities
- `.container-responsive` - Responsive container with max-width
- `.full-bleed` - Full viewport width
- `.aspect-square/video/photo` - Aspect ratio utilities

### Text Utilities
- `.text-gradient-primary/accent/success` - Gradient text effects
- `.truncate-2/3` - Multi-line text truncation
- `.text-balance` - Balanced text wrapping

### Accessibility Utilities
- `.sr-only` - Screen reader only content
- `.focus-within-ring` - Focus ring for containers
- `.high-contrast-border/outline` - High contrast mode styles

### Mobile Utilities
- `.safe-area-inset-*` - Safe area padding for mobile devices

### Print Utilities
- `.print-hidden/visible` - Print-specific visibility
- `.print-break-*` - Page break controls

## Design Token Integration

### CSS Custom Properties
All design tokens are available as CSS custom properties:

```css
/* Colors */
var(--color-primary-500)
var(--color-neutral-100)

/* Spacing */
var(--spacing-4)
var(--spacing-8)

/* Typography */
var(--font-family-sans)
var(--font-size-lg)
var(--font-weight-medium)

/* Shadows */
var(--box-shadow-lg)
var(--box-shadow-soft)
```

### Tailwind Integration
Design tokens are integrated with Tailwind CSS classes:

```html
<div class="bg-primary-500 text-white p-4 rounded-lg shadow-soft">
  Content with design tokens
</div>
```

## Component Base Styles

### Button Base (`.btn-base`)
- Consistent sizing and spacing
- Focus states and transitions
- Disabled state handling

### Card Base (`.card-base`)
- Consistent border radius and shadows
- Background and border styling
- Hover state transitions

### Input Base (`.input-base`)
- Consistent form styling
- Focus states with design tokens
- Placeholder styling

## Browser Support

### Modern Features with Fallbacks
- Container queries with fallbacks
- Backdrop filters with fallbacks
- CSS Grid with Flexbox fallbacks
- Custom properties with fallback values

### Cross-Browser Compatibility
- Webkit-specific fixes for Safari
- iOS Safari viewport height fixes
- Scrollbar styling for all browsers
- Form element consistency

## Usage Guidelines

### Importing Styles
```javascript
// In your main app file
import './styles/globals.css'

// For standalone reset only
import './styles/reset.css'
```

### Using Design Tokens
```typescript
import { getColor, getSpacing } from './styles/utils'

const primaryColor = getColor('primary', 500)
const mediumSpacing = getSpacing(4)
```

### Custom Components
```css
.my-component {
  background: var(--color-neutral-50);
  padding: var(--spacing-4);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow-soft);
}
```

## Performance Considerations

### Optimizations
- Minimal CSS custom property usage
- Hardware-accelerated animations
- Efficient selector specificity
- Reduced layout thrashing

### Best Practices
- Use design tokens consistently
- Leverage utility classes when possible
- Minimize custom CSS overrides
- Test across different devices and browsers

## Maintenance

### Adding New Styles
1. Check if existing utilities can be used
2. Add to appropriate layer (`@layer base/components/utilities`)
3. Use design tokens for consistency
4. Test accessibility and mobile compatibility
5. Update documentation

### Updating Design Tokens
1. Update `tokens.js` and `tokens.css`
2. Test all components for visual consistency
3. Verify dark mode compatibility
4. Update TypeScript types if needed

## Testing

### Visual Regression
- Test across different browsers
- Verify mobile responsiveness
- Check dark mode consistency
- Validate print styles

### Accessibility
- Test with screen readers
- Verify keyboard navigation
- Check color contrast ratios
- Test with reduced motion preferences

### Performance
- Monitor CSS bundle size
- Test animation performance
- Verify loading times
- Check for layout shifts