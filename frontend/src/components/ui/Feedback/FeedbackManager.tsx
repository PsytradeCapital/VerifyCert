import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FeedbackAnimation } from './FeedbackAnimations';

export interface FeedbackItem {
id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  message: string;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  showIcon?: boolean;
  showCloseButton?: boolean;
  action?: {
    label: string;
    onClick: () => void;
}};
  // Special animation options
  shake?: boolean;
  confetti?: boolean;
  progress?: number;

interface FeedbackContextType {
feedbacks: FeedbackItem[];
  showFeedback: (feedback: Omit<FeedbackItem, 'id'>) => string;
  showSuccess: (message: string, options?: Partial<FeedbackItem>) => string;
  showError: (message: string, options?: Partial<FeedbackItem>) => string;
  showWarning: (message: string, options?: Partial<FeedbackItem>) => string;
  showInfo: (message: string, options?: Partial<FeedbackItem>) => string;
  showLoading: (message: string, options?: Partial<FeedbackItem>) => string;
  showSuccessWithConfetti: (message: string, options?: Partial<FeedbackItem>) => string;
  showErrorWithShake: (message: string, options?: Partial<FeedbackItem>) => string;
  showLoadingWithProgress: (message: string, progress: number, options?: Partial<FeedbackItem>) => string;
  updateProgress: (id: string, progress: number) => void;
  dismissFeedback: (id: string) => void;
  dismissAll: () => void;

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  return context;
}};

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const dismissFeedback = useCallback((id: string) => {
    setFeedbacks(prev => prev.filter(feedback => feedback.id !== id));
  }, []);

  const showFeedback = useCallback((feedback: Omit<FeedbackItem, 'id'>): string => {
    const id = generateId();
    const newFeedback: FeedbackItem = {
      id,
      duration: 4000,
      position: 'top-right',
      showIcon: true,
      showCloseButton: true,
      ...feedback,
    };

    setFeedbacks(prev => [...prev, newFeedback]);

    // Auto-dismiss if duration is set
    if (newFeedback.duration && newFeedback.duration > 0) {
      setTimeout(() => {
        dismissFeedback(id);
      }, newFeedback.duration);

    return id;
  }, [dismissFeedback]);

  const showSuccess = useCallback((message: string, options?: Partial<FeedbackItem>): string => {
    return showFeedback({
      type: 'success',
      message,
      duration: 4000,
      ...options,
    });
  }, [showFeedback]);

  const showError = useCallback((message: string, options?: Partial<FeedbackItem>): string => {
    return showFeedback({
      type: 'error',
      message,
      duration: 6000,
      ...options,
    });
  }, [showFeedback]);

  const showWarning = useCallback((message: string, options?: Partial<FeedbackItem>): string => {
    return showFeedback({
      type: 'warning',
      message,
      duration: 5000,
      ...options,
    });
  }, [showFeedback]);

  const showInfo = useCallback((message: string, options?: Partial<FeedbackItem>): string => {
    return showFeedback({
      type: 'info',
      message,
      duration: 4000,
      ...options,
    });
  }, [showFeedback]);

  const showLoading = useCallback((message: string, options?: Partial<FeedbackItem>): string => {
    return showFeedback({
      type: 'loading',
      message,
      duration: 0, // Loading doesn't auto-dismiss
      showCloseButton: false,
      ...options,
    });
  }, [showFeedback]);

  const showSuccessWithConfetti = useCallback((message: string, options?: Partial<FeedbackItem>): string => {
    return showFeedback({
      type: 'success',
      message,
      confetti: true,
      position: 'center',
      duration: 3000,
      ...options,
    });
  }, [showFeedback]);

  const showErrorWithShake = useCallback((message: string, options?: Partial<FeedbackItem>): string => {
    return showFeedback({
      type: 'error',
      message,
      shake: true,
      duration: 6000,
      ...options,
    });
  }, [showFeedback]);

  const showLoadingWithProgress = useCallback((message: string, progress: number, options?: Partial<FeedbackItem>): string => {
    return showFeedback({
      type: 'loading',
      message,
      progress,
      duration: 0,
      showCloseButton: false,
      ...options,
    });
  }, [showFeedback]);

  const updateProgress = useCallback((id: string, progress: number) => {
    setFeedbacks(prev => 
      prev.map(feedback => 
        feedback.id === id 
          ? { ...feedback, progress
          : feedback
      )
    );
  }, []);

  const dismissAll = useCallback(() => {
    setFeedbacks([]);
  }, []);

  const contextValue: FeedbackContextType = {
    feedbacks,
    showFeedback,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showSuccessWithConfetti,
    showErrorWithShake,
    showLoadingWithProgress,
    updateProgress,
    dismissFeedback,
    dismissAll,
  };

  return (
    <FeedbackContext.Provider value={contextValue}>
      {children}
      <FeedbackRenderer feedbacks={feedbacks} onDismiss={dismissFeedback} />
    </FeedbackContext.Provider>
  );
};

const FeedbackRenderer: React.FC<{
  feedbacks: FeedbackItem[];
  onDismiss: (id: string) => void;
}> = ({ feedbacks, onDismiss }) => {
  // Group feedbacks by position to avoid overlapping
  const groupedFeedbacks = feedbacks.reduce((acc, feedback) => {
    const position = feedback.position || 'top-right';
    if (!acc[position]) {
      acc[position] = [];
    acc[position].push(feedback);
    return acc;
  }, {} as Record<string, FeedbackItem[]>);

  return (
    <>
      {Object.entries(groupedFeedbacks).map(([position, positionFeedbacks]) => (
        <div key={position} className="fixed z-50">
          <AnimatePresence mode="popLayout">
            {positionFeedbacks.map((feedback, index) => {
              const handleClose = () => onDismiss(feedback.id);

              // Special animations for specific types
              if (feedback.confetti && feedback.type === 'success') {
                return (
                  <SuccessAnimation
                    key={feedback.id}
                    message={feedback.message}
                    isVisible={true}
                    onClose={handleClose}
                    showConfetti={true}
                  />
                );

              if (feedback.shake && feedback.type === 'error') {
                return (
                  <ErrorAnimation
                    key={feedback.id}
                    message={feedback.message}
                    isVisible={true}
                    onClose={handleClose}
                    shake={true}
                  />
                );

              if (feedback.progress !== undefined && feedback.type === 'loading') {
                return (
                  <LoadingAnimation
                    key={feedback.id}
                    message={feedback.message}
                    isVisible={true}
                    progress={feedback.progress}
                  />
                );

              // Default feedback animation
              return (
                <div
                  key={feedback.id}
                  style={{
                    marginBottom: position.includes('bottom') ? `${index * 80}px` : undefined,
                    marginTop: position.includes('top') ? `${index * 80}px` : undefined,
                  }}
                >
                  <FeedbackAnimation
                    type={feedback.type as 'success' | 'error' | 'warning' | 'info'}
                    message={feedback.message}
                    isVisible={true}
                    onClose={handleClose}
                    duration={0} // Duration is handled by the provider
                    position={feedback.position}
                    showIcon={feedback.showIcon}
                    showCloseButton={feedback.showCloseButton}
                    action={feedback.action}
                  />
                </div>
              );
            })}
          </AnimatePresence>
        </div>
      ))}
    </>
  );
};

export default FeedbackProvider;
}
}}}}}}