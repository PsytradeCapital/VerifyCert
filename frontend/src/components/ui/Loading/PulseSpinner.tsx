import React from 'react';

interface PulseSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PulseSpinner: React.FC<PulseSpinnerProps> = ({
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="w-full h-full bg-blue-600 rounded-full animate-pulse"></div>
    </div>
  );
};

export default PulseSpinner;