import React, { useState, useRef, useEffect } from 'react';
import { designTokens } from '../../../styles/tokens';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  divider?: boolean;
  onClick?: () => void;

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  disabled?: boolean;
  className?: string;
  'data-testid'?: string;

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  placement = 'bottom-start',
  disabled = false,
  className = '',
  'data-testid': testId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
  };

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled && item.onClick) {
      item.onClick();
      setIsOpen(false);
  };

  const placementStyles = {
    'bottom-start': 'top-full left-0 mt-1',
    'bottom-end': 'top-full right-0 mt-1',
    'top-start': 'bottom-full left-0 mb-1',
    'top-end': 'bottom-full right-0 mb-1'
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef} data-testid={testId}>
      <div
        onClick={handleToggle}
        className={`${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`
            absolute z-dropdown min-w-48 bg-white rounded-lg shadow-lg ring-1 ring-neutral-200 py-1
            ${placementStyles[placement]}
          `}
          style={{ zIndex: designTokens.zIndex.dropdown }}
          role="menu"
        >
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              {item.divider ? (
                <div className="border-t border-neutral-100 my-1" />
              ) : (
                <button
                  type="button"
                  className={`
                    w-full text-left px-3 py-2 text-sm transition-colors duration-150 flex items-center
                    ${item.disabled
                      ? 'text-neutral-400 cursor-not-allowed'
                      : 'text-neutral-900 hover:bg-primary-50 hover:text-primary-900 cursor-pointer'
                  `}
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  role="menuitem"
                >
                  {item.icon && (
                    <span className="mr-2 flex-shrink-0">{item.icon}</span>
                  )}
                  <span className="truncate">{item.label}</span>
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
}}}}}}}}