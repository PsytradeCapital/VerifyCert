import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

export interface FABAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export interface FloatingActionButtonProps {
  actions?: FABAction[];
  mainIcon?: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'extended';
  label?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

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

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actions = [],
  mainIcon = <Plus />,
  position = 'bottom-right',
  size = 'md',
  variant = 'default',
  label,
  onClick,
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleMainClick = () => {
    if (actions.length > 0) {
      setIsOpen(!isOpen);
    } else if (onClick) {
      onClick();
    }
  };

  const handleActionClick = (action: FABAction) => {
    if (!action.disabled) {
      action.onClick();
      setIsOpen(false);
    }
  };

  const mainButtonClasses = `
    ${positionClasses[position]}
    ${sizeClasses[size]}
    ${colorClasses.primary}
    ${variant === 'extended' && label ? 'px-6 w-auto' : ''}
    rounded-full shadow-lg hover:shadow-xl
    flex items-center justify-center
    transition-all duration-200 ease-in-out
    transform hover:scale-105 active:scale-95
    z-50
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `.trim();

  return (
    <div className="relative">
      {/* Action buttons */}
      {actions.length > 0 && isOpen && (
        <div className={`${positionClasses[position]} mb-20 space-y-3 z-40`}>
          {actions.map((action, index) => (
            <div
              key={action.id}
              className="flex items-center space-x-3"
              style={{
                animation: `fadeInUp 0.2s ease-out ${index * 0.05}s both`
              }}
            >
              <span className="bg-black bg-opacity-75 text-white text-sm px-2 py-1 rounded whitespace-nowrap">
                {action.label}
              </span>
              <button
                onClick={() => handleActionClick(action)}
                disabled={action.disabled}
                className={`
                  w-12 h-12 rounded-full shadow-lg hover:shadow-xl
                  flex items-center justify-center
                  transition-all duration-200 ease-in-out
                  transform hover:scale-105 active:scale-95
                  ${colorClasses[action.color || 'primary']}
                  ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="w-5 h-5">
                  {action.icon}
                </div>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main button */}
      <button
        onClick={handleMainClick}
        disabled={disabled}
        className={mainButtonClasses}
      >
        <div className={`${iconSizeClasses[size]} transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}>
          {isOpen && actions.length > 0 ? <X /> : mainIcon}
        </div>
        {variant === 'extended' && label && (
          <span className="ml-2 font-medium">{label}</span>
        )}
      </button>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingActionButton;