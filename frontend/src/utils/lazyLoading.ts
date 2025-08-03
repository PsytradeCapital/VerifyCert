import React, { lazy, ComponentType, LazyExoticComponent } from 'react';
import { monitorLazyLoading } from './performanceMonitoring';

/**
 * Utility for creating lazy-loaded components with error boundaries
 */
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ComponentType,
  componentName?: string
): LazyExoticComponent<T> => {
  return lazy(async () => {
    const monitor = componentName ? monitorLazyLoading.component(componentName) : null;
    
    try {
      monitor?.onStart();
      const module = await importFn();
      monitor?.onEnd(true);
      return module;
    } catch (error) {
      monitor?.onEnd(false);
      console.error('Failed to load component:', error);
      // Return a fallback component if loading fails
      if (fallback) {
        return { default: fallback as T };
      }
      throw error;
    }
  });
};

/**
 * Lazy image loading hook with intersection observer
 */
export const useLazyImage = (src: string, options?: IntersectionObserverInit) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [options]);

  React.useEffect(() => {
    if (isInView && !isLoaded) {
      const img = new Image();
      img.onload = () => setIsLoaded(true);
      img.onerror = () => setIsLoaded(false);
      img.src = src;
    }
  }, [isInView, isLoaded, src]);

  return {
    ref: imgRef,
    src: isInView && isLoaded ? src : undefined,
    isLoaded: isLoaded && isInView,
    isInView,
  };
};

/**
 * Lazy image component with loading states
 */
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  loadingComponent?: React.ComponentType;
  errorComponent?: React.ComponentType<{ retry: () => void }>;
  observerOptions?: IntersectionObserverInit;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallbackSrc,
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  observerOptions,
  className = '',
  ...props
}) => {
  const [loadState, setLoadState] = React.useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = React.useState<string | undefined>();
  const imgRef = React.useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = React.useState(false);

  // Intersection observer for lazy loading
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...observerOptions,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [observerOptions]);

  // Load image when in view
  React.useEffect(() => {
    if (!isInView) return;

    const monitor = monitorLazyLoading.image(src);
    monitor.onStart();

    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(src);
      setLoadState('loaded');
      monitor.onEnd(true, img.naturalWidth * img.naturalHeight);
    };
    
    img.onerror = () => {
      if (fallbackSrc && fallbackSrc !== src) {
        // Try fallback image
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          setCurrentSrc(fallbackSrc);
          setLoadState('loaded');
          monitor.onEnd(true);
        };
        fallbackImg.onerror = () => {
          setLoadState('error');
          monitor.onEnd(false);
        };
        fallbackImg.src = fallbackSrc;
      } else {
        setLoadState('error');
        monitor.onEnd(false);
      }
    };
    
    img.src = src;
  }, [isInView, src, fallbackSrc]);

  const retry = () => {
    setLoadState('loading');
    setCurrentSrc(undefined);
    // Trigger reload by toggling isInView
    setIsInView(false);
    setTimeout(() => setIsInView(true), 100);
  };

  if (loadState === 'loading' || !isInView) {
    return (
      <div 
        ref={imgRef}
        className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
        {...props}
      >
        {LoadingComponent ? (
          <LoadingComponent />
        ) : (
          <svg 
            className="w-8 h-8 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        )}
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div 
        className={`bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-4 ${className}`}
        {...props}
      >
        {ErrorComponent ? (
          <ErrorComponent retry={retry} />
        ) : (
          <>
            <svg 
              className="w-8 h-8 text-gray-400 mb-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
            <p className="text-sm text-gray-500 mb-2">Failed to load image</p>
            <button
              onClick={retry}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Retry
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={className}
      {...props}
    />
  );
};

/**
 * Component lazy loading with suspense boundary
 */
interface LazyComponentWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export const LazyComponentWrapper: React.FC<LazyComponentWrapperProps> = ({
  children,
  fallback,
  errorFallback: ErrorFallback,
}) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const retry = () => {
    setHasError(false);
    setError(null);
  };

  if (hasError && error && ErrorFallback) {
    return <ErrorFallback error={error} retry={retry} />;
  }

  return (
    <React.Suspense 
      fallback={
        fallback || (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )
      }
    >
      <ErrorBoundary onError={(error) => {
        setError(error);
        setHasError(true);
      }}>
        {children}
      </ErrorBoundary>
    </React.Suspense>
  );
};

/**
 * Simple error boundary for lazy components
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: Error) => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return null; // Let parent handle error display
    }

    return this.props.children;
  }
}

