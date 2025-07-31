import React from 'react';
import { motion } from 'framer-motion';
import { buttonInteractions } from '../../../utils/interactionAnimations';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  enableAnimations?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled,
  enableAnimations = true,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg focus:outline-none';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white focus:ring-blue-500 disabled:bg-blue-300',
    secondary: 'bg-gray-100 text-gray-900 focus:ring-gray-500 disabled:bg-gray-50 disabled:text-gray-400',
    tertiary: 'bg-transparent text-blue-600 focus:ring-blue-500 disabled:text-blue-300',
    danger: 'bg-red-600 text-white focus:ring-red-500 disabled:bg-red-300'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const isDisabled = disabled || loading;

  // Get animation props based on variant and animation settings
  const animationProps = enableAnimations && !isDisabled 
    ? buttonInteractions[variant] || buttonInteractions.primary
    : {};

  const MotionButton = motion.button;

  return (
    <MotionButton
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClass}
        ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      disabled={isDisabled}
      {...animationProps}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </MotionButton>
  );
};

export default Button;