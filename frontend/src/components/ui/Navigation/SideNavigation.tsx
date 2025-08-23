import React, { useState, useRef, useEffect, useCallback, ComponentType } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  FileText, 
  Settings, ;;
  Users, ;;
  BarChart3,;;
  Shield,;;
  Plus;;
} from 'lucide-react';

export interface NavigationItem {
id: string;
  label: string;
  icon: ComponentType<{ className?: string
}}>;
  path: string;
  badge?: string;
  children?: NavigationItem[];
  disabled?: boolean;
  active?: boolean;

export interface SideNavigationProps {
items?: NavigationItem[];
  collapsed?: boolean;
  onToggle?: () => void;
  className?: string;
  showToggleButton?: boolean;
  showBranding?: boolean;

const defaultNavigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard'
}},
  { id: 'verify', label: 'Verify Certificate', icon: Shield, path: '/verify' },
  { id: 'certificates', label: 'My Certificates', icon: FileText, path: '/certificates' },
  { id: 'issue', label: 'Issue Certificate', icon: Plus, path: '/issue' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { id: 'users', label: 'Users', icon: Users, path: '/users' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export default function SideNavigation(): JSX.Element {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [, setFocusedIndex] = useState(-1);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const navigationRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Get all navigation items including children for keyboard navigation
  const getAllNavigationItems = useCallback(() => {
    const allItems: NavigationItem[] = [];
    items.forEach(item => {
      allItems.push(item);
      if (item.children && expandedItems.has(item.id)) {
        allItems.push(...item.children);
    });
    return allItems;
  }, [items, expandedItems]);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const hasActiveChild = (item: NavigationItem) => {
    return item.children?.some(child => isActive(child.path)) || false;
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      return newSet;
    });
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    const allItems = getAllNavigationItems();
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = index < allItems.length - 1 ? index + 1 : 0;
        setFocusedIndex(nextIndex);
        const nextItem = document.querySelector(`[data-nav-index="${nextIndex}"]`) as HTMLElement;
        nextItem?.focus();
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = index > 0 ? index - 1 : allItems.length - 1;
        setFocusedIndex(prevIndex);
        const prevItem = document.querySelector(`[data-nav-index="${prevIndex}"]`) as HTMLElement;
        prevItem?.focus();
        break;
      
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        const firstItem = document.querySelector(`[data-nav-index="0"]`) as HTMLElement;
        firstItem?.focus();
        break;
      
      case 'End':
        event.preventDefault();
        const lastIndex = allItems.length - 1;
        setFocusedIndex(lastIndex);
        const lastItem = document.querySelector(`[data-nav-index="${lastIndex}"]`) as HTMLElement;
        lastItem?.focus();
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        const currentItem = allItems[index];
        if (currentItem?.children) {
          toggleExpanded(currentItem.id);
        break;
  };

  // Handle tooltip positioning for collapsed state
  const handleMouseEnter = (event: React.MouseEvent, itemId: string) => {
    setHoveredItem(itemId);
    
    if (collapsed && tooltipRef.current) {
      const rect = event.currentTarget.getBoundingClientRect();
      tooltipRef.current.style.top = `${rect.top + rect.height / 2}px`;
      tooltipRef.current.style.left = `${rect.right + 8}px`;
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  // Auto-expand parent items if child is active
  useEffect(() => {
    items.forEach(item => {
      if (item.children && hasActiveChild(item)) {
        setExpandedItems(prev => new Set(prev).add(item.id));
    });
  }, [items, location.pathname]);

  const renderNavigationItem = (item: NavigationItem, index: number, depth: number = 0) => {
    const Icon = item.icon;
    const active = item.active || isActive(item.path);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const childActive = hasActiveChild(item);

    return (
      <li key={item.id} className={depth > 0 ? 'ml-4' : ''}>
        {hasChildren && !collapsed ? (
          // Parent item with children (not collapsed)
          <div>
            <button
              data-nav-index={index}
              className={`
                w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${active || childActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              onClick={() => !item.disabled && toggleExpanded(item.id)}
              onMouseEnter={(e) => handleMouseEnter(e, item.id)}
              onMouseLeave={handleMouseLeave}
              onKeyDown={(e) => handleKeyDown(e, index)}
              aria-expanded={isExpanded}
              aria-label={`${item.label}${hasChildren ? ' submenu' : ''}`}
              disabled={item.disabled}
            >
              <Icon className={`
                w-5 h-5 flex-shrink-0 mr-3
                ${active || childActive ? 'text-blue-700' : 'text-gray-500'}
              `} />
              <span className="font-medium truncate flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full mr-2">
                  {item.badge}
                </span>
              )}
              <ChevronRight className={`
                w-4 h-4 transition-transform duration-200
                ${isExpanded ? 'rotate-90' : ''}
                ${active || childActive ? 'text-blue-700' : 'text-gray-400'}
              `} />
            </button>
            
            {/* Children */}
            {isExpanded && item.children && (
              <ul className="mt-1 space-y-1 ml-4" role="group">
                {item.children.map((child, childIndex) => 
                  renderNavigationItem(child, index + childIndex + 1, depth + 1)
                )}
              </ul>
            )}
          </div>
        ) : (
          // Regular navigation item or collapsed parent
          <Link
            to={item.path}
            data-nav-index={index}
            className={`
              flex items-center px-3 py-2.5 rounded-lg transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${active 
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
              ${collapsed ? 'justify-center' : 'justify-start'}
              ${item.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
            `}
            onMouseEnter={(e) => handleMouseEnter(e, item.id)}
            onMouseLeave={handleMouseLeave}
            onKeyDown={(e) => handleKeyDown(e, index)}
            title={collapsed ? item.label : undefined}
            aria-current={active ? 'page' : undefined}
            aria-label={item.label}
          >
            <Icon className={`
              w-5 h-5 flex-shrink-0
              ${active ? 'text-blue-700' : 'text-gray-500'}
              ${!collapsed ? 'mr-3' : ''}
            `} />
            
            {!collapsed && (
              <>
                <span className="font-medium truncate flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {hasChildren && (
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-2" />
                )}
              </>
            )}
          </Link>
        )}
      </li>
    );
  };

  return (
    <nav 
      ref={navigationRef}
      className={`
        bg-white border-r border-gray-200 
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-64'}
        ${className}
      `}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Header */}
      {showBranding && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!collapsed && (
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                VerifyCert
              </h2>
            </div>
          )}
          {collapsed && (
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
          )}
          {showToggleButton && onToggle && (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!collapsed}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              )}
            </button>
          )}
        </div>
      )}

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-2">
          <ul className="space-y-1" role="list">
            {items.map((item, index) => renderNavigationItem(item, index))}
          </ul>
        </div>
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-gray-200 p-4">
          <div className="text-xs text-gray-500 text-center">
            v1.0.0
          </div>
        </div>
      )}

      {/* Tooltip for collapsed state */}
      {collapsed && hoveredItem && (
        <div 
          ref={tooltipRef}
          className="fixed bg-gray-900 text-white text-sm px-2 py-1 rounded shadow-lg z-50 pointer-events-none transform -translate-y-1/2"
        >
          {items.find(item => item.id === hoveredItem)?.label}
        </div>
      )}
    </nav>
  );
}
}}}}}}}}}