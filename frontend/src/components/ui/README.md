# UI Component Library

This directory contains the organized component library structure for VerifyCert's enhanced UI/UX system.

## Structure

```
ui/
├── Layout/              # Layout and container components
│   ├── AppLayout.tsx    # Main application layout wrapper
│   ├── Container.tsx    # Responsive container component
│   └── Grid.tsx         # Grid system component
├── Navigation/          # Navigation components
│   ├── SideNavigation.tsx    # Desktop sidebar navigation
│   ├── BottomNavigation.tsx  # Mobile bottom navigation
│   └── Breadcrumbs.tsx       # Breadcrumb navigation
├── Button/              # Button components
│   └── Button.tsx       # Enhanced button with variants and states
├── Input/               # Form input components
│   └── Input.tsx        # Enhanced input with floating labels
├── Select/              # Select dropdown components
│   └── Select.tsx       # Enhanced select with search functionality
├── FileUpload/          # File upload components
│   └── FileUpload.tsx   # Drag-and-drop file upload
├── Card/                # Card components
│   └── Card.tsx         # Versatile card component
├── Modal/               # Modal and dialog components
│   └── Modal.tsx        # Modal with backdrop and animations
├── Alert/               # Alert and notification components
│   └── Alert.tsx        # Alert component with variants
├── Badge/               # Badge and tag components
│   └── Badge.tsx        # Status indicator badges
├── Tooltip/             # Tooltip components
│   └── Tooltip.tsx      # Hover tooltip component
├── Animation/           # Animation components
│   ├── PageTransition.tsx   # Page transition animations
│   ├── LoadingSpinner.tsx   # Loading spinner component
│   └── SkeletonLoader.tsx   # Skeleton loading states
├── index.ts             # Centralized exports
└── README.md            # This documentation
```

## Usage

Import components from the centralized index:

```typescript
import { 
  Button, 
  Card, 
  Input, 
  AppLayout,
  LoadingSpinner 
} from '@/components/ui';
```

## Component Categories

### Layout Components
- **AppLayout**: Main application wrapper with header, sidebar, and content areas
- **Container**: Responsive container with size variants
- **Grid**: Flexible grid system with responsive breakpoints

### Navigation Components
- **SideNavigation**: Collapsible sidebar for desktop navigation
- **BottomNavigation**: Mobile-optimized bottom tab navigation
- **Breadcrumbs**: Hierarchical navigation breadcrumbs

### Form Components
- **Button**: Enhanced buttons with variants, sizes, loading states, and icons
- **Input**: Advanced inputs with floating labels, validation states, and icons
- **Select**: Dropdown selects with search functionality and custom styling
- **FileUpload**: Drag-and-drop file upload with preview and validation

### Content Components
- **Card**: Versatile cards with multiple variants and hover effects
- **Modal**: Accessible modals with backdrop, animations, and keyboard support
- **Alert**: Contextual alerts with variants and dismissible functionality
- **Badge**: Status indicators and tags with color variants
- **Tooltip**: Hover tooltips with positioning options

### Animation Components
- **PageTransition**: Smooth page transition animations
- **LoadingSpinner**: Customizable loading spinners
- **SkeletonLoader**: Skeleton loading states for content placeholders

## Design Principles

1. **Consistency**: All components follow the same design patterns and API conventions
2. **Accessibility**: WCAG-compliant with proper ARIA attributes and keyboard navigation
3. **Responsiveness**: Mobile-first design with responsive breakpoints
4. **Customization**: Flexible props for styling and behavior customization
5. **Performance**: Optimized for minimal bundle impact and smooth animations

## TypeScript Support

All components are fully typed with TypeScript interfaces exported for external use. This provides excellent developer experience with IntelliSense and type checking.

## Future Enhancements

This structure is designed to be extensible. Additional components can be added following the same organizational pattern:

- Create component directory under appropriate category
- Implement component with TypeScript
- Export from category index if needed
- Add to main index.ts file
- Update this README documentation