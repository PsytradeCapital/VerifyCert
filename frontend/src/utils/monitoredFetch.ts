export interface MonitoredFetchOptions extends RequestInit {
  skipMonitoring?: boolean;
  operationName?: string;
}

export const monitoredFetch = async (
  input: RequestInfo | URL,
  init?: MonitoredFetchOptions
): Promise<Response> => {
  const startTime = performance.now();
  const operationName = init?.operationName || 'fetch';
  
  try {
    if (init?.skipMonitoring) {
      return await fetch(input, init);
    }
    
    console.log('Starting ' + operationName + ':', input);
    
    const response = await fetch(input, init);
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(operationName + ' completed in ' + duration.toFixed(2) + 'ms', {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    });
    
    return response;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.error(operationName + ' failed after ' + duration.toFixed(2) + 'ms:', error);
    throw error;
  }
};

export default monitoredFetch;
