import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home, FileText, Settings, Users, BarChart3 } from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: string;
}

interface SideNavigationProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
  { id: 'certificates', label: 'Certificates', icon: FileText, path: '/certificates' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { id: 'users', label: 'Users', icon: Users, path: '/users' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export default function SideNavigation({ 
  isCollapsed = false, 
  onToggleCollapse,
  className = '' 
}: SideNavigationProps) {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const isActive = (path: string) => location.pathname === path;

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = index < navigationItems.length - 1 ? index + 1 : 0;
        setFocusedIndex(nextIndex);
        // Focus the next navigation item
        const nextItem = document.querySelector(`[data-nav-index="${nextIndex}"]`) as HTMLElement;
        nextItem?.focus();
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = index > 0 ? index - 1 : navigationItems.length - 1;
        setFocusedIndex(prevIndex);
        // Focus the previous navigation item
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
        const lastIndex = navigationItems.length - 1;
        setFocusedIndex(lastIndex);
        const lastItem = document.querySelector(`[data-nav-index="${lastIndex}"]`) as HTMLElement;
        lastItem?.focus();
        break;
    }
  };

  return (
    <nav className={`
      bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
      transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-16' : 'w-64'}
      ${className}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            VerifyCert
          </h2>
        )}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <div className="p-2">
        <ul className="space-y-1" role="list">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const hovered = hoveredItem === item.id;

            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  data-nav-index={index}
                  className={`
                    flex items-center px-3 py-2.5 rounded-lg transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${active 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-700 dark:border-blue-300' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                    ${isCollapsed ? 'justify-center' : 'justify-start'}
                  `}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  title={isCollapsed ? item.label : undefined}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className={`
                    w-5 h-5 flex-shrink-0
                    ${active ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}
                    ${!isCollapsed ? 'mr-3' : ''}
                  `} />
                  
                  {!isCollapsed && (
                    <>
                      <span className="font-medium truncate">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>

                {/* Tooltip for collapsed state */}
                {isCollapsed && hovered && (
                  <div className="fixed left-16 bg-gray-900 dark:bg-gray-700 text-white text-sm px-2 py-1 rounded shadow-lg z-50 pointer-events-none">
                    {item.label}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            v1.0.0
          </div>
        </div>
      )}
    </nav>
  );
}