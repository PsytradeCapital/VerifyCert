import React, { forwardRef } from 'react';
import { createFieldRelationships, ariaLabels } from '../../../utils/ariaUtils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
}
}
}
}
}
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  validationState?: 'default' | 'success' | 'error';
  enableAnimations?: boolean;
  fieldName?: string;

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  icon,
  validationState = 'default',
  className = '',
  enableAnimations = true,
  fieldName,
  required,
  ...props
}, ref) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors';
  
  const stateClasses = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
    success: 'border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200',
    error: 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
  };

  const currentState = error ? 'error' : validationState;
  
  // Create field relationships for accessibility
  const fieldRelationships = fieldName ? createFieldRelationships(fieldName) : null;
  const inputId = props.id || fieldRelationships?.labelId || `input-${Math.random().toString(36).substring(2, 11)}`;

  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={inputId}
          id={fieldRelationships?.labelId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label={ariaLabels.forms.required}>
              *
            </span>
          )}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400" aria-hidden="true">
              {icon}
            </div>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={`
            ${baseClasses}
            ${stateClasses[currentState]}
            ${icon ? 'pl-10' : ''}
            ${enableAnimations ? 'transition-all duration-200 ease-in-out' : ''}
            ${className}
          `}
          aria-required={required}
          {...(fieldRelationships ? fieldRelationships.getInputProps(!!error, !!helperText) : {})}
          {...props}
        />
      </div>
      
      {error && (
        <p 
          id={fieldRelationships?.errorId}
          className="text-sm text-red-600 flex items-center"
          role="alert"
          aria-live="polite"
        >
          <svg 
            className="mr-1 h-4 w-4" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p 
          id={fieldRelationships?.helpId}
          className="text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;