import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';

interface TransitionState {
  isTransitioning: boolean;
  direction: 'forward' | 'backward' | 'none';
  previousPath: string | null;
  currentPath: string;
}

export const useNavigationTransitions = () => {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  
  const [transitionState, setTransitionState] = useState<TransitionState>({
    isTransitioning: false,
    direction: 'none',
    previousPath: null,
    currentPath: location.pathname,
  });

  // Determine navigation direction
  const getNavigationDirection = useCallback((from: string, to: string): 'forward' | 'backward' | 'none' => {
    // Simple heuristic for determining direction
    // If going to a longer path that starts with current path, it's forward
    if (to.length > from.length && to.startsWith(from)) {
      return 'forward';
    }
    // If going to a shorter path and current path starts with it, it's backward
    if (from.length > to.length && from.startsWith(to)) {
      return 'backward';
    }
    // Otherwise, it's a lateral navigation
    return 'none';
  }, []);

  // Get page transition variants
  const getPageTransitionVariants = useCallback((direction: string) => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 }
      };
    }

    switch (direction) {
      case 'forward':
        return {
          initial: { opacity: 0, x: 100 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -100 }
        };
      case 'backward':
        return {
          initial: { opacity: 0, x: -100 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 100 }
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
    }
  }, [shouldReduceMotion]);

  // Get transition config
  const getTransitionConfig = useCallback(() => {
    if (shouldReduceMotion) {
      return {
        duration: 0
      };
    }

    return {
      duration: 0.3,
      ease: 'easeInOut'
    };
  }, [shouldReduceMotion]);

  // Handle route changes
  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = transitionState.currentPath;
    
    if (currentPath !== previousPath) {
      const direction = getNavigationDirection(previousPath, currentPath);
      
      setTransitionState({
        isTransitioning: true,
        direction,
        previousPath,
        currentPath,
      });

      // End transition after animation duration
      if (!shouldReduceMotion) {
        const timer = setTimeout(() => {
          setTransitionState(prev => ({
            ...prev,
            isTransitioning: false
          }));
        }, 300); // Match your animation duration

        return () => clearTimeout(timer);
      }
    }
  }, [location.pathname, transitionState.currentPath, getNavigationDirection, shouldReduceMotion]);

  return {
    transitionState,
    getPageTransitionVariants,
    getTransitionConfig,
    shouldReduceMotion
  };
};

export default useNavigationTransitions;