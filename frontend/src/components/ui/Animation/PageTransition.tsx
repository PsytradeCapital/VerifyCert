import React from 'react';

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = ''
}) => {
  return (
    <div
      className={`
        transition-all duration-300 ease-in-out
        animate-in fade-in slide-in-from-bottom-2
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default PageTransition;