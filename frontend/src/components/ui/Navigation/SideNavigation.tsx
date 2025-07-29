import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useActiveIndicator } from '../../../hooks/useActiveIndicator';
import type { NavigationItem } from '../../../contexts/NavigationContext';

export interface SideNavigationProps {
  items?: NavigationItem[];
  collapsed?: boolean;
  onToggle?: () => void;
  className?: string;
  showTooltips?: boolean;
  useContext?: boolean;
}

const SideNavigation: React.FC<SideNavigationProps> = ({
  items: propItems,
  collapsed: propCollapsed,
  onToggle,
  className = '',
  showTooltips = true,
  useContext = true
}) => {
  const location = useLocation();
  const navigationContext = useContext ? useNavigation() : null;
  
  // Use context state if available, otherwise fall back to props
  const items = useContext && navigationContext 
    ? navigationContext.state.navigationItems 
    : propItems || [];
  const collapsed = useContext && navigationContext 
    ? navigationContext.state.sidebarCollapsed 
    : propCollapsed || false;
  const activeItems = useContext && navigationContext 
    ? navigationContext.state.activeItems 
    : new Set<string>();

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Auto-collapse expanded items when sidebar is collapsed
  useEffect(() => {
    if (collapsed) {
      setExpandedItems(new Set());
    }
  }, [collapsed]);

  // Helper function to determine if an item is active
  const isItemActive = (itemPath: string, currentPath: string): boolean => {
    if (itemPath === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(itemPath);
  };

  const toggleExpanded = (itemId: string) => {
    if (collapsed) return; // Don't allow expansion when collapsed
    
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isHovered = hoveredItem === item.id;
    const isActive = activeItems.has(item.id) || isItemActive(item.href, location.pathname);
    
    // Get active indicator styles
    const indicatorStyles = useActiveIndicator(item.id, isActive);

    return (
      <div key={item.id} className={`relative ${indicatorStyles.containerClasses}`}>
        {/* Tooltip for collapsed state */}
        {collapsed && showTooltips && isHovered && (
          <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 z-50">
            <div className="bg-neutral-900 text-white text-sm px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
              {item.label}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-neutral-900"></div>
            </div>
          </div>
        )}

        {/* Active indicator */}
        {isActive && <div className={indicatorStyles.indicatorClasses} />}
        
        <div
          className={`
            group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out
            ${item.disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'cursor-pointer'
            }
            ${isActive 
              ? `bg-primary-100 text-primary-900 shadow-sm ${indicatorStyles.itemClasses}` 
              : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 hover:shadow-sm'
            }
            ${level > 0 ? 'ml-4 text-xs bg-neutral-25' : ''}
            ${collapsed ? 'justify-center px-2' : ''}
            hover:bg-neutral-100
            ${indicatorStyles.transitionClasses}
          `}
          onClick={(e) => {
            if (item.disabled) return;
            e.preventDefault();
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              // Use navigation context if available
              if (navigationContext) {
                navigationContext.actions.navigateTo(item.href);
              } else {
                window.location.href = item.href;
              }
            }
          }}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          role="button"
          tabIndex={item.disabled ? -1 : 0}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-disabled={item.disabled}
        >
          {/* Icon */}
          {item.icon && (
            <span className={`
              flex-shrink-0 h-5 w-5 transition-all duration-200
              ${collapsed ? '' : 'mr-3'}
              ${isActive ? 'text-primary-600' : 'text-neutral-500 group-hover:text-neutral-700'}
            `}>
              {item.icon}
            </span>
          )}

          {/* Label and controls (hidden when collapsed) */}
          {!collapsed && (
            <>
              <span className="flex-1 truncate font-medium">
                {item.label}
              </span>
              
              {/* Badge */}
              {item.badge && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {item.badge}
                </span>
              )}

              {/* Expand/collapse arrow for items with children */}
              {hasChildren && (
                <span className="ml-3 transition-transform duration-200 ease-in-out">
                  <svg 
                    className={`h-4 w-4 transform ${isExpanded ? 'rotate-90' : ''} text-neutral-400`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              )}
            </>
          )}
        </div>
        
        {/* Submenu with smooth animation */}
        {hasChildren && !collapsed && (
          <div className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
          `}>
            <div className="mt-1 space-y-1 pl-2">
              {item.children!.map(child => renderNavigationItem(child, level + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <nav 
      className={`space-y-1 transition-all duration-300 ease-in-out ${className}`}
      role="navigation"
      aria-label="Side navigation"
    >
      {items.map(item => renderNavigationItem(item))}
    </nav>
  );
};

export default SideNavigation;