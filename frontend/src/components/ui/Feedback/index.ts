/**
 * Feedback Components
 */

export { default as FeedbackButton } from './FeedbackButton';
export { default as FeedbackCollector } from './FeedbackCollector';
export { default as FeedbackDashboard } from './FeedbackDashboard';
export { default as FeedbackManager } from './FeedbackManager';
export { default as FeedbackIntegration } from './FeedbackIntegration';

export type { FeedbackButtonProps } from './FeedbackButton';
export type { FeedbackCollectorProps } from './FeedbackCollector';
export type { FeedbackDashboardProps } from './FeedbackDashboard';
export type { FeedbackManagerProps } from './FeedbackManager';
export type { FeedbackIntegrationProps } from './FeedbackIntegration';

// Common types
export interface FeedbackData {
  id: string;
  type: 'bug' | 'feature' | 'improvement' | 'other';
  message: string;
  rating?: number;
  timestamp: Date;
  userAgent?: string;
  url?: string;
}

export interface FeedbackAnalytics {
  totalFeedback: number;
  averageRating: number;
  feedbackByType: Record<string, number>;
  recentFeedback: FeedbackData[];
}