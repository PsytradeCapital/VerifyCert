import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  threshold: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
}

interface PerformanceAlertProps {
  metrics?: PerformanceMetric[];
  className?: string;
  onDismiss?: () => void;
}

export const PerformanceAlert: React.FC<PerformanceAlertProps> = ({ 
  metrics = [],
  className = '',
  onDismiss 
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkPerformance = () => {
      const performanceMetrics: PerformanceMetric[] = [
        {
          name: 'Page Load Time',
          value: performance.now(),
          threshold: 3000,
          unit: 'ms',
          status: performance.now() > 3000 ? 'warning' : 'good'
        },
        {
          name: 'Memory Usage',
          value: (performance as any).memory?.usedJSHeapSize || 0,
          threshold: 50 * 1024 * 1024, // 50MB
          unit: 'MB',
          status: ((performance as any).memory?.usedJSHeapSize || 0) > 50 * 1024 * 1024 ? 'warning' : 'good'
        }
      ];

      setMetrics(performanceMetrics);
      
      // Show alert if any metric is in warning or critical state
      const hasIssues = performanceMetrics.some(metric => 
        metric.status === 'warning' || metric.status === 'critical'
      );
      setIsVisible(hasIssues);
    };

    checkPerformance();
    const interval = setInterval(checkPerformance, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <TrendingUp className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'critical':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'MB') {
      return `${(value / (1024 * 1024)).toFixed(1)} ${unit}`;
    }
    if (unit === 'ms') {
      return `${Math.round(value)} ${unit}`;
    }
    return `${value} ${unit}`;
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Performance Alert
            </h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className={`p-2 rounded border ${getStatusColor(metric.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(metric.status)}
                  <span className="text-sm font-medium">{metric.name}</span>
                </div>
                <span className="text-sm">
                  {formatValue(metric.value, metric.unit)}
                </span>
              </div>
              {metric.status !== 'good' && (
                <div className="text-xs mt-1 opacity-75">
                  Threshold: {formatValue(metric.threshold, metric.unit)}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Performance is being monitored. Consider optimizing if issues persist.
        </div>
      </div>
    </div>
  );
};

export default PerformanceAlert;