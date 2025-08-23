import React, { Suspense, lazy } from 'react';

export interface LazyComponentProps {
  fallback?: React.ReactNode;
  placeholder?: string;
  className?: string;
}

export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) => {
  const LazyComponent = lazy(importFn);
  
  return (props: React.ComponentProps<T> & LazyComponentProps) => {
    const { fallback, placeholder, className, ...componentProps } = props;
    
    const defaultFallback = (
      <div className={className || 'flex items-center justify-center p-4'}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        {placeholder && <span className="ml-2">{placeholder}</span>}
      </div>
    );
    
    return (
      <Suspense fallback={fallback || defaultFallback}>
        <LazyComponent {...componentProps as React.ComponentProps<T>} />
      </Suspense>
    );
  };
};

export const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}> = ({ src, alt, className, placeholder }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(e) => {
        if (placeholder) {
          (e.target as HTMLImageElement).src = placeholder;
        }
      }}
    />
  );
};
