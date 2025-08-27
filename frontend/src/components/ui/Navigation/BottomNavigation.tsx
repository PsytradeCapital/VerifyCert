import React from 'react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  active?: boolean;
}

interface BottomNavigationProps {
  items: NavigationItem[];
  onItemClick?: (item: NavigationItem) => void;
  className?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items,
  onItemClick,
  className = ''
}) => {
  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 ${className}`}>
      <div className="flex items-center justify-around py-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick?.(item)}
            className={`
              flex flex-col items-center justify-center px-3 py-2 text-xs font-medium rounded-lg transition-colors
              ${item.active 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <div className="w-6 h-6 mb-1">
              {item.icon}
            </div>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
export type { BottomNavigationProps, NavigationItem as BottomNavItem };