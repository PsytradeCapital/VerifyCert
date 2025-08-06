import { useCallback } from 'react';
import toast from 'react-hot-toast';

interface FeedbackOptions {
  showConfetti?: boolean;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  shake?: boolean;
  duration?: number;
}

export const useFeedbackAnimations = () => {
  const showSuccess = useCallback((message: string, options: FeedbackOptions = {}) => {
    const { showConfetti = false, position = 'top-center', duration = 4000 } = options;
    
    toast.success(message, {
      duration,
      position: position as any,
    });

    // Trigger confetti animation if requested
    if (showConfetti && typeof window !== 'undefined') {
      // Simple confetti effect using CSS animations
      const confettiElement = document.createElement('div');
      confettiElement.innerHTML = '🎉';
      confettiElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        font-size: 2rem;
        animation: confetti 2s ease-out forwards;
        pointer-events: none;
        z-index: 9999;
      `;
      
      // Add confetti animation keyframes if not already added
      if (!document.querySelector('#confetti-styles')) {
        const style = document.createElement('style');
        style.id = 'confetti-styles';
        style.textContent = `
          @keyframes confetti {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(confettiElement);
      setTimeout(() => {
        document.body.removeChild(confettiElement);
      }, 2000);
    }
  }, []);

  const showError = useCallback((message: string, options: FeedbackOptions = {}) => {
    const { shake = false, position = 'top-center', duration = 4000 } = options;
    
    toast.error(message, {
      duration,
      position: position as any,
    });

    // Trigger shake animation if requested
    if (shake && typeof window !== 'undefined') {
      document.body.style.animation = 'shake 0.5s ease-in-out';
      setTimeout(() => {
        document.body.style.animation = '';
      }, 500);
      
      // Add shake animation keyframes if not already added
      if (!document.querySelector('#shake-styles')) {
        const style = document.createElement('style');
        style.id = 'shake-styles';
        style.textContent = `
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  const showWarning = useCallback((message: string, options: FeedbackOptions = {}) => {
    const { position = 'top-center', duration = 4000 } = options;
    
    toast(message, {
      duration,
      position: position as any,
      icon: '⚠️',
    });
  }, []);

  const showInfo = useCallback((message: string, options: FeedbackOptions = {}) => {
    const { position = 'top-center', duration = 4000 } = options;
    
    toast(message, {
      duration,
      position: position as any,
      icon: 'ℹ️',
    });
  }, []);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};