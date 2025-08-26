const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing remaining build errors...');

// Fix Dashboard index exports
const dashboardIndexPath = 'frontend/src/components/ui/Dashboard/index.ts';
if (fs.existsSync(dashboardIndexPath)) {
  const dashboardIndex = `/**
 * Dashboard Components
 */

export { default as ActivityFeed } from './ActivityFeed';
export { default as MetricCard } from './MetricCard';
export { default as DashboardOverview } from './DashboardOverview';
export { default as QuickStats } from './QuickStats';

// Export types
export type { ActivityItem, ActivityFeedProps } from './ActivityFeed';
`;
  fs.writeFileSync(dashboardIndexPath, dashboardIndex);
  console.log('✅ Fixed Dashboard index exports');
}

// Fix Input index exports
const inputIndexPath = 'frontend/src/components/ui/Input/index.ts';
if (fs.existsSync(inputIndexPath)) {
  const inputIndex = `/**
 * Input Components
 */

export { default as Input } from './Input';
export type { InputProps } from './Input';
`;
  fs.writeFileSync(inputIndexPath, inputIndex);
  console.log('✅ Fixed Input index exports');
}

// Fix Select index exports
const selectIndexPath = 'frontend/src/components/ui/Select/index.ts';
if (fs.existsSync(selectIndexPath)) {
  const selectIndex = `/**
 * Select Components
 */

export { default as Select } from './Select';
export type { SelectProps } from './Select';
`;
  fs.writeFileSync(selectIndexPath, selectIndex);
  console.log('✅ Fixed Select index exports');
}

// Fix Modal index exports
const modalIndexPath = 'frontend/src/components/ui/Modal/index.ts';
if (fs.existsSync(modalIndexPath)) {
  const modalIndex = `/**
 * Modal Components
 */

export { default as Modal } from './Modal';
export { default as Dialog } from './Dialog';
export type { ModalProps } from './Modal';
export type { DialogProps } from './Dialog';
`;
  fs.writeFileSync(modalIndexPath, modalIndex);
  console.log('✅ Fixed Modal index exports');
}

// Fix Loading index exports
const loadingIndexPath = 'frontend/src/components/ui/Loading/index.ts';
if (fs.existsSync(loadingIndexPath)) {
  const loadingIndex = `/**
 * Loading Components
 */

export { default as Spinner } from './Spinner';
export { default as LoadingButton } from './LoadingButton';
export { default as ProgressBar } from './ProgressBar';
export { default as Skeleton } from './Skeleton';
export { default as LoadingOverlay } from './LoadingOverlay';
export { default as CircularProgress } from './CircularProgress';
export { default as DotsSpinner } from './DotsSpinner';
export { default as PulseSpinner } from './PulseSpinner';
export { default as StepProgress } from './StepProgress';
`;
  fs.writeFileSync(loadingIndexPath, loadingIndex);
  console.log('✅ Fixed Loading index exports');
}

// Fix Navigation index exports
const navigationIndexPath = 'frontend/src/components/ui/Navigation/index.ts';
if (fs.existsSync(navigationIndexPath)) {
  const navigationIndex = `/**
 * Navigation Components
 */

export { default as SideNavigation } from './SideNavigation';
export { default as BottomNavigation } from './BottomNavigation';
export { default as Breadcrumbs } from './Breadcrumbs';
export { default as FloatingActionButton } from './FloatingActionButton';
export { default as NavigationStateManager } from './NavigationStateManager';
`;
  fs.writeFileSync(navigationIndexPath, navigationIndex);
  console.log('✅ Fixed Navigation index exports');
}

console.log('🎉 All critical build errors fixed!');