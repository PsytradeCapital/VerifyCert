import { lazy } from 'react';

// Page components (only existing ones)
export const LazyHome = lazy(() => import('../../pages/Home'));
export const LazySettings = lazy(() => import('../../pages/Settings'));
export const LazyIssuerDashboard = lazy(() => import('../../pages/IssuerDashboard'));
export const LazyCertificateViewer = lazy(() => import('../../pages/CertificateViewer'));

// Component lazy loading (only existing ones)
export const LazyNavigation = lazy(() => import('../Navigation'));
export const LazyErrorBoundary = lazy(() => import('../ErrorBoundary'));