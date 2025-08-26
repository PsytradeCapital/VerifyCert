/**
 * UI Component Library
 * Centralized exports for all reusable UI components
 */

// Layout Components
export { default as AppLayout } from './Layout/AppLayout';
export { default as Header } from './Layout/Header';
export { default as Container } from './Layout/Container';
export { default as Grid, GridItem } from './Layout/Grid';
export { ResponsiveLayout } from './Layout/ResponsiveLayout';
export { ResponsiveGrid } from './Layout/ResponsiveGrid';

// Responsive Utilities
export * from './Layout/ResponsiveUtility';

// Navigation Components
export * from './Navigation';

// Form Components
export * from './Button';
export * from './Input';
export * from './Select';
export * from './FileUpload';

// Content Components
export { default as Card } from './Card/Card';
export { default as ResponsiveCard } from './Card/ResponsiveCard';
export * from './Modal';
export * from './Alert';
export * from './Badge';
export * from './Tooltip';

// Animation Components
export { default as PageTransition } from './Animation/PageTransition';
export { default as AnimatedRoutes } from './Animation/AnimatedRoutes';

// Loading Components
export * from './Loading';

// Feedback Components
export * from './Feedback';

// PWA and Offline Components
export {
  OfflineIndicator,
  ServiceWorkerUpdate,
  PWAInstallPrompt
} from './OfflineIndicator';
export { default as CacheManager } from './CacheManager';

// Verification Components
export { default as VerificationResult } from './VerificationResult/VerificationResult';

// Dashboard Components
export {
  MetricCard,
  DashboardOverview,
  ActivityFeed,
  QuickStats
} from './Dashboard';

// Certificate Components
export { default as CertificateList } from './CertificateList/CertificateList';

// Wizard Components
export { CertificateWizard } from './Wizard';

// Types - only export what exists
export type { ButtonProps } from './Button/Button';
export type { InputProps } from './Input/Input';

// Dashboard Component Types
export type {
  ActivityItem,
  ActivityFeedProps
} from './Dashboard/ActivityFeed';