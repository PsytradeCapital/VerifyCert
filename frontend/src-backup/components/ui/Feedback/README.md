# Feedback Animations

A comprehensive feedback animation system that provides enhanced user feedback with smooth animations, built on top of Framer Motion.

## Features

- **Multiple Animation Types**: Success, error, warning, info, and loading animations
- **Enhanced Effects**: Confetti for celebrations, shake effects for errors, progress indicators
- **Flexible Positioning**: Support for different screen positions
- **Auto-dismiss**: Configurable auto-dismiss timing
- **Action Support**: Add action buttons to feedback messages
- **Accessibility**: Respects user motion preferences
- **Integration**: Works alongside existing toast notifications

## Quick Start

### 1. Wrap your app with FeedbackProvider

```tsx
import { FeedbackProvider } from './components/ui/Feedback';

function App() {
  return (
    <FeedbackProvider>
      {/* Your app content */}
    </FeedbackProvider>
  );
}
```

### 2. Use the feedback hook in components

```tsx
import { useFeedbackAnimations } from './hooks/useFeedbackAnimations';

function MyComponent() {
  const feedback = useFeedbackAnimations();

  const handleSuccess = () => {
    feedback.showSuccess('Operation completed successfully!', {
      showConfetti: true,
      position: 'center'
    });
  };

  const handleError = () => {
    feedback.showError('Something went wrong!', {
      shake: true
    });
  };

  return (
    <div>
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
    </div>
  );
}
```

## API Reference

### useFeedbackAnimations Hook

#### Basic Methods

- `showSuccess(message, options?)` - Show success feedback
- `showError(message, options?)` - Show error feedback  
- `showWarning(message, options?)` - Show warning feedback
- `showInfo(message, options?)` - Show info feedback
- `showLoading(message, options?)` - Show loading feedback

#### Blockchain-specific Methods

- `showBlockchainSuccess(message, txHash?, options?)` - Success with transaction link
- `showBlockchainError(message, error?, options?)` - Error with blockchain error handling
- `showWalletConnection(isConnecting)` - Wallet connection feedback
- `showNetworkError(message?)` - Network error with retry option
- `showWrongNetwork()` - Wrong network warning with switch option

#### Certificate Operations

- `showCertificateOperation(operation, promise?)` - Handle certificate operations with loading states

#### Utility Methods

- `updateProgress(id, progress)` - Update progress for loading animations
- `dismiss(id)` - Dismiss specific feedback
- `dismissAll()` - Dismiss all active feedback

### Options

#### FeedbackOptions
```tsx
interface FeedbackOptions {
  useAnimation?: boolean;     // Enable/disable animations (default: true)
  useToast?: boolean;        // Also show toast notification (default: false)
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  duration?: number;         // Auto-dismiss duration in ms
  showIcon?: boolean;        // Show/hide icon (default: true)
  showCloseButton?: boolean; // Show/hide close button (default: true)
  action?: {                 // Optional action button
    label: string;
    onClick: () => void;
  };
}
```

#### SuccessOptions
```tsx
interface SuccessOptions extends FeedbackOptions {
  showConfetti?: boolean;    // Show confetti animation
  txHash?: string;          // Transaction hash for blockchain operations
}
```

#### ErrorOptions
```tsx
interface ErrorOptions extends FeedbackOptions {
  shake?: boolean;          // Enable shake animation
  error?: any;             // Error object for blockchain operations
}
```

#### LoadingOptions
```tsx
interface LoadingOptions extends FeedbackOptions {
  showProgress?: boolean;   // Show progress indicator
  progress?: number;       // Initial progress value (0-100)
}
```

## Examples

### Basic Usage

```tsx
// Simple success message
feedback.showSuccess('Task completed!');

// Error with shake effect
feedback.showError('Validation failed!', { shake: true });

// Loading with progress
const loadingId = feedback.showLoading('Processing...', { 
  showProgress: true, 
  progress: 0 
});

// Update progress
feedback.updateProgress(loadingId, 50);

// Complete and dismiss
feedback.dismiss(loadingId);
feedback.showSuccess('Processing complete!');
```

### Blockchain Integration

```tsx
// Transaction success with link
feedback.showBlockchainSuccess(
  'Transaction confirmed!', 
  '0x1234567890abcdef...'
);

// Handle blockchain errors
try {
  await contract.mintCertificate();
} catch (error) {
  feedback.showBlockchainError('Transaction failed', error);
}

// Certificate operations
feedback.showCertificateOperation('minting', mintPromise);
```

### Advanced Positioning

```tsx
// Center success with confetti
feedback.showSuccess('Certificate minted!', {
  showConfetti: true,
  position: 'center',
  duration: 3000
});

// Bottom-right error
feedback.showError('Network error', {
  position: 'bottom-right',
  action: {
    label: 'Retry',
    onClick: () => retryOperation()
  }
});
```

## Animation Types

### Success Animations
- **Basic**: Slide-in with checkmark icon
- **Confetti**: Celebration with particle effects
- **Blockchain**: Success with transaction link

### Error Animations  
- **Basic**: Slide-in with error icon
- **Shake**: Shake effect for emphasis
- **Blockchain**: Error with specific blockchain error handling

### Loading Animations
- **Basic**: Spinner with message
- **Progress**: Circular progress indicator
- **Pulse**: Pulsing effect during loading

### Special Effects
- **Confetti**: Particle animation for celebrations
- **Shake**: Shake animation for errors
- **Pulse**: Breathing effect for loading states

## Accessibility

The feedback system respects user preferences:

- **Reduced Motion**: Animations are disabled for users who prefer reduced motion
- **Screen Readers**: Proper ARIA labels and announcements
- **Keyboard Navigation**: Full keyboard support for interactive elements
- **High Contrast**: Compatible with high contrast themes

## Integration with Existing Systems

The feedback animations can work alongside existing notification systems:

```tsx
// Use both animations and toasts
feedback.showSuccess('Success!', {
  useAnimation: true,
  useToast: true
});

// Animation only
feedback.showSuccess('Success!', {
  useAnimation: true,
  useToast: false
});

// Toast only (fallback)
feedback.showSuccess('Success!', {
  useAnimation: false,
  useToast: true
});
```

## Performance Considerations

- Animations use hardware acceleration when possible
- Automatic cleanup of dismissed feedback items
- Efficient re-rendering with React.memo and useCallback
- Lazy loading of animation components
- Respect for device performance capabilities

## Browser Support

- Modern browsers with CSS animations support
- Graceful degradation for older browsers
- Mobile-optimized touch interactions
- Cross-platform consistency