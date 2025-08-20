import React from 'react';
import { motion } from 'framer-motion';

interface DotsSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white' | 'gray' | 'success' | 'warning' | 'error';
  className?: string;

const DotsSpinner: React.FC<DotsSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
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

  const bounceVariants = {
    start: {
      y: "0%"
    },
    end: {
      y: "100%"
  };

  const bounceTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut"
  };

  return (
    <div className={`flex space-x-1 ${className}`} aria-label="Loading">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full`}
          variants={bounceVariants}
          initial="start"
          animate="end"
          transition={{
            ...bounceTransition,
            delay: index * 0.1
          }}
        />
      ))}
    </div>
  );
};

export default DotsSpinner;
}}