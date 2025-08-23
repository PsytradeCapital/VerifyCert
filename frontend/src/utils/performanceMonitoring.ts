export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  
  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }
  
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }
  
  clearMetrics() {
    this.metrics = [];
  }
  
  mark(name: string) {
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        performance.mark(name);
      } catch (error) {
        console.warn('Performance mark failed:', error);
      }
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

export const withPerformanceMonitoring = <T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T => {
  return ((...args: any[]) => {
    const startTime = performance.now();
    performanceMonitor.mark(name + '-start');
    
    try {
      const result = fn(...args);
      
      if (result instanceof Promise) {
        return result.finally(() => {
          const endTime = performance.now();
          performanceMonitor.recordMetric({
            name,
            value: endTime - startTime,
            timestamp: Date.now()
          });
        });
      }
      
      const endTime = performance.now();
      performanceMonitor.recordMetric({
        name,
        value: endTime - startTime,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      performanceMonitor.recordMetric({
        name: name + '-error',
        value: endTime - startTime,
        timestamp: Date.now(),
        metadata: { error: (error as Error).message }
      });
      throw error;
    }
  }) as T;
};
