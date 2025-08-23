import React from 'react';
import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../../../utils/motion';

export interface PageTransitionProps {
}
}
}
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