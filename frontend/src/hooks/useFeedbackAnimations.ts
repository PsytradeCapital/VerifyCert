import { useCallback } from 'react';
import { useFeedback } from '../components/ui/Feedback/FeedbackManager';
import { toastService } from '../services/toastService';

export interface FeedbackOptions {
  useAnimation?: boolean;
  useToast?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  duration?: number;
  showIcon?: boolean;
  showCloseButton?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface SuccessOptions extends FeedbackOptions {
  showConfetti?: boolean;
  txHash?: string;
}

export interface ErrorOptions extends FeedbackOptions {
  shake?: boolean;
  error?: any;
}

export interface LoadingOptions extends FeedbackOptions {
  showProgress?: boolean;
  progress?: number;
}

/**
 * Enhanced feedback hook that provides both animated feedback and toast notifications
 * Can be used as a drop-in replacement for the existing toast service
 */
export const useFeedbackAnimations = () => {
  const feedback = useFeedback();

  const showSuccess = useCallback((
    message: string, 
    options: SuccessOptions = {}
  ): string => {
    const {
      useAnimation = true,
      useToast = false,
      showConfetti = false,
      txHash,
      ...feedbackOptions
    } = options;

    let id = '';

    if (useAnimation) {
      if (showConfetti) {
        id = feedback.showSuccessWithConfetti(message, feedbackOptions);
      } else {
        id = feedback.showSuccess(message, feedbackOptions);
      }
    }

    if (useToast) {
      if (txHash) {
        toastService.blockchainSuccess(message, txHash);
      } else {
        toastService.success(message);
      }
    }

    return id;
  }, [feedback]);

  const showError = useCallback((
    message: string, 
    options: ErrorOptions = {}
  ): string => {
    const {
      useAnimation = true,
      useToast = false,
      shake = false,
      error,
      ...feedbackOptions
    } = options;

    let id = '';

    if (useAnimation) {
      if (shake) {
        id = feedback.showErrorWithShake(message, feedbackOptions);
      } else {
        id = feedback.showError(message, feedbackOptions);
      }
    }

    if (useToast) {
      if (error) {
        toastService.blockchainError(message, error);
      } else {
        toastService.error(message);
      }
    }

    return id;
  }, [feedback]);

  const showWarning = useCallback((
    message: string, 
    options: FeedbackOptions = {}
  ): string => {
    const {
      useAnimation = true,
      useToast = false,
      ...feedbackOptions
    } = options;

    let id = '';

    if (useAnimation) {
      id = feedback.showWarning(message, feedbackOptions);
    }

    if (useToast) {
      toastService.warning(message);
    }

    return id;
  }, [feedback]);

  const showInfo = useCallback((
    message: string, 
    options: FeedbackOptions = {}
  ): string => {
    const {
      useAnimation = true,
      useToast = false,
      ...feedbackOptions
    } = options;

    let id = '';

    if (useAnimation) {
      id = feedback.showInfo(message, feedbackOptions);
    }

    if (useToast) {
      toastService.info(message);
    }

    return id;
  }, [feedback]);

  const showLoading = useCallback((
    message: string, 
    options: LoadingOptions = {}
  ): string => {
    const {
      useAnimation = true,
      useToast = false,
      showProgress = false,
      progress = 0,
      ...feedbackOptions
    } = options;

    let id = '';

    if (useAnimation) {
      if (showProgress) {
        id = feedback.showLoadingWithProgress(message, progress, feedbackOptions);
      } else {
        id = feedback.showLoading(message, feedbackOptions);
      }
    }

    if (useToast) {
      toastService.loading(message);
    }

    return id;
  }, [feedback]);

  // Blockchain-specific feedback methods
  const showBlockchainSuccess = useCallback((
    message: string,
    txHash?: string,
    options: SuccessOptions = {}
  ): string => {
    const action = txHash ? {
      label: 'View Transaction',
      onClick: () => {
        window.open(`https://mumbai.polygonscan.com/tx/${txHash}`, '_blank');
      }
    } : undefined;

    return showSuccess(message, {
      ...options,
      action,
      duration: 6000,
      showConfetti: true,
    });
  }, [showSuccess]);

  const showBlockchainError = useCallback((
    message: string,
    error?: any,
    options: ErrorOptions = {}
  ): string => {
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
      }
    }

    return showError(errorMessage, {
      ...options,
      shake: true,
      duration: 8000,
    });
  }, [showError]);

  const showWalletConnection = useCallback((isConnecting: boolean): string => {
    if (isConnecting) {
      return showLoading('Connecting to wallet...', {
        showProgress: false,
      });
    } else {
      return showSuccess('Wallet connected successfully!', {
        showConfetti: true,
        position: 'center',
      });
    }
  }, [showLoading, showSuccess]);

  const showNetworkError = useCallback((
    message: string = 'Network connection error'
  ): string => {
    return showError(message, {
      duration: 5000,
      action: {
        label: 'Retry',
        onClick: () => {
          window.location.reload();
        }
      }
    });
  }, [showError]);

  const showWrongNetwork = useCallback((): string => {
    return showWarning('Please switch to Polygon Mumbai network', {
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
          }
        }
      }
    });
  }, [showWarning]);

  // Certificate-specific operations
  const showCertificateOperation = useCallback((
    operation: 'minting' | 'verifying' | 'loading',
    promise?: Promise<any>
  ): string | Promise<any> => {
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
      const loadingId = showLoading(messages[operation].loading, {
        showProgress: false,
      });

      return promise
        .then((result) => {
          feedback.dismissFeedback(loadingId);
          showSuccess(messages[operation].success, {
            showConfetti: operation === 'minting',
          });
          return result;
        })
        .catch((error) => {
          feedback.dismissFeedback(loadingId);
          showError(messages[operation].error, {
            shake: true,
            error,
          });
          throw error;
        });
    } else {
      return showLoading(messages[operation].loading);
    }
  }, [showLoading, showSuccess, showError, feedback]);

  const updateProgress = useCallback((id: string, progress: number) => {
    feedback.updateProgress(id, progress);
  }, [feedback]);

  const dismiss = useCallback((id: string) => {
    feedback.dismissFeedback(id);
  }, [feedback]);

  const dismissAll = useCallback(() => {
    feedback.dismissAll();
  }, [feedback]);

  const renderFeedback = useCallback(() => {
    return feedback.renderFeedback();
  }, [feedback]);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showBlockchainSuccess,
    showBlockchainError,
    showWalletConnection,
    showNetworkError,
    showWrongNetwork,
    showCertificateOperation,
    updateProgress,
    dismiss,
    dismissAll,
    renderFeedback,
  };
};

export default useFeedbackAnimations;