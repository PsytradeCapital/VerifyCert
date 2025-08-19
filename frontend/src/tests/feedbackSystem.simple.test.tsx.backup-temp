import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { FeedbackProvider } from '../contexts/FeedbackContext';
import { FeedbackCollector } from '../components/ui/Feedback/FeedbackCollector';
import { feedbackService } from '../services/feedbackService';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <FeedbackProvider>
      {children}
    </FeedbackProvider>
  </BrowserRouter>
);

describe('Feedback System - Basic Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders feedback collector when open', () => {
    render(
      <TestWrapper>
        <FeedbackCollector
          isOpen={true}
          onClose={jest.fn()}
          category="overall-experience"
        />
      </TestWrapper>
    );

    expect(screen.getByText('Share Your Feedback')).toBeInTheDocument();
  });

  test('feedback service stores data correctly', () => {
    const feedback = {
      category: 'navigation' as const,
      rating: 5,
      feedback: 'Great navigation!',
      page: '/test',
      timestamp: Date.now(),
      userAgent: 'test-agent',
      screenSize: '1920x1080'
    };

    feedbackService.storeFeedback(feedback);
    const stored = feedbackService.getAllFeedback();
    
    expect(stored).toHaveLength(1);
    expect(stored[0]).toEqual(feedback);
  });

  test('feedback service generates analytics', () => {
    const feedback = {
      category: 'navigation' as const,
      rating: 4,
      feedback: 'Good navigation',
      page: '/test',
      timestamp: Date.now(),
      userAgent: 'test-agent',
      screenSize: '1920x1080'
    };

    feedbackService.storeFeedback(feedback);
    const analytics = feedbackService.getAnalytics();

    expect(analytics.totalFeedback).toBe(1);
    expect(analytics.averageRating).toBe(4);
  });
});