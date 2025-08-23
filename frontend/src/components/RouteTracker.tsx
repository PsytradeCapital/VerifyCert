import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface RouteTrackerProps {
  onRouteChange?: (path: string) => void;
}

export default function RouteTracker({ onRouteChange }: RouteTrackerProps) {
  const location = useLocation();

  useEffect(() => {
    if (onRouteChange) {
      onRouteChange(location.pathname);
    }
    
    // Track page view
    console.log(`Route changed to: ${location.pathname}`);
  }, [location.pathname, onRouteChange]);

  return null;
}