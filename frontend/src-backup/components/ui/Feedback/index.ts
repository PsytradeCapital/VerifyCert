export { FeedbackCollector } from './FeedbackCollector';
export { FeedbackButton } from './FeedbackButton';
export { FeedbackDashboard } from './FeedbackDashboard';
export { 
  FeedbackIntegration,
  NavigationFeedback,
  VisualDesignFeedback,
  OverallExperienceFeedback,
  useFeedbackIntegration
} from './FeedbackIntegration';

// Re-export service and hooks
export { feedbackService } from '../../../services/feedbackService';
export { 
  useFeedbackTrigger,
  useNavigationFeedback,
  useVisualDesignFeedback,
  useErrorFeedback
} from '../../../hooks/useFeedbackTrigger';

// Types
export type { FeedbackData, FeedbackAnalytics } from '../../../services/feedbackService';