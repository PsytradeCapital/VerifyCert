import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { designTokens } from '../../../styles/tokens';
import { selectInteractions } from '../../../utils/interactionAnimations';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
  className?: string;
  'data-testid'?: string;
  enableAnimations?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  helperText,
  disabled = false,
  searchable = false,
  clearable = false,
  loading = false,
  size = 'md',
  variant = 'default',
  className = '',
  'data-testid': testId,
  enableAnimations = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(option => option.value === value);
  
  const filteredOptions = searchable
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (searchable && !isOpen) {
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }
  };

  const handleOptionSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.('');
    setSearchTerm('');
  };

  const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;

  // Size-based styles
  const sizeStyles = {
    sm: {
      button: 'px-2 py-1 text-sm',
      dropdown: 'text-sm',
      input: 'px-2 py-1 text-sm'
    },
    md: {
      button: 'px-3 py-2 text-base',
      dropdown: 'text-base',
      input: 'px-3 py-1 text-base'
    },
    lg: {
      button: 'px-4 py-3 text-lg',
      dropdown: 'text-lg',
      input: 'px-4 py-2 text-lg'
    }
  };

  // Variant-based styles
  const variantStyles = {
    default: {
      button: 'bg-white border border-neutral-300 hover:border-neutral-400',
      focus: 'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
    },
    outlined: {
      button: 'bg-transparent border-2 border-neutral-300 hover:border-primary-400',
      focus: 'focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
    },
    filled: {
      button: 'bg-neutral-50 border border-transparent hover:bg-neutral-100',
      focus: 'focus:ring-2 focus:ring-primary-500 focus:bg-white focus:border-primary-500'
    }
  };

  return (
    <div className={className} data-testid={testId}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative" ref={selectRef}>
        <motion.button
          id={selectId}
          type="button"
          className={`
            relative w-full rounded-lg text-left cursor-default
            focus:outline-none
            ${sizeStyles[size].button}
            ${variantStyles[variant].button}
            ${variantStyles[variant].focus}
            ${error 
              ? 'border-error-300 text-error-900 focus:ring-error-500 focus:border-error-500' 
              : 'text-neutral-900'
            }
            ${disabled 
              ? 'bg-neutral-50 text-neutral-500 cursor-not-allowed opacity-60' 
              : ''
            }
            ${loading ? 'cursor-wait' : ''}
          `}
          onClick={handleToggle}
          disabled={disabled || loading}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          {...(enableAnimations && !disabled && !loading ? selectInteractions.trigger : {})}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              {selectedOption?.icon && (
                <span className="mr-2 flex-shrink-0">{selectedOption.icon}</span>
              )}
              <span className="block truncate">
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>
            
            <div className="flex items-center ml-2">
              {clearable && selectedOption && !disabled && !loading && (
                <span
                  onClick={handleClear}
                  className="mr-1 p-1 rounded-full hover:bg-neutral-100 transition-colors duration-150 cursor-pointer"
                  aria-label="Clear selection"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleClear(e);
                    }
                  }}
                >
                  <svg className="h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
              )}
              
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg
                  className={`h-5 w-5 text-neutral-400 transition-transform duration-200 ${
                    isOpen ? 'transform rotate-180' : ''
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              className="absolute z-dropdown mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg py-1 ring-1 ring-neutral-200 overflow-auto focus:outline-none"
              style={{ zIndex: designTokens.zIndex.dropdown }}
              role="listbox"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
            {searchable && (
              <div className="px-2 py-2 border-b border-neutral-100">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    className={`
                      w-full border border-neutral-300 rounded-md 
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                      transition-colors duration-200
                      ${sizeStyles[size].input}
                    `}
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <svg 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            )}
            
            {filteredOptions.length === 0 ? (
              <div className={`px-3 py-2 text-neutral-500 ${sizeStyles[size].dropdown}`}>
                {searchTerm ? 'No options found' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <motion.button
                  key={option.value}
                  type="button"
                  className={`
                    w-full text-left px-3 py-2 flex items-center
                    ${sizeStyles[size].dropdown}
                    ${option.disabled
                      ? 'text-neutral-400 cursor-not-allowed'
                      : 'text-neutral-900 cursor-pointer'
                    }
                    ${option.value === value ? 'bg-primary-100 text-primary-900' : ''}
                  `}
                  onClick={() => !option.disabled && handleOptionSelect(option.value)}
                  disabled={option.disabled}
                  role="option"
                  aria-selected={option.value === value}
                  {...(enableAnimations && !option.disabled ? selectInteractions.option : {})}
                >
                  {option.icon && (
                    <span className="mr-2 flex-shrink-0">{option.icon}</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-neutral-500 truncate mt-0.5">
                        {option.description}
                      </div>
                    )}
                  </div>
                  {option.value === value && (
                    <svg className="ml-2 h-4 w-4 text-primary-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </motion.button>
              ))
            )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p className="mt-1 text-sm text-error-600 flex items-center">
          <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-neutral-500">{helperText}</p>
      )}
    </div>
  );
};

export default Select;