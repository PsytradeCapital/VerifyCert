import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './PageTransition';

export interface AnimatedRoutesProps {
  children: React.ReactNode;
  /**
   * Whether to enable exit animations when navigating away from routes
   */
  exitBeforeEnter?: boolean;
  /**
   * Custom className for the page transition wrapper
   */
  className?: string;
}

/**
 * AnimatedRoutes component that wraps React Router Routes with page transitions
 * Uses Framer Motion's AnimatePresence to handle enter/exit animations
 */
const AnimatedRoutes: React.FC<AnimatedRoutesProps> = ({
  children,
  exitBeforeEnter = true,
  className = ''
}) => {
  const location = useLocation();

  return (
    <AnimatePresence mode={exitBeforeEnter ? 'wait' : 'sync'}>
      <PageTransition key={location.pathname} className={className}>
        {children}
      </PageTransition>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;