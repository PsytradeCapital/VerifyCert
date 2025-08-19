import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../services/performanceMetrics';
import { useRouteMonitoring } from '../hooks/usePerformanceMonitoring';

export const RouteTracker: React.FC = () => {
  const location = useLocation();
  const previousLocation = useRef<string>('');
  const { monitorRouteChange } = useRouteMonitoring();

  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = previousLocation.current;

    // Track page view
    trackPageView(currentPath);

    // Monitor route change performance if there was a previous route
    if (previousPath && previousPath !== currentPath) {
      monitorRouteChange(previousPath, currentPath);

    // Update previous location
    previousLocation.current = currentPath;

    // Log route change in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Route changed: ${previousPath || 'initial'} → ${currentPath}`);
  }, [location.pathname, monitorRouteChange]);

  return null; // This component doesn't render anything
};

export default RouteTracker;