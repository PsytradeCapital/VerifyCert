import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface FeedbackTriggerConfig {
// Automatic triggers
  timeOnPage?: number; // milliseconds
  scrollPercentage?: number; // 0-100
  exitIntent?: boolean;
  errorOccurred?: boolean;
  
  // Manual triggers
  afterAction?: string; // action name
  onElementClick?: string; // element selector
  
  // Context
  category?: 'navigation' | 'visual-design' | 'overall-experience';
  context?: string;

interface FeedbackTriggerState {
}}
}
}}}
  shouldShow: boolean;
  category: 'navigation' | 'visual-design' | 'overall-experience';
  context: string;
  trigger: () => void;
  dismiss: () => void;
  reset: () => void;

export const useFeedbackTrigger = (config: FeedbackTriggerConfig = {}): FeedbackTriggerState => {
  const location = useLocation();
  const [shouldShow, setShouldShow] = useState(false);
  const [timeOnPage, setTimeOnPage] = useState(0);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [hasTriggered, setHasTriggered] = useState(false);

  const {
    timeOnPage: triggerTime = 30000, // 30 seconds default
    scrollPercentage: triggerScroll = 80, // 80% default
    exitIntent = false,
    errorOccurred = false,
    category = 'overall-experience',
    context = ''
  } = config;

  // Track time on page
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setTimeOnPage(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [location.pathname]);

  // Track scroll percentage
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollPercentage(scrollPercent);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track exit intent
  useEffect(() => {
    if (!exitIntent) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasTriggered) {
        setShouldShow(true);
        setHasTriggered(true);
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [exitIntent, hasTriggered]);

  // Check triggers
  useEffect(() => {
    if (hasTriggered) return;

    // Time-based trigger
    if (triggerTime && timeOnPage >= triggerTime) {
      setShouldShow(true);
      setHasTriggered(true);
      return;

    // Scroll-based trigger
    if (triggerScroll && scrollPercentage >= triggerScroll) {
      setShouldShow(true);
      setHasTriggered(true);
      return;

    // Error-based trigger
    if (errorOccurred) {
      setShouldShow(true);
      setHasTriggered(true);
      return;
  }, [timeOnPage, scrollPercentage, errorOccurred, triggerTime, triggerScroll, hasTriggered]);

  // Reset on page change
  useEffect(() => {
    setShouldShow(false);
    setHasTriggered(false);
    setTimeOnPage(0);
    setScrollPercentage(0);
  }, [location.pathname]);

  const trigger = useCallback(() => {
    setShouldShow(true);
  }, []);

  const dismiss = useCallback(() => {
    setShouldShow(false);
    setHasTriggered(true);
  }, []);

  const reset = useCallback(() => {
    setShouldShow(false);
    setHasTriggered(false);
    setTimeOnPage(0);
    setScrollPercentage(0);
  }, []);

  return {
    shouldShow,
    category,
    context: context || `Page: ${location.pathname}, Time: ${Math.round(timeOnPage / 1000)}s, Scroll: ${Math.round(scrollPercentage)}%`,
    trigger,
    dismiss,
    reset
  };
};

// Hook for specific feedback scenarios
export const useNavigationFeedback = () => {
  return useFeedbackTrigger({
    category: 'navigation',
    timeOnPage: 45000, // 45 seconds - longer for navigation issues
    scrollPercentage: 90,
    exitIntent: true,
    context: 'Navigation experience feedback'
  });
};

export const useVisualDesignFeedback = () => {
  return useFeedbackTrigger({
    category: 'visual-design',
    timeOnPage: 20000, // 20 seconds - quicker for visual feedback
    scrollPercentage: 70,
    context: 'Visual design and layout feedback'
  });
};

export const useErrorFeedback = (error: Error | null) => {
  return useFeedbackTrigger({
    category: 'overall-experience',
    errorOccurred: !!error,
    context: error ? `Error occurred: ${error.message}` : 'Error experience feedback'
  });
};
}