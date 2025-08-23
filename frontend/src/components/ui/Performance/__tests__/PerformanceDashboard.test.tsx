import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PerformanceDashboard } from '../PerformanceDashboard';
import { performanceMonitor } from '../../../../utils/performanceMonitoring';

// Mock the performance monitor
jest.mock('../../../../utils/performanceMonitoring', () => ({
  performanceMonitor: {
    getSummary: jest.fn(),
    getMetrics: jest.fn(),
    getSlowMetrics: jest.fn(),
    exportData: jest.fn(),
  },
}));

const mockPerformanceMonitor = performanceMonitor as jest.Mocked<typeof performanceMonitor>;

// Mock URL.createObjectURL and related APIs
Object.defineProperty(URL, 'createObjectURL', {
  value: jest.fn(() => 'mock-blob-url'),
});

Object.defineProperty(URL, 'revokeObjectURL', {
  value: jest.fn(),
});

// Mock document.createElement and related DOM APIs
const mockAnchorElement = {
  href: '',
  download: '',
  click: jest.fn(),
};

jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
  if (tagName === 'a') {
    return mockAnchorElement as any;
  return document.createElement(tagName);
});

jest.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
jest.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

describe('PerformanceDashboard', () => {
  const mockSummary = {
    total: 10,
    components: {
      count: 3,
      averageLoadTime: 250,
      slowest: {
        name: 'SlowComponent',
        duration: 500,
        startTime: 1000,
        endTime: 1500,
      },
    },
    images: {
      count: 5,
      averageLoadTime: 800,
      slowest: {
        name: 'large-image.jpg',
        duration: 1200,
        startTime: 1000,
        endTime: 2200,
      },
    },
    bundles: {
      count: 2,
      averageLoadTime: 1500,
      slowest: {
        name: 'main-bundle',
        duration: 2000,
        startTime: 1000,
        endTime: 3000,
      },
    },
    navigation: {
      name: 'navigation',
      duration: 3000,
      startTime: 0,
      endTime: 3000,
      metadata: {
        firstContentfulPaint: 1200,
      },
    },
  };

  const mockMetrics = [
    {
      name: 'component_TestComponent',
      startTime: 1000,
      endTime: 1300,
      duration: 300,
      metadata: { type: 'component', success: true },
    },
    {
      name: 'image_test.jpg',
      startTime: 1000,
      endTime: 1800,
      duration: 800,
      metadata: { type: 'image', success: true, size: 1024 },
    },
    {
      name: 'bundle_main',
      startTime: 1000,
      endTime: 2500,
      duration: 1500,
      metadata: { type: 'bundle', success: false },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceMonitor.getSummary.mockReturnValue(mockSummary);
    mockPerformanceMonitor.getMetrics.mockReturnValue(mockMetrics);
    mockPerformanceMonitor.getSlowMetrics.mockReturnValue([mockMetrics[2]]);
    mockPerformanceMonitor.exportData.mockReturnValue(JSON.stringify({
      timestamp: '2023-01-01T00:00:00.000Z',
      metrics: mockMetrics,
    }));
  });

  it('should render performance dashboard with summary cards', async () => {
    render(<PerformanceDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Performance Dashboard')).toBeInTheDocument();
    });

    // Check summary cards
    expect(screen.getByText('Components')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Avg: 250.00ms')).toBeInTheDocument();

    expect(screen.getByText('Images')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Avg: 800.00ms')).toBeInTheDocument();

    expect(screen.getByText('Bundles')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Avg: 1500.00ms')).toBeInTheDocument();

    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('3000.00ms')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    mockPerformanceMonitor.getSummary.mockReturnValue(null as any);

    render(<PerformanceDashboard />);

    expect(screen.getByText('Loading performance metrics...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
  });

  it('should toggle detailed metrics visibility', async () => {
    render(<PerformanceDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Performance Dashboard')).toBeInTheDocument();
    });

    // Initially, detailed metrics should be hidden
    expect(screen.queryByText('Detailed Metrics')).not.toBeInTheDocument();

    // Click show details button
    fireEvent.click(screen.getByText('Show Details'));

    // Now detailed metrics should be visible
    expect(screen.getByText('Detailed Metrics')).toBeInTheDocument();
    expect(screen.getByText('Hide Details')).toBeInTheDocument();

    // Check table headers
    expect(screen.getByText('Resource')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();

    // Check metric rows
    expect(screen.getByText('component_TestComponent')).toBeInTheDocument();
    expect(screen.getByText('300.00ms')).toBeInTheDocument();
    expect(screen.getByText('good')).toBeInTheDocument();

    // Hide details again
    fireEvent.click(screen.getByText('Hide Details'));
    expect(screen.queryByText('Detailed Metrics')).not.toBeInTheDocument();
  });

  it('should export performance data', async () => {
    render(<PerformanceDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Performance Dashboard')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Export Data'));

    expect(mockPerformanceMonitor.exportData).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(mockAnchorElement.click).toHaveBeenCalled();
    expect(mockAnchorElement.download).toMatch(/performance-metrics-.*\.json/);
  });

  it('should display performance warnings for slow resources', async () => {
    render(<PerformanceDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Performance Dashboard')).toBeInTheDocument();
    });

    // Should show performance warning
    expect(screen.getByText('⚠️ Performance Warnings')).toBeInTheDocument();
    expect(screen.getByText(/following resources are loading slowly/)).toBeInTheDocument();
    expect(screen.getByText(/bundle_main: 1500.00ms/)).toBeInTheDocument();
  });

  it('should not display warnings when no slow resources', async () => {
    mockPerformanceMonitor.getSlowMetrics.mockReturnValue([]);

    render(<PerformanceDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Performance Dashboard')).toBeInTheDocument();
    });

    expect(screen.queryByText('⚠️ Performance Warnings')).not.toBeInTheDocument();
  });

  it('should update metrics periodically', async () => {
    jest.useFakeTimers();

    render(<PerformanceDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Performance Dashboard')).toBeInTheDocument();
    });

    // Clear initial calls
    mockPerformanceMonitor.getSummary.mockClear();
    mockPerformanceMonitor.getMetrics.mockClear();

    // Fast-forward 5 seconds
    jest.advanceTimersByTime(5000);

    expect(mockPerformanceMonitor.getSummary).toHaveBeenCalled();
    expect(mockPerformanceMonitor.getMetrics).toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('should handle missing navigation data', async () => {
    const summaryWithoutNavigation = {
      ...mockSummary,
      navigation: undefined,
    };

    mockPerformanceMonitor.getSummary.mockReturnValue(summaryWithoutNavigation);

    render(<PerformanceDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Performance Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('No navigation data')).toBeInTheDocument();
  });

  it('should format long resource names correctly', async () => {
    const longNameMetric = {
      name: 'very-long-resource-name-that-should-be-truncated-because-it-is-too-long-for-display',
      startTime: 1000,
      endTime: 1200,
      duration: 200,
      metadata: { type: 'resource' },
    };

    mockPerformanceMonitor.getMetrics.mockReturnValue([longNameMetric]);

    render(<PerformanceDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Performance Dashboard')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Show Details'));

    // Should show truncated name
    expect(screen.getByText(/very-long-resource-name-that-should-be-truncated\.\.\.$/)).toBeInTheDocument();
  });

  it('should display correct status colors and badges', async () => {
    const metricsWithDifferentStatuses = [
      {
        name: 'fast-resource',
        duration: 50,
        startTime: 1000,
        endTime: 1050,
        metadata: { type: 'component', success: true },
      },
      {
        name: 'medium-resource',
        duration: 300,
        startTime: 1000,
        endTime: 1300,
        metadata: { type: 'image', success: true },
      },
      {
        name: 'slow-resource',
        duration: 2000,
        startTime: 1000,
        endTime: 3000,
        metadata: { type: 'bundle', success: false },
      },
    ];

    mockPerformanceMonitor.getMetrics.mockReturnValue(metricsWithDifferentStatuses);

    render(<PerformanceDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Performance Dashboard')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Show Details'));

    // Check status badges
    const goodBadges = screen.getAllByText('good');
    const warningBadges = screen.getAllByText('warning');
    const poorBadges = screen.getAllByText('poor');

    expect(goodBadges.length).toBeGreaterThan(0);
    expect(warningBadges.length).toBeGreaterThan(0);
    expect(poorBadges.length).toBeGreaterThan(0);
  });
});
}