import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useActiveIndicator } from '../../../hooks/useActiveIndicator';
import type { NavigationItem } from '../../../contexts/NavigationContext';

export interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  active?: boolean;
  badge?: string | number;
  disabled?: boolean;
  onClick?: () => void;
}

export interface BottomNavigationProps {
  items?: NavigationItem[];
  className?: string;
  variant?: 'default' | 'floating';
  showLabels?: boolean;
  useContext?: boolean;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items: propItems,
  className = '',
  variant = 'default',
  showLabels = true,
  useContext = true
}) => {
  const location = useLocation();
  const navigationContext = useContext ? useNavigation() : null;
  
  // Use context state if available, otherwise fall back to props
  const items = useContext && navigationContext 
    ? navigationContext.state.navigationItems.filter(item => item.public || true) // Filter based on visibility
    : propItems || [];
  const activeItems = useContext && navigationContext 
    ? navigationContext.state.activeItems 
    : new Set<string>();

  // Helper function to determine if an item is active
  const isItemActive = (itemPath: string, currentPath: string): boolean => {
    if (itemPath === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(itemPath);
  };

  // Auto-detect active state based on current route if not explicitly set
  const itemsWithActiveState = items.map(item => ({
    ...item,
    active: activeItems.has(item.id) || isItemActive(item.href, location.pathname)
  }));

  const baseClasses = variant === 'floating' 
    ? 'fixed bottom-4 left-4 right-4 mx-auto max-w-md bg-white/95 backdrop-blur-sm border border-neutral-200 rounded-2xl shadow-xl'
    : 'fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-neutral-200 shadow-lg';

  const containerClasses = variant === 'floating'
    ? 'grid py-3 px-2'
    : 'grid py-2 pb-safe-bottom';

  return (
    <nav 
      className={`${baseClasses} z-fixed ${className}`}
      role="navigation"
      aria-label="Bottom navigation"
      style={{
        paddingBottom: variant === 'default' ? 'env(safe-area-inset-bottom)' : undefined
      }}
    >
      <div className={`${containerClasses} ${
        items.length === 1 ? 'grid-cols-1' :
        items.length === 2 ? 'grid-cols-2' :
        items.length === 3 ? 'grid-cols-3' :
        items.length === 4 ? 'grid-cols-4' :
        'grid-cols-5'
      }`}>
        {itemsWithActiveState.map((item) => {
          // Get active indicator styles
          const indicatorStyles = useActiveIndicator(item.id, item.active || false);
          
          const commonContent = (
            <>
              <div className="relative">
                <span className={`
                  h-6 w-6 flex items-center justify-center
                  transition-transform duration-200 ease-out
                  ${item.active ? 'scale-110' : 'hover:scale-105'}
                `}>
                  {item.icon}
                </span>
                {item.badge && (
                  <span 
                    className="absolute -top-1 -right-1 h-4 w-4 bg-error-500 text-white text-xs rounded-full flex items-center justify-center min-w-4 font-semibold animate-pulse"
                    aria-label={`${item.badge} notifications`}
                  >
                    {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              {showLabels && (
                <span className={`
                  mt-1 truncate max-w-16 text-center leading-tight
                  transition-all duration-200 ease-out
                  ${item.active ? 'font-semibold' : ''}
                `}>
                  {item.label}
                </span>
              )}
            </>
          );

          const commonClasses = `
            ${indicatorStyles.containerClasses}
            flex flex-col items-center justify-center 
            min-h-[44px] px-2 py-2 text-xs font-medium 
            transition-all duration-200 ease-out
            rounded-lg touch-manipulation
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${item.active 
              ? `text-primary-600 bg-primary-50 ${indicatorStyles.itemClasses}` 
              : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 active:text-neutral-800 active:bg-neutral-100'
            }
            ${variant === 'floating' ? 'mx-1' : ''}
            ${indicatorStyles.transitionClasses}
          `;

          if (item.onClick) {
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                type="button"
                disabled={item.disabled}
                className={commonClasses}
                aria-label={item.label}
                aria-current={item.active ? 'page' : undefined}
              >
                {/* Active indicator */}
                {item.active && <div className={indicatorStyles.indicatorClasses} />}
                {commonContent}
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.href}
              className={`${commonClasses} ${item.disabled ? 'pointer-events-none' : ''}`}
              onClick={(e) => {
                if (item.disabled) {
                  e.preventDefault();
                  return;
                }
                // Use navigation context if available
                if (navigationContext) {
                  e.preventDefault();
                  navigationContext.actions.navigateTo(item.href);
                }
              }}
              aria-label={item.label}
              aria-current={item.active ? 'page' : undefined}
            >
              {/* Active indicator */}
              {item.active && <div className={indicatorStyles.indicatorClasses} />}
              {commonContent}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;