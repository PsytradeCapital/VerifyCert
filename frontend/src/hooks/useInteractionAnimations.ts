import { useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';

interface AnimationVariants {
  initial: object;
  animate: object;
  exit?: object;
  hover?: object;
  tap?: object;
}

export const useInteractionAnimations = () => {
  const shouldReduceMotion = useReducedMotion();

  const getButtonAnimations = useCallback((): AnimationVariants => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        hover: { opacity: 0.8 },
        tap: { opacity: 0.6 }
      };
    }

    return {
      initial: { scale: 1 },
      animate: { scale: 1 },
      hover: { scale: 1.05 },
      tap: { scale: 0.95 }
    };
  }, [shouldReduceMotion]);

  const getCardAnimations = useCallback((): AnimationVariants => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        hover: { opacity: 0.9 }
      };
    }

    return {
      initial: { y: 0, scale: 1 },
      animate: { y: 0, scale: 1 },
      hover: { y: -4, scale: 1.02 }
    };
  }, [shouldReduceMotion]);

  const getModalAnimations = useCallback((): AnimationVariants => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      };
    }

    return {
      initial: { opacity: 0, scale: 0.9, y: 20 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.9, y: 20 }
    };
  }, [shouldReduceMotion]);

  const getSlideAnimations = useCallback((direction: 'left' | 'right' | 'up' | 'down' = 'right'): AnimationVariants => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      };
    }

    const directions = {
      left: { x: -100 },
      right: { x: 100 },
      up: { y: -100 },
      down: { y: 100 }
    };

    return {
      initial: { opacity: 0, ...directions[direction] },
      animate: { opacity: 1, x: 0, y: 0 },
      exit: { opacity: 0, ...directions[direction] }
    };
  }, [shouldReduceMotion]);

  const getFadeAnimations = useCallback((): AnimationVariants => {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    };
  }, []);

  return {
    shouldReduceMotion,
    getButtonAnimations,
    getCardAnimations,
    getModalAnimations,
    getSlideAnimations,
    getFadeAnimations
  };
};

export default useInteractionAnimations;