import { errorLogger, logError, logBlockchainError, logNetworkError, logValidationError } from '../errorLogger';

// Mock fetch
global.fetch = jest.fn();

// Mock console methods
const originalConsole = {
  error: console.error,
  log: console.log,
  group: console.group,
  groupEnd: console.groupEnd,
};

beforeAll(() => {
  console.error = jest.fn();
  console.log = jest.fn();
  console.group = jest.fn();
  console.groupEnd = jest.fn();
});

afterAll(() => {
  console.error = originalConsole.error;
  console.log = originalConsole.log;
  console.group = originalConsole.group;
  console.groupEnd = originalConsole.groupEnd;
});

// Mock navigator
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

Object.defineProperty(navigator, 'userAgent', {
  writable: true,
  value: 'Mozilla/5.0 (Test Browser)',
});

// Mock window.location
delete (window as any).location;
window.location = {
  href: 'http://localhost:3000/test',
} as any;

describe('ErrorLogger', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
    // Set to development mode for console logging
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('logError', () => {
    it('logs error with correct structure', () => {
      const testError = new Error('Test error');
      
      logError(testError);

      expect(console.group).toHaveBeenCalledWith('🚨 Error Report [MEDIUM]');
      expect(console.error).toHaveBeenCalledWith('Error:', testError);
    });

    it('includes context information in error report', () => {
      const testError = new Error('Test error');
      const context = { userId: '123', action: 'test' };
      
      errorLogger.logError(testError, undefined, 'javascript', 'high', context);

      expect(console.log).toHaveBeenCalledWith(
        'Error Report:',
        expect.objectContaining({
          message: 'Test error',
          timestamp: expect.any(String),
          userAgent: 'Mozilla/5.0 (Test Browser)',
          url: 'http://localhost:3000/test',
          errorType: 'javascript',
          severity: 'high',
          context: expect.objectContaining(context),
        })
      );
    });

    it('sends error report when online', async () => {
      process.env.REACT_APP_ERROR_REPORTING_URL = 'http://test-api.com/errors';
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

      const testError = new Error('Test error');
      errorLogger.logError(testError);

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(fetch).toHaveBeenCalledWith(
        'http://test-api.com/errors',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Test error'),
        })
      );

      delete process.env.REACT_APP_ERROR_REPORTING_URL;
    });
  });

  describe('logBlockchainError', () => {
    it('logs blockchain error with operation context', () => {
      const testError = new Error('Transaction failed');
      
      logBlockchainError(testError, 'mintCertificate', '0x123', '0xabc', '0xdef');

      expect(console.group).toHaveBeenCalledWith('🚨 Error Report [HIGH]');
      expect(console.log).toHaveBeenCalledWith(
        'Error Report:',
        expect.objectContaining({
          errorType: 'blockchain',
          severity: 'high',
          context: expect.objectContaining({
            operation: 'mintCertificate',
            contractAddress: '0x123',
            transactionHash: '0xabc',
            walletAddress: '0xdef',
          }),
        })
      );
    });
  });

  describe('logNetworkError', () => {
    it('logs network error with endpoint context', () => {
      const testError = new Error('Network timeout');
      
      logNetworkError(testError, '/api/certificates', 'POST', 500);

      expect(console.group).toHaveBeenCalledWith('🚨 Error Report [MEDIUM]');
      expect(console.log).toHaveBeenCalledWith(
        'Error Report:',
        expect.objectContaining({
          errorType: 'network',
          severity: 'medium',
          context: expect.objectContaining({
            endpoint: '/api/certificates',
            method: 'POST',
            statusCode: 500,
            networkStatus: 'online',
          }),
        })
      );
    });
  });

  describe('logValidationError', () => {
    it('logs validation error with sanitized form data', () => {
      const testError = new Error('Invalid email');
      const formData = {
        email: 'invalid-email',
        password: 'secret123',
        name: 'John Doe',
      };
      
      logValidationError(testError, formData, 'email');

      expect(console.group).toHaveBeenCalledWith('🚨 Error Report [LOW]');
      expect(console.log).toHaveBeenCalledWith(
        'Error Report:',
        expect.objectContaining({
          errorType: 'validation',
          severity: 'low',
          context: expect.objectContaining({
            formData: {
              email: 'invalid-email',
              password: '[REDACTED]',
              name: 'John Doe',
            },
            fieldName: 'email',
          }),
        })
      );
    });
  });

  describe('getErrorStats', () => {
    it('returns correct error statistics', () => {
      // Clear error queue by accessing private property (for testing only)
      (errorLogger as any).errorQueue = [];
      
      // Manually add errors to queue to test stats functionality
      const mockErrors = [
        { errorType: 'javascript', severity: 'medium' },
        { errorType: 'blockchain', severity: 'high' },
        { errorType: 'validation', severity: 'low' },
      ];
      
      (errorLogger as any).errorQueue = mockErrors;

      const stats = errorLogger.getErrorStats();
      
      expect(stats.total).toBe(3);
      expect(stats.byType.javascript).toBe(1);
      expect(stats.byType.blockchain).toBe(1);
      expect(stats.byType.validation).toBe(1);
      expect(stats.bySeverity.medium).toBe(1);
      expect(stats.bySeverity.high).toBe(1);
      expect(stats.bySeverity.low).toBe(1);
    });
  });

  describe('offline handling', () => {
    it('queues errors when offline', () => {
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        value: false,
      });

      const testError = new Error('Offline error');
      errorLogger.logError(testError);

      // Should not call fetch when offline
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('global error listeners', () => {
    it('listens for unhandled promise rejections', () => {
      const unhandledRejectionEvent = new Event('unhandledrejection') as any;
      unhandledRejectionEvent.reason = 'Promise rejection reason';

      window.dispatchEvent(unhandledRejectionEvent);

      expect(console.group).toHaveBeenCalledWith('🚨 Error Report [HIGH]');
    });

    it('listens for global JavaScript errors', () => {
      const errorEvent = new ErrorEvent('error', {
        message: 'Global error',
        filename: 'test.js',
        lineno: 10,
        colno: 5,
      });

      window.dispatchEvent(errorEvent);

      expect(console.group).toHaveBeenCalledWith('🚨 Error Report [MEDIUM]');
    });
  });
});