import React, { useState, useCallback, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  placeholder,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder || '');
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
    onError?.();
  }, [onError]);

  useEffect(() => {
    if (src) {
      setCurrentSrc(src);
    }
  }, [src]);

  const imageClasses = `
    transition-opacity duration-300
    ${isLoaded ? 'opacity-100' : 'opacity-0'}
    ${hasError ? 'hidden' : ''}
    ${className}
  `;

  return (
    <div className="relative overflow-hidden">
      {!isLoaded && !hasError && placeholder && (
        <div 
          className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`}
          style={{ width, height }}
        />
      )}
      
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={imageClasses}
        width={width}
        height={height}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {hasError && (
        <div 
          className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}
          style={{ width, height }}
        >
          <span className="text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;