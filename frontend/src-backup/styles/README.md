# Design Tokens

This directory contains the design system tokens for the VerifyCert application. Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes.

## Files Overview

- **`tokens.js`** - JavaScript version of design tokens (used by Tailwind CSS)
- **`tokens.ts`** - TypeScript version with type definitions
- **`tokens.css`** - CSS custom properties version
- **`utils.ts`** - Utility functions for working with tokens
- **`index.ts`** - Main export file

## Usage

### 1. Using with Tailwind CSS

The design tokens are automatically integrated with Tailwind CSS. You can use them in your JSX:

```jsx
<div className="bg-primary-500 text-neutral-50 p-4 rounded-lg shadow-md">
  <h1 className="text-2xl font-semibold">Hello World</h1>
</div>
```

### 2. Using TypeScript Utilities

Import utility functions for programmatic access:

```typescript
import { getColor, getSpacing, colorCombinations } from '../styles';

const primaryColor = getColor('primary', 500); // #3b82f6
const mediumSpacing = getSpacing(4); // 1rem
const buttonStyles = colorCombinations.primary; // Complete color scheme
```

### 3. Using CSS Custom Properties

Use CSS custom properties directly in CSS files:

```css
.my-component {
  background-color: var(--color-primary-500);
  padding: var(--spacing-4);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow-md);
}
```

### 4. Using in CSS-in-JS

For styled-components or emotion:

```typescript
import styled from 'styled-components';
import { designTokens } from '../styles';

const Button = styled.button`
  background-color: ${designTokens.colors.primary[500]};
  padding: ${designTokens.spacing[3]} ${designTokens.spacing[6]};
  border-radius: ${designTokens.borderRadius.md};
  font-family: ${designTokens.typography.fontFamily.sans.join(', ')};
`;
```

## Token Categories

### Colors

- **Primary**: Main brand colors (blue palette)
- **Accent**: Secondary brand colors (gold palette)
- **Neutral**: Grayscale colors for text and backgrounds
- **Semantic**: Success, error, warning, info colors

Each color has shades from 50 (lightest) to 950 (darkest).

### Typography

- **Font Families**: Sans, mono, display
- **Font Sizes**: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl, 8xl, 9xl
- **Font Weights**: thin, extralight, light, normal, medium, semibold, bold, extrabold, black
- **Letter Spacing**: tighter, tight, normal, wide, wider, widest

### Spacing

Consistent spacing scale from 0 to 96 (in rem units).

### Border Radius

- **none**: 0
- **sm**: 2px
- **default**: 4px
- **md**: 6px
- **lg**: 8px
- **xl**: 12px
- **2xl**: 16px
- **3xl**: 24px
- **full**: 9999px (circular)

### Box Shadows

- **sm**: Subtle shadow
- **default**: Standard shadow
- **md**: Medium shadow
- **lg**: Large shadow
- **xl**: Extra large shadow
- **2xl**: Very large shadow
- **inner**: Inset shadow
- **none**: No shadow

### Z-Index

Layered z-index values for consistent stacking:

- **dropdown**: 1000
- **sticky**: 1020
- **fixed**: 1030
- **modalBackdrop**: 1040
- **modal**: 1050
- **popover**: 1060
- **tooltip**: 1070

## Dark Mode Support

The design tokens include dark mode variants. Use the `[data-theme="dark"]` selector or Tailwind's `dark:` prefix:

```jsx
<div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50">
  Content that adapts to theme
</div>
```

## Responsive Design

Use the breakpoint utilities for responsive design:

```typescript
import { breakpoints } from '../styles';

const styles = {
  container: {
    padding: '1rem',
    [breakpoints.md]: {
      padding: '2rem',
    },
    [breakpoints.lg]: {
      padding: '3rem',
    },
  },
};
```

## Animation

Animation utilities are available for consistent motion:

```typescript
import { animations } from '../styles';

const fadeInAnimation = {
  transition: `opacity ${animations.duration[300]} ${animations.easing.out}`,
};
```

## Best Practices

1. **Always use design tokens** instead of hardcoded values
2. **Use semantic color names** (primary, accent) rather than specific colors (blue, gold)
3. **Maintain consistency** by using the same tokens across all components
4. **Test in both light and dark modes** when using color tokens
5. **Use TypeScript utilities** for better type safety and autocomplete

## Extending Tokens

To add new tokens:

1. Update `tokens.js` with the new values
2. Update `tokens.css` with corresponding CSS custom properties
3. Update `utils.ts` with new utility functions if needed
4. Update TypeScript types in `utils.ts`
5. Test that Tailwind CSS picks up the changes

## Integration with Tailwind

The tokens are automatically integrated with Tailwind CSS through the `tailwind.config.js` file. Any changes to the tokens will be reflected in the available Tailwind classes after rebuilding.