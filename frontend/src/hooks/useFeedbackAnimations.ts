import { useCallback } from 'react';

interface FeedbackOptions {
  duration?: number;
  position?: 'top' | 'bottom' | 'center';
  type?: 'success' | 'error' | 'warning' | 'info';
}

export const useFeedbackAnimations = () => {
  const showSuccess = useCallback((message: string, options: FeedbackOptions = {}) => {
    const { duration = 3000, position = 'top' } = options;
    
    // Create success notification element
    const successElement = document.createElement('div');
    successElement.textContent = `✅ ${message}`;
    successElement.style.cssText = `
      position: fixed;
      ${position}: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
      pointer-events: none;
    `;
    
    // Add animation keyframes if not already added
    if (!document.querySelector('#feedback-styles')) {
      const style = document.createElement('style');
      style.id = 'feedback-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(successElement);
    
    // Remove after duration
    setTimeout(() => {
      successElement.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (document.body.contains(successElement)) {
          document.body.removeChild(successElement);
        }
      }, 300);
    }, duration);
  }, []);

  const showError = useCallback((message: string, options: FeedbackOptions = {}) => {
    const { duration = 4000, position = 'top' } = options;
    
    // Create error notification element
    const errorElement = document.createElement('div');
    errorElement.textContent = `❌ ${message}`;
    errorElement.style.cssText = `
      position: fixed;
      ${position}: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
      pointer-events: none;
    `;
    
    document.body.appendChild(errorElement);
    
    // Remove after duration
    setTimeout(() => {
      errorElement.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (document.body.contains(errorElement)) {
          document.body.removeChild(errorElement);
        }
      }, 300);
    }, duration);
  }, []);

  const showWarning = useCallback((message: string, options: FeedbackOptions = {}) => {
    const { duration = 3500, position = 'top' } = options;
    
    // Create warning notification element
    const warningElement = document.createElement('div');
    warningElement.textContent = `⚠️ ${message}`;
    warningElement.style.cssText = `
      position: fixed;
      ${position}: 20px;
      right: 20px;
      background: #f59e0b;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
      pointer-events: none;
    `;
    
    document.body.appendChild(warningElement);
    
    // Remove after duration
    setTimeout(() => {
      warningElement.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (document.body.contains(warningElement)) {
          document.body.removeChild(warningElement);
        }
      }, 300);
    }, duration);
  }, []);

  const showConfetti = useCallback(() => {
    // Create confetti element
    const confettiElement = document.createElement('div');
    confettiElement.textContent = '🎉';
    confettiElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      font-size: 2rem;
      animation: confetti 2s ease-out forwards;
      pointer-events: none;
      z-index: 9999;
    `;
    
    document.body.appendChild(confettiElement);
    setTimeout(() => {
      if (document.body.contains(confettiElement)) {
        document.body.removeChild(confettiElement);
      }
    }, 2000);
  }, []);

  return {
    showSuccess,
    showError,
    showWarning,
    showConfetti
  };
};

export default useFeedbackAnimations;