interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

interface NavigationTiming {
  loadStart: number;
  loadEnd: number;
  domContentLoaded: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
}

class PerformanceMetricsService {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers(): void {
    if (typeof window === 'undefined') return;

    // Observe navigation timing
    if ('performance' in window && 'getEntriesByType' in window.performance) {
      this.observeNavigationTiming();
    }

    // Observe paint timing
    if ('PerformanceObserver' in window) {
      this.observePaintTiming();
    }
  }

  private observeNavigationTiming(): void {
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    
    if (navigationEntries.length > 0) {
      const entry = navigationEntries[0];
      this.recordMetric('navigation.loadStart', entry.loadEventStart);
      this.recordMetric('navigation.loadEnd', entry.loadEventEnd);
      this.recordMetric('navigation.domContentLoaded', entry.domContentLoadedEventEnd);
    }
  }

  private observePaintTiming(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric(`paint.${entry.name}`, entry.startTime);
        }
      });
      
      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Paint timing observer not supported:', error);
    }
  }

  recordMetric(name: string, value: number): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now()
    };
    
    this.metrics.push(metric);
    
    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  getNavigationTiming(): NavigationTiming | null {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return null;
    }

    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    
    if (navigationEntries.length === 0) {
      return null;
    }

    const entry = navigationEntries[0];
    
    return {
      loadStart: entry.loadEventStart,
      loadEnd: entry.loadEventEnd,
      domContentLoaded: entry.domContentLoadedEventEnd,
      firstPaint: this.getMetricsByName('paint.first-paint')[0]?.value,
      firstContentfulPaint: this.getMetricsByName('paint.first-contentful-paint')[0]?.value
    };
  }

  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.clearMetrics();
  }
}

export const performanceMetrics = new PerformanceMetricsService();
export default performanceMetrics;