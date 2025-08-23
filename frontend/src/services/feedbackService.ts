import React from 'react';

interface FeedbackData {
  category: 'navigation' | 'visual-design' | 'overall-experience';
  rating: number;
  feedback: string;
  page: string;
  timestamp: number;
  userAgent: string;
  screenSize: string;
  context?: string;
}

interface FeedbackAnalytics {
  totalFeedback: number;
  averageRating: number;
  categoryBreakdown: Record<string, {
    count: number;
    averageRating: number;
    commonIssues: string[];
  }>;
  pageBreakdown: Record<string, {
    count: number;
    averageRating: number;
  }>;
  recentFeedback: FeedbackData[];
  trends: {
    improvementAreas: string[];
    positiveAspects: string[];
    urgentIssues: string[];
  };
}

class FeedbackService {
  private readonly STORAGE_KEY = 'verifycert-feedback';
  private readonly ANALYTICS_KEY = 'verifycert-feedback-analytics';

  storeFeedback(feedback: FeedbackData): void {
    try {
      const existingFeedback = this.getAllFeedback();
      existingFeedback.push(feedback);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingFeedback));
      this.updateAnalytics();
      this.sendToAnalytics(feedback);
    } catch (error) {
      console.error('Failed to store feedback:', error);
    }
  }

  getAllFeedback(): FeedbackData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to retrieve feedback:', error);
      return [];
    }
  }

  getAnalytics(): FeedbackAnalytics {
    try {
      const stored = localStorage.getItem(this.ANALYTICS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return this.generateAnalytics();
    } catch (error) {
      console.error('Failed to retrieve analytics:', error);
      return this.getEmptyAnalytics();
    }
  }

  private generateAnalytics(): FeedbackAnalytics {
    const feedback = this.getAllFeedback();
    if (feedback.length === 0) {
      return this.getEmptyAnalytics();
    }

    const totalFeedback = feedback.length;
    const averageRating = feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback;

    return {
      totalFeedback,
      averageRating,
      categoryBreakdown: {},
      pageBreakdown: {},
      recentFeedback: feedback.slice(-10),
      trends: {
        improvementAreas: [],
        positiveAspects: [],
        urgentIssues: []
      }
    };
  }

  private updateAnalytics(): void {
    this.generateAnalytics();
  }

  private sendToAnalytics(feedback: FeedbackData): void {
    // Analytics implementation
  }

  private getEmptyAnalytics(): FeedbackAnalytics {
    return {
      totalFeedback: 0,
      averageRating: 0,
      categoryBreakdown: {},
      pageBreakdown: {},
      recentFeedback: [],
      trends: {
        improvementAreas: [],
        positiveAspects: [],
        urgentIssues: []
      }
    };
  }

  clearFeedback(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.ANALYTICS_KEY);
  }

  getCategoryFeedback(category: 'navigation' | 'visual-design' | 'overall-experience'): {
    feedback: FeedbackData[];
    averageRating: number;
    count: number;
  } {
    const feedback = this.getAllFeedback().filter(f => f.category === category);
    const averageRating = feedback.length > 0 
      ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length 
      : 0;

    return {
      feedback,
      averageRating,
      count: feedback.length
    };
  }
}

export const feedbackService = new FeedbackService();
export type { FeedbackData, FeedbackAnalytics };