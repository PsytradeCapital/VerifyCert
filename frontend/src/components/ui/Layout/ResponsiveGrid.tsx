import React from 'react';
import { cn } from '../../../styles/utils';

export interface ResponsiveGridProps {
}
}
}
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  breakpoints?: {
    sm?: 1 | 2 | 3 | 4 | 6 | 12;
    md?: 1 | 2 | 3 | 4 | 6 | 12;
    lg?: 1 | 2 | 3 | 4 | 6 | 12;
    xl?: 1 | 2 | 3 | 4 | 6 | 12;
  };

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = 1,
  gap = 'md',
  className = '',
  as: Component = 'div',
  breakpoints = {},
}) => {
  const gapClasses = {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
    xl: 'gap-8 sm:gap-12'
  };

  const getColumnClass = (cols: number) => {
    const columnMap = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      6: 'grid-cols-6',
      12: 'grid-cols-12'
    };
    return columnMap[cols as keyof typeof columnMap] || 'grid-cols-1';
  };

  const baseClasses = cn(
    'grid',
    getColumnClass(columns),
    gapClasses[gap]
  );

  const breakpointClasses = [
    breakpoints.sm && `sm:${getColumnClass(breakpoints.sm)}`,
    breakpoints.md && `md:${getColumnClass(breakpoints.md)}`,
    breakpoints.lg && `lg:${getColumnClass(breakpoints.lg)}`,
    breakpoints.xl && `xl:${getColumnClass(breakpoints.xl)}`
  ].filter(Boolean).join(' ');

  const combinedClasses = cn(
    baseClasses,
    breakpointClasses,
    className
  );

  return (
    <Component className={combinedClasses}>
      {children}
    </Component>
  );
};

export default ResponsiveGrid;