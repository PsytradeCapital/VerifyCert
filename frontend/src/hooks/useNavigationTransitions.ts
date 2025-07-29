import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export interface NavigationTransition {
  isTransitioning: boolean;
  transitionDirection: 'forward' | 'backward' | 'none';
  previousPath: string | null;
  currentPath: string;
}

export interface NavigationTransitionOptions {
  transitionDuration?: number;
  enableTransitions?: boolean;
}

export const useNavigationTransitions = (
  options: NavigationTransitionOptions = {}
) => {
  const {
    transitionDuration = 300,
    enableTransitions = true
  } = options;

  const location = useLocation();
  const [transition, setTransition] = useState<NavigationTransition>({
    isTransitioning: false,
    transitionDirection: 'none',
    previousPath: null,
    currentPath: location.pathname
  });

  const [navigationHistory, setNavigationHistory] = useState<string[]>([location.pathname]);

  // Update transition state when location changes
  useEffect(() => {
    if (!enableTransitions) return;

    const currentPath = location.pathname;
    const previousPath = transition.currentPath;

    // Skip transition on initial render
    if (previousPath === currentPath) {
      return;
    }

    // Determine transition direction based on history
    const currentIndex = navigationHistory.indexOf(currentPath);
    const previousIndex = navigationHistory.indexOf(previousPath);
    
    let direction: 'forward' | 'backward' | 'none' = 'none';
    
    if (currentIndex === -1) {
      // New page - forward transition
      direction = 'forward';
      setNavigationHistory(prev => [...prev, currentPath]);
    } else if (currentIndex < previousIndex) {
      // Going back in history
      direction = 'backward';
    } else if (currentIndex > previousIndex) {
      // Going forward in history
      direction = 'forward';
    }

    // Start transition
    setTransition({
      isTransitioning: true,
      transitionDirection: direction,
      previousPath,
      currentPath
    });

    // End transition after duration
    const timer = setTimeout(() => {
      setTransition(prev => ({
        ...prev,
        isTransitioning: false,
        transitionDirection: 'none',
        previousPath: null
      }));
    }, transitionDuration);

    return () => clearTimeout(timer);
  }, [location.pathname, transitionDuration, enableTransitions]);

  // Manual transition trigger
  const triggerTransition = useCallback((direction: 'forward' | 'backward' = 'forward') => {
    if (!enableTransitions) return;

    setTransition(prev => ({
      ...prev,
      isTransitioning: true,
      transitionDirection: direction
    }));

    setTimeout(() => {
      setTransition(prev => ({
        ...prev,
        isTransitioning: false,
        transitionDirection: 'none'
      }));
    }, transitionDuration);
  }, [transitionDuration, enableTransitions]);

  // Get transition classes for animations
  const getTransitionClasses = useCallback((baseClasses: string = '') => {
    const classes = [baseClasses];

    if (transition.isTransitioning) {
      classes.push('transition-all duration-300 ease-in-out');
      
      switch (transition.transitionDirection) {
        case 'forward':
          classes.push('transform translate-x-0 opacity-100');
          break;
        case 'backward':
          classes.push('transform -translate-x-0 opacity-100');
          break;
        default:
          classes.push('opacity-100');
      }
    } else {
      classes.push('opacity-100');
    }

    return classes.filter(Boolean).join(' ');
  }, [transition]);

  // Get page transition variants for Framer Motion
  const getPageTransitionVariants = useCallback(() => {
    return {
      initial: {
        opacity: 0,
        x: transition.transitionDirection === 'backward' ? -20 : 20,
        scale: 0.98
      },
      in: {
        opacity: 1,
        x: 0,
        scale: 1
      },
      out: {
        opacity: 0,
        x: transition.transitionDirection === 'backward' ? 20 : -20,
        scale: 0.98
      }
    };
  }, [transition.transitionDirection]);

  const getPageTransition = useCallback(() => {
    return {
      type: 'tween',
      ease: 'anticipate',
      duration: transitionDuration / 1000
    };
  }, [transitionDuration]);

  return {
    transition,
    triggerTransition,
    getTransitionClasses,
    getPageTransitionVariants,
    getPageTransition,
    navigationHistory
  };
};

export default useNavigationTransitions;