import React, { useState, useEffect } from 'react';
import { Activity, Clock, Zap, TrendingUp } from 'lucide-react';
import PerformanceAlert from './PerformanceAlert';

interface PerformanceMetric {
  name: string;
  value: number;
  threshold: number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
}

interface PerformanceDashboardProps {
  className?: string;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ 
  className = '' 
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading performance metrics
    const loadMetrics = () => {
      const mockMetrics: PerformanceMetric[] = [
        {
          name: 'Page Load Time',
          value: 2.3,
          threshold: 3.0,
          unit: 's',
          trend: 'down'
        },
        {
          name: 'First Contentful Paint',
          value: 1.2,
          threshold: 1.8,
          unit: 's',
          trend: 'stable'
        },
        {
          name: 'Largest Contentful Paint',
          value: 2.8,
          threshold: 2.5,
          unit: 's',
          trend: 'up'
        },
        {
          name: 'Cumulative Layout Shift',
          value: 0.05,
          threshold: 0.1,
          unit: '',
          trend: 'down'
        }
      ];
      
      setMetrics(mockMetrics);
      setIsLoading(false);
    };

    const timer = setTimeout(loadMetrics, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getMetricIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'page load time':
        return <Clock className="h-5 w-5" />;
      case 'first contentful paint':
        return <Zap className="h-5 w-5" />;
      case 'largest contentful paint':
        return <Activity className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up':
        return 'text-red-500';
      case 'down':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className={`p-6 bg-white rounded-lg shadow ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Performance Metrics
        </h3>
        
        <PerformanceAlert metrics={metrics} className="mb-4" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {getMetricIcon(metric.name)}
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {metric.name}
                  </span>
                </div>
                {metric.trend && (
                  <TrendingUp 
                    className={`h-4 w-4 ${getTrendColor(metric.trend)} ${
                      metric.trend === 'down' ? 'rotate-180' : ''
                    }`} 
                  />
                )}
              </div>
              
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-gray-900">
                  {metric.value}
                </span>
                <span className="ml-1 text-sm text-gray-500">
                  {metric.unit}
                </span>
              </div>
              
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Threshold: {metric.threshold}{metric.unit}</span>
                  <span>
                    {metric.value <= metric.threshold ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      metric.value <= metric.threshold 
                        ? 'bg-green-500' 
                        : metric.value <= metric.threshold * 1.5
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min((metric.value / (metric.threshold * 2)) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;