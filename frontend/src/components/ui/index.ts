/**
 * UI Component Library
 * Centralized exports for all reusable UI components
 */

// Layout Components
export { default as AppLayout } from './Layout/AppLayout';
export { default as Header } from './Layout/Header';
export { default as Container } from './Layout/Container';
export { default as Grid, GridItem } from './Layout/Grid';

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
  ResponsiveGrid,
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
export { default as Modal } from './Modal/Modal';
export { default as Alert } from './Alert/Alert';
export { default as Badge } from './Badge/Badge';
export { default as Tooltip } from './Tooltip/Tooltip';

// Animation Components
export { default as PageTransition } from './Animation/PageTransition';
export { default as LoadingSpinner } from './Animation/LoadingSpinner';
export { default as SkeletonLoader } from './Animation/SkeletonLoader';

// Types
export type { AppLayoutProps } from './Layout/AppLayout';
export type { HeaderProps, UserMenuProps } from './Layout/Header';
export type { ContainerProps } from './Layout/Container';
export type { GridProps, GridItemProps } from './Layout/Grid';
export type { SideNavigationProps } from './Navigation/SideNavigation';
export type { BottomNavItem, BottomNavigationProps } from './Navigation/BottomNavigation';
export type { FloatingActionButtonProps } from './Navigation/FloatingActionButton';
export type { BreadcrumbItem, BreadcrumbsProps } from './Navigation/Breadcrumbs';
export type { ButtonProps } from './Button/Button';
export type { InputProps } from './Input/Input';
export type { SelectOption, SelectProps } from './Select/Select';
export type { FileUploadProps } from './FileUpload/FileUpload';
export type { CardProps } from './Card/Card';
export type { ModalProps } from './Modal/Modal';
export type { AlertProps } from './Alert/Alert';
export type { BadgeProps } from './Badge/Badge';
export type { TooltipProps } from './Tooltip/Tooltip';
export type { PageTransitionProps } from './Animation/PageTransition';
export type { LoadingSpinnerProps } from './Animation/LoadingSpinner';
export type { SkeletonLoaderProps } from './Animation/SkeletonLoader';
export type {
  ResponsiveUtilityProps,
  ResponsiveShowProps,
  SafeAreaProps,
  TouchTargetProps,
  MobilePaddingProps,
  ResponsiveGridProps,
  ResponsiveTextProps
} from './Layout/ResponsiveUtility';