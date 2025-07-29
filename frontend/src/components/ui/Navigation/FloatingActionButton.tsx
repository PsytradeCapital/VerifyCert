import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigation } from '../../../contexts/NavigationContext';

export interface FloatingActionButtonProps {
  icon: React.ReactNode;
  label?: string;
  href?: string;
  onClick?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'accent';
  className?: string;
  disabled?: boolean;
  badge?: string | number;
  tooltip?: string;
  useContext?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  label,
  href,
  onClick,
  position = 'bottom-right',
  size = 'md',
  variant = 'primary',
  className = '',
  disabled = false,
  badge,
  tooltip,
  useContext = true
}) => {
  const navigationContext = useContext ? useNavigation() : null;

  // Position classes
  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'bottom-center': 'fixed bottom-6 left-1/2 transform -translate-x-1/2'
  };

  // Size classes
  const sizeClasses = {
    sm: 'h-12 w-12 text-sm',
    md: 'h-14 w-14 text-base',
    lg: 'h-16 w-16 text-lg'
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/25',
    secondary: 'bg-neutral-600 hover:bg-neutral-700 text-white shadow-neutral-500/25',
    accent: 'bg-accent-600 hover:bg-accent-700 text-white shadow-accent-500/25'
  };

  const baseClasses = `
    inline-flex items-center justify-center
    rounded-full shadow-lg hover:shadow-xl
    transition-all duration-300 ease-out
    focus:outline-none focus:ring-4 focus:ring-offset-2
    transform hover:scale-105 active:scale-95
    z-50 relative
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${positionClasses[position]}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `;

  const content = (
    <>
      <span className="flex items-center justify-center">
        {icon}
      </span>
      
      {/* Badge */}
      {badge && (
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center min-w-5 font-semibold animate-pulse">
          {typeof badge === 'number' && badge > 99 ? '99+' : badge}
        </span>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-neutral-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
            {tooltip}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900"></div>
          </div>
        </div>
      )}

      {/* Extended label for larger sizes */}
      {label && size === 'lg' && (
        <span className="ml-3 font-medium">
          {label}
        </span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} group`}
        aria-label={label || tooltip || 'Floating action button'}
      >
        {content}
      </button>
    );
  }

  if (href) {
    return (
      <Link
        to={href}
        className={`${baseClasses} group ${disabled ? 'pointer-events-none' : ''}`}
        onClick={(e) => {
          if (disabled) {
            e.preventDefault();
            return;
          }
          // Use navigation context if available
          if (navigationContext) {
            e.preventDefault();
            navigationContext.actions.navigateTo(href);
          }
        }}
        aria-label={label || tooltip || 'Floating action button'}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={`${baseClasses} group`}
      aria-label={label || tooltip || 'Floating action button'}
    >
      {content}
    </div>
  );
};

export default FloatingActionButton;