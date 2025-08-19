import React from 'react';
import { motion } from 'framer-motion';

interface PulseSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray' | 'success' | 'warning' | 'error';
  className?: string;

const PulseSpinner: React.FC<PulseSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20',
  };

  const colorClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    white: 'bg-white',
    gray: 'bg-gray-400',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
  };

  const pulseVariants = {
    start: {
      scale: 0,
      opacity: 1
    },
    end: {
      scale: 1,
      opacity: 0
  };

  return (
    <div className={`relative ${className}`} aria-label="Loading">
      <div className={`${sizeClasses[size]} relative`}>
        {[0, 1].map((index) => (
          <motion.div
            key={index}
            className={`absolute inset-0 ${colorClasses[color]} rounded-full`}
            variants={pulseVariants}
            initial="start"
            animate="end"
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 1,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default PulseSpinner;