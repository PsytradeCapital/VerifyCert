import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Spinner from './Spinner';
import DotsSpinner from './DotsSpinner';
import PulseSpinner from './PulseSpinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
  className?: string;
  spinnerType?: 'spinner' | 'dots' | 'pulse';
  backdrop?: 'light' | 'dark' | 'blur';
  size?: 'sm' | 'md' | 'lg';
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  children,
  className = '',
  spinnerType = 'spinner',
  backdrop = 'light',
  size = 'md'
}) => {
  const backdropClasses = {
    light: 'bg-white bg-opacity-75',
    dark: 'bg-gray-900 bg-opacity-50',
    blur: 'bg-white bg-opacity-75 backdrop-blur-sm',
  };

  const renderSpinner = () => {
    switch (spinnerType) {
      case 'dots':
        return <DotsSpinner size={size} />;
      case 'pulse':
        return <PulseSpinner size={size} />;
      default:
        return <Spinner size={size === 'sm' ? 'md' : size === 'md' ? 'lg' : 'xl'} />;
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const contentVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { delay: 0.1 }
    },
    exit: { scale: 0.8, opacity: 0 }
  };

  return (
    <div className={`relative ${className}`}>
      {children}
      
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className={`absolute inset-0 ${backdropClasses[backdrop]} flex items-center justify-center z-50 rounded-md`}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="flex flex-col items-center space-y-3"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {renderSpinner()}
              {message && (
                <p className={`font-medium ${backdrop === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                  {message}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoadingOverlay;