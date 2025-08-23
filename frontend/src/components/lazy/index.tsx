import { lazy } from 'react';

// Page components
export const LazyHome = lazy(() => import('../../pages/Home'));
export const LazyDashboard = lazy(() => import('../../pages/Dashboard'));
export const LazyProfile = lazy(() => import('../../pages/Profile'));
export const LazySettings = lazy(() => import('../../pages/Settings'));

// Component lazy loading
export const LazyHeader = lazy(() => import('../Header'));
export const LazyFooter = lazy(() => import('../Footer'));
export const LazyNavigation = lazy(() => import('../Navigation'));
export const LazyModal = lazy(() => import('../Modal'));