import React from 'react';
import { Link } from 'react-router-dom';

export interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  active?: boolean;
  badge?: string | number;
}

export interface BottomNavigationProps {
  items: BottomNavItem[];
  className?: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items,
  className = ''
}) => {
  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-lg safe-area-inset-bottom ${className}`}>
      <div className={`grid py-2 ${
        items.length === 1 ? 'grid-cols-1' :
        items.length === 2 ? 'grid-cols-2' :
        items.length === 3 ? 'grid-cols-3' :
        'grid-cols-4'
      }`}>
        {items.map((item) => (
          <Link
            key={item.id}
            to={item.href}
            className={`
              relative flex flex-col items-center justify-center px-2 py-2 text-xs font-medium transition-colors
              ${item.active 
                ? 'text-primary-600' 
                : 'text-neutral-500 hover:text-neutral-700'
              }
            `}
          >
            <div className="relative">
              <span className="h-6 w-6 flex items-center justify-center">
                {item.icon}
              </span>
              {item.badge && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-error-500 text-white text-xs rounded-full flex items-center justify-center min-w-4">
                  {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className="mt-1 truncate max-w-12">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;