import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { pageTransition, fadeIn, fadeInUp, scaleIn } from '../../utils/animations';

interface AnimatedWrapperProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  animation?: 'page' | 'fade' | 'fadeUp' | 'scale';
  className?: string;

/**
 * AnimatedWrapper Component
 * A reusable wrapper component that applies Framer Motion animations
 */
const AnimatedWrapper: React.FC<AnimatedWrapperProps> = ({
  children,
  animation = 'fade',
  className = '',
  ...motionProps
}) => {
  const getAnimationProps = () => {
    switch (animation) {
      case 'page':
        return pageTransition;
      case 'fade':
        return fadeIn;
      case 'fadeUp':
        return fadeInUp;
      case 'scale':
        return scaleIn;
      default:
        return fadeIn;
  };

  return (
    <motion.div
      className={className}
      {...getAnimationProps()}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedWrapper;
}}