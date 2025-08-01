/**
 * UI Component Library
 * Centralized exports for all reusable UI components
 */

// Layout Components
export { default as AppLayout } from './Layout/AppLayout';
export { default as Header } from './Layout/Header';
export { default as Container } from './Layout/Container';
export { default as Grid, GridItem } from './Layout/Grid';
export { default as ResponsiveLayout } from './Layout/ResponsiveLayout';
export { default as ResponsiveGrid } from './Layout/ResponsiveGrid';

// Responsive Utilities
export {
  MobileOnly,
  TabletOnly,
  DesktopOnly,
  TouchOnly,
  HoverOnly,
  ResponsiveShow,
  SafeArea,
  TouchTarget,
  MobilePadding,
  ResponsiveText
} from './Layout/ResponsiveUtility';

// Navigation Components
export { default as SideNavigation } from './Navigation/SideNavigation';
export { default as BottomNavigation } from './Navigation/BottomNavigation';
export { default as Breadcrumbs, AutoBreadcrumbs } from './Navigation/Breadcrumbs';
export { default as FloatingActionButton } from './Navigation/FloatingActionButton';

// Form Components
export { default as Button } from './Button/Button';
export { default as Input } from './Input/Input';
export { default as Select } from './Select/Select';
export { default as FileUpload } from './FileUpload/FileUpload';

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
export {
  Spinner,
  DotsSpinner,
  PulseSpinner,
  ProgressBar,
  CircularProgress,
  Skeleton,
  CertificateCardSkeleton,
  CertificateListSkeleton,
  DashboardSkeleton,
  FormSkeleton,
  LoadingOverlay,
  LoadingButton,
  StepProgress
} from './Loading';

// Feedback Components
export {
  FeedbackAnimation,
  SuccessAnimation,
  ErrorAnimation,
  LoadingAnimation,
  FeedbackProvider,
  useFeedback
} from './Feedback';

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

// Types
export type { AppLayoutProps } from './Layout/AppLayout';
export type { HeaderProps, UserMenuProps } from './Layout/Header';
export type { ContainerProps } from './Layout/Container';
export type { GridProps, GridItemProps } from './Layout/Grid';
export type { ResponsiveLayoutProps } from './Layout/ResponsiveLayout';
export type { ResponsiveGridProps as ResponsiveGridComponentProps } from './Layout/ResponsiveGrid';
export type { SideNavigationProps } from './Navigation/SideNavigation';
export type { BottomNavItem, BottomNavigationProps } from './Navigation/BottomNavigation';
export type { FloatingActionButtonProps } from './Navigation/FloatingActionButton';
export type { BreadcrumbItem, BreadcrumbsProps } from './Navigation/Breadcrumbs';
export type { ButtonProps } from './Button/Button';
export type { InputProps } from './Input/Input';
export type { SelectOption, SelectProps, DropdownItem, DropdownProps, MultiSelectProps } from './Select';
export type { FileUploadProps } from './FileUpload/FileUpload';
export type { CardProps } from './Card/Card';
export type { ResponsiveCardProps } from './Card/ResponsiveCard';
export type { ModalProps, DialogProps } from './Modal';
export type { AlertProps, NotificationProps } from './Alert';
export type { BadgeProps, TagProps } from './Badge';
export type { TooltipProps } from './Tooltip';
export type { PageTransitionProps } from './Animation/PageTransition';
export type { AnimatedRoutesProps } from './Animation/AnimatedRoutes';

// Loading Component Types
export type {
  SpinnerProps,
  DotsSpinnerProps,
  PulseSpinnerProps,
  ProgressBarProps,
  CircularProgressProps,
  SkeletonProps,
  LoadingOverlayProps,
  LoadingButtonProps,
  StepProgressProps
} from './Loading';

// Feedback Component Types
export type {
  FeedbackAnimationProps,
  FeedbackItem,
  FeedbackOptions,
  SuccessOptions,
  ErrorOptions,
  LoadingOptions
} from './Feedback';

// Verification Component Types
export type { VerificationResultProps } from './VerificationResult';

// Dashboard Component Types
export type {
  MetricCardProps,
  DashboardStats,
  DashboardOverviewProps,
  ActivityItem,
  ActivityFeedProps,
  QuickStatsProps
} from './Dashboard';

// Certificate Component Types
export type { FilterOptions } from './CertificateList';

// Wizard Component Types
export type { CertificateFormData } from './Wizard';
export type {
  ResponsiveUtilityProps,
  ResponsiveShowProps,
  SafeAreaProps,
  TouchTargetProps,
  MobilePaddingProps,
  ResponsiveGridProps,
  ResponsiveTextProps
} from './Layout/ResponsiveUtility';