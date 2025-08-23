import React from 'react';
interface FeedbackData {
}
}
}
  category: 'navigation' | 'visual-design' | 'overall-experience';
  rating: number;
  feedback: string;
  page: string;
  timestamp: number;
  userAgent: string;
  screenSize: string;
  context?: string;

interface FeedbackAnalytics {
}
}
}
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

class FeedbackService {
  private readonly STORAGE_KEY = 'verifycert-feedback';
  private readonly ANALYTICS_KEY = 'verifycert-feedback-analytics';

  /**
   * Store feedback data locally
   */
  storeFeedback(feedback: FeedbackData): void {
    try {
      const existingFeedback = this.getAllFeedback();
      existingFeedback.push(feedback);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingFeedback));
      
      // Update analytics
      this.updateAnalytics();
      
      // Send to external analytics if available
      this.sendToAnalytics(feedback);
    } catch (error) {
      console.error('Failed to store feedback:', error);

  /**
   * Get all stored feedback
   */
  getAllFeedback(): FeedbackData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to retrieve feedback:', error);
      return [];

  /**
   * Get feedback analytics
   */
  getAnalytics(): FeedbackAnalytics {
    try {
      const stored = localStorage.getItem(this.ANALYTICS_KEY);
      if (stored) {
        return JSON.parse(stored);
      
      // Generate analytics if not cached
      return this.generateAnalytics();
    } catch (error) {
      console.error('Failed to retrieve analytics:', error);
      return this.getEmptyAnalytics();

  /**
   * Generate analytics from feedback data
   */
  private generateAnalytics(): FeedbackAnalytics {
    const feedback = this.getAllFeedback();
    
    if (feedback.length === 0) {
      return this.getEmptyAnalytics();

    const totalFeedback = feedback.length;
    const averageRating = feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback;

    // Category breakdown
    const categoryBreakdown: Record<string, any> = {};
    const categories = ['navigation', 'visual-design', 'overall-experience'];
    
    categories.forEach(category => {
      const categoryFeedback = feedback.filter(f => f.category === category);
      if (categoryFeedback.length > 0) {
        categoryBreakdown[category] = {
          count: categoryFeedback.length,
          averageRating: categoryFeedback.reduce((sum, f) => sum + f.rating, 0) / categoryFeedback.length,
          commonIssues: this.extractCommonIssues(categoryFeedback)
        };
    });

    // Page breakdown
    const pageBreakdown: Record<string, any> = {};
    const pages = [...new Set(feedback.map(f => f.page))];
    
    pages.forEach(page => {
      const pageFeedback = feedback.filter(f => f.page === page);
      pageBreakdown[page] = {
        count: pageFeedback.length,
        averageRating: pageFeedback.reduce((sum, f) => sum + f.rating, 0) / pageFeedback.length
      };
    });

    // Recent feedback (last 10)
    const recentFeedback = feedback
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);

    // Trends analysis
    const trends = this.analyzeTrends(feedback);

    const analytics: FeedbackAnalytics = {
      totalFeedback,
      averageRating,
      categoryBreakdown,
      pageBreakdown,
      recentFeedback,
      trends
    };

    // Cache analytics
    localStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(analytics));
    
    return analytics;

  /**
   * Extract common issues from feedback text
   */
  private extractCommonIssues(feedback: FeedbackData[]): string[] {
    const issues: Record<string, number> = {};
    const keywords = [
      'slow', 'confusing', 'hard to find', 'unclear', 'broken', 'error',
      'difficult', 'frustrating', 'not intuitive', 'complicated', 'missing',
      'hard to use', 'not responsive', 'ugly', 'outdated', 'inconsistent'
    ];

    feedback.forEach(f => {
      const text = f.feedback.toLowerCase();
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          issues[keyword] = (issues[keyword] || 0) + 1;
      });
    });

    return Object.entries(issues)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([keyword]) => keyword);

  /**
   * Analyze trends in feedback
   */
  private analyzeTrends(feedback: FeedbackData[]): FeedbackAnalytics['trends'] {
    const lowRatingFeedback = feedback.filter(f => f.rating <= 2);
    const highRatingFeedback = feedback.filter(f => f.rating >= 4);

    const improvementAreas = this.extractCommonIssues(lowRatingFeedback);
    const positiveAspects = this.extractPositiveAspects(highRatingFeedback);
    const urgentIssues = this.identifyUrgentIssues(feedback);

    return {
      improvementAreas,
      positiveAspects,
      urgentIssues
    };

  /**
   * Extract positive aspects from high-rating feedback
   */
  private extractPositiveAspects(feedback: FeedbackData[]): string[] {
    const aspects: Record<string, number> = {};
    const keywords = [
      'easy', 'intuitive', 'clean', 'fast', 'beautiful', 'simple',
      'clear', 'helpful', 'smooth', 'responsive', 'modern', 'professional'
    ];

    feedback.forEach(f => {
      const text = f.feedback.toLowerCase();
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          aspects[keyword] = (aspects[keyword] || 0) + 1;
      });
    });

    return Object.entries(aspects)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([keyword]) => keyword);

  /**
   * Identify urgent issues that need immediate attention
   */
  private identifyUrgentIssues(feedback: FeedbackData[]): string[] {
    const urgentKeywords = ['broken', 'error', 'crash', 'not working', 'bug'];
    const urgentIssues: Set<string> = new Set();

    feedback.forEach(f => {
      if (f.rating <= 2) {
        const text = f.feedback.toLowerCase();
        urgentKeywords.forEach(keyword => {
          if (text.includes(keyword)) {
            urgentIssues.add(`${f.category}: ${keyword}`);
        });
    });

    return Array.from(urgentIssues).slice(0, 5);

  /**
   * Update analytics cache
   */
  private updateAnalytics(): void {
    this.generateAnalytics();

  /**
   * Send feedback to external analytics service
   */
  private sendToAnalytics(feedback: FeedbackData): void {
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', 'feedback_submitted', {
        category: feedback.category,
        rating: feedback.rating,
        page: feedback.page,
        custom_map: {
          dimension1: feedback.category,
          dimension2: feedback.page
      });

    // Custom analytics endpoint (if available)
    if (process.env.REACT_APP_ANALYTICS_ENDPOINT) {
      fetch(process.env.REACT_APP_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'feedback',
          data: feedback
        })
      }).catch(error => {
        console.warn('Failed to send feedback to analytics:', error);
      });

  /**
   * Get empty analytics structure
   */
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
    };

  /**
   * Export feedback data for analysis
   */
  exportFeedback(): string {
    const feedback = this.getAllFeedback();
    const analytics = this.getAnalytics();
    
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      feedback,
      analytics
    }, null, 2);

  /**
   * Clear all feedback data
   */
  clearFeedback(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.ANALYTICS_KEY);

  /**
   * Get feedback summary for a specific page
   */
  getPageFeedback(page: string): {
    feedback: FeedbackData[];
    averageRating: number;
    count: number;
  } {
    const feedback = this.getAllFeedback().filter(f => f.page === page);
    const averageRating = feedback.length > 0 
      ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length 
      : 0;

    return {
      feedback,
      averageRating,
      count: feedback.length
    };

  /**
   * Get feedback summary for a specific category
   */
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

// Export singleton instance
export const feedbackService = new FeedbackService();

// Type exports
export type { FeedbackData, FeedbackAnalytics };
}
}}}}}}}}}}}}}}}}}}}}}}}}}