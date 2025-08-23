import React from 'react';
import { useEffect, useState } from 'react';
import { initializeWebPOptimization, webpCache } from '../utils/webpGenerator';
import { isWebPSupported } from '../utils/imageOptimization';

/**
 * Hook to manage image optimization initialization and state
 */
export const useImageOptimization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [webpSupported, setWebpSupported] = useState<boolean | null>(null);
  const [cacheSize, setCacheSize] = useState(0);

  useEffect(() => {
    const initializeOptimization = async () => {
      try {
        // Check WebP support
        const supported = await isWebPSupported();
        setWebpSupported(supported);

        // Initialize WebP optimization if supported
        if (supported) {
          await initializeWebPOptimization();
          setCacheSize(webpCache.size());

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize image optimization:', error);
        setIsInitialized(true); // Still mark as initialized to prevent blocking
    };

    initializeOptimization();

    // Cleanup on unmount
    return () => {
      webpCache.clear();
    };
  }, []);

  return {
    isInitialized,
    webpSupported,
    cacheSize,
  };
};

/**
 * Hook to get optimized image URL with WebP fallback
 */
export const useOptimizedImage = (originalUrl: string) => {
  const [optimizedUrl, setOptimizedUrl] = useState<string>(originalUrl);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getOptimizedUrl = async () => {
      try {
        setIsLoading(true);
        const webpUrl = await webpCache.getWebPUrl(originalUrl);
        setOptimizedUrl(webpUrl);
      } catch (error) {
        console.warn('Failed to get optimized image:', error);
        setOptimizedUrl(originalUrl);
      } finally {
        setIsLoading(false);
    };

    getOptimizedUrl();
  }, [originalUrl]);

  return {
    optimizedUrl,
    isLoading,
    isOptimized: optimizedUrl !== originalUrl,
  };
};

/**
 * Hook to preload critical images
 */
export const useImagePreloader = (imagePaths: string[]) => {
  const [preloadedCount, setPreloadedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const preloadImages = async () => {
      let loaded = 0;
      
      for (const imagePath of imagePaths) {
        try {
          await webpCache.getWebPUrl(imagePath);
          loaded++;
          setPreloadedCount(loaded);
        } catch (error) {
          console.warn(`Failed to preload ${imagePath}:`, error);
      
      setIsComplete(true);
    };

    if (imagePaths.length > 0) {
      preloadImages();
    } else {
      setIsComplete(true);
  }, [imagePaths]);

  return {
    preloadedCount,
    totalCount: imagePaths.length,
    isComplete,
    progress: imagePaths.length > 0 ? (preloadedCount / imagePaths.length) * 100 : 100,
  };
};

/**
 * Hook to monitor image loading performance
 */
export const useImagePerformance = () => {
  const [metrics, setMetrics] = useState<{
    totalImages: number;
    averageLoadTime: number;
    slowImages: string[];
    webpSavings: number;
  }>({
    totalImages: 0,
    averageLoadTime: 0,
    slowImages: [],
    webpSavings: 0,
  });

  useEffect(() => {
    const updateMetrics = () => {
      const { imagePerformanceMonitor } = require('../utils/imageOptimization');
      const stats = imagePerformanceMonitor.getStats();
      
      const loadTimes = Object.values(stats) as number[];
      const slowImages = Object.entries(stats)
        .filter(([, time]) => (time as number) > 3000)
        .map(([url]) => url);
      
      const averageLoadTime = loadTimes.length > 0 
        ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length 
        : 0;

      setMetrics({
        totalImages: loadTimes.length,
        averageLoadTime,
        slowImages,
        webpSavings: webpCache.size(), // Approximate savings based on cached WebP images
      });
    };

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    
    // Initial update
    updateMetrics();

    return () => clearInterval(interval);
  }, []);

  return metrics;
};

export default useImageOptimization;
}
}}}}}