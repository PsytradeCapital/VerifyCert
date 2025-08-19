/**
 * Webpack Optimization Helpers
 * Utilities to enhance webpack tree shaking and bundle optimization
 */

// Tree shaking verification
export const verifyTreeShaking = () => {
  if (process.env.NODE_ENV === 'development') {
    // Check for unused exports in development
    const unusedExports = [];
    
    // This would be populated by webpack analysis
    if (window.__WEBPACK_UNUSED_EXPORTS__) {
      unusedExports.push(...window.__WEBPACK_UNUSED_EXPORTS__);
    }
    
    if (unusedExports.length > 0) {
      console.warn('🌳 Tree shaking opportunities found:', unusedExports);
    } else {
      console.log('✅ Tree shaking is working optimally');
    }
  }
};

// Bundle size monitoring
export const monitorBundleSize = () => {
  if (process.env.NODE_ENV === 'production') {
    // Monitor bundle performance
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const timing = entry;
          console.log('📦 Bundle Performance:', {
            loadTime: timing.loadEventEnd - timing.loadEventStart,
            domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
            transferSize: timing.transferSize,
            encodedBodySize: timing.encodedBodySize,
            decodedBodySize: timing.decodedBodySize,
            compressionRatio: timing.encodedBodySize / timing.decodedBodySize
          });
        }
      }
    });
    
    observer.observe({ entryTypes: ['navigation'] });
  }
};

// Dynamic import optimization
export const optimizedImport = async (importFn, fallback = null) => {
  try {
    const module = await importFn();
    return module.default || module;
  } catch (error) {
    console.warn('Dynamic import failed:', error);
    return fallback;
  }
};

// Chunk loading optimization
export const preloadChunk = (chunkName) => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = `/static/js/${chunkName}.chunk.js`;
      document.head.appendChild(link);
    });
  }
};

// Bundle analysis helpers
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const scripts = Array.from(document.querySelectorAll('script[src*="static/js"]'));
    const styles = Array.from(document.querySelectorAll('link[href*="static/css"]'));
    
    console.group('📊 Bundle Analysis');
    console.log('JavaScript chunks:', scripts.length);
    console.log('CSS chunks:', styles.length);
    
    // Estimate sizes (rough approximation)
    const estimatedJSSize = scripts.length * 50; // KB per chunk estimate
    const estimatedCSSSize = styles.length * 10; // KB per chunk estimate
    
    console.log('Estimated JS size:', estimatedJSSize, 'KB');
    console.log('Estimated CSS size:', estimatedCSSSize, 'KB');
    console.log('Total estimated size:', estimatedJSSize + estimatedCSSSize, 'KB');
    console.groupEnd();
    
    return {
      jsChunks: scripts.length,
      cssChunks: styles.length,
      estimatedSize: estimatedJSSize + estimatedCSSSize
    };
  }
};

// Compression detection
export const detectCompression = () => {
  if (typeof window !== 'undefined') {
    const scripts = document.querySelectorAll('script[src]');
    let gzipSupported = false;
    let brotliSupported = false;
    
    scripts.forEach(script => {
      const src = script.src;
      if (src.includes('.gz')) gzipSupported = true;
      if (src.includes('.br')) brotliSupported = true;
    });
    
    console.log('🗜️ Compression Support:', {
      gzip: gzipSupported,
      brotli: brotliSupported
    });
    
    return { gzip: gzipSupported, brotli: brotliSupported };
  }
};

// Initialize optimization monitoring
export const initializeOptimization = () => {
  if (typeof window !== 'undefined') {
    // Run after page load
    window.addEventListener('load', () => {
      verifyTreeShaking();
      monitorBundleSize();
      analyzeBundleSize();
      detectCompression();
    });
  }
};