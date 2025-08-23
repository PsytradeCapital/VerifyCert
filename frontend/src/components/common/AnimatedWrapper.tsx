import React, { ReactNode } from 'react';

interface AnimatedWrapperProps {
  children: ReactNode;
  animation?: 'fadeIn' | 'slideIn' | 'scaleIn';
  duration?: number;
  delay?: number;
  className?: string;
}

const AnimatedWrapper: React.FC<AnimatedWrapperProps> = ({
  children,
  animation = 'fadeIn',
  duration = 300,
  delay = 0,
  className = ''
}) => {
  const getAnimationClass = () => {
    switch (animation) {
      case 'slideIn':
        return 'animate-slide-in';
      case 'scaleIn':
        return 'animate-scale-in';
      default:
        return 'animate-fade-in';
    }
  };

  return (
    <div 
      className={`${getAnimationClass()} ${className}`}
      style={{
        animationDuration: `${duration}ms`,
        animationDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedWrapper;
