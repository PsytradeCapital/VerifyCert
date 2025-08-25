import React from 'react';

/**
 * Lazy-loaded logo component
 */
interface LazyLogoProps {
  className?: string;
  alt?: string;
}

export const LazyLogo: React.FC<LazyLogoProps> = ({ 
  className = "h-8 w-auto", 
  alt = "VerifyCert Logo"
}) => {
  return (
    <img
      src="/icon.svg"
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
};

/**
 * Lazy-loaded screenshot component for PWA
 */
interface LazyScreenshotProps {
  type: 'narrow' | 'wide';
  className?: string;
}

export const LazyScreenshot: React.FC<LazyScreenshotProps> = ({ 
  type, 
  className = "" 
}) => {
  const src = type === 'narrow' ? '/screenshot-narrow.png' : '/screenshot-wide.png';
  
  return (
    <img
      src={src}
      alt={`VerifyCert ${type} screenshot`}
      className={className}
      loading="lazy"
    />
  );
};