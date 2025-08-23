import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FeedbackButton } from './FeedbackButton';
import { FeedbackCollector } from './FeedbackCollector';
import { useFeedbackTrigger, useNavigationFeedback, useVisualDesignFeedback } from '../../../hooks/useFeedbackTrigger';
import { feedbackService } from '../../../services/feedbackService';

interface FeedbackIntegrationProps {
// Display options
  showFloatingButton?: boolean;
  showAutoTrigger?: boolean;
  
  // Trigger configuration
  category?: 'navigation' | 'visual-design' | 'overall-experience';
  triggerAfterTime?: number; // milliseconds
  triggerAfterScroll?: number; // percentage
  
  // Positioning
  buttonPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  
  // Context
  context?: string;
  
  // Callbacks
  onFeedbackSubmitted?: (feedback: any) => void;

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

  // Auto-trigger feedback based on user behavior
  const autoTrigger = useFeedbackTrigger({
    timeOnPage: triggerAfterTime,
    scrollPercentage: triggerAfterScroll,
    category,
    context: currentContext
  });

  // Specific feedback triggers
  const navigationFeedback = useNavigationFeedback();
  const visualDesignFeedback = useVisualDesignFeedback();

  // Update context based on current page
  useEffect(() => {
    const pageContext = getPageContext(location.pathname);
    setCurrentContext(context || pageContext);
  }, [location.pathname, context]);

  // Handle auto-trigger
  useEffect(() => {
    if (showAutoTrigger && autoTrigger.shouldShow && !isCollectorOpen) {
      setIsCollectorOpen(true);
      setCurrentCategory(autoTrigger.category);
      setCurrentContext(autoTrigger.context);
  }, [showAutoTrigger, autoTrigger.shouldShow, isCollectorOpen]);

  // Handle specific triggers
  useEffect(() => {
    if (navigationFeedback.shouldShow && !isCollectorOpen) {
      setIsCollectorOpen(true);
      setCurrentCategory('navigation');
      setCurrentContext(navigationFeedback.context);
  }, [navigationFeedback.shouldShow, isCollectorOpen]);

  useEffect(() => {
    if (visualDesignFeedback.shouldShow && !isCollectorOpen) {
      setIsCollectorOpen(true);
      setCurrentCategory('visual-design');
      setCurrentContext(visualDesignFeedback.context);
  }, [visualDesignFeedback.shouldShow, isCollectorOpen]);

  const handleFeedbackClose = () => {
    setIsCollectorOpen(false);
    autoTrigger.dismiss();
    navigationFeedback.dismiss();
    visualDesignFeedback.dismiss();
  };

  const handleFeedbackSubmitted = (feedback: any) => {
    if (onFeedbackSubmitted) {
      onFeedbackSubmitted(feedback);
    handleFeedbackClose();
  };

  return (
    <>
      {/* Floating Feedback Button */}
      {showFloatingButton && (
        <FeedbackButton
          position={buttonPosition}
          category={currentCategory}
          context={currentContext}
        />
      )}
      {/* Auto-triggered Feedback Collector */}
      <FeedbackCollector
        isOpen={isCollectorOpen}
        onClose={handleFeedbackClose}
        category={currentCategory}
        context={currentContext}
      />
    </>
  );
};

// Helper function to get context based on current page
function getPageContext(pathname: string): string {
  const pageContextMap: Record<string, string> = {
    '/': 'Homepage experience',
    '/verify': 'Certificate verification process',
    '/dashboard': 'Issuer dashboard experience',
    '/settings': 'Settings and configuration',
    '/certificate': 'Certificate viewing experience'
  };

  // Find exact match first
  if (pageContextMap[pathname]) {
    return pageContextMap[pathname];

  // Find partial match
  for (const [path, context] of Object.entries(pageContextMap)) {
    if (pathname.startsWith(path) && path !== '/') {
      return context;

  return Page: ${pathname};

// Specialized feedback components for specific use cases
export const NavigationFeedback: React.FC<Omit<FeedbackIntegrationProps, 'category'>> = (props) => (;
  <FeedbackIntegration {...props} category="navigation" />
);

export const VisualDesignFeedback: React.FC<Omit<FeedbackIntegrationProps, 'category'>> = (props) => (;
  <FeedbackIntegration {...props} category="visual-design" />
);

export const OverallExperienceFeedback: React.FC<Omit<FeedbackIntegrationProps, 'category'>> = (props) => (;
  <FeedbackIntegration {...props} category="overall-experience" />
);

// Hook for programmatic feedback triggering
export const useFeedbackIntegration = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<'navigation' | 'visual-design' | 'overall-experience'>('overall-experience');
  const [context, setContext] = useState('');

  const triggerFeedback = (
    feedbackCategory: 'navigation' | 'visual-design' | 'overall-experience' = 'overall-experience',
    feedbackContext: string = ''
  ) => {
    setCategory(feedbackCategory);
    setContext(feedbackContext);
    setIsOpen(true);
  };

  const closeFeedback = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    category,
    context,
    triggerFeedback,
    closeFeedback,
    FeedbackComponent: () => (
      <FeedbackCollector
        isOpen={isOpen}
        onClose={closeFeedback}
        category={category}
        context={context}
      />
    )
  };
};
}
}