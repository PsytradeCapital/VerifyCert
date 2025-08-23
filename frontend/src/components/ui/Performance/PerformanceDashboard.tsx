import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '../../../utils/performanceMonitoring';
import Card from '../Card/Card';

interface PerformanceMetric {
}
}
}
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;

interface PerformanceSummary {
}
}
}
  total: number;
  components: {
    count: number;
    averageLoadTime: number;
    slowest?: PerformanceMetric;
  };
  images: {
    count: number;
    averageLoadTime: number;
    slowest?: PerformanceMetric;
  };
  bundles: {
    count: number;
    averageLoadTime: number;
    slowest?: PerformanceMetric;
  };
  navigation?: PerformanceMetric;

export const PerformanceDashboard: React.FC = () => {
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateMetrics = () => {
      setSummary(performanceMonitor.getSummary());
      setMetrics(performanceMonitor.getMetrics());
    };

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    updateMetrics(); // Initial load

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (duration?: number): string => {
    if (!duration) return 'N/A';
    return `${duration.toFixed(2)}ms`;
  };

  const getPerformanceStatus = (duration?: number): 'good' | 'warning' | 'poor' => {
    if (!duration) return 'good';
    if (duration < 100) return 'good';
    if (duration < 500) return 'warning';
    return 'poor';
  };

  const getStatusColor = (status: 'good' | 'warning' | 'poor'): string => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
  };

  const exportMetrics = () => {
    const data = performanceMonitor.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!summary) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading performance metrics...</p>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Toggle Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Performance Dashboard</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isVisible ? 'Hide Details' : 'Show Details'}
          </button>
          <button
            onClick={exportMetrics}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Components</h3>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-blue-600">{summary.components.count}</p>
            <p className="text-sm text-gray-600">
              Avg: {formatDuration(summary.components.averageLoadTime)}
            </p>
            {summary.components.slowest && (
              <p className={`text-xs ${getStatusColor(getPerformanceStatus(summary.components.slowest.duration))}`}>
                Slowest: {formatDuration(summary.components.slowest.duration)}
              </p>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Images</h3>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-green-600">{summary.images.count}</p>
            <p className="text-sm text-gray-600">
              Avg: {formatDuration(summary.images.averageLoadTime)}
            </p>
            {summary.images.slowest && (
              <p className={`text-xs ${getStatusColor(getPerformanceStatus(summary.images.slowest.duration))}`}>
                Slowest: {formatDuration(summary.images.slowest.duration)}
              </p>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Bundles</h3>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-purple-600">{summary.bundles.count}</p>
            <p className="text-sm text-gray-600">
              Avg: {formatDuration(summary.bundles.averageLoadTime)}
            </p>
            {summary.bundles.slowest && (
              <p className={`text-xs ${getStatusColor(getPerformanceStatus(summary.bundles.slowest.duration))}`}>
                Slowest: {formatDuration(summary.bundles.slowest.duration)}
              </p>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Navigation</h3>
          <div className="space-y-1">
            {summary.navigation ? (
              <>
                <p className="text-2xl font-bold text-orange-600">
                  {formatDuration(summary.navigation.duration)}
                </p>
                <p className="text-sm text-gray-600">Page Load</p>
                {summary.navigation.metadata?.firstContentfulPaint && (
                  <p className="text-xs text-gray-500">
                    FCP: {formatDuration(summary.navigation.metadata.firstContentfulPaint)}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">No navigation data</p>
            )}
          </div>
        </Card>
      </div>

      {/* Detailed Metrics */}
      {isVisible && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Detailed Metrics</h3>
          
          {metrics.length === 0 ? (
            <p className="text-gray-500">No metrics available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {metrics.map((metric, index) => {
                    const status = getPerformanceStatus(metric.duration);
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {metric.name.length > 50 ? `${metric.name.substring(0, 50)}...` : metric.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {metric.metadata?.type || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDuration(metric.duration)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            status === 'good' ? 'bg-green-100 text-green-800' :
                            status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {metric.metadata?.success !== undefined && (
                            <span className={metric.metadata.success ? 'text-green-600' : 'text-red-600'}>
                              {metric.metadata.success ? '✓' : '✗'}
                            </span>
                          )}
                          {metric.metadata?.size && (
                            <span className="ml-2 text-xs">
                              {(metric.metadata.size / 1024).toFixed(1)}KB
                            </span>
                          )}
                          {metric.metadata?.cached && (
                            <span className="ml-2 text-xs text-blue-600">Cached</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Performance Warnings */}
      {(() => {
        const slowMetrics = performanceMonitor.getSlowMetrics(1000);
        if (slowMetrics.length === 0) return null;

        return (
          <Card className="p-6 border-l-4 border-red-500 bg-red-50">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              ⚠️ Performance Warnings
            </h3>
            <p className="text-red-700 mb-3">
              The following resources are loading slowly (&gt;1000ms):
            </p>
            <ul className="space-y-1">
              {slowMetrics.map((metric, index) => (
                <li key={index} className="text-sm text-red-600">
                  • {metric.name}: {formatDuration(metric.duration)}
                </li>
              ))}
            </ul>
          </Card>
        );
      })()}
    </div>
  );
};

export default PerformanceDashboard;
}}}}