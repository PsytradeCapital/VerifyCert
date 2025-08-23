import React from 'react';
import { useState, useEffect } from 'react';

export interface BreakpointConfig {
xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;

export const defaultBreakpoints: BreakpointConfig = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}};

export type BreakpointKey = keyof BreakpointConfig;

export interface ResponsiveState {
width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  currentBreakpoint: BreakpointKey;
  isBreakpoint: (breakpoint: BreakpointKey) => boolean;
  isAboveBreakpoint: (breakpoint: BreakpointKey) => boolean;
  isBelowBreakpoint: (breakpoint: BreakpointKey) => boolean;

export function useResponsive(breakpoints: BreakpointConfig = defaultBreakpoints): ResponsiveState {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
}});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCurrentBreakpoint = (width: number): BreakpointKey => {
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  };

  const isBreakpoint = (breakpoint: BreakpointKey): boolean => {
    return getCurrentBreakpoint(windowSize.width) === breakpoint;
  };

  const isAboveBreakpoint = (breakpoint: BreakpointKey): boolean => {
    return windowSize.width >= breakpoints[breakpoint];
  };

  const isBelowBreakpoint = (breakpoint: BreakpointKey): boolean => {
    return windowSize.width < breakpoints[breakpoint];
  };

  // Determine device types
  const isMobile = windowSize.width < breakpoints.md;
  const isTablet = windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg;
  const isDesktop = windowSize.width >= breakpoints.lg;
  
  // Check if device likely supports touch
  const isTouch = typeof window !== 'undefined' && (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    windowSize.width < breakpoints.lg
  );

  return {
    width: windowSize.width,
    height: windowSize.height,
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
    currentBreakpoint: getCurrentBreakpoint(windowSize.width),
    isBreakpoint,
    isAboveBreakpoint,
    isBelowBreakpoint,
  };

// Hook for specific breakpoint checks
export function useBreakpoint(breakpoint: BreakpointKey, breakpoints?: BreakpointConfig): boolean {
  const { isAboveBreakpoint } = useResponsive(breakpoints);
  return isAboveBreakpoint(breakpoint);

// Hook for mobile detection
export function useIsMobile(breakpoints?: BreakpointConfig): boolean {
  const { isMobile } = useResponsive(breakpoints);
  return isMobile;

// Hook for desktop detection
export function useIsDesktop(breakpoints?: BreakpointConfig): boolean {
  const { isDesktop } = useResponsive(breakpoints);
  return isDesktop;

// Hook for touch device detection
export function useIsTouch(breakpoints?: BreakpointConfig): boolean {
  const { isTouch } = useResponsive(breakpoints);
  return isTouch;

// Hook for getting current breakpoint
export function useCurrentBreakpoint(breakpoints?: BreakpointConfig): BreakpointKey {
  const { currentBreakpoint } = useResponsive(breakpoints);
  return currentBreakpoint;

// Hook for responsive values based on breakpoints
export function useResponsiveValue<T>(
  values: Partial<Record<BreakpointKey, T>>,
  fallback: T,;
  breakpoints?: BreakpointConfig;;
): T {
  const { currentBreakpoint, width } = useResponsive(breakpoints);
  
  // Get all breakpoints that apply to current width, sorted by size
  const applicableBreakpoints = Object.keys(values)
    .filter(bp => width >= (breakpoints || defaultBreakpoints)[bp as BreakpointKey])
    .sort((a, b) => (breakpoints || defaultBreakpoints)[b as BreakpointKey] - (breakpoints || defaultBreakpoints)[a as BreakpointKey]);
  
  // Return the value for the largest applicable breakpoint, or fallback
  const applicableBreakpoint = applicableBreakpoints[0] as BreakpointKey;
  return applicableBreakpoint ? values[applicableBreakpoint] ?? fallback : fallback;

// Hook for responsive spacing
export function useResponsiveSpacing(
  mobile: string | number,
  tablet?: string | number,
  desktop?: string | number,;
  breakpoints?: BreakpointConfig;;
): string | number {
  const { isMobile, isTablet } = useResponsive(breakpoints);
  
  if (isMobile) return mobile;
  if (isTablet && tablet !== undefined) return tablet;
  if (desktop !== undefined) return desktop;
  return tablet || mobile;

// Hook for responsive font sizes
export function useResponsiveFontSize(
  mobile: string,
  tablet?: string,
  desktop?: string,;
  breakpoints?: BreakpointConfig;;
): string {
  return useResponsiveSpacing(mobile, tablet, desktop, breakpoints) as string;

// Hook for responsive grid columns
export function useResponsiveColumns(
  mobile: number,
  tablet?: number,
  desktop?: number,;
  breakpoints?: BreakpointConfig;;
): number {
  return useResponsiveSpacing(mobile, tablet, desktop, breakpoints) as number;

export default useResponsive;
}
}}}}}}}}}