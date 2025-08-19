import { performanceMetrics, trackPageView, trackUserInteraction, trackFormSubmission } from '../performanceMetrics';
import { performanceMonitor } from '../../utils/performanceMonitoring';

// Mock fetch
global.fetch = jest.fn();

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => 1000),
  getEntriesByType: jest.fn(() => []),
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

  Object.defineProperty(window, 'location', {
    value: { href: 'https://example.com/test' },
    writable: true,
  });

  Object.defineProperty(navigator, 'userAgent', {
    value: 'Test User Agent',
    writable: true,
  });
});

describe('PerformanceMetricsService', () => {
  beforeEach(() => {
    performanceMonitor.clear();
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('Web Vitals tracking', () => {
    it('should initialize web vitals tracking', () => {
      expect(mockPerformanceObserver).toHaveBeenCalled();
      expect(mockPerformanceObserver.prototype.observe).toHaveBeenCalled();
    });

    it('should return web vitals metrics', () => {
      const webVitals = performanceMetrics.getWebVitals();
      expect(webVitals).toEqual(expect.objectContaining({
        FCP: expect.any(Number),
        LCP: expect.any(Number),
        FID: expect.any(Number),
        CLS: expect.any(Number),
        TTFB: expect.any(Number),
      }));
    });
  });

  describe('Custom metrics', () => {
    beforeEach(() => {
      // Add some test metrics
      mockPerformance.now
        .mockReturnValueOnce(1000).mockReturnValueOnce(1300) // Component: 300ms
        .mockReturnValueOnce(1000).mockReturnValueOnce(1500) // Image: 500ms
        .mockReturnValueOnce(1000).mockReturnValueOnce(1800) // Bundle: 800ms
        .mockReturnValueOnce(1000).mockReturnValueOnce(1200); // API: 200ms

      performanceMonitor.startComponentLoad('TestComponent');
      performanceMonitor.endComponentLoad('TestComponent');

      performanceMonitor.startImageLoad('/test.jpg');
      performanceMonitor.endImageLoad('/test.jpg');

      performanceMonitor.startBundleLoad('test-bundle');
      performanceMonitor.endBundleLoad('test-bundle');

      performanceMonitor.startTiming('api_get_test', { type: 'api' });
      performanceMonitor.endTiming('api_get_test');
    });

    it('should calculate custom metrics correctly', () => {
      const customMetrics = performanceMetrics.getCustomMetrics();

      expect(customMetrics).toEqual({
        bundleLoadTime: 800,
        componentLoadTime: 300,
        imageLoadTime: 500,
        apiResponseTime: 200,
        routeChangeTime: 0, // No route metrics in this test
      });
    });
  });

  describe('Performance scoring', () => {
    it('should calculate performance score', () => {
      const score = performanceMetrics.getPerformanceScore();
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return performance grade', () => {
      const grade = performanceMetrics.getPerformanceGrade();
      expect(['A', 'B', 'C', 'D', 'F']).toContain(grade);
    });
  });

  describe('Report generation', () => {
    it('should generate performance report', () => {
      const report = performanceMetrics.generateReport();

      expect(report).toEqual(expect.objectContaining({
        timestamp: expect.any(String),
        url: 'https://example.com/test',
        userAgent: 'Test User Agent',
        webVitals: expect.any(Object),
        customMetrics: expect.any(Object),
        slowResources: expect.any(Array),
        errors: expect.any(Array),
      }));
    });

    it('should send report to endpoint', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const endpoint = 'https://api.example.com/metrics';
      performanceMetrics.setReportingEndpoint(endpoint);

      await performanceMetrics.sendReport();

      expect(fetch).toHaveBeenCalledWith(
        endpoint,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String),
        })
      );
    });

    it('should handle report sending errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await performanceMetrics.sendReport('https://api.example.com/metrics');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to send performance report:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Recommendations', () => {
    it('should provide performance recommendations', () => {
      const recommendations = performanceMetrics.getRecommendations();
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should recommend bundle optimization for slow bundles', () => {
      // Add slow bundle metric
      mockPerformance.now
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(2500); // 1500ms bundle load

      performanceMonitor.startBundleLoad('slow-bundle');
      performanceMonitor.endBundleLoad('slow-bundle');

      const recommendations = performanceMetrics.getRecommendations();
      expect(recommendations.some(rec => 
        rec.includes('bundle loading') || rec.includes('code splitting')
      )).toBe(true);
    });
  });

  describe('Error tracking', () => {
    it('should track JavaScript errors', () => {
      const errorEvent = new ErrorEvent('error', {
        error: new Error('Test error'),
        message: 'Test error message',
      });

      window.dispatchEvent(errorEvent);

      const report = performanceMetrics.generateReport();
      expect(report.errors.length).toBeGreaterThan(0);
      expect(report.errors[0].message).toContain('Test error');
    });

    it('should track unhandled promise rejections', () => {
      const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.reject('Test rejection'),
        reason: 'Test rejection',
      });

      window.dispatchEvent(rejectionEvent);

      const report = performanceMetrics.generateReport();
      expect(report.errors.length).toBeGreaterThan(0);
      expect(report.errors[0].message).toContain('Test rejection');
    });

    it('should clear errors', () => {
      // Add an error
      const errorEvent = new ErrorEvent('error', {
        error: new Error('Test error'),
      });
      window.dispatchEvent(errorEvent);

      // Verify error exists
      let report = performanceMetrics.generateReport();
      expect(report.errors.length).toBeGreaterThan(0);

      // Clear errors
      performanceMetrics.clearErrors();

      // Verify errors are cleared
      report = performanceMetrics.generateReport();
      expect(report.errors.length).toBe(0);
    });
  });
});

describe('Utility functions', () => {
  beforeEach(() => {
    performanceMonitor.clear();
    jest.clearAllMocks();
  });

  describe('trackPageView', () => {
    it('should track page view timing', () => {
      mockPerformance.now.mockReturnValue(1000);

      trackPageView('home');

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        name: 'page_view_home',
        metadata: {
          type: 'page_view',
          page: 'home',
        },
      });
    });
  });

  describe('trackUserInteraction', () => {
    it('should track user interactions', (done) => {
      mockPerformance.now
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1050);

      trackUserInteraction('click', 'button');

      // Wait for setTimeout to complete
      setTimeout(() => {
        const metrics = performanceMonitor.getMetrics();
        expect(metrics).toHaveLength(1);
        expect(metrics[0]).toMatchObject({
          name: 'interaction_click_button',
          metadata: {
            type: 'user_interaction',
            action: 'click',
            element: 'button',
            success: true,
          },
        });
        done();
      }, 100);
    });
  });

  describe('trackFormSubmission', () => {
    it('should track successful form submissions', async () => {
      mockPerformance.now
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1300);

      const mockSubmitFunction = jest.fn(() => Promise.resolve('success'));

      const result = await trackFormSubmission('login', mockSubmitFunction);

      expect(result).toBe('success');
      expect(mockSubmitFunction).toHaveBeenCalled();

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        name: 'form_submit_login',
        duration: 300,
        metadata: {
          type: 'form_submission',
          form: 'login',
          success: true,
        },
      });
    });

    it('should track failed form submissions', async () => {
      mockPerformance.now
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1200);

      const mockSubmitFunction = jest.fn(() => Promise.reject(new Error('Submission failed')));

      await expect(trackFormSubmission('contact', mockSubmitFunction))
        .rejects.toThrow('Submission failed');

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        name: 'form_submit_contact',
        duration: 200,
        metadata: {
          type: 'form_submission',
          form: 'contact',
          success: false,
          error: 'Submission failed',
        },
      });
    });
  });
});