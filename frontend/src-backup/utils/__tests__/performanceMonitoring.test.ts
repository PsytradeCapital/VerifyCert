import { performanceMonitor, withPerformanceMonitoring, monitorLazyLoading } from '../performanceMonitoring';

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => 1000),
  getEntriesByType: jest.fn(() => []),
  mark: jest.fn(),
  measure: jest.fn(),
};

// Mock PerformanceObserver
const mockPerformanceObserver = jest.fn();
mockPerformanceObserver.prototype.observe = jest.fn();
mockPerformanceObserver.prototype.disconnect = jest.fn();

// Setup mocks
beforeAll(() => {
  Object.defineProperty(window, 'performance', {
    value: mockPerformance,
    writable: true,
  });

  Object.defineProperty(window, 'PerformanceObserver', {
    value: mockPerformanceObserver,
    writable: true,
  });
});

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    performanceMonitor.clear();
    jest.clearAllMocks();
    mockPerformance.now.mockReturnValue(1000);
  });

  describe('Manual timing', () => {
    it('should start and end timing correctly', () => {
      mockPerformance.now
        .mockReturnValueOnce(1000) // Start time
        .mockReturnValueOnce(1500); // End time

      performanceMonitor.startTiming('test-operation');
      performanceMonitor.endTiming('test-operation');

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        name: 'test-operation',
        startTime: 1000,
        endTime: 1500,
        duration: 500,
      });
    });

    it('should handle metadata correctly', () => {
      mockPerformance.now
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1200);

      performanceMonitor.startTiming('test-operation', { type: 'component' });
      performanceMonitor.endTiming('test-operation', { success: true });

      const metrics = performanceMonitor.getMetrics();
      expect(metrics[0].metadata).toMatchObject({
        type: 'component',
        success: true,
      });
    });
  });

  describe('Component monitoring', () => {
    it('should track component load times', () => {
      mockPerformance.now
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1300);

      performanceMonitor.startComponentLoad('TestComponent');
      performanceMonitor.endComponentLoad('TestComponent', true);

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        name: 'component_TestComponent',
        duration: 300,
        metadata: { type: 'component', success: true },
      });
    });
  });

  describe('Image monitoring', () => {
    it('should track image load times', () => {
      mockPerformance.now
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1800);

      const imageSrc = '/test-image.jpg';
      performanceMonitor.startImageLoad(imageSrc);
      performanceMonitor.endImageLoad(imageSrc, true, 1024);

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        name: `image_${imageSrc}`,
        duration: 800,
        metadata: { type: 'image', success: true, size: 1024 },
      });
    });
  });

  describe('Bundle monitoring', () => {
    it('should track bundle load times', () => {
      mockPerformance.now
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(2000);

      performanceMonitor.startBundleLoad('main-bundle');
      performanceMonitor.endBundleLoad('main-bundle', true);

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        name: 'bundle_main-bundle',
        duration: 1000,
        metadata: { type: 'bundle', success: true },
      });
    });
  });

  describe('Metrics filtering', () => {
    beforeEach(() => {
      // Add test metrics
      mockPerformance.now
        .mockReturnValueOnce(1000).mockReturnValueOnce(1200) // Component: 200ms
        .mockReturnValueOnce(1000).mockReturnValueOnce(1600) // Image: 600ms
        .mockReturnValueOnce(1000).mockReturnValueOnce(2500); // Bundle: 1500ms

      performanceMonitor.startComponentLoad('TestComponent');
      performanceMonitor.endComponentLoad('TestComponent');

      performanceMonitor.startImageLoad('/test.jpg');
      performanceMonitor.endImageLoad('/test.jpg');

      performanceMonitor.startBundleLoad('test-bundle');
      performanceMonitor.endBundleLoad('test-bundle');
    });

    it('should filter metrics by type', () => {
      const componentMetrics = performanceMonitor.getMetricsByType('component');
      const imageMetrics = performanceMonitor.getMetricsByType('image');
      const bundleMetrics = performanceMonitor.getMetricsByType('bundle');

      expect(componentMetrics).toHaveLength(1);
      expect(imageMetrics).toHaveLength(1);
      expect(bundleMetrics).toHaveLength(1);
    });

    it('should identify slow metrics', () => {
      const slowMetrics = performanceMonitor.getSlowMetrics(1000);
      expect(slowMetrics).toHaveLength(1);
      expect(slowMetrics[0].name).toBe('bundle_test-bundle');
    });
  });

  describe('Performance summary', () => {
    beforeEach(() => {
      // Add multiple metrics for summary calculation
      mockPerformance.now
        .mockReturnValueOnce(1000).mockReturnValueOnce(1300) // Component 1: 300ms
        .mockReturnValueOnce(1000).mockReturnValueOnce(1400) // Component 2: 400ms
        .mockReturnValueOnce(1000).mockReturnValueOnce(1800) // Image 1: 800ms
        .mockReturnValueOnce(1000).mockReturnValueOnce(1600); // Image 2: 600ms

      performanceMonitor.startComponentLoad('Component1');
      performanceMonitor.endComponentLoad('Component1');

      performanceMonitor.startComponentLoad('Component2');
      performanceMonitor.endComponentLoad('Component2');

      performanceMonitor.startImageLoad('/image1.jpg');
      performanceMonitor.endImageLoad('/image1.jpg');

      performanceMonitor.startImageLoad('/image2.jpg');
      performanceMonitor.endImageLoad('/image2.jpg');
    });

    it('should generate correct summary statistics', () => {
      const summary = performanceMonitor.getSummary();

      expect(summary.components.count).toBe(2);
      expect(summary.components.averageLoadTime).toBe(350); // (300 + 400) / 2
      expect(summary.components.slowest?.duration).toBe(400);

      expect(summary.images.count).toBe(2);
      expect(summary.images.averageLoadTime).toBe(700); // (800 + 600) / 2
      expect(summary.images.slowest?.duration).toBe(800);
    });
  });

  describe('Data export', () => {
    it('should export data in correct format', () => {
      mockPerformance.now
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1500);

      performanceMonitor.startTiming('test-export');
      performanceMonitor.endTiming('test-export');

      const exportedData = performanceMonitor.exportData();
      const parsedData = JSON.parse(exportedData);

      expect(parsedData).toHaveProperty('timestamp');
      expect(parsedData).toHaveProperty('userAgent');
      expect(parsedData).toHaveProperty('metrics');
      expect(parsedData).toHaveProperty('summary');
      expect(parsedData.metrics).toHaveLength(1);
    });
  });
});

describe('withPerformanceMonitoring', () => {
  beforeEach(() => {
    performanceMonitor.clear();
    jest.clearAllMocks();
  });

  it('should monitor synchronous functions', () => {
    mockPerformance.now
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1200);

    const testFunction = jest.fn(() => 'result');
    const monitoredFunction = withPerformanceMonitoring(testFunction, 'test-sync');

    const result = monitoredFunction();

    expect(result).toBe('result');
    expect(testFunction).toHaveBeenCalled();

    const metrics = performanceMonitor.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0]).toMatchObject({
      name: 'test-sync',
      duration: 200,
      metadata: { success: true },
    });
  });

  it('should monitor asynchronous functions', async () => {
    mockPerformance.now
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1500);

    const testFunction = jest.fn(() => Promise.resolve('async-result'));
    const monitoredFunction = withPerformanceMonitoring(testFunction, 'test-async');

    const result = await monitoredFunction();

    expect(result).toBe('async-result');
    expect(testFunction).toHaveBeenCalled();

    const metrics = performanceMonitor.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0]).toMatchObject({
      name: 'test-async',
      duration: 500,
      metadata: { success: true },
    });
  });

  it('should handle function errors', () => {
    mockPerformance.now
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1100);

    const testFunction = jest.fn(() => {
      throw new Error('Test error');
    });
    const monitoredFunction = withPerformanceMonitoring(testFunction, 'test-error');

    expect(() => monitoredFunction()).toThrow('Test error');

    const metrics = performanceMonitor.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0]).toMatchObject({
      name: 'test-error',
      duration: 100,
      metadata: { success: false, error: 'Test error' },
    });
  });

  it('should handle async function errors', async () => {
    mockPerformance.now
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1300);

    const testFunction = jest.fn(() => Promise.reject(new Error('Async error')));
    const monitoredFunction = withPerformanceMonitoring(testFunction, 'test-async-error');

    await expect(monitoredFunction()).rejects.toThrow('Async error');

    const metrics = performanceMonitor.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0]).toMatchObject({
      name: 'test-async-error',
      duration: 300,
      metadata: { success: false, error: 'Async error' },
    });
  });
});

describe('monitorLazyLoading', () => {
  beforeEach(() => {
    performanceMonitor.clear();
    jest.clearAllMocks();
  });

  it('should provide component monitoring utilities', () => {
    mockPerformance.now
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1400);

    const componentMonitor = monitorLazyLoading.component('LazyComponent');
    
    componentMonitor.onStart();
    componentMonitor.onEnd(true);

    const metrics = performanceMonitor.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0]).toMatchObject({
      name: 'component_LazyComponent',
      duration: 400,
      metadata: { type: 'component', success: true },
    });
  });

  it('should provide image monitoring utilities', () => {
    mockPerformance.now
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1700);

    const imageMonitor = monitorLazyLoading.image('/lazy-image.jpg');
    
    imageMonitor.onStart();
    imageMonitor.onEnd(true, 2048);

    const metrics = performanceMonitor.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0]).toMatchObject({
      name: 'image_/lazy-image.jpg',
      duration: 700,
      metadata: { type: 'image', success: true, size: 2048 },
    });
  });

  it('should provide bundle monitoring utilities', () => {
    mockPerformance.now
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(2200);

    const bundleMonitor = monitorLazyLoading.bundle('lazy-bundle');
    
    bundleMonitor.onStart();
    bundleMonitor.onEnd(true);

    const metrics = performanceMonitor.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0]).toMatchObject({
      name: 'bundle_lazy-bundle',
      duration: 1200,
      metadata: { type: 'bundle', success: true },
    });
  });
});