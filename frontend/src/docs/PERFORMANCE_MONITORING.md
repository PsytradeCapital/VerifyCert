# Performance Monitoring and Metrics

This document describes the comprehensive performance monitoring system implemented for the VerifyCert application.

## Overview

The performance monitoring system provides real-time tracking, analysis, and reporting of application performance metrics including Web Vitals, custom metrics, and resource loading times.

## Components

### 1. Core Performance Monitor (`utils/performanceMonitoring.ts`)

The main performance monitoring utility that tracks:
- Component load times
- Image loading performance
- Bundle loading metrics
- Navigation timing
- Resource loading performance

**Key Features:**
- Automatic performance observers for browser APIs
- Manual timing methods for custom operations
- Metrics filtering and analysis
- Performance summary generation
- Data export capabilities

**Usage:**
```typescript
import { performanceMonitor } from './utils/performanceMonitoring';

// Manual timing
performanceMonitor.startTiming('operation-name');
performanceMonitor.endTiming('operation-name');

// Component monitoring
performanceMonitor.startComponentLoad('MyComponent');
performanceMonitor.endComponentLoad('MyComponent');

// Get metrics
const metrics = performanceMonitor.getMetrics();
const summary = performanceMonitor.getSummary();
```

### 2. Performance Metrics Service (`services/performanceMetrics.ts`)

Advanced metrics service that provides:
- Web Vitals tracking (FCP, LCP, FID, CLS, TTFB)
- Custom metrics calculation
- Performance scoring and grading
- Automatic error tracking
- Performance recommendations
- Report generation and sending

**Key Features:**
- Automatic Web Vitals collection
- Performance health scoring (A-F grades)
- Intelligent recommendations
- Automatic error correlation
- Remote reporting capabilities

**Usage:**
```typescript
import { performanceMetrics } from './services/performanceMetrics';

// Get performance score
const score = performanceMetrics.getPerformanceScore();
const grade = performanceMetrics.getPerformanceGrade();

// Get recommendations
const recommendations = performanceMetrics.getRecommendations();

// Generate and send reports
const report = performanceMetrics.generateReport();
await performanceMetrics.sendReport();
```

### 3. Performance Dashboard (`components/ui/Performance/PerformanceDashboard.tsx`)

Interactive dashboard component that displays:
- Real-time performance metrics
- Component, image, and bundle statistics
- Detailed metrics table
- Performance warnings
- Data export functionality

**Features:**
- Live metrics updates every 5 seconds
- Collapsible detailed view
- Performance status indicators
- Export to JSON functionality
- Responsive design

### 4. Performance Alerts (`components/ui/Performance/PerformanceAlert.tsx`)

Real-time alert system that provides:
- Performance warnings for slow resources
- Critical performance issue alerts
- Floating performance indicator
- Configurable thresholds
- Auto-dismissing notifications

**Features:**
- Configurable alert thresholds
- Position customization
- Production/development modes
- Performance status indicator
- Click-to-view dashboard integration

### 5. Performance Hooks (`hooks/usePerformanceMonitoring.ts`)

React hooks for component-level monitoring:
- `usePerformanceMonitoring` - Component lifecycle tracking
- `useOperationMonitoring` - Generic operation monitoring
- `useApiMonitoring` - API call performance tracking
- `useRouteMonitoring` - Route change performance

**Usage:**
```typescript
import { usePerformanceMonitoring, useApiMonitoring } from './hooks/usePerformanceMonitoring';

function MyComponent() {
  const { measureAsync, measureSync } = usePerformanceMonitoring({
    componentName: 'MyComponent',
    trackRenders: true
  });

  const { monitorApiCall } = useApiMonitoring();

  const handleApiCall = async () => {
    await monitorApiCall(() => fetch('/api/data'), '/api/data', 'GET');
  };
}
```

### 6. Monitored Fetch (`utils/monitoredFetch.ts`)

Enhanced fetch wrapper with automatic performance monitoring:
- Automatic API call tracking
- Retry logic with performance monitoring
- Batch API call monitoring
- Operation name generation
- Error tracking and reporting

**Features:**
- Automatic performance tracking for all API calls
- Configurable retry logic
- Batch operation support
- Consistent operation naming
- Development warnings for slow calls

### 7. Performance Setup (`utils/performanceSetup.ts`)

Comprehensive initialization system that sets up:
- Automatic performance reporting
- Performance alerts
- Memory monitoring
- User interaction tracking
- Error monitoring integration
- Page visibility monitoring

**Features:**
- Automatic initialization
- Configurable reporting intervals
- Memory usage monitoring
- User interaction tracking
- Error correlation
- Development debugging tools

### 8. Route Tracking (`components/RouteTracker.tsx`)

Route-level performance monitoring:
- Page view tracking
- Route change performance
- Navigation timing
- Development logging

## Integration

### App Integration

The performance monitoring system is integrated into the main App component:

```typescript
// App.tsx
import { initializePerformanceMonitoring } from './utils/performanceSetup';
import { PerformanceAlert, PerformanceIndicator } from './components/ui/Performance/PerformanceAlert';
import RouteTracker from './components/RouteTracker';

// Initialize monitoring
useEffect(() => {
  initializePerformanceMonitoring();
}, []);

// Components in render
<RouteTracker />
<PerformanceAlert threshold={1000} />
<PerformanceIndicator onClick={() => setShowDashboard(true)} />
```

### Automatic API Monitoring

All fetch calls are automatically monitored in development:

```typescript
// Automatic replacement in development
if (process.env.NODE_ENV === 'development') {
  window.fetch = monitoredFetch;
}
```

## Configuration

### Environment Variables

- `REACT_APP_PERFORMANCE_ENDPOINT` - Remote reporting endpoint
- `NODE_ENV` - Controls development features

### Thresholds

- Slow resource threshold: 1000ms (configurable)
- Critical performance threshold: 2000ms
- Memory usage warning: 80%
- Alert cooldown: 30 seconds

## Metrics Collected

### Web Vitals
- **FCP (First Contentful Paint)** - Time to first content render
- **LCP (Largest Contentful Paint)** - Time to largest content render
- **FID (First Input Delay)** - Time from first user input to response
- **CLS (Cumulative Layout Shift)** - Visual stability metric
- **TTFB (Time to First Byte)** - Server response time

### Custom Metrics
- Component load times
- Image loading performance
- Bundle loading times
- API response times
- Route change performance
- User interaction timing
- Memory usage
- Error correlation

### Performance Scoring

The system provides an A-F grade based on:
- Web Vitals performance
- Custom metrics performance
- Error frequency
- Resource loading times

**Scoring Criteria:**
- A: 90-100 points (Excellent)
- B: 80-89 points (Good)
- C: 70-79 points (Fair)
- D: 60-69 points (Poor)
- F: Below 60 points (Critical)

## Development Tools

### Browser Console Tools

In development mode, performance debugging tools are available:

```javascript
// Available at window.performanceDebug
performanceDebug.getHealth()      // Get performance health status
performanceDebug.exportData()     // Export all performance data
performanceDebug.clearData()      // Clear all metrics
performanceDebug.logStats()       // Log current statistics
performanceDebug.monitor          // Access to performance monitor
performanceDebug.metrics          // Access to metrics service
```

### Performance Dashboard

Access the performance dashboard by:
1. Clicking the floating performance indicator (development only)
2. Programmatically showing the dashboard modal

### Automatic Logging

The system automatically logs:
- Performance statistics after page load
- Slow resource warnings
- Route changes
- Component lifecycle events
- Memory usage alerts

## Testing

Comprehensive test coverage includes:
- Performance monitor functionality
- Metrics service operations
- Dashboard component behavior
- Hook functionality
- Utility functions

**Test Files:**
- `utils/__tests__/performanceMonitoring.test.ts`
- `services/__tests__/performanceMetrics.test.ts`
- `components/ui/Performance/__tests__/PerformanceDashboard.test.tsx`

## Best Practices

### For Developers

1. **Use Performance Hooks**: Leverage the provided hooks for component monitoring
2. **Monitor Critical Paths**: Focus on user-critical operations
3. **Set Appropriate Thresholds**: Configure alerts for your performance requirements
4. **Regular Monitoring**: Check performance dashboard regularly during development
5. **Export Data**: Use data export for detailed analysis

### For Production

1. **Configure Reporting**: Set up remote performance reporting
2. **Monitor Alerts**: Set up monitoring for performance degradation
3. **Regular Analysis**: Analyze performance reports regularly
4. **Optimization**: Use recommendations for performance improvements

## Future Enhancements

Potential improvements include:
- Real User Monitoring (RUM) integration
- Performance budgets and CI integration
- Advanced analytics and trending
- Performance regression detection
- A/B testing performance impact
- Mobile-specific metrics
- Network condition awareness

## Troubleshooting

### Common Issues

1. **High Memory Usage**: Check for memory leaks in components
2. **Slow API Calls**: Review network requests and server performance
3. **Poor LCP Scores**: Optimize images and critical resource loading
4. **High CLS Values**: Set explicit dimensions for dynamic content

### Debug Steps

1. Check browser console for performance warnings
2. Use performance dashboard for detailed metrics
3. Export performance data for analysis
4. Review recommendations for optimization suggestions
5. Monitor specific operations with custom timing

## Conclusion

The performance monitoring system provides comprehensive visibility into application performance, enabling proactive optimization and ensuring excellent user experience. The system is designed to be lightweight, non-intrusive, and highly configurable for different environments and requirements.