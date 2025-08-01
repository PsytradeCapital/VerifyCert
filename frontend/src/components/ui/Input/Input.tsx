import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { inputInteractions } from '../../../utils/interactionAnimations';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  validationState?: 'default' | 'success' | 'error';
  enableAnimations?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  icon,
  validationState = 'default',
  className = '',
  enableAnimations = true,
  ...props
}, ref) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors';
  
  const stateClasses = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
    success: 'border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200',
    error: 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
  };

  const currentState = error ? 'error' : validationState;
  const animationProps = enableAnimations ? inputInteractions[currentState] || inputInteractions.default : {};

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400">
              {icon}
            </div>
          </div>
        )}
        
        <motion.input
          ref={ref}
          className={`
            ${baseClasses}
            ${stateClasses[currentState]}
            ${icon ? 'pl-10' : ''}
            ${className}
          `}
          {...animationProps}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;