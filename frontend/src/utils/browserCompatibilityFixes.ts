/**
 * Browser Compatibility Fixes and Utilities
 * Runtime fixes for browser-specific issues and feature detection
 */

export interface BrowserCompatibilityConfig {
  enablePolyfills: boolean;
  enableFallbacks: boolean;
  logCompatibilityIssues: boolean;

/**
 * Initialize browser compatibility fixes
 */
interface BrowserCompatibilityConfig {
  enablePolyfills?: boolean;
  enableFallbacks?: boolean;
  logCompatibilityIssues?: boolean;
}

export function initializeBrowserCompatibility(config: BrowserCompatibilityConfig = {
  enablePolyfills: true,
  enableFallbacks: true,
  logCompatibilityIssues: process.env.NODE_ENV === 'development'
}): void {
  if (typeof window === 'undefined') return;

  // Apply CSS fixes
  applyCSSCompatibilityFixes();
  
  // Apply JavaScript polyfills
  if (config.enablePolyfills) {
    applyPolyfills();
  
  // Apply runtime fallbacks
  if (config.enableFallbacks) {
    applyRuntimeFallbacks();
  
  // Fix browser-specific issues
  fixBrowserSpecificIssues();
  
  // Log compatibility information
  if (config.logCompatibilityIssues) {
    logBrowserCompatibility();

/**
 * Apply CSS-based compatibility fixes
 */
function applyCSSCompatibilityFixes(): void {
  const style = document.createElement('style');
  style.textContent = `
    /* Runtime CSS fixes for immediate application */
    
    /* Fix iOS Safari input zoom */
    @supports (-webkit-touch-callout: none) {
      input, textarea, select {
        font-size: 16px !important;
    
    /* Fix Chrome autofill styling */
    input:-webkit-autofill {
      -webkit-box-shadow: 0 0 0 30px white inset !important;
      -webkit-text-fill-color: #111827 !important;
    
    /* Fix Firefox number input */
    @-moz-document url-prefix() {
      input[type="number"] {
        -moz-appearance: textfield;
    
    /* Fix Edge clear button */
    input::-ms-clear {
      display: none;
  `;
  document.head.appendChild(style);

/**
 * Apply JavaScript polyfills for missing features
 */
function applyPolyfills(): void {
  // ResizeObserver polyfill
  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      private callback: ResizeObserverCallback;
      private elements: Set<Element> = new Set();
      private rafId: number | null = null;

      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;

      observe(element: Element): void {
        this.elements.add(element);
        this.scheduleCallback();

      unobserve(element: Element): void {
        this.elements.delete(element);

      disconnect(): void {
        this.elements.clear();
        if (this.rafId) {
          cancelAnimationFrame(this.rafId);
          this.rafId = null;

      private scheduleCallback(): void {
        if (this.rafId) return;
        
        this.rafId = requestAnimationFrame(() => {
          const entries: ResizeObserverEntry[] = [];
          this.elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            entries.push({
              target: element,
              contentRect: rect,
              borderBoxSize: [{ blockSize: rect.height, inlineSize: rect.width }],
              contentBoxSize: [{ blockSize: rect.height, inlineSize: rect.width }],
              devicePixelContentBoxSize: [{ blockSize: rect.height, inlineSize: rect.width }]
            } as ResizeObserverEntry);
          });
          
          if (entries.length > 0) {
            this.callback(entries, this);
          
          this.rafId = null;
          if (this.elements.size > 0) {
            this.scheduleCallback();
        });
    };

  // IntersectionObserver polyfill (basic)
  if (!window.IntersectionObserver) {
    window.IntersectionObserver = class IntersectionObserver {
      private callback: IntersectionObserverCallback;
      private elements: Set<Element> = new Set();

      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;

      observe(element: Element): void {
        this.elements.add(element);
        // Simple fallback - assume element is always intersecting
        setTimeout(() => {
          this.callback([{
            target: element,
            isIntersecting: true,
            intersectionRatio: 1,
            boundingClientRect: element.getBoundingClientRect(),
            intersectionRect: element.getBoundingClientRect(),
            rootBounds: null,
            time: Date.now()
          } as IntersectionObserverEntry], this);
        }, 0);

      unobserve(element: Element): void {
        this.elements.delete(element);

      disconnect(): void {
        this.elements.clear();
    };

  // requestIdleCallback polyfill
  if (!window.requestIdleCallback) {
    window.requestIdleCallback = function(callback: IdleRequestCallback): number {
      const start = Date.now();
      return setTimeout(() => {
        callback({
          didTimeout: false,
          timeRemaining() {
            return Math.max(0, 50 - (Date.now() - start));
        });
      }, 1) as unknown as number;
    };

  if (!window.cancelIdleCallback) {
    window.cancelIdleCallback = function(id: number): void {
      clearTimeout(id);
    };

  // Array.from polyfill for IE
  if (!Array.from) {
    Array.from = function<T>(arrayLike: ArrayLike<T>): T[] {
      return Array.prototype.slice.call(arrayLike);
    };

  // Object.assign polyfill for IE
  if (!Object.assign) {
    Object.assign = function(target: any, ...sources: any[]): any {
      if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');

      const to = Object(target);
      sources.forEach(source => {
        if (source != null) {
          Object.keys(source).forEach(key => {
            to[key] = source[key];
          });
      });

      return to;
    };

/**
 * Apply runtime fallbacks for unsupported features
 */
function applyRuntimeFallbacks(): void {
  // CSS Grid fallback
  if (!CSS.supports('display', 'grid')) {
    document.documentElement.classList.add('no-css-grid');

  // Flexbox fallback
  if (!CSS.supports('display', 'flex')) {
    document.documentElement.classList.add('no-flexbox');

  // Custom properties fallback
  if (!CSS.supports('color', 'var(--test)')) {
    document.documentElement.classList.add('no-css-custom-properties');

  // Backdrop filter fallback
  if (!CSS.supports('backdrop-filter', 'blur(10px)')) {
    document.documentElement.classList.add('no-backdrop-filter');

  // Sticky positioning fallback
  if (!CSS.supports('position', 'sticky')) {
    document.documentElement.classList.add('no-sticky');

/**
 * Fix browser-specific issues
 */
function fixBrowserSpecificIssues(): void {
  const userAgent = navigator.userAgent;

  // iOS Safari fixes
  if (/iPad|iPhone|iPod/.test(userAgent)) {
    // Fix viewport height on iOS
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', () => {
      setTimeout(setVH, 100);
    });

    // Prevent zoom on input focus
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      if (input instanceof HTMLElement) {
        const currentFontSize = window.getComputedStyle(input).fontSize;
        if (parseFloat(currentFontSize) < 16) {
          input.style.fontSize = '16px';
    });

    // Fix iOS Safari scrolling issues
    document.body.style.webkitOverflowScrolling = 'touch';

  // Safari-specific fixes
  if (/^((?!chrome|android).)*safari/i.test(userAgent)) {
    // Fix Safari date input
    const dateInputs = document.querySelectorAll('input[type="date"], input[type="time"], input[type="datetime-local"]');
    dateInputs.forEach(input => {
      if (input instanceof HTMLInputElement) {
        input.style.webkitAppearance = 'none';
    });

  // Firefox fixes
  if (userAgent.includes('Firefox')) {
    // Fix Firefox button focus
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.addEventListener('focus', (e) => {
        (e.target as HTMLElement).style.outline = '2px solid #3b82f6';
        (e.target as HTMLElement).style.outlineOffset = '2px';
      });
      
      button.addEventListener('blur', (e) => {
        (e.target as HTMLElement).style.outline = '';
        (e.target as HTMLElement).style.outlineOffset = '';
      });
    });

  // Edge/IE fixes
  if (userAgent.includes('Edge') || userAgent.includes('Trident')) {
    // Fix Edge input clear button
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      if (input instanceof HTMLInputElement) {
        input.style.msReveal = 'none';
        input.style.msClear = 'none';
    });

/**
 * Log browser compatibility information
 */
function logBrowserCompatibility(): void {
  const features = {
    'CSS Grid': CSS.supports('display', 'grid'),
    'CSS Flexbox': CSS.supports('display', 'flex'),
    'CSS Custom Properties': CSS.supports('color', 'var(--test)'),
    'Backdrop Filter': CSS.supports('backdrop-filter', 'blur(10px)'),
    'Sticky Positioning': CSS.supports('position', 'sticky'),
    'ResizeObserver': 'ResizeObserver' in window,
    'IntersectionObserver': 'IntersectionObserver' in window,
    'Service Worker': 'serviceWorker' in navigator,
    'Local Storage': 'localStorage' in window,
    'Session Storage': 'sessionStorage' in window,
    'IndexedDB': 'indexedDB' in window,
    'WebGL': (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch {
        return false;
    })(),
    'Touch Events': 'ontouchstart' in window,
    'Pointer Events': 'onpointerdown' in window,
    'Geolocation': 'geolocation' in navigator,
    'Device Motion': 'DeviceMotionEvent' in window,
    'Web Share API': 'share' in navigator,
    'Clipboard API': 'clipboard' in navigator,
    'Fullscreen API': 'fullscreenEnabled' in document,
    'Picture in Picture': 'pictureInPictureEnabled' in document
  };

  console.group('🌐 Browser Compatibility Report');
  console.log('User Agent:', navigator.userAgent);
  console.log('Platform:', navigator.platform);
  console.log('Language:', navigator.language);
  console.log('Viewport:', `${window.innerWidth}x${window.innerHeight}`);
  
  console.group('📋 Feature Support');
  Object.entries(features).forEach(([feature, supported]) => {
    console.log(`${supported ? '✅' : '❌'} ${feature}`);
  });
  console.groupEnd();

  // Check for common issues
  const issues: string[] = [];
  
  if (!features['CSS Grid']) {
    issues.push('CSS Grid not supported - using flexbox fallbacks');
  
  if (!features['CSS Custom Properties']) {
    issues.push('CSS Custom Properties not supported - using static values');
  
  if (!features['Service Worker']) {
    issues.push('Service Worker not supported - PWA features unavailable');
  
  if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !features['Touch Events']) {
    issues.push('Touch events not properly supported on iOS device');

  if (issues.length > 0) {
    console.group('⚠️ Compatibility Issues');
    issues.forEach(issue => console.warn(issue));
    console.groupEnd();

  console.groupEnd();

/**
 * Fix specific component compatibility issues
 */
export function fixComponentCompatibility(): void {
  // Fix motion component conflicts
  const motionElements = document.querySelectorAll('[data-framer-motion]');
  motionElements.forEach(element => {
    if (element instanceof HTMLElement) {
      // Ensure proper transform origin
      if (!element.style.transformOrigin) {
        element.style.transformOrigin = 'center';
      
      // Fix z-index stacking issues
      if (element.style.position === 'fixed' || element.style.position === 'absolute') {
        if (!element.style.zIndex) {
          element.style.zIndex = '1';
  });

  // Fix input autofill styling
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    if (input instanceof HTMLInputElement) {
      // Fix Chrome autofill background
      input.addEventListener('animationstart', (e) => {
        if ((e as AnimationEvent).animationName === 'onAutoFillStart') {
          input.style.backgroundColor = 'transparent';
      });
  });

  // Fix modal backdrop issues
  const modals = document.querySelectorAll('[role="dialog"]');
  modals.forEach(modal => {
    if (modal instanceof HTMLElement) {
      // Ensure proper focus trapping
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
      });
  });

/**
 * Apply browser-specific CSS classes
 */
export function applyBrowserClasses(): void {
  const userAgent = navigator.userAgent;
  const classes: string[] = [];

  // Browser detection
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    classes.push('browser-chrome');
  } else if (userAgent.includes('Firefox')) {
    classes.push('browser-firefox');
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    classes.push('browser-safari');
  } else if (userAgent.includes('Edg')) {
    classes.push('browser-edge');

  // Platform detection
  if (/iPad|iPhone|iPod/.test(userAgent)) {
    classes.push('platform-ios');
  } else if (userAgent.includes('Android')) {
    classes.push('platform-android');
  } else if (userAgent.includes('Windows')) {
    classes.push('platform-windows');
  } else if (userAgent.includes('Mac')) {
    classes.push('platform-mac');

  // Device type detection
  if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    classes.push('device-mobile');
  } else {
    classes.push('device-desktop');

  // Touch support
  if ('ontouchstart' in window) {
    classes.push('touch-enabled');
  } else {
    classes.push('no-touch');

  // Apply classes
  document.documentElement.classList.add(...classes);

/**
 * Monitor and fix runtime compatibility issues
 */
export function monitorCompatibilityIssues(): void {
  // Monitor for console errors related to compatibility
  const originalError = console.error;
  console.error = function(...args: any[]) {
    const message = args.join(' ');
    
    // Check for common compatibility errors
    if (message.includes('ResizeObserver') && !window.ResizeObserver) {
      console.warn('ResizeObserver not supported - applying polyfill');
      applyPolyfills();
    
    if (message.includes('IntersectionObserver') && !window.IntersectionObserver) {
      console.warn('IntersectionObserver not supported - applying polyfill');
      applyPolyfills();
    
    originalError.apply(console, args);
  };

  // Monitor for layout shifts
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && (entry as any).value > 0.1) {
            console.warn('Large layout shift detected:', entry);
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // PerformanceObserver not fully supported

/**
 * Initialize all browser compatibility fixes
 */
export function initializeAllCompatibilityFixes(): void {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeBrowserCompatibility();
      applyBrowserClasses();
      fixComponentCompatibility();
      monitorCompatibilityIssues();
    });
  } else {
    initializeBrowserCompatibility();
    applyBrowserClasses();
    fixComponentCompatibility();
    monitorCompatibilityIssues();