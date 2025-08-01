import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Search, User, Plus } from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
}

interface BottomNavigationProps {
  onQuickAction?: () => void;
  className?: string;
}

const navigationItems: NavigationItem[] = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'verify', label: 'Verify', icon: Search, path: '/verify' },
  { id: 'certificates', label: 'Certificates', icon: FileText, path: '/certificates' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

export default function BottomNavigation({ onQuickAction, className = '' }: BottomNavigationProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`
      fixed bottom-0 left-0 right-0 z-50
      bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700
      safe-area-inset-bottom
      ${className}
    `}>
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <React.Fragment key={item.id}>
              <Link
                to={item.path}
                className={`
                  flex flex-col items-center justify-center px-3 py-2 rounded-lg
                  transition-all duration-200 min-w-0 flex-1
                  ${active 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }
                `}
              >
                <div className="relative">
                  <Icon className={`
                    w-6 h-6 mb-1
                    ${active ? 'text-blue-600 dark:text-blue-400' : ''}
                  `} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={`
                  text-xs font-medium truncate
                  ${active ? 'text-blue-600 dark:text-blue-400' : ''}
                `}>
                  {item.label}
                </span>
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
}