import React from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator = '/',
  className = ''
}) => {
  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-gray-400 select-none">
                {separator}
              </span>
            )}
            {item.href && !item.active ? (
              <a
                href={item.href}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span
                className={`text-sm font-medium ${
                  item.active ? 'text-gray-900' : 'text-gray-500'
                }`}
                aria-current={item.active ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;