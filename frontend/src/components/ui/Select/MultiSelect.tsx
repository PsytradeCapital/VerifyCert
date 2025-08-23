import React, { useState, useRef, useEffect } from 'react';
import { designTokens } from '../../../styles/tokens';
import { SelectOption } from './Select';

export interface MultiSelectProps {
options: SelectOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  searchable?: boolean;
  maxSelections?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  'data-testid'?: string;

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value = [],
  onChange,
  placeholder = 'Select options',
  label,
  error,
  helperText,
  disabled = false,
  searchable = false,
  maxSelections,
  size = 'md',
  className = '',
  'data-testid': testId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOptions = options.filter(option => value.includes(option.value));
  
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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (searchable && !isOpen) {
        setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleOptionToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : maxSelections && value.length >= maxSelections
        ? value
        : [...value, optionValue];
    
    onChange?.(newValue);
  };

  const handleRemoveOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(value.filter(v => v !== optionValue));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.([]);
    setSearchTerm('');
  };

  const selectId = `multiselect-${Math.random().toString(36).substr(2, 9)}`;

  const sizeStyles = {
    sm: {
      button: 'px-2 py-1 text-sm min-h-8',
      tag: 'px-1.5 py-0.5 text-xs',
      dropdown: 'text-sm',
      input: 'px-2 py-1 text-sm'
    },
    md: {
      button: 'px-3 py-2 text-base min-h-10',
      tag: 'px-2 py-1 text-sm',
      dropdown: 'text-base',
      input: 'px-3 py-1 text-base'
    },
    lg: {
      button: 'px-4 py-3 text-lg min-h-12',
      tag: 'px-2.5 py-1.5 text-base',
      dropdown: 'text-lg',
      input: 'px-4 py-2 text-lg'
  };

  return (
    <div className={className} data-testid={testId}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative" ref={selectRef}>
        <button
          id={selectId}
          type="button"
          className={`
            relative w-full bg-white border border-neutral-300 rounded-lg text-left cursor-default
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            transition-colors duration-200 flex flex-wrap items-center gap-1
            ${sizeStyles[size].button}
            ${error 
              ? 'border-error-300 text-error-900 focus:ring-error-500 focus:border-error-500' 
              : 'text-neutral-900 hover:border-neutral-400'
            ${disabled 
              ? 'bg-neutral-50 text-neutral-500 cursor-not-allowed opacity-60' 
              : ''
          `}
          onClick={handleToggle}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="flex flex-wrap items-center gap-1 flex-1 min-w-0">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className={`
                    inline-flex items-center bg-primary-100 text-primary-800 rounded-md
                    ${sizeStyles[size].tag}
                  `}
                >
                  {option.icon && (
                    <span className="mr-1 flex-shrink-0">{option.icon}</span>
                  )}
                  <span className="truncate max-w-24">{option.label}</span>
                  {!disabled && (
                    <span
                      onClick={(e) => handleRemoveOption(option.value, e)}
                      className="ml-1 hover:bg-primary-200 rounded-full p-0.5 transition-colors duration-150 cursor-pointer"
                      aria-label={`Remove ${option.label}`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleRemoveOption(option.value, e);
                      }}
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                  )}
                </span>
              ))
            ) : (
              <span className="text-neutral-500 truncate">{placeholder}</span>
            )}
          </div>
          
          <div className="flex items-center ml-2">
            {selectedOptions.length > 0 && !disabled && (
              <span
                onClick={handleClearAll}
                className="mr-1 p-1 rounded-full hover:bg-neutral-100 transition-colors duration-150 cursor-pointer"
                aria-label="Clear all selections"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClearAll(e);
                }}
              >
                <svg className="h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            )}
            
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
          </div>
        </button>

        {isOpen && (
          <div 
            className="absolute z-dropdown mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg py-1 ring-1 ring-neutral-200 overflow-auto focus:outline-none"
            style={{ zIndex: designTokens.zIndex.dropdown }}
            role="listbox"
            aria-multiselectable="true"
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
            
            {maxSelections && (
              <div className="px-3 py-2 text-xs text-neutral-500 border-b border-neutral-100">
                {value.length} of {maxSelections} selected
              </div>
            )}
            
            {filteredOptions.length === 0 ? (
              <div className={`px-3 py-2 text-neutral-500 ${sizeStyles[size].dropdown}`}>
                {searchTerm ? 'No options found' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = value.includes(option.value);
                const isDisabled = option.disabled || (maxSelections && !isSelected && value.length >= maxSelections);
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`
                      w-full text-left px-3 py-2 transition-colors duration-150 flex items-center
                      ${sizeStyles[size].dropdown}
                      ${isDisabled
                        ? 'text-neutral-400 cursor-not-allowed'
                        : 'text-neutral-900 hover:bg-primary-50 hover:text-primary-900 cursor-pointer'
                      ${isSelected ? 'bg-primary-100 text-primary-900' : ''}
                    `}
                    onClick={() => !isDisabled && handleOptionToggle(option.value)}
                    disabled={isDisabled}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center mr-2">
                      <div className={`
                        w-4 h-4 border-2 rounded flex items-center justify-center
                        ${isSelected 
                          ? 'bg-primary-600 border-primary-600' 
                          : 'border-neutral-300'
                      `}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    
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
                  </button>
                );
              })
            )}
          </div>
        )}
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

export default MultiSelect;
}
}}}}}}}}}}