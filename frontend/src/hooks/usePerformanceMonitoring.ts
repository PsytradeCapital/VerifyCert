import { useEffect, useCallback, useRef } from 'react';
import { performanceMonitor } from '../utils/performanceMonitoring';

interface UsePerformanceMonitoringOptions {
  componentName?: string;
  trackRenders?: boolean;
  trackEffects?: boolean;
  warnThreshold?: number;
}

export const usePerformanceMonitoring = (options: UsePerformanceMonitoringOptions = {}) => {
  const {
    componentName = 'UnknownComponent',
    trackRenders = true,
    trackEffects = true,
    warnThreshold = 100
  } = options;

  const renderCount = useRef(0);
  const mountTime = useRef<number>();
  const lastRenderTime = useRef<number>();

  // Track component mount/unmount
  useEffect(() => {
    if (trackEffects) {
      mountTime.current = performance.now();
      performanceMonitor.startComponentLoad(componentName);

      return () => {
        performanceMonitor.endComponentLoad(componentName);
        
        // Log component lifecycle stats in development
        if (process.env.NODE_ENV === 'development' && mountTime.current) {
          const totalLifetime = performance.now() - mountTime.current;
          console.log(`🔍 Component ${componentName} lifecycle:`, {
            totalLifetime: `${totalLifetime.toFixed(2)}ms`,
            renderCount: renderCount.current,
            averageRenderTime: renderCount.current > 0 ? 
              `${(totalLifetime / renderCount.current).toFixed(2)}ms` : 'N/A'
          });
        }
      };
    }
  }, [componentName, trackEffects]);

  // Track renders
  useEffect(() => {
    if (trackRenders) {
      const renderStart = performance.now();
      renderCount.current += 1;

      // Measure render time
      const measureRender = () => {
        const renderTime = performance.now() - renderStart;
        lastRenderTime.current = renderTime;

        // Warn about slow renders in development
        if (process.env.NODE_ENV === 'development' && renderTime > warnThreshold) {
          console.warn(`⚠️ Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
        }

        // Record render performance
        performanceMonitor.startTiming(`render_${componentName}_${renderCount.current}`);
        performanceMonitor.endTiming(`render_${componentName}_${renderCount.current}`, {
          renderCount: renderCount.current,
          renderTime
        });
      };

      // Use setTimeout to measure after render completion
      setTimeout(measureRender, 0);
    }
  });

  // Performance measurement utilities
  const measureAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    const fullName = `${componentName}_${operationName}`;
    performanceMonitor.startTiming(fullName);

    try {
      const result = await operation();
      performanceMonitor.endTiming(fullName, { success: true });
      return result;
    } catch (error) {
      performanceMonitor.endTiming(fullName, { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }, [componentName]);

  const measureSync = useCallback(<T>(
    operation: () => T,
    operationName: string
  ): T => {
    const fullName = `${componentName}_${operationName}`;
    performanceMonitor.startTiming(fullName);

    try {
      const result = operation();
      performanceMonitor.endTiming(fullName, { success: true });
      return result;
    } catch (error) {
      performanceMonitor.endTiming(fullName, { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }, [componentName]);

  const startTiming = useCallback((operationName: string) => {
    performanceMonitor.startTiming(`${componentName}_${operationName}`);
  }, [componentName]);

  const endTiming = useCallback((operationName: string, metadata?: Record<string, any>) => {
    performanceMonitor.endTiming(`${componentName}_${operationName}`, metadata);
  }, [componentName]);

  return {
    measureAsync,
    measureSync,
    startTiming,
    endTiming,
    renderCount: renderCount.current,
    lastRenderTime: lastRenderTime.current
  };
};

// Hook for monitoring specific operations
export const useOperationMonitoring = () => {
  const measureOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string,
    metadata?: Record<string, any>
  ): Promise<T> => {
    performanceMonitor.startTiming(operationName, metadata);

    try {
      const result = await operation();
      performanceMonitor.endTiming(operationName, { success: true, ...metadata });
      return result;
    } catch (error) {
      performanceMonitor.endTiming(operationName, { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        ...metadata 
      });
      throw error;
    }
  }, []);

  return { measureOperation };
};

// Hook for monitoring API calls
export const useApiMonitoring = () => {
  const monitorApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    endpoint: string,
    method: string = 'GET'
  ): Promise<T> => {
    const operationName = `api_${method.toLowerCase()}_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    performanceMonitor.startTiming(operationName, {
      type: 'api',
      endpoint,
      method
    });

    try {
      const result = await apiCall();
      performanceMonitor.endTiming(operationName, { 
        success: true,
        type: 'api',
        endpoint,
        method
      });
      return result;
    } catch (error) {
      performanceMonitor.endTiming(operationName, { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        type: 'api',
        endpoint,
        method
      });
      throw error;
    }
  }, []);

  return { monitorApiCall };
};

// Hook for monitoring route changes
export const useRouteMonitoring = () => {
  const monitorRouteChange = useCallback((fromRoute: string, toRoute: string) => {
    const operationName = `route_change_${fromRoute.replace(/[^a-zA-Z0-9]/g, '_')}_to_${toRoute.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    performanceMonitor.startTiming(operationName, {
      type: 'navigation',
      fromRoute,
      toRoute
    });

    // End timing after a short delay to capture route transition
    setTimeout(() => {
      performanceMonitor.endTiming(operationName, {
        type: 'navigation',
        fromRoute,
        toRoute,
        success: true
      });
    }, 100);
  }, []);

  return { monitorRouteChange };
};

export default usePerformanceMonitoring;