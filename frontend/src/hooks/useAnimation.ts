import { useReducedMotion } from 'framer-motion';
import { motionConfig, easings, durations, springs } from '../config/motion';

/**
 * Enhanced animation hook that provides consistent animation behavior
 * across the application with respect for user preferences
 */
export const useAnimation = () => {
  const shouldReduceMotion = useReducedMotion();

  // Return appropriate animation settings based on user preference
  const getAnimationConfig = (animationType: 'transition' | 'spring' | 'tween' = 'transition') => {
    if (shouldReduceMotion) {
      return {
        duration: 0.01,
        ease: 'linear'
      };

    switch (animationType) {
      case 'spring':
        return springs.gentle;
      case 'tween':
        return {
          duration: durations.normal,
          ease: easings.easeInOut
        };
      default:
        return motionConfig.defaultTransition;
  };

  const getVariants = (type: 'fade' | 'slide' | 'scale' | 'bounce') => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1
      };

    switch (type) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0
        };
      case 'slide':
        return {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20
        };
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.9
        };
      case 'bounce':
        return {
          initial: { opacity: 0, scale: 0.3 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.3
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0
        };
  };

  return {
    shouldReduceMotion,
    getAnimationConfig,
    getVariants,
    config: motionConfig,
    easings,
    durations,
    springs
  };
};

export default useAnimation;
}
}}}}}}}}}