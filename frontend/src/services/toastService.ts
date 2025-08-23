import toast, { Toast, ToastOptions } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from 'lucide-react';
import React from 'react';

export interface CustomToastOptions extends ToastOptions {
}
}
}
  action?: {
    label: string;
    onClick: () => void;
  };

class ToastService {
  private static instance: ToastService;

  private constructor() {}

  public static getInstance(): ToastService {
    if (!ToastService.instance) {
      ToastService.instance = new ToastService();
    return ToastService.instance;

  // Success toast
  public success(message: string, options?: CustomToastOptions): string {
    return toast.success(message, {
      duration: 4000,
      icon: '✅',
      style: {
        background: '#10b981',
        color: '#fff',
      },
      ...options,
    });

  // Error toast
  public error(message: string, options?: CustomToastOptions): string {
    return toast.error(message, {
      duration: 6000,
      icon: '❌',
      style: {
        background: '#ef4444',
        color: '#fff',
      },
      ...options,
    });

  // Warning toast
  public warning(message: string, options?: CustomToastOptions): string {
    return toast(message, {
      duration: 5000,
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: '#fff',
      },
      ...options,
    });

  // Info toast
  public info(message: string, options?: CustomToastOptions): string {
    return toast(message, {
      duration: 4000,
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: '#fff',
      },
      ...options,
    });

  // Loading toast
  public loading(message: string, options?: ToastOptions): string {
    return toast.loading(message, {
      style: {
        background: '#6b7280',
        color: '#fff',
      },
      ...options,
    });

  // Promise toast - handles async operations
  public promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: ToastOptions
  ): Promise<T> {
    return toast.promise(promise, messages, {
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
      ...options,
    });

  // Blockchain-specific toasts
  public blockchainSuccess(message: string, txHash?: string): string {
    const fullMessage = txHash 
      ? `${message}\nTx: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`
      : message;

    return this.success(fullMessage, {
      duration: 6000,
      action: txHash ? {
        label: 'View Transaction',
        onClick: () => {
          window.open(`https://mumbai.polygonscan.com/tx/${txHash}`, '_blank');
      } : undefined,
    });

  public blockchainError(message: string, error?: any): string {
    let errorMessage = message;
    
    if (error) {
      if (error.code === 4001) {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      } else if (error.message?.includes('gas')) {
        errorMessage = 'Transaction failed due to gas issues';
      } else if (error.message?.includes('revert')) {
        errorMessage = `Transaction reverted: ${error.reason || 'Unknown reason'}`;

    return this.error(errorMessage, {
      duration: 8000,
    });

  public walletConnection(isConnecting: boolean): string {
    if (isConnecting) {
      return this.loading('Connecting to wallet...');
    } else {
      return this.success('Wallet connected successfully!');

  public certificateOperation(
    operation: 'minting' | 'verifying' | 'loading',
    promise?: Promise<any>
  ): string | Promise<any> {
    const messages = {
      minting: {
        loading: 'Minting certificate...',
        success: 'Certificate minted successfully!',
        error: 'Failed to mint certificate',
      },
      verifying: {
        loading: 'Verifying certificate...',
        success: 'Certificate verified successfully!',
        error: 'Failed to verify certificate',
      },
      loading: {
        loading: 'Loading certificate...',
        success: 'Certificate loaded successfully!',
        error: 'Failed to load certificate',
      },
    };

    if (promise) {
      return this.promise(promise, messages[operation]);
    } else {
      return this.loading(messages[operation].loading);

  // Network-specific toasts
  public networkError(message: string = 'Network connection error'): string {
    return this.error(message, {
      duration: 5000,
      action: {
        label: 'Retry',
        onClick: () => {
          window.location.reload();
    });

  public wrongNetwork(): string {
    return this.warning('Please switch to Polygon Mumbai network', {
      duration: 8000,
      action: {
        label: 'Switch Network',
        onClick: async () => {
          try {
            await (window as any).ethereum?.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x13881' }], // Mumbai testnet
            });
          } catch (error) {
            console.error('Failed to switch network:', error);
    });

  // Form validation toasts
  public validationError(field: string, message: string): string {
    return this.error(`${field}: ${message}`, {
      duration: 4000,
    });

  // Dismiss specific toast
  public dismiss(toastId?: string): void {
    toast.dismiss(toastId);

  // Dismiss all toasts
  public dismissAll(): void {
    toast.dismiss();

  // Custom toast with action button
  public custom(
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info',
    action?: { label: string; onClick: () => void
  ): string {
    const config = {
      success: { icon: '✅', bg: '#10b981' },
      error: { icon: '❌', bg: '#ef4444' },
      warning: { icon: '⚠️', bg: '#f59e0b' },
      info: { icon: 'ℹ️', bg: '#3b82f6' },
    };

    return toast(message, {
      icon: config[type].icon,
      style: {
        background: config[type].bg,
        color: '#fff',
      },
      duration: 5000,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
    } as any);

// Export singleton instance
export const toastService = ToastService.getInstance();

// Export convenience functions
export const showSuccess = (message: string, options?: CustomToastOptions) => ;;
  toastService.success(message, options);

export const showError = (message: string, options?: CustomToastOptions) => ;;
  toastService.error(message, options);

export const showWarning = (message: string, options?: CustomToastOptions) => ;;
  toastService.warning(message, options);

export const showInfo = (message: string, options?: CustomToastOptions) => ;;
  toastService.info(message, options);

export const showLoading = (message: string, options?: ToastOptions) => ;;
  toastService.loading(message, options);

export const showBlockchainSuccess = (message: string, txHash?: string) => ;;
  toastService.blockchainSuccess(message, txHash);

export const showBlockchainError = (message: string, error?: any) => ;;
  toastService.blockchainError(message, error);

export const showNetworkError = (message?: string) => ;;
  toastService.networkError(message);

export const showWrongNetwork = () => ;;
  toastService.wrongNetwork();

export const dismissToast = (toastId?: string) => ;;
  toastService.dismiss(toastId);

export const dismissAllToasts = () => ;;
  toastService.dismissAll();
}
}}}}}}}}}}}}}}}}}}}}}}}}}}}