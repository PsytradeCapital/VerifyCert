import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface FeedbackTriggerConfig {
  // Time-based triggers
  timeThreshold?: number; // milliseconds
  scrollThreshold?: number; // percentage
  
  // Interaction-based triggers
  clickThreshold?: number;
  errorThreshold?: number;
  
  // Context
  category?: 'navigation' | 'visual-design' | 'overall-experience';
  context?: string;
}

interface FeedbackTriggerState {
  shouldShow: boolean;
  category: 'navigation' | 'visual-design' | 'overall-experience';
  context: string;
  trigger: () => void;
  dismiss: () => void;
  reset: () => void;
}

export const useFeedbackTrigger = (config: FeedbackTriggerConfig = {}): FeedbackTriggerState => {
  const location = useLocation();
  const [shouldShow, setShouldShow] = useState(false);
  const [timeOnPage, setTimeOnPage] = useState(0);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const {
    timeThreshold = 30000, // 30 seconds
    scrollThreshold = 70, // 70%
    clickThreshold = 5,
    errorThreshold = 2,
    category = 'overall-experience',
    context = location.pathname
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
      const scrollPercent = (scrollTop / docHeight) * 100;
      setScrollPercentage(Math.min(scrollPercent, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track clicks
  useEffect(() => {
    const handleClick = () => {
      setClickCount(prev => prev + 1);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Check if feedback should be triggered
  useEffect(() => {
    const shouldTrigger = 
      timeOnPage >= timeThreshold ||
      scrollPercentage >= scrollThreshold ||
      clickCount >= clickThreshold ||
      errorCount >= errorThreshold;

    if (shouldTrigger && !shouldShow) {
      setShouldShow(true);
    }
  }, [timeOnPage, scrollPercentage, clickCount, errorCount, timeThreshold, scrollThreshold, clickThreshold, errorThreshold, shouldShow]);

  // Reset when route changes
  useEffect(() => {
    setShouldShow(false);
    setTimeOnPage(0);
    setScrollPercentage(0);
    setClickCount(0);
    setErrorCount(0);
  }, [location.pathname]);

  const trigger = useCallback(() => {
    setShouldShow(true);
  }, []);

  const dismiss = useCallback(() => {
    setShouldShow(false);
  }, []);

  const reset = useCallback(() => {
    setShouldShow(false);
    setTimeOnPage(0);
    setScrollPercentage(0);
    setClickCount(0);
    setErrorCount(0);
  }, []);

  return {
    shouldShow,
    category,
    context,
    trigger,
    dismiss,
    reset
  };
};

export default useFeedbackTrigger;