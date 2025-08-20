import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { feedbackService, FeedbackData } from '../services/feedbackService';

interface FeedbackContextType {
  // State
  isCollectorOpen: boolean;
  currentCategory: 'navigation' | 'visual-design' | 'overall-experience';
  currentContext: string;
  
  // Actions
  openFeedback: (category?: 'navigation' | 'visual-design' | 'overall-experience', context?: string) => void;
  closeFeedback: () => void;
  submitFeedback: (feedback: Omit<FeedbackData, 'timestamp' | 'userAgent' | 'screenSize'>) => Promise<void>;
  
  // Analytics
  getFeedbackAnalytics: () => ReturnType<typeof feedbackService.getAnalytics>;
  exportFeedback: () => string;
  clearFeedback: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

interface FeedbackProviderProps {
  children: ReactNode;
}

export const FeedbackProvider: React.FC<FeedbackProviderProps> = ({ children }) => {
  const [isCollectorOpen, setIsCollectorOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<'navigation' | 'visual-design' | 'overall-experience'>('overall-experience');
  const [currentContext, setCurrentContext] = useState('');

  const openFeedback = useCallback((
    category: 'navigation' | 'visual-design' | 'overall-experience' = 'overall-experience',
    context: string = ''
  ) => {
    setCurrentCategory(category);
    setCurrentContext(context);
    setIsCollectorOpen(true);
  }, []);

  const closeFeedback = useCallback(() => {
    setIsCollectorOpen(false);
  }, []);

  const submitFeedback = useCallback(async (
    feedback: Omit<FeedbackData, 'timestamp' | 'userAgent' | 'screenSize'>
  ) => {
    const fullFeedback: FeedbackData = {
      ...feedback,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`
    };

    feedbackService.storeFeedback(fullFeedback);
    
    // Close the collector after successful submission
    setIsCollectorOpen(false);
  }, []);

  const getFeedbackAnalytics = useCallback(() => {
    return feedbackService.getAnalytics();
  }, []);

  const exportFeedback = useCallback(() => {
    return feedbackService.exportFeedback();
  }, []);

  const clearFeedback = useCallback(() => {
    feedbackService.clearFeedback();
  }, []);

  const value: FeedbackContextType = {
    isCollectorOpen,
    currentCategory,
    currentContext,
    openFeedback,
    closeFeedback,
    submitFeedback,
    getFeedbackAnalytics,
    exportFeedback,
    clearFeedback
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = (): FeedbackContextType => {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  return context;
};
}