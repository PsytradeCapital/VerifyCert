import React, { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
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
  className?: string;
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
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(option => option.value === value);
  
  const filteredOptions = searchable
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
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

  const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative" ref={selectRef}>
        <button
          id={selectId}
          type="button"
          className={`
            relative w-full bg-white border rounded-lg pl-3 pr-10 py-2 text-left cursor-default
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-colors duration-200
            ${error 
              ? 'border-red-300 text-red-900' 
              : 'border-gray-300 text-gray-900'
            }
            ${disabled 
              ? 'bg-gray-50 text-gray-500 cursor-not-allowed' 
              : 'hover:border-gray-400'
            }
          `}
          onClick={handleToggle}
          disabled={disabled}
        >
          <span className="block truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
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
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
            {searchable && (
              <div className="px-2 py-2">
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
            
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`
                    w-full text-left px-3 py-2 text-sm transition-colors duration-150
                    ${option.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-900 hover:bg-blue-50 hover:text-blue-900 cursor-pointer'
                    }
                    ${option.value === value ? 'bg-blue-100 text-blue-900' : ''}
                  `}
                  onClick={() => !option.disabled && handleOptionSelect(option.value)}
                  disabled={option.disabled}
                >
                  {option.label}
                </button>
              ))
            )}
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

export default Select;