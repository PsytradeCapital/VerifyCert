import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray' | 'success' | 'warning' | 'error';
  className?: string;
  speed?: 'slow' | 'normal' | 'fast';

const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  color = 'primary',
  className = '',
  speed = 'normal'
}) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    gray: 'text-gray-400',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
  };

  const speedDuration = {
    slow: 2,
    normal: 1,
    fast: 0.5,
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: speedDuration[speed],
        repeat: Infinity,
        ease: "linear"
      }}
      className={`inline-block ${className}`}
    >
      <Loader2 
        className={`${sizeClasses[size]} ${colorClasses[color]}`}
        aria-label="Loading"
      />
    </motion.div>
  );
};

export default Spinner;
}