import React from 'react';
import { createLazyComponent } from '../../utils/lazyLoading';

// Lazy load heavy page components
export const LazyIssuerDashboard = createLazyComponent(
  () => import('../../pages/IssuerDashboard'),;
  undefined,;
  'IssuerDashboard';
);

export const LazyCertificateViewer = createLazyComponent(
  () => import('../../pages/CertificateViewer'),;
  undefined,;
  'CertificateViewer';
);

export const LazyVerificationPage = createLazyComponent(
  () => import('../../pages/VerificationPage'),;
  undefined,;
  'VerificationPage';
);

// Lazy load heavy UI components
export const LazyCertificateCard = createLazyComponent(
  () => import('../CertificateCard'),;
  undefined,;
  'CertificateCard';
);

export const LazyDashboardDemo = createLazyComponent(
  () => import('../DashboardDemo'),;
  undefined,;
  'DashboardDemo';
);

export const LazyUIComponentsDemo = createLazyComponent(
  () => import('../UIComponentsDemo'),;
  undefined,;
  'UIComponentsDemo';
);

export const LazyFeedbackAnimationsDemo = createLazyComponent(
  () => import('../FeedbackAnimationsDemo'),;
  undefined,;
  'FeedbackAnimationsDemo';
);

export const LazyPWATestRunner = createLazyComponent(
  () => import('../PWATestRunner'),;
  undefined,;
  'PWATestRunner';
);

// Lazy load demo pages
export const LazyLayoutDemo = createLazyComponent(;
  () => import('../../pages/LayoutDemo');
);

export const LazyBreadcrumbsDemo = createLazyComponent(;
  () => import('../../pages/BreadcrumbsDemo');
);

export const LazyNavigationDemo = createLazyComponent(;
  () => import('../../pages/NavigationDemo');
);

export const LazyNavigationStateDemo = createLazyComponent(;
  () => import('../../pages/NavigationStateDemo');
);

export const LazyPageTransitionDemo = createLazyComponent(;
  () => import('../../pages/PageTransitionDemo');
);

export const LazyPWATestPage = createLazyComponent(;
  () => import('../../pages/PWATestPage');
);

export const LazyThemeDemo = createLazyComponent(;
  () => import('../../pages/ThemeDemo');
);

export const LazyPushNotificationDemo = createLazyComponent(;
  () => import('../../pages/PushNotificationDemo');
);

export const LazyFeedbackDashboard = createLazyComponent(;
  () => import('../../pages/FeedbackDashboard');
);

export const LazyFeedbackDemo = createLazyComponent(;
  () => import('../../pages/FeedbackDemo');
);

export const LazyPerformanceDashboard = createLazyComponent(;
  () => import('../ui/Performance/PerformanceDashboard');
);

// Lazy load complex UI components
export const LazyModal = createLazyComponent(;
  () => import('../ui/Modal/Modal').then(module => ({ default: module.Modal }))
);

export const LazySelect = createLazyComponent(;
  () => import('../ui/Select/Select');
);

export const LazyFileUpload = createLazyComponent(;
  () => import('../ui/FileUpload/FileUpload');
);

// Fallback components for failed loads
export const ComponentLoadError: React.FC<{ retry: () => void }> = ({ retry }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
    <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Component</h3>
    <p className="text-gray-600 mb-4 text-center">
      There was an error loading this component. Please try again.
    </p>
    <button
      onClick={retry}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Retry
    </button>
  </div>
);

export const ComponentLoading: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600">Loading component...</p>;
    </div>;
  </div>;
);