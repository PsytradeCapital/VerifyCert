import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FeedbackButton } from './FeedbackButton';
import { FeedbackCollector } from './FeedbackCollector';
import { useFeedbackTrigger } from '../../../hooks/useFeedbackTrigger';
import { feedbackService } from '../../../services/feedbackService';

interface FeedbackIntegrationProps {
  showFloatingButton?: boolean;
  showAutoTrigger?: boolean;
  category?: 'navigation' | 'visual-design' | 'overall-experience';
  triggerAfterTime?: number;
  triggerAfterScroll?: number;
  buttonPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  context?: string;
  onFeedbackSubmitted?: (feedback: any) => void;
}

export const FeedbackIntegration: React.FC<FeedbackIntegrationProps> = ({
  showFloatingButton = true,
  showAutoTrigger = true,
  category = 'overall-experience',
  triggerAfterTime = 30000,
  triggerAfterScroll = 80,
  buttonPosition = 'bottom-right',
  context,
  onFeedbackSubmitted
}) => {
  const location = useLocation();
  const [isCollectorOpen, setIsCollectorOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(category);
  const [currentContext, setCurrentContext] = useState(context || '');

  const autoTrigger = useFeedbackTrigger({
    triggerAfterTime,
    scrollThreshold: triggerAfterScroll,
    category,
    context: currentContext
  });

  // Navigation and visual design feedback hooks removed for now

  useEffect(() => {
    const pageContext = `${location.pathname}${location.search}`;
    setCurrentContext(context || pageContext);
  }, [location, context]);

  useEffect(() => {
    if (showAutoTrigger && autoTrigger.shouldTrigger && !isCollectorOpen) {
      setIsCollectorOpen(true);
      setCurrentCategory(category);
    }
  }, [autoTrigger.shouldTrigger, showAutoTrigger, category, isCollectorOpen]);

  const handleFeedbackSubmit = (feedback: any) => {
    const enrichedFeedback = {
      ...feedback,
      page: location.pathname,
      context: currentContext,
      category: currentCategory,
      timestamp: Date.now()
    };

    feedbackService.submitFeedback(enrichedFeedback);
    onFeedbackSubmitted?.(enrichedFeedback);
    setIsCollectorOpen(false);
  };

  const handleButtonClick = () => {
    setIsCollectorOpen(true);
    setCurrentCategory(category);
  };

  return (
    <>
      {showFloatingButton && (
        <FeedbackButton
          position={buttonPosition}
          onFeedbackRequest={handleButtonClick}
        />
      )}
      
      {isCollectorOpen && (
        <FeedbackCollector
          isOpen={isCollectorOpen}
          onClose={() => setIsCollectorOpen(false)}
          category={currentCategory}
          context={currentContext}
        />
      )}
    </>
  );
};

export const NavigationFeedback: React.FC<Omit<FeedbackIntegrationProps, 'category'>> = (props) => (
  <FeedbackIntegration {...props} category="navigation" />
);

export const VisualDesignFeedback: React.FC<Omit<FeedbackIntegrationProps, 'category'>> = (props) => (
  <FeedbackIntegration {...props} category="visual-design" />
);

export const OverallExperienceFeedback: React.FC<Omit<FeedbackIntegrationProps, 'category'>> = (props) => (
  <FeedbackIntegration {...props} category="overall-experience" />
);

export const useFeedbackIntegration = (options: Partial<FeedbackIntegrationProps> = {}) => {
  const [isActive, setIsActive] = useState(false);
  const [category, setCategory] = useState<string>(options.category || 'overall-experience');

  const trigger = (newCategory?: string) => {
    if (newCategory) setCategory(newCategory);
    setIsActive(true);
  };

  const dismiss = () => {
    setIsActive(false);
  };

  return {
    isActive,
    category,
    trigger,
    dismiss
  };
};

export default FeedbackIntegration;
export type { FeedbackIntegrationProps };
export { FeedbackIntegration };
export type { FeedbackIntegrationProps };