export function initializeBrowserCompatibility() {
  if (!window.IntersectionObserver) {
    console.warn('IntersectionObserver not supported');
  }
  
  if (!window.ResizeObserver) {
    console.warn('ResizeObserver not supported');
  }
  
  if (!CSS.supports('color', 'var(--test)')) {
    console.warn('CSS custom properties not supported');
  }
}

export function detectBrowserFeatures() {
  return {
    intersectionObserver: 'IntersectionObserver' in window,
    resizeObserver: 'ResizeObserver' in window,
    customProperties: CSS.supports('color', 'var(--test)'),
    webp: false
  };
}
