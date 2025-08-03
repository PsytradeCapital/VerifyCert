import { performanceMonitor } from './performanceMonitoring';

interface MonitoredFetchOptions extends RequestInit {
  skipMonitoring?: boolean;
  operationName?: string;
}

/**
 * Enhanced fetch function with automatic performance monitoring
 */
export const monitoredFetch = async (
  input: RequestInfo | URL,
  init?: MonitoredFetchOptions
): Promise<Response> => {
  const { skipMonitoring = false, operationName, ...fetchOptions } = init || {};

  // Skip monitoring if explicitly requested
  if (skipMonitoring) {
    return fetch(input, fetchOptions);
  }

  // Extract URL and method for monitoring
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const method = fetchOptions.method || 'GET';
  
  // Generate operation name
  const operation = operationName || generateOperationName(url, method);
  
  // Start monitoring
  performanceMonitor.startTiming(operation, {
    type: 'api',
    url,
    method,
    timestamp: Date.now()
  });

  try {
    const response = await fetch(input, fetchOptions);
    
    // End monitoring with success status
    performanceMonitor.endTiming(operation, {
      type: 'api',
      url,
      method,
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      responseSize: response.headers.get('content-length') || 'unknown'
    });

    // Log slow API calls in development
    if (process.env.NODE_ENV === 'development') {
      const metrics = performanceMonitor.getMetrics();
      const currentMetric = metrics.find(m => m.name === operation);
      
      if (currentMetric && currentMetric.duration && currentMetric.duration > 1000) {
        console.warn(`🐌 Slow API call detected: ${operation} (${currentMetric.duration.toFixed(0)}ms)`);
      }
    }

    return response;
  } catch (error) {
    // End monitoring with error
    performanceMonitor.endTiming(operation, {
      type: 'api',
      url,
      method,
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    });

    throw error;
  }
};

/**
 * Generate a consistent operation name for API monitoring
 */
function generateOperationName(url: string, method: string): string {
  try {
    const urlObj = new URL(url, window.location.origin);
    const pathname = urlObj.pathname;
    
    // Clean up the pathname for consistent naming
    const cleanPath = pathname
      .replace(/\/+/g, '/') // Remove duplicate slashes
      .replace(/^\//, '') // Remove leading slash
      .replace(/\/$/, '') // Remove trailing slash
      .replace(/[^a-zA-Z0-9\/\-_]/g, '_') // Replace special chars with underscore
      .replace(/\//g, '_'); // Replace slashes with underscores

    return `api_${method.toLowerCase()}_${cleanPath || 'root'}`;
  } catch {
    // Fallback for invalid URLs
    return `api_${method.toLowerCase()}_unknown`;
  }
}

/**
 * Monitored fetch with automatic retry logic
 */
export const monitoredFetchWithRetry = async (
  input: RequestInfo | URL,
  init?: MonitoredFetchOptions & { maxRetries?: number; retryDelay?: number }
): Promise<Response> => {
  const { maxRetries = 3, retryDelay = 1000, ...fetchOptions } = init || {};
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await monitoredFetch(input, {
        ...fetchOptions,
        operationName: fetchOptions.operationName ? 
          `${fetchOptions.operationName}_attempt_${attempt}` : 
          undefined
      });
      
      // Return successful response
      if (response.ok) {
        return response;
      }
      
      // Don't retry client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        return response;
      }
      
      // Retry server errors (5xx) and network issues
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        continue;
      }
      
      throw lastError;
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
};

/**
 * Batch API calls with performance monitoring
 */
export const monitoredBatchFetch = async <T>(
  requests: Array<{
    input: RequestInfo | URL;
    init?: MonitoredFetchOptions;
    parser?: (response: Response) => Promise<T>;
  }>,
  options?: {
    concurrency?: number;
    operationName?: string;
  }
): Promise<Array<T | Error>> => {
  const { concurrency = 5, operationName = 'batch_api_calls' } = options || {};
  
  performanceMonitor.startTiming(operationName, {
    type: 'api_batch',
    requestCount: requests.length,
    concurrency
  });

  try {
    // Process requests in batches to control concurrency
    const results: Array<T | Error> = [];
    
    for (let i = 0; i < requests.length; i += concurrency) {
      const batch = requests.slice(i, i + concurrency);
      
      const batchPromises = batch.map(async ({ input, init, parser }) => {
        try {
          const response = await monitoredFetch(input, init);
          
          if (parser) {
            return await parser(response);
          }
          
          return response.json() as T;
        } catch (error) {
          return error instanceof Error ? error : new Error('Unknown error');
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    const successCount = results.filter(result => !(result instanceof Error)).length;
    const errorCount = results.length - successCount;
    
    performanceMonitor.endTiming(operationName, {
      type: 'api_batch',
      requestCount: requests.length,
      successCount,
      errorCount,
      success: errorCount === 0
    });
    
    return results;
  } catch (error) {
    performanceMonitor.endTiming(operationName, {
      type: 'api_batch',
      requestCount: requests.length,
      success: false,
      error: error instanceof Error ? error.message : 'Batch operation failed'
    });
    
    throw error;
  }
};

/**
 * Create a monitored version of any async function
 */
export const withApiMonitoring = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  operationName: string
): T => {
  return (async (...args: any[]) => {
    performanceMonitor.startTiming(operationName, {
      type: 'api_operation',
      args: args.length
    });

    try {
      const result = await fn(...args);
      performanceMonitor.endTiming(operationName, {
        type: 'api_operation',
        success: true
      });
      return result;
    } catch (error) {
      performanceMonitor.endTiming(operationName, {
        type: 'api_operation',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }) as T;
};

// Export the original fetch as well for cases where monitoring is not needed
export { fetch as originalFetch };

// Replace global fetch with monitored version in development
if (process.env.NODE_ENV === 'development') {
  // Store original fetch
  (window as any).__originalFetch = window.fetch;
  
  // Replace with monitored version
  window.fetch = monitoredFetch as any;
  
  console.log('🔍 API performance monitoring enabled');
}

export default monitoredFetch;