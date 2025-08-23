import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '../../../utils/performanceMonitoring';

interface PerformanceAlertProps {
threshold?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showInProduction?: boolean;

interface Alert {
}}
}
}}}
  id: string;
  type: 'warning' | 'error';
  message: string;
  timestamp: number;
  metric?: any;

export const PerformanceAlert: React.FC<PerformanceAlertProps> = ({
  threshold = 1000,
  position = 'top-right',
  showInProduction = false
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  const shouldShow = process.env.NODE_ENV !== 'production' || showInProduction;

  useEffect(() => {
    if (!shouldShow) return;
    
    const checkPerformance = () => {
      const slowMetrics = performanceMonitor.getSlowMetrics(threshold);
      const newAlerts: Alert[] = [];

      slowMetrics.forEach(metric => {
        // Only alert for recent metrics (last 10 seconds)
        const isRecent = metric.endTime && (Date.now() - metric.endTime) < 10000;
        if (!isRecent) return;

        const alertId = `${metric.name}_${metric.endTime}`;
        const existingAlert = alerts.find(alert => alert.id === alertId);
        
        if (!existingAlert) {
          newAlerts.push({
            id: alertId,
            type: metric.duration && metric.duration > threshold * 2 ? 'error' : 'warning',
            message: `Slow loading: ${metric.name} (${metric.duration?.toFixed(0)}ms)`,
            timestamp: Date.now(),
            metric
          });
      });

      if (newAlerts.length > 0) {
        setAlerts(prev => [...prev, ...newAlerts].slice(-5)); // Keep only last 5 alerts
    };

    const interval = setInterval(checkPerformance, 2000);
    return () => clearInterval(interval);
  }, [threshold, alerts, shouldShow]);

  // Auto-dismiss alerts after 10 seconds
  useEffect(() => {
    if (!shouldShow) return;
    
    const dismissTimer = setInterval(() => {
      const now = Date.now();
      setAlerts(prev => prev.filter(alert => now - alert.timestamp < 10000));
    }, 1000);

    return () => clearInterval(dismissTimer);
  }, [shouldShow]);

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
  };

  // Don't show in production unless explicitly enabled
  if (!shouldShow || !isVisible || alerts.length === 0) {
    return null;

  return (
    <div className={`fixed ${getPositionClasses()} z-50 space-y-2 max-w-sm`}>
      {alerts.map(alert => (
        <div
          key={alert.id}
          className={`p-4 rounded-lg shadow-lg border-l-4 ${
            alert.type === 'error'
              ? 'bg-red-50 border-red-500 text-red-800'
              : 'bg-yellow-50 border-yellow-500 text-yellow-800'
          } animate-slide-in`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <span className="text-lg mr-2">
                  {alert.type === 'error' ? '🚨' : '⚠️'}
                </span>
                <h4 className="font-semibold text-sm">Performance Alert</h4>
              </div>
              <p className="text-sm mt-1">{alert.message}</p>
              {alert.metric?.metadata?.type && (
                <p className="text-xs mt-1 opacity-75">
                  Type: {alert.metric.metadata.type}
                </p>
              )}
            </div>
            <button
              onClick={() => dismissAlert(alert.id)}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss alert"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
      
      {/* Toggle visibility button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsVisible(false)}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Hide performance alerts
        </button>
      </div>
    </div>
  );
};

// Floating performance indicator
export const PerformanceIndicator: React.FC<{
  onClick?: () => void;
}> = ({ onClick }) => {
  const [status, setStatus] = useState<'good' | 'warning' | 'poor'>('good');

  useEffect(() => {
    const updateStatus = () => {
      const summary = performanceMonitor.getSummary();
      const slowMetrics = performanceMonitor.getSlowMetrics(500);
      
      // Remove the setMetrics call as it's not defined
      
      if (slowMetrics.length > 3) {
        setStatus('poor');
      } else if (slowMetrics.length > 0) {
        setStatus('warning');
      } else {
        setStatus('good');
    };

    const interval = setInterval(updateStatus, 3000);
    updateStatus();

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'good': return '✓';
      case 'warning': return '⚠';
      case 'poor': return '✗';
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-4 left-4 w-12 h-12 rounded-full ${getStatusColor()} text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40`}
      title={`Performance Status: ${status}\nClick to view details`}
    >
      <span className="text-lg font-bold">{getStatusIcon()}</span>
    </button>
  );
};

export default PerformanceAlert;
}
}}}