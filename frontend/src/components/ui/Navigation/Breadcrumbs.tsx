import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import { useBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import { navigationInteractions } from '../../../utils/interactionAnimations';

export interface BreadcrumbItem {
label: string;
  href?: string;
  active?: boolean;

export interface BreadcrumbsProps {
}}}
  items?: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
  showHomeIcon?: boolean;
  maxItems?: number;
  enableAnimations?: boolean;

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator = <ChevronRight className="w-4 h-4" />,
  className = '',
  showHomeIcon = true,
  maxItems,
  enableAnimations = true
}) => {
  const autoBreadcrumbs = useBreadcrumbs();
  const breadcrumbItems = items || autoBreadcrumbs;

  // Truncate breadcrumbs if maxItems is specified
  const displayItems = maxItems && breadcrumbItems.length > maxItems
    ? [
        breadcrumbItems[0],
        { label: '...', active: false },
        ...breadcrumbItems.slice(-(maxItems - 2))
      ]
    : breadcrumbItems;

  if (displayItems.length === 0) {
    return null;

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {displayItems.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-gray-400 select-none flex items-center">
                {separator}
              </span>
            )}
            
            {item.label === '...' ? (
              <span className="text-sm font-medium text-gray-400 px-1">
                {item.label}
              </span>
            ) : item.href && !item.active ? (
              <motion.div
                {...(enableAnimations ? navigationInteractions.breadcrumbItem : {})}
              >
                <Link
                  to={item.href}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1 px-1 py-1 rounded"
                >
                  {index === 0 && showHomeIcon && item.href === '/' && (
                    <Home className="w-4 h-4" />
                  )}
                  {item.label}
                </Link>
              </motion.div>
            ) : (
              <span
                className={`text-sm font-medium px-1 py-1 rounded flex items-center gap-1 ${
                  item.active 
                    ? 'text-gray-900 bg-gray-100' 
                    : 'text-gray-500'
                }`}
                aria-current={item.active ? 'page' : undefined}
              >
                {index === 0 && showHomeIcon && item.label === 'Home' && (
                  <Home className="w-4 h-4" />
                )}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Convenience component that automatically generates breadcrumbs
export const AutoBreadcrumbs: React.FC<Omit<BreadcrumbsProps, 'items'>> = (props) => {
  return <Breadcrumbs {...props} />;
};

export default Breadcrumbs;
}