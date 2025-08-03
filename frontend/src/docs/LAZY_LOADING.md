# Lazy Loading Implementation

This document describes the lazy loading implementation for the VerifyCert application, which helps improve performance by loading components and images only when needed.

## Overview

The lazy loading system consists of several utilities and patterns:

1. **Component Lazy Loading** - Load React components on demand
2. **Image Lazy Loading** - Load images when they enter the viewport
3. **Route-based Code Splitting** - Split code by route groups
4. **Performance Monitoring** - Track loading performance

## Component Lazy Loading

### Basic Usage

```typescript
import { createLazyComponent } from '../utils/lazyLoading';

const LazyComponent = createLazyComponent(
  () => import('./HeavyComponent'),
  undefined, // fallback component
  'HeavyComponent' // name for monitoring
);

// Usage with Suspense
<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

### Lazy Component Wrapper

```typescript
import { LazyComponentWrapper } from '../utils/lazyLoading';

<LazyComponentWrapper 
  fallback={<ComponentLoading />}
  errorFallback={ComponentLoadError}
>
  <LazyComponent />
</LazyComponentWrapper>
```

## Image Lazy Loading

### LazyImage Component

```typescript
import { LazyImage } from '../utils/lazyLoading';

<LazyImage
  src="large-image.jpg"
  alt="Description"
  className="w-full h-auto"
  fallbackSrc="placeholder.jpg"
  loadingComponent={() => <div>Loading...</div>}
  errorComponent={({ retry }) => (
    <div>
      <p>Failed to load</p>
      <button onClick={retry}>Retry</button>
    </div>
  )}
/>
```

### Specialized Image Components

```typescript
import { LazyLogo, LazyScreenshot, LazyIcon } from '../components/ui/LazyAssets';

// Logo with fallback
<LazyLogo className="h-8 w-auto" />

// PWA screenshots
<LazyScreenshot type="narrow" className="w-full" />

// App icons
<LazyIcon size={192} className="w-16 h-16" />
```

## Route-based Code Splitting

### Route Groups

Routes are organized into logical groups for optimal bundle splitting:

- **Core Routes**: Home, Verify, NotFound (loaded immediately)
- **Dashboard Routes**: IssuerDashboard, Settings (loaded when accessing dashboard)
- **Certificate Routes**: CertificateViewer, VerificationPage (loaded when viewing certificates)
- **Demo Routes**: Various demo pages (loaded only when needed)
- **PWA Routes**: PWA testing and features (loaded when needed)

### Preloading Strategies

```typescript
import { preloadStrategies } from '../utils/routeCodeSplitting';

// Preload dashboard when user connects wallet
preloadStrategies.preloadDashboard();

// Preload certificate viewer when starting verification
preloadStrategies.preloadCertificateViewer();
```

## Performance Monitoring

### Automatic Monitoring

The system automatically tracks:
- Component load times
- Image load times
- Bundle load times
- Navigation timing
- Resource loading

### Manual Monitoring

```typescript
import { performanceMonitor } from '../utils/performanceMonitoring';

// Start timing
performanceMonitor.startTiming('custom-operation');

// End timing
performanceMonitor.endTiming('custom-operation', { success: true });

// Get performance summary
const summary = performanceMonitor.getSummary();
console.log(summary);
```

### React Hook

```typescript
import { usePerformanceMonitoring } from '../utils/performanceMonitoring';

function MyComponent() {
  usePerformanceMonitoring('MyComponent');
  // Component will be automatically monitored
  return <div>Content</div>;
}
```

## Implementation Details

### App.tsx Updates

The main App component has been updated to use lazy loading:

```typescript
// Lazy imports
import {
  LazyIssuerDashboard,
  LazyCertificateViewer,
  LazyVerificationPage,
  // ... other lazy components
} from './components/lazy';

// Route with lazy loading
<Route 
  path="/dashboard" 
  element={
    <LazyComponentWrapper 
      fallback={<ComponentLoading />}
      errorFallback={ComponentLoadError}
    >
      <LazyIssuerDashboard />
    </LazyComponentWrapper>
  } 
/>
```

### CertificateCard Updates

The CertificateCard component now uses lazy loading for QR code images:

```typescript
import { LazyImage } from '../utils/lazyLoading';

<LazyImage
  src={certificate.qrCodeURL}
  alt="Certificate QR Code"
  className="mx-auto max-w-32 max-h-32"
  loadingComponent={() => <QRLoadingPlaceholder />}
  errorComponent={({ retry }) => <QRErrorPlaceholder retry={retry} />}
/>
```

### Navigation Updates

The Navigation component uses lazy loading for the logo:

```typescript
import { LazyLogo } from './ui/LazyAssets';

<LazyLogo 
  className="h-4 w-4 sm:h-5 sm:w-5 text-white" 
  alt="VerifyCert Logo"
/>
```

## Benefits

1. **Reduced Initial Bundle Size**: Only core components are loaded initially
2. **Faster Page Load**: Critical content loads first
3. **Better User Experience**: Progressive loading with proper fallbacks
4. **Improved Performance**: Images load only when visible
5. **Performance Insights**: Detailed monitoring and analytics

## Best Practices

1. **Use Suspense Boundaries**: Always wrap lazy components with Suspense
2. **Provide Fallbacks**: Include loading and error states
3. **Monitor Performance**: Use the built-in monitoring tools
4. **Preload Strategically**: Preload likely next routes
5. **Optimize Images**: Use appropriate formats and sizes
6. **Test Error States**: Ensure error boundaries work correctly

## Bundle Analysis

To analyze bundle sizes and lazy loading effectiveness:

```bash
# Build with bundle analyzer
npm run build

# Check bundle sizes
ls -la build/static/js/

# View performance stats in browser console (development mode)
# Performance stats are automatically logged after page load
```

## Troubleshooting

### Common Issues

1. **Component Not Loading**: Check import paths and ensure component exports default
2. **Images Not Loading**: Verify image URLs and check network requests
3. **Performance Issues**: Use performance monitor to identify slow components
4. **Error Boundaries**: Ensure error fallbacks are properly implemented

### Debug Mode

In development, performance statistics are automatically logged to the console. Check the browser console for:
- Component load times
- Image load times
- Slow loading resources
- Bundle statistics

### Testing

Run the lazy loading tests:

```bash
npm test -- --testPathPattern=lazyLoading
```

## Future Improvements

1. **Service Worker Caching**: Cache lazy-loaded resources
2. **Predictive Loading**: Load components based on user behavior
3. **Image Optimization**: Implement WebP conversion and responsive images
4. **Bundle Optimization**: Further optimize chunk splitting
5. **Performance Budgets**: Set and enforce performance budgets