import React, { useState, useRef, useEffect, useCallback, ComponentType } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  FileText, 
  Settings, 
  Users, 
  BarChart3,
  Shield,
  Plus
} from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  path: string;
  badge?: string | number;
  children?: NavigationItem[];
}

interface SideNavigationProps {
  items: NavigationItem[];
  isCollapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

const SideNavigation: React.FC<SideNavigationProps> = ({
  items,
  isCollapsed = false,
  onToggle,
  className = ''
}) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const navRef = useRef<HTMLElement>(null);

  const toggleExpanded = useCallback((itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const isActive = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const active = isActive(item.path);

    return (
      <li key={item.id} className="mb-1">
        <div className="relative">
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(item.id)}
              className={`
                w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg
                transition-colors duration-200
                ${active 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                }
                ${isCollapsed ? 'justify-center' : 'justify-between'}
              `}
              style={{ paddingLeft: `${(level * 16) + 12}px` }}
            >
              <div className="flex items-center">
                <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && (
                  <>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </div>
              {!isCollapsed && hasChildren && (
                <ChevronRight 
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isExpanded ? 'rotate-90' : ''
                  }`} 
                />
              )}
            </button>
          ) : (
            <Link
              to={item.path}
              className={`
                w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg
                transition-colors duration-200
                ${active 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                }
              `}
              style={{ paddingLeft: `${(level * 16) + 12}px` }}
            >
              <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
              {!isCollapsed && (
                <>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          )}
        </div>
        
        {hasChildren && isExpanded && !isCollapsed && (
          <ul className="mt-1 space-y-1">
            {item.children?.map(child => renderNavigationItem(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav 
      ref={navRef}
      className={`
        bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${className}
      `}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Navigation
            </h2>
          )}
          {onToggle && (
            <button
              onClick={onToggle}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {items.map(item => renderNavigationItem(item))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default SideNavigation;