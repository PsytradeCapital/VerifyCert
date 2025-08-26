import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  mountTime: number;
  lastRenderTime: number;
}

interface PerformanceMonitoringOptions {
  componentName?: string;
  trackRenders?: boolean;
  trackEffects?: boolean;
  logToConsole?: boolean;
}

export const usePerformanceMonitoring = (options: PerformanceMonitoringOptions = {}) => {
  const {
    componentName = 'Component',
    trackRenders = true,
    trackEffects = false,
    logToConsole = false
  } = options;

  const mountTime = useRef<number>(performance.now());
  const renderCount = useRef<number>(0);
  const totalRenderTime = useRef<number>(0);
  const lastRenderStart = useRef<number>(0);

  // Track component mount
  useEffect(() => {
    if (logToConsole) {
      console.log(`🚀 Component ${componentName} mounted at ${mountTime.current}ms`);
    }

    return () => {
      if (logToConsole) {
        const totalLifetime = performance.now() - mountTime.current;
        console.log(`🔍 Component ${componentName} lifecycle:`, {
          totalLifetime: `${totalLifetime.toFixed(2)}ms`,
          renderCount: renderCount.current,
          averageRenderTime: renderCount.current > 0 ? 
            `${(totalRenderTime.current / renderCount.current).toFixed(2)}ms` : 'N/A'
        });
      }
    };
  }, [componentName, logToConsole]);

  // Track renders
  useEffect(() => {
    if (trackRenders) {
      const renderStart = performance.now();
      renderCount.current += 1;
      lastRenderStart.current = renderStart;

      // Measure render time in next tick
      const timeoutId = setTimeout(() => {
        const renderTime = performance.now() - renderStart;
        totalRenderTime.current += renderTime;

        if (logToConsole && renderTime > 16) { // Log slow renders (>16ms)
          console.warn(`⚠️ Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
        }
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  });

  // Track effects
  useEffect(() => {
    if (trackEffects && logToConsole) {
      console.log(`🔄 Effect triggered in ${componentName}`);
    }
  }, [trackEffects, logToConsole, componentName]);

  const getMetrics = useCallback((): PerformanceMetrics => {
    const currentTime = performance.now();
    return {
      renderCount: renderCount.current,
      totalRenderTime: totalRenderTime.current,
      averageRenderTime: renderCount.current > 0 ? 
        totalRenderTime.current / renderCount.current : 0,
      mountTime: mountTime.current,
      lastRenderTime: currentTime - lastRenderStart.current
    };
  }, []);

  const logMetrics = useCallback(() => {
    const metrics = getMetrics();
    console.table({
      [`${componentName} Metrics`]: {
        'Render Count': metrics.renderCount,
        'Total Render Time': `${metrics.totalRenderTime.toFixed(2)}ms`,
        'Average Render Time': `${metrics.averageRenderTime.toFixed(2)}ms`,
        'Component Age': `${(performance.now() - metrics.mountTime).toFixed(2)}ms`,
        'Last Render Time': `${metrics.lastRenderTime.toFixed(2)}ms`
      }
    });
  }, [componentName, getMetrics]);

  const resetMetrics = useCallback(() => {
    renderCount.current = 0;
    totalRenderTime.current = 0;
    mountTime.current = performance.now();
  }, []);

  return {
    getMetrics,
    logMetrics,
    resetMetrics
  };
};

export default usePerformanceMonitoring;