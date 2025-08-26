/**
 * Navigation Components
 * Centralized exports for navigation-related UI components
 */

export { default as SideNavigation } from './SideNavigation';
export { default as BottomNavigation } from './BottomNavigation';
export { default as FloatingActionButton } from './FloatingActionButton';
export { default as Breadcrumbs } from './Breadcrumbs';
export { default as NavigationStateManager } from './NavigationStateManager';

// Re-export types
export type { SideNavigationProps } from './SideNavigation';
export type { BottomNavItem, BottomNavigationProps } from './BottomNavigation';
export type { FloatingActionButtonProps } from './FloatingActionButton';
export type { BreadcrumbItem, BreadcrumbsProps } from './Breadcrumbs';
export type { NavigationStateManagerProps } from './NavigationStateManager';