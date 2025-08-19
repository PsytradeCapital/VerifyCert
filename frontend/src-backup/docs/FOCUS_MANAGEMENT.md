# Focus Management Implementation

This document describes the comprehensive focus management system implemented for the VerifyCert application to ensure excellent accessibility and keyboard navigation.

## Overview

The focus management system provides:
- **Focus trapping** for modals and dialogs
- **Keyboard navigation** for menus and interactive elements
- **Focus restoration** when components close
- **Skip links** for quick navigation
- **Roving tabindex** for navigation menus
- **Screen reader announcements** for state changes

## Components and Utilities

### 1. Focus Management Hooks (`useFocusManagement.ts`)

#### `useFocusTrap(isActive: boolean)`
Creates a focus trap within a container element.

```typescript
const { containerRef, focusFirst, focusLast } = useFocusTrap(true);
```

**Features:**
- Traps Tab and Shift+Tab navigation within container
- Automatically focuses first focusable element
- Restores focus when deactivated
- Handles containers with no focusable elements

#### `useFocusRestore()`
Manages focus restoration for temporary UI states.

```typescript
const { saveFocus, restoreFocus } = useFocusRestore();
```

#### `useRovingTabIndex(items, activeIndex)`
Implements roving tabindex pattern for navigation menus.

```typescript
const { handleKeyDown } = useRovingTabIndex(menuItems, currentIndex);
```

**Keyboard Support:**
- Arrow keys for navigation
- Home/End for first/last item
- Configurable orientation (horizontal/vertical)

#### `useDropdownFocus(isOpen)`
Specialized focus management for dropdown menus.

```typescript
const { triggerRef, menuRef, focusFirstMenuItem } = useDropdownFocus(isOpen);
```

### 2. Focus Management Classes (`focusManagement.ts`)

#### `FocusTrap`
Low-level focus trap implementation.

```typescript
const focusTrap = new FocusTrap(containerElement);
focusTrap.activate();
// ... later
focusTrap.deactivate();
```

#### `NavigationFocusManager`
Manages keyboard navigation in menus with roving tabindex.

```typescript
const navManager = new NavigationFocusManager(menuItems, {
  orientation: 'vertical',
  wrap: true
});
```

#### `ModalFocusManager`
Enhanced focus trap specifically for modals.

```typescript
const modalManager = new ModalFocusManager(modalElement, {
  onEscape: closeModal,
  restoreFocusOnClose: true
});
```

#### `DropdownFocusManager`
Manages focus for dropdown menus and comboboxes.

```typescript
const dropdownManager = new DropdownFocusManager(trigger, menu);
dropdownManager.open();
```

### 3. React Components

#### `<FocusTrap>`
React wrapper for focus trap functionality.

```tsx
<FocusTrap isActive={isModalOpen}>
  <div>
    <button>Trapped Button 1</button>
    <button>Trapped Button 2</button>
  </div>
</FocusTrap>
```

#### `<RovingTabIndex>`
React component for roving tabindex navigation.

```tsx
<RovingTabIndex orientation="horizontal" wrap={true}>
  <button>Item 1</button>
  <button>Item 2</button>
  <button>Item 3</button>
</RovingTabIndex>
```

#### `<SkipLinks>`
Provides skip navigation links for accessibility.

```tsx
<SkipLinks links={[
  { targetId: 'main-content', label: 'Skip to main content' },
  { targetId: 'navigation', label: 'Skip to navigation' }
]} />
```

## Implementation Details

### Modal Focus Management

The Modal component uses `ModalFocusManager` to:

1. **Store previous focus** when modal opens
2. **Focus first focusable element** in modal
3. **Trap Tab navigation** within modal
4. **Handle Escape key** to close modal
5. **Restore focus** to trigger element when closed
6. **Prevent body scroll** while modal is open

```tsx
// Enhanced Modal implementation
const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const focusManagerRef = useRef<ModalFocusManager | null>(null);

  useEffect(() => {
    if (modalRef.current && !focusManagerRef.current) {
      focusManagerRef.current = new ModalFocusManager(modalRef.current, {
        onEscape: onClose,
        restoreFocusOnClose: true,
      });
    }
  }, [onClose]);

  useEffect(() => {
    if (focusManagerRef.current) {
      if (isOpen) {
        focusManagerRef.current.activate();
      } else {
        focusManagerRef.current.deactivate();
      }
    }
  }, [isOpen]);

  // ... rest of component
};
```

### Navigation Focus Management

The Navigation component implements:

1. **Roving tabindex** for menu items
2. **Arrow key navigation** (horizontal for desktop, vertical for mobile)
3. **Focus management** for mobile menu toggle
4. **Screen reader announcements** for navigation changes

```tsx
// Enhanced Navigation implementation
const Navigation = () => {
  const desktopFocusManagerRef = useRef<NavigationFocusManager | null>(null);
  
  useEffect(() => {
    if (desktopNavRef.current) {
      const navItems = Array.from(
        desktopNavRef.current.querySelectorAll('[role="menuitem"]')
      ) as HTMLElement[];
      
      desktopFocusManagerRef.current = new NavigationFocusManager(navItems, {
        orientation: 'horizontal',
        wrap: true,
      });
    }
  }, []);

  const handleDesktopNavKeyDown = (event: React.KeyboardEvent) => {
    if (desktopFocusManagerRef.current) {
      desktopFocusManagerRef.current.handleKeyDown(event.nativeEvent);
    }
  };

  // ... rest of component
};
```

### Select/Dropdown Focus Management

The Select component uses `useDropdownFocus` hook to:

1. **Focus first option** when dropdown opens
2. **Handle arrow key navigation** through options
3. **Support type-ahead** functionality
4. **Return focus to trigger** when closed
5. **Handle Escape key** to close dropdown

## Keyboard Navigation Patterns

### Standard Patterns Implemented

| Pattern | Keys | Behavior |
|---------|------|----------|
| **Tab Navigation** | Tab, Shift+Tab | Move between focusable elements |
| **Arrow Navigation** | ↑↓←→ | Navigate within components |
| **Home/End** | Home, End | Jump to first/last item |
| **Escape** | Escape | Close overlays, exit modes |
| **Enter/Space** | Enter, Space | Activate buttons, select items |

### Component-Specific Patterns

#### Modal/Dialog
- **Tab/Shift+Tab**: Navigate within modal (trapped)
- **Escape**: Close modal
- **Focus restoration**: Return to trigger element

#### Navigation Menu
- **Arrow keys**: Navigate between menu items
- **Home/End**: Jump to first/last menu item
- **Enter/Space**: Activate menu item
- **Escape**: Close mobile menu

#### Dropdown/Select
- **Arrow keys**: Navigate options
- **Home/End**: Jump to first/last option
- **Enter/Space**: Select option
- **Escape**: Close dropdown
- **Type-ahead**: Jump to option by typing

#### Skip Links
- **Tab**: Reveal skip links
- **Enter**: Jump to target section

## Accessibility Features

### Screen Reader Support

1. **Live regions** for dynamic content announcements
2. **ARIA labels** and descriptions for all interactive elements
3. **Role attributes** for semantic meaning
4. **State announcements** for navigation changes

### Focus Indicators

1. **Visible focus rings** on all interactive elements
2. **High contrast** focus indicators
3. **Consistent styling** across components
4. **Skip link visibility** on focus

### Keyboard-Only Navigation

1. **All functionality** accessible via keyboard
2. **Logical tab order** throughout application
3. **Focus trapping** in modal contexts
4. **Bypass mechanisms** via skip links

## Testing

### Automated Tests

The focus management system includes comprehensive tests:

```typescript
// Example test structure
describe('Focus Management', () => {
  describe('Modal Focus Management', () => {
    it('should trap focus within modal when open');
    it('should close modal on Escape key');
    it('should restore focus when modal closes');
  });

  describe('Navigation Focus Management', () => {
    it('should handle arrow key navigation');
    it('should support roving tabindex');
    it('should announce navigation changes');
  });
});
```

### Manual Testing Checklist

- [ ] Tab navigation works in logical order
- [ ] All interactive elements are keyboard accessible
- [ ] Focus is trapped in modals
- [ ] Focus is restored when modals close
- [ ] Skip links work correctly
- [ ] Arrow key navigation works in menus
- [ ] Screen reader announcements are appropriate
- [ ] Focus indicators are visible and consistent

## Browser Support

The focus management system supports:
- **Chrome 90+**
- **Firefox 88+**
- **Safari 14+**
- **Edge 90+**

## Performance Considerations

1. **Event listener cleanup** to prevent memory leaks
2. **Debounced focus updates** for performance
3. **Lazy initialization** of focus managers
4. **Efficient DOM queries** for focusable elements

## Future Enhancements

1. **Focus history** for complex navigation flows
2. **Custom focus indicators** per component
3. **Focus debugging tools** for development
4. **Advanced roving tabindex** patterns
5. **Touch device optimizations**

## Usage Examples

### Basic Modal with Focus Management

```tsx
import { Modal } from './components/ui/Modal';

const MyModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open Modal
      </button>
      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        title="Example Modal"
      >
        <p>Modal content with automatic focus management</p>
        <button onClick={() => setIsOpen(false)}>Close</button>
      </Modal>
    </>
  );
};
```

### Navigation with Keyboard Support

```tsx
import { RovingTabIndex } from './components/ui/FocusManagement';

const NavigationMenu = () => (
  <nav role="navigation" aria-label="Main navigation">
    <RovingTabIndex orientation="horizontal">
      <a href="/home" role="menuitem">Home</a>
      <a href="/about" role="menuitem">About</a>
      <a href="/contact" role="menuitem">Contact</a>
    </RovingTabIndex>
  </nav>
);
```

### Custom Focus Trap

```tsx
import { FocusTrap } from './components/ui/FocusManagement';

const CustomDialog = ({ isOpen }) => (
  isOpen && (
    <FocusTrap isActive={isOpen}>
      <div className="dialog">
        <h2>Custom Dialog</h2>
        <button>Action 1</button>
        <button>Action 2</button>
      </div>
    </FocusTrap>
  )
);
```

This comprehensive focus management system ensures that the VerifyCert application provides an excellent keyboard navigation experience and meets accessibility standards.