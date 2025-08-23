import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

export interface FABAction {
id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

export interface FloatingActionButtonProps {
}
}
}
  actions?: FABAction[];
  mainIcon?: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'extended';
  label?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;

const positionClasses = {
  'bottom-right': 'fixed bottom-6 right-6',
  'bottom-left': 'fixed bottom-6 left-6',
  'top-right': 'fixed top-6 right-6',
  'top-left': 'fixed top-6 left-6'
};

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-14 h-14',
  lg: 'w-16 h-16'
};

const iconSizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-7 h-7'
};

const colorClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white'
};

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actions = [],
  mainIcon = <Plus className="w-6 h-6" />,
  position = 'bottom-right',
  size = 'md',
  variant = 'default',
  label,
  onClick,
  className = '',
  disabled = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMainClick = () => {
    if (actions.length > 0) {
      setIsExpanded(!isExpanded);
    } else if (onClick) {
      onClick();
  };

  const handleActionClick = (action: FABAction) => {
    if (!action.disabled) {
      action.onClick();
      setIsExpanded(false);
  };

  const mainButtonClasses = 
    ${positionClasses[position]}
    ${sizeClasses[size]}
    ${colorClasses.primary}
    rounded-full shadow-lg
    flex items-center justify-center
    transition-all duration-300 transform
    hover:scale-105 hover:shadow-xl
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    z-50
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${variant === 'extended' && label ? 'px-6 rounded-full' : ''}
    ${className}
  ;

  return (
    <>
      {/* Backdrop */}
      {isExpanded && actions.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
      {/* Action buttons */}
      {isExpanded && actions.length > 0 && (
        <div className={${positionClasses[position]} z-50}>
          <div className="flex flex-col-reverse items-end space-y-reverse space-y-3 mb-3">
            {actions.map((action, index) => (
              <div
                key={action.id}
                className="flex items-center space-x-3 animate-in slide-in-from-bottom-2 duration-200"
                style={{ animationDelay: ${index * 50}ms }
              >
                <span className="bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap shadow-lg">
                  {action.label}
                </span>
                <button
                  onClick={() => handleActionClick(action)}
                  disabled={action.disabled}
                  className={
                    w-12 h-12 rounded-full shadow-lg
                    flex items-center justify-center
                    transition-all duration-200 transform hover:scale-105
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${colorClasses[action.color || 'primary']}
                  }
                  aria-label={action.label}
                >
                  {action.icon}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Main FAB */}
      <button
        onClick={handleMainClick}
        disabled={disabled}
        className={mainButtonClasses}
        aria-label={label || 'Floating action button'}
        aria-expanded={isExpanded}
      >
        {variant === 'extended' && label ? (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{label}</span>
            <div className={transition-transform duration-300 ${isExpanded ? 'rotate-45' : ''}}>
              {isExpanded && actions.length > 0 ? <X className={iconSizeClasses[size]} /> : mainIcon}
            </div>
          </div>
        ) : (
          <div className={transition-transform duration-300 ${isExpanded ? 'rotate-45' : ''}}>
            {isExpanded && actions.length > 0 ? <X className={iconSizeClasses[size]} /> : mainIcon}
          </div>
        )}
      </button>
    </>
  );
};
}