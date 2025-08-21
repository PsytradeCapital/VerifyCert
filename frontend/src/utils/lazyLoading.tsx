import React from 'react';

export interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;

export const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  placeholder = 'Loading...', 
  className = '',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return <div className={className}>Failed to load image</div>;

  return (
    <div className={className}>
      {!isLoaded && <div>{placeholder}</div>
      <img
        {...props}
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        style={{ display: isLoaded ? 'block' : 'none' }}
      />
    </div>
  );
};

export default LazyImage;