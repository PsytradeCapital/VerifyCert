import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    x: -20
  },
  in: {
    opacity: 1,
    x: 0
  },
  out: {
    opacity: 0,
    x: 20
  }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3
};

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Custom animation variants to override default page transitions
   */
  variants?: typeof pageVariants;
  /**
   * Custom transition configuration
   */
  transition?: typeof pageTransition;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
  variants = pageVariants,
  transition = pageTransition
}) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={variants}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;