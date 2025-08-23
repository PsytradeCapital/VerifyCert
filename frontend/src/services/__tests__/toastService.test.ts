import { toastService, showSuccess, showError, showBlockchainSuccess } from '../toastService';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: jest.fn(),
  success: jest.fn(),
  error: jest.fn(),
  loading: jest.fn(),
  promise: jest.fn(),
  dismiss: jest.fn(),
}));

import toast from 'react-hot-toast';

// Mock window.open
global.open = jest.fn();

describe('ToastService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('success', () => {
    it('calls toast.success with correct parameters', () => {
      (toast.success as jest.Mock).mockReturnValue('toast-id');
      
      const result = toastService.success('Success message');
      
      expect(toast.success).toHaveBeenCalledWith('Success message', {
        duration: 4000,
        icon: '✅',
        style: {
          background: '#10b981',
          color: '#fff',
        },
      });
      expect(result).toBe('toast-id');
    });

    it('merges custom options', () => {
      toastService.success('Success message', { duration: 2000 });
      
      expect(toast.success).toHaveBeenCalledWith('Success message', {
        duration: 2000,
        icon: '✅',
        style: {
          background: '#10b981',
          color: '#fff',
        },
      });
    });
  });

  describe('error', () => {
    it('calls toast.error with correct parameters', () => {
      (toast.error as jest.Mock).mockReturnValue('error-toast-id');
      
      const result = toastService.error('Error message');
      
      expect(toast.error).toHaveBeenCalledWith('Error message', {
        duration: 6000,
        icon: '❌',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
      expect(result).toBe('error-toast-id');
    });
  });

  describe('warning', () => {
    it('calls toast with warning configuration', () => {
      (toast as jest.Mock).mockReturnValue('warning-toast-id');
      
      const result = toastService.warning('Warning message');
      
      expect(toast).toHaveBeenCalledWith('Warning message', {
        duration: 5000,
        icon: '⚠️',
        style: {
          background: '#f59e0b',
          color: '#fff',
        },
      });
      expect(result).toBe('warning-toast-id');
    });
  });

  describe('info', () => {
    it('calls toast with info configuration', () => {
      (toast as jest.Mock).mockReturnValue('info-toast-id');
      
      const result = toastService.info('Info message');
      
      expect(toast).toHaveBeenCalledWith('Info message', {
        duration: 4000,
        icon: 'ℹ️',
        style: {
          background: '#3b82f6',
          color: '#fff',
        },
      });
      expect(result).toBe('info-toast-id');
    });
  });

  describe('loading', () => {
    it('calls toast.loading with correct parameters', () => {
      (toast.loading as jest.Mock).mockReturnValue('loading-toast-id');
      
      const result = toastService.loading('Loading message');
      
      expect(toast.loading).toHaveBeenCalledWith('Loading message', {
        style: {
          background: '#6b7280',
          color: '#fff',
        },
      });
      expect(result).toBe('loading-toast-id');
    });
  });

  describe('promise', () => {
    it('calls toast.promise with correct parameters', async () => {
      const mockPromise = Promise.resolve('success');
      const messages = {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Error!',
      };
      
      (toast.promise as jest.Mock).mockReturnValue(mockPromise);
      
      const result = toastService.promise(mockPromise, messages);
      
      expect(toast.promise).toHaveBeenCalledWith(mockPromise, messages, {
        loading: {
          style: {
            background: '#6b7280',
            color: '#fff',
          },
        },
        success: {
          duration: 4000,
          style: {
            background: '#10b981',
            color: '#fff',
          },
        },
        error: {
          duration: 6000,
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        },
      });
      expect(result).toBe(mockPromise);
    });
  });

  describe('blockchainSuccess', () => {
    it('shows success toast without transaction hash', () => {
      (toast.success as jest.Mock).mockReturnValue('blockchain-success-id');
      
      const result = toastService.blockchainSuccess('Transaction successful');
      
      expect(toast.success).toHaveBeenCalledWith('Transaction successful', {
        duration: 6000,
        icon: '✅',
        style: {
          background: '#10b981',
          color: '#fff',
        },
        action: undefined,
      });
      expect(result).toBe('blockchain-success-id');
    });

    it('shows success toast with transaction hash and action', () => {
      const txHash = '0x1234567890abcdef1234567890abcdef12345678';
      (toast.success as jest.Mock).mockReturnValue('blockchain-success-id');
      
      toastService.blockchainSuccess('Transaction successful', txHash);
      
      expect(toast.success).toHaveBeenCalledWith(
        'Transaction successful\nTx: 0x12345678...ef12345678',
        expect.objectContaining({
          duration: 6000,
          action: expect.objectContaining({
            label: 'View Transaction',
            onClick: expect.any(Function),
          }),
        })
      );
    });

    it('opens transaction link when action is clicked', () => {
      const txHash = '0x1234567890abcdef1234567890abcdef12345678';
      (toast.success as jest.Mock).mockImplementation((message, options) => {
        // Simulate clicking the action
        if (options?.action?.onClick) {
          options.action.onClick();
        return 'toast-id';
      });
      
      toastService.blockchainSuccess('Transaction successful', txHash);
      
      expect(global.open).toHaveBeenCalledWith(
        https://mumbai.polygonscan.com/tx/${txHash},
        '_blank'
      );
    });
  });

  describe('blockchainError', () => {
    it('shows generic error message', () => {
      (toast.error as jest.Mock).mockReturnValue('blockchain-error-id');
      
      toastService.blockchainError('Transaction failed');
      
      expect(toast.error).toHaveBeenCalledWith('Transaction failed', {
        duration: 8000,
        icon: '❌',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
    });

    it('handles user rejection error', () => {
      const error = { code: 4001 };
      
      toastService.blockchainError('Transaction failed', error);
      
      expect(toast.error).toHaveBeenCalledWith('Transaction was rejected by user', expect.any(Object));
    });

    it('handles insufficient funds error', () => {
      const error = { message: 'insufficient funds for gas' };
      
      toastService.blockchainError('Transaction failed', error);
      
      expect(toast.error).toHaveBeenCalledWith('Insufficient funds for transaction', expect.any(Object));
    });

    it('handles gas error', () => {
      const error = { message: 'out of gas' };
      
      toastService.blockchainError('Transaction failed', error);
      
      expect(toast.error).toHaveBeenCalledWith('Transaction failed due to gas issues', expect.any(Object));
    });

    it('handles revert error', () => {
      const error = { message: 'execution reverted', reason: 'Unauthorized' };
      
      toastService.blockchainError('Transaction failed', error);
      
      expect(toast.error).toHaveBeenCalledWith('Transaction reverted: Unauthorized', expect.any(Object));
    });
  });

  describe('wrongNetwork', () => {
    it('shows warning toast with network switch action', () => {
      (toast as jest.Mock).mockImplementation((message, options) => {
        expect(options.action).toBeDefined();
        expect(options.action.label).toBe('Switch Network');
        return 'network-warning-id';
      });
      
      toastService.wrongNetwork();
      
      expect(toast).toHaveBeenCalledWith(
        'Please switch to Polygon Mumbai network',
        expect.objectContaining({
          duration: 8000,
          action: expect.objectContaining({
            label: 'Switch Network',
            onClick: expect.any(Function),
          }),
        })
      );
    });
  });

  describe('dismiss', () => {
    it('calls toast.dismiss with toast ID', () => {
      toastService.dismiss('toast-id');
      
      expect(toast.dismiss).toHaveBeenCalledWith('toast-id');
    });

    it('calls toast.dismiss without ID', () => {
      toastService.dismiss();
      
      expect(toast.dismiss).toHaveBeenCalledWith(undefined);
    });
  });

  describe('dismissAll', () => {
    it('calls toast.dismiss without parameters', () => {
      toastService.dismissAll();
      
      expect(toast.dismiss).toHaveBeenCalledWith();
    });
  });

  describe('convenience functions', () => {
    it('showSuccess calls toastService.success', () => {
      const spy = jest.spyOn(toastService, 'success');
      
      showSuccess('Success message');
      
      expect(spy).toHaveBeenCalledWith('Success message', undefined);
    });

    it('showError calls toastService.error', () => {
      const spy = jest.spyOn(toastService, 'error');
      
      showError('Error message');
      
      expect(spy).toHaveBeenCalledWith('Error message', undefined);
    });

    it('showBlockchainSuccess calls toastService.blockchainSuccess', () => {
      const spy = jest.spyOn(toastService, 'blockchainSuccess');
      
      showBlockchainSuccess('Success message', '0x123');
      
      expect(spy).toHaveBeenCalledWith('Success message', '0x123');
    });
  });
});
}