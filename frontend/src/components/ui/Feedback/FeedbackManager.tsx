import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';

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
  };
  shake?: boolean;
  confetti?: boolean;
  progress?: number;
}

interface FeedbackContextType {
  feedbacks: FeedbackItem[];
  showFeedback: (feedback: Omit<FeedbackItem, 'id'>) => string;
  showSuccess: (message: string, options?: Partial<FeedbackItem>) => string;
  showError: (message: string, options?: Partial<FeedbackItem>) => string;
  showWarning: (message: string, options?: Partial<FeedbackItem>) => string;
  showInfo: (message: string, options?: Partial<FeedbackItem>) => string;
  showLoading: (message: string, options?: Partial<FeedbackItem>) => string;
  updateProgress: (id: string, progress: number) => void;
  dismissFeedback: (id: string) => void;
  dismissAll: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const showFeedback = useCallback((feedback: Omit<FeedbackItem, 'id'>) => {
    const id = generateId();
    const newFeedback: FeedbackItem = {
      id,
      duration: 5000,
      position: 'top-right',
      showIcon: true,
      showCloseButton: true,
      ...feedback
    };

    setFeedbacks(prev => [...prev, newFeedback]);

    if (newFeedback.duration && newFeedback.duration > 0) {
      setTimeout(() => {
        dismissFeedback(id);
      }, newFeedback.duration);
    }

    return id;
  }, []);

  const showSuccess = useCallback((message: string, options?: Partial<FeedbackItem>) => {
    return showFeedback({ type: 'success', message, ...options });
  }, [showFeedback]);

  const showError = useCallback((message: string, options?: Partial<FeedbackItem>) => {
    return showFeedback({ type: 'error', message, ...options });
  }, [showFeedback]);

  const showWarning = useCallback((message: string, options?: Partial<FeedbackItem>) => {
    return showFeedback({ type: 'warning', message, ...options });
  }, [showFeedback]);

  const showInfo = useCallback((message: string, options?: Partial<FeedbackItem>) => {
    return showFeedback({ type: 'info', message, ...options });
  }, [showFeedback]);

  const showLoading = useCallback((message: string, options?: Partial<FeedbackItem>) => {
    return showFeedback({ type: 'loading', message, duration: 0, ...options });
  }, [showFeedback]);

  const updateProgress = useCallback((id: string, progress: number) => {
    setFeedbacks(prev => prev.map(feedback => 
      feedback.id === id ? { ...feedback, progress } : feedback
    ));
  }, []);

  const dismissFeedback = useCallback((id: string) => {
    setFeedbacks(prev => prev.filter(feedback => feedback.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setFeedbacks([]);
  }, []);

  const value: FeedbackContextType = {
    feedbacks,
    showFeedback,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    updateProgress,
    dismissFeedback,
    dismissAll
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <FeedbackContainer />
    </FeedbackContext.Provider>
  );
};

const FeedbackContainer: React.FC = () => {
  const { feedbacks, dismissFeedback } = useFeedback();

  const groupedFeedbacks = feedbacks.reduce((acc, feedback) => {
    const position = feedback.position || 'top-right';
    if (!acc[position]) acc[position] = [];
    acc[position].push(feedback);
    return acc;
  }, {} as Record<string, FeedbackItem[]>);

  return (
    <>
      {Object.entries(groupedFeedbacks).map(([position, positionFeedbacks]) => (
        <div
          key={position}
          className={`fixed z-50 pointer-events-none ${getPositionClasses(position)}`}
        >
          <AnimatePresence>
            {positionFeedbacks.map(feedback => (
              <div key={feedback.id} className="pointer-events-auto mb-2">
                <div className="bg-white rounded-lg shadow-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <span>{feedback.message}</span>
                    {feedback.showCloseButton && (
                      <button
                        onClick={() => dismissFeedback(feedback.id)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </AnimatePresence>
        </div>
      ))}
    </>
  );
};

const getPositionClasses = (position: string) => {
  switch (position) {
    case 'top-right':
      return 'top-4 right-4';
    case 'top-left':
      return 'top-4 left-4';
    case 'bottom-right':
      return 'bottom-4 right-4';
    case 'bottom-left':
      return 'bottom-4 left-4';
    case 'center':
      return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    default:
      return 'top-4 right-4';
  }
};

export default FeedbackProvider;