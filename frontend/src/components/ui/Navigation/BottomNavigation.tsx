import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Search, User, Plus } from 'lucide-react';

export interface BottomNavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number | string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;

export interface BottomNavigationProps {
  items?: BottomNavItem[];
  variant?: 'default' | 'floating';
  showLabels?: boolean;
  className?: string;
  onItemClick?: (item: BottomNavItem) => void;
  onQuickAction?: () => void;

const defaultNavigationItems: BottomNavItem[] = [
  { 
    id: 'home', 
    label: 'Home', 
    href: '/', 
    icon: <Home className="w-6 h-6" />,
  { 
    id: 'verify', 
    label: 'Verify', 
    href: '/verify', 
    icon: <Search className="w-6 h-6" />,
  { 
    id: 'certificates', 
    label: 'Certificates', 
    href: '/certificates', 
    icon: <FileText className="w-6 h-6" />,
  { 
    id: 'profile', 
    label: 'Profile', 
    href: '/profile', 
    icon: <User className="w-6 h-6" />
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items = defaultNavigationItems,
  variant = 'default',
  showLabels = true,
  className = '',
  onItemClick,
  onQuickAction
}) => {
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        const prevIndex = index > 0 ? index - 1 : items.length - 1;
        const prevItem = document.querySelector(`[data-bottom-nav-index="${prevIndex}"]`) as HTMLElement;
        prevItem?.focus();
        break;
      case 'ArrowRight':
        e.preventDefault();
        const nextIndex = index < items.length - 1 ? index + 1 : 0;
        const nextItem = document.querySelector(`[data-bottom-nav-index="${nextIndex}"]`) as HTMLElement;
        nextItem?.focus();
        break;
  };

  const baseClasses = variant === 'floating' 
    ? 'fixed bottom-4 left-4 right-4 z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700'
    : 'fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-area-inset-bottom';

  return (
    <nav className={`${baseClasses} ${className}`}>
      <div className="flex items-center justify-around px-2 py-2" role="tablist">
        {items.map((item, index) => {
          const active = isActive(item.href);

          return (
            <React.Fragment key={item.id}>
              <Link
                to={item.href}
                data-bottom-nav-index={index}
                className={`
                  flex flex-col items-center justify-center px-3 py-2 rounded-lg
                  transition-all duration-200 min-w-0 flex-1
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  ${active 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                `}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onClick={() => {
                  if (!item.disabled && onItemClick) {
                    onItemClick(item);
                }}
                role="tab"
                aria-selected={active}
                aria-current={active ? 'page' : undefined}
                aria-disabled={item.disabled}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                {showLabels && (
                  <span className={`
                    text-xs font-medium truncate mt-1
                    ${active ? 'text-blue-600 dark:text-blue-400' : ''}
                  `}>
                    {item.label}
                  </span>
                )}
              </Link>

              {/* Quick Action Button in the middle */}
              {index === 1 && onQuickAction && (
                <button
                  onClick={onQuickAction}
                  className="
                    flex items-center justify-center w-14 h-14 mx-2
                    bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                    text-white rounded-full shadow-lg
                    transition-all duration-200 transform hover:scale-105
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  "
                  aria-label="Quick action"
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      const prevItem = document.querySelector(`[data-bottom-nav-index="${index}"]`) as HTMLElement;
                      prevItem?.focus();
                    } else if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      const nextItem = document.querySelector(`[data-bottom-nav-index="${index + 1}"]`) as HTMLElement;
                      nextItem?.focus();
                  }}
                >
                  <Plus className="w-6 h-6" />
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};
}}}}}}}}}}