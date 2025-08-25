import React, { createContext, useContext, useState, useCallback } from 'react';

export interface FeedbackItem {
  id: string;
  type: 'bug' | 'feature' | 'improvement' | 'other';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

interface FeedbackContextType {
  feedback: FeedbackItem[];
  addFeedback: (feedback: Omit<FeedbackItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFeedback: (id: string, updates: Partial<FeedbackItem>) => void;
  deleteFeedback: (id: string) => void;
  getFeedbackById: (id: string) => FeedbackItem | undefined;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

interface FeedbackProviderProps {
  children: React.ReactNode;
}

export const FeedbackProvider: React.FC<FeedbackProviderProps> = ({ children }) => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);

  const addFeedback = useCallback((newFeedback: Omit<FeedbackItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const feedbackItem: FeedbackItem = {
      ...newFeedback,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setFeedback(prev => [...prev, feedbackItem]);
  }, []);

  const updateFeedback = useCallback((id: string, updates: Partial<FeedbackItem>) => {
    setFeedback(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, ...updates, updatedAt: new Date() }
          : item
      )
    );
  }, []);

  const deleteFeedback = useCallback((id: string) => {
    setFeedback(prev => prev.filter(item => item.id !== id));
  }, []);

  const getFeedbackById = useCallback((id: string) => {
    return feedback.find(item => item.id === id);
  }, [feedback]);

  const value: FeedbackContextType = {
    feedback,
    addFeedback,
    updateFeedback,
    deleteFeedback,
    getFeedbackById,
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};

export default FeedbackContext;