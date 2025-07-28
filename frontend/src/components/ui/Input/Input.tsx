import React, { useState } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'floating';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  variant = 'default',
  icon,
  iconPosition = 'left',
  className = '',
  id,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

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

  const baseInputClasses = `
    block w-full rounded-lg border transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
  `;

  const inputClasses = error
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500'
    : 'border-gray-300 text-gray-900 placeholder-gray-400';

  const paddingClasses = icon
    ? iconPosition === 'left' ? 'pl-10 pr-3' : 'pl-3 pr-10'
    : 'px-3';

  if (variant === 'floating') {
    return (
      <div className={`relative ${className}`}>
        <input
          {...props}
          id={inputId}
          className={`
            ${baseInputClasses}
            ${inputClasses}
            ${paddingClasses}
            py-3
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
              absolute left-3 transition-all duration-200 pointer-events-none
              peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
              peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-600
              ${hasValue || focused ? 'top-1 text-xs text-blue-600' : 'top-3 text-base text-gray-400'}
              ${error ? 'peer-focus:text-red-600' : ''}
            `}
          >
            {label}
          </label>
        )}

        {icon && (
          <div className={`absolute inset-y-0 ${iconPosition === 'left' ? 'left-0' : 'right-0'} pl-3 flex items-center pointer-events-none`}>
            <span className="text-gray-400 h-5 w-5">{icon}</span>
          </div>
        )}

        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          {...props}
          id={inputId}
          className={`
            ${baseInputClasses}
            ${inputClasses}
            ${paddingClasses}
            py-2
          `}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
        />

        {icon && (
          <div className={`absolute inset-y-0 ${iconPosition === 'left' ? 'left-0' : 'right-0'} pl-3 flex items-center pointer-events-none`}>
            <span className="text-gray-400 h-5 w-5">{icon}</span>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;