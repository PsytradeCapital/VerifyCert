import React, { useState, useRef, useEffect } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'floating';
  validationState?: 'default' | 'success' | 'error' | 'warning';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  showValidationIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  variant = 'floating',
  validationState = 'default',
  icon,
  iconPosition = 'left',
  showValidationIcon = true,
  size = 'md',
  className = '',
  id,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  // Update hasValue when props.value changes (controlled component)
  useEffect(() => {
    setHasValue(!!props.value);
  }, [props.value]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(!!e.target.value);
    props.onChange?.(e);
  };

  // Determine validation state (error prop overrides validationState)
  const currentValidationState = error ? 'error' : validationState;

  // Validation icons
  const ValidationIcon = () => {
    if (!showValidationIcon || currentValidationState === 'default') return null;
    
    const iconClasses = "h-5 w-5 transition-colors duration-200";
    
    switch (currentValidationState) {
      case 'success':
        return (
          <svg className={`${iconClasses} text-success-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className={`${iconClasses} text-error-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className={`${iconClasses} text-warning-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      input: 'py-2 text-sm',
      floating: 'py-2.5',
      icon: 'h-4 w-4',
      iconContainer: 'pl-2.5',
      padding: icon ? (iconPosition === 'left' ? 'pl-8 pr-3' : 'pl-3 pr-8') : 'px-3'
    },
    md: {
      input: 'py-2.5 text-base',
      floating: 'py-3',
      icon: 'h-5 w-5',
      iconContainer: 'pl-3',
      padding: icon ? (iconPosition === 'left' ? 'pl-10 pr-3' : 'pl-3 pr-10') : 'px-3'
    },
    lg: {
      input: 'py-3 text-lg',
      floating: 'py-4',
      icon: 'h-6 w-6',
      iconContainer: 'pl-4',
      padding: icon ? (iconPosition === 'left' ? 'pl-12 pr-4' : 'pl-4 pr-12') : 'px-4'
    }
  };

  const currentSize = sizeConfig[size];

  // Base input classes with enhanced styling
  const baseInputClasses = `
    block w-full rounded-lg border transition-all duration-300 ease-in-out
    focus:outline-none focus:ring-2 focus:border-transparent
    disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed
    disabled:border-neutral-200 disabled:shadow-none
    placeholder:text-neutral-400 placeholder:transition-colors
    ${currentSize.input}
  `;

  // Validation state styling
  const getValidationClasses = () => {
    const baseClasses = 'bg-white text-neutral-900';
    
    switch (currentValidationState) {
      case 'success':
        return `${baseClasses} border-success-300 focus:ring-success-500 focus:border-success-500`;
      case 'error':
        return `${baseClasses} border-error-300 focus:ring-error-500 focus:border-error-500 text-error-900`;
      case 'warning':
        return `${baseClasses} border-warning-300 focus:ring-warning-500 focus:border-warning-500`;
      default:
        return `${baseClasses} border-neutral-300 focus:ring-primary-500 focus:border-primary-500 hover:border-neutral-400`;
    }
  };

  // Padding classes accounting for icons and validation icons
  const hasRightIcon = (icon && iconPosition === 'right') || showValidationIcon;
  const paddingClasses = icon && iconPosition === 'left' 
    ? hasRightIcon ? 'pl-10 pr-10' : 'pl-10 pr-3'
    : hasRightIcon ? 'pl-3 pr-10' : 'px-3';

  if (variant === 'floating') {
    return (
      <div className={`relative ${className}`}>
        <input
          {...props}
          ref={inputRef}
          id={inputId}
          className={`
            ${baseInputClasses}
            ${getValidationClasses()}
            ${paddingClasses}
            ${currentSize.floating}
            peer
            placeholder-transparent
          `}
          placeholder={label}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
        />
        
        {label && (
          <label
            htmlFor={inputId}
            className={`
              absolute left-3 transition-all duration-300 ease-in-out pointer-events-none
              select-none font-medium
              peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-neutral-400
              peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-semibold
              ${hasValue || focused 
                ? 'top-2 translate-y-0 text-xs font-semibold' 
                : 'top-1/2 -translate-y-1/2 text-base text-neutral-400'
              }
              ${currentValidationState === 'success' && (focused || hasValue) ? 'text-success-600' : ''}
              ${currentValidationState === 'error' && (focused || hasValue) ? 'text-error-600' : ''}
              ${currentValidationState === 'warning' && (focused || hasValue) ? 'text-warning-600' : ''}
              ${currentValidationState === 'default' && (focused || hasValue) ? 'text-primary-600' : ''}
            `}
          >
            {label}
          </label>
        )}

        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <div className={`absolute inset-y-0 left-0 ${currentSize.iconContainer} flex items-center pointer-events-none`}>
            <span className={`text-neutral-400 ${currentSize.icon} transition-colors duration-200`}>
              {icon}
            </span>
          </div>
        )}

        {/* Right Icon or Validation Icon */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          {icon && iconPosition === 'right' && (
            <span className={`text-neutral-400 ${currentSize.icon} transition-colors duration-200 mr-2`}>
              {icon}
            </span>
          )}
          <ValidationIcon />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-2 flex items-start">
            <svg className="h-4 w-4 text-error-500 mt-0.5 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-error-600 font-medium">{error}</p>
          </div>
        )}
        
        {/* Helper Text */}
        {helperText && !error && (
          <p className={`mt-2 text-sm transition-colors duration-200 ${
            currentValidationState === 'success' ? 'text-success-600' :
            currentValidationState === 'warning' ? 'text-warning-600' :
            'text-neutral-500'
          }`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }

  // Default variant (traditional label above input)
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-neutral-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          {...props}
          ref={inputRef}
          id={inputId}
          className={`
            ${baseInputClasses}
            ${getValidationClasses()}
            ${paddingClasses}
          `}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
        />

        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <div className={`absolute inset-y-0 left-0 ${currentSize.iconContainer} flex items-center pointer-events-none`}>
            <span className={`text-neutral-400 ${currentSize.icon} transition-colors duration-200`}>
              {icon}
            </span>
          </div>
        )}

        {/* Right Icon or Validation Icon */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          {icon && iconPosition === 'right' && (
            <span className={`text-neutral-400 ${currentSize.icon} transition-colors duration-200 mr-2`}>
              {icon}
            </span>
          )}
          <ValidationIcon />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 flex items-start">
          <svg className="h-4 w-4 text-error-500 mt-0.5 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-error-600 font-medium">{error}</p>
        </div>
      )}
      
      {/* Helper Text */}
      {helperText && !error && (
        <p className={`mt-2 text-sm transition-colors duration-200 ${
          currentValidationState === 'success' ? 'text-success-600' :
          currentValidationState === 'warning' ? 'text-warning-600' :
          'text-neutral-500'
        }`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;