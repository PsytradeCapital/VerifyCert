import React from 'react';

export interface FloatingActionButtonProps {
  icon: React.ReactNode;
  label?: string;
  onClick?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  label,
  onClick,
  position = 'bottom-right',
  size = 'md',
  className = '',
  disabled = false
}) => {
  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'bottom-center': 'fixed bottom-6 left-1/2 transform -translate-x-1/2'
  };

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-14 w-14',
    lg: 'h-16 w-16'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${positionClasses[position]} ${sizeClasses[size]} bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 z-50 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      aria-label={label}
    >
      {icon}
    </button>
  );
};

export default FloatingActionButton;
export type { FloatingActionButtonProps };
export { FloatingActionButton };