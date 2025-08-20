import React from 'react';
import { cn } from '../../../styles/utils';

export interface GridProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12;
  colsSm?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12;
  colsMd?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12;
  colsLg?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12;
  colsXl?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12;
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  gapX?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  gapY?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  rows?: 'auto' | 1 | 2 | 3 | 4 | 5 | 6;
  autoRows?: 'auto' | 'min' | 'max' | 'fr';
  autoCols?: 'auto' | 'min' | 'max' | 'fr';
  placeItems?: 'start' | 'end' | 'center' | 'stretch';
  placeContent?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly' | 'stretch';
  className?: string;
  as?: keyof JSX.IntrinsicElements;

const Grid: React.FC<GridProps> = ({
  children,
  cols = 1,
  colsSm,
  colsMd,
  colsLg,
  colsXl,
  gap = 'md',
  gapX,
  gapY,
  rows,
  autoRows,
  autoCols,
  placeItems,
  placeContent,
  className = '',
  as: Component = 'div',
  ...rest
}) => {
  // Column classes for different breakpoints
  const getColsClass = (columns: number, prefix = '') => {
    const prefixStr = prefix ? `${prefix}:` : '';
    const colsMap = {
      1: `${prefixStr}grid-cols-1`,
      2: `${prefixStr}grid-cols-2`,
      3: `${prefixStr}grid-cols-3`,
      4: `${prefixStr}grid-cols-4`,
      5: `${prefixStr}grid-cols-5`,
      6: `${prefixStr}grid-cols-6`,
      8: `${prefixStr}grid-cols-8`,
      12: `${prefixStr}grid-cols-12`
    };
    return colsMap[columns] || `${prefixStr}grid-cols-1`;
  };

  // Enhanced gap classes with mobile-first responsive approach
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-1 xs:gap-1.5',
    sm: 'gap-2 xs:gap-3',
    md: 'gap-3 xs:gap-4 sm:gap-5',
    lg: 'gap-4 xs:gap-5 sm:gap-6 lg:gap-8',
    xl: 'gap-6 xs:gap-7 sm:gap-8 lg:gap-10',
    '2xl': 'gap-8 xs:gap-10 sm:gap-12 lg:gap-16'
  };

  const gapXClasses = {
    none: 'gap-x-0',
    xs: 'gap-x-1 xs:gap-x-1.5',
    sm: 'gap-x-2 xs:gap-x-3',
    md: 'gap-x-3 xs:gap-x-4 sm:gap-x-5',
    lg: 'gap-x-4 xs:gap-x-5 sm:gap-x-6 lg:gap-x-8',
    xl: 'gap-x-6 xs:gap-x-7 sm:gap-x-8 lg:gap-x-10',
    '2xl': 'gap-x-8 xs:gap-x-10 sm:gap-x-12 lg:gap-x-16'
  };

  const gapYClasses = {
    none: 'gap-y-0',
    xs: 'gap-y-1 xs:gap-y-1.5',
    sm: 'gap-y-2 xs:gap-y-3',
    md: 'gap-y-3 xs:gap-y-4 sm:gap-y-5',
    lg: 'gap-y-4 xs:gap-y-5 sm:gap-y-6 lg:gap-y-8',
    xl: 'gap-y-6 xs:gap-y-7 sm:gap-y-8 lg:gap-y-10',
    '2xl': 'gap-y-8 xs:gap-y-10 sm:gap-y-12 lg:gap-y-16'
  };

  // Row classes
  const rowsClasses = {
    auto: 'grid-rows-none',
    1: 'grid-rows-1',
    2: 'grid-rows-2',
    3: 'grid-rows-3',
    4: 'grid-rows-4',
    5: 'grid-rows-5',
    6: 'grid-rows-6'
  };

  // Auto sizing classes
  const autoRowsClasses = {
    auto: 'auto-rows-auto',
    min: 'auto-rows-min',
    max: 'auto-rows-max',
    fr: 'auto-rows-fr'
  };

  const autoColsClasses = {
    auto: 'auto-cols-auto',
    min: 'auto-cols-min',
    max: 'auto-cols-max',
    fr: 'auto-cols-fr'
  };

  // Placement classes
  const placeItemsClasses = {
    start: 'place-items-start',
    end: 'place-items-end',
    center: 'place-items-center',
    stretch: 'place-items-stretch'
  };

  const placeContentClasses = {
    start: 'place-content-start',
    end: 'place-content-end',
    center: 'place-content-center',
    between: 'place-content-between',
    around: 'place-content-around',
    evenly: 'place-content-evenly',
    stretch: 'place-content-stretch'
  };

  // Build responsive column classes
  const responsiveColsClasses = cn(
    getColsClass(cols),
    colsSm && getColsClass(colsSm, 'sm'),
    colsMd && getColsClass(colsMd, 'md'),
    colsLg && getColsClass(colsLg, 'lg'),
    colsXl && getColsClass(colsXl, 'xl')
  );

  // Build gap classes
  let gapClassNames = '';
  if (gapX || gapY) {
    gapClassNames = cn(
      gapX ? gapXClasses[gapX] : '',
      gapY ? gapYClasses[gapY] : ''
    );
  } else {
    gapClassNames = gapClasses[gap];

  // Combine all classes
  const combinedClasses = cn(
    'grid',
    responsiveColsClasses,
    gapClassNames,
    rows && rowsClasses[rows],
    autoRows && autoRowsClasses[autoRows],
    autoCols && autoColsClasses[autoCols],
    placeItems && placeItemsClasses[placeItems],
    placeContent && placeContentClasses[placeContent],
    className
  );

  return (
    <Component className={combinedClasses} {...rest}>
      {children}
    </Component>
  );
};

// Grid Item component for more control over individual grid items
export interface GridItemProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';
  colSpanSm?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';
  colSpanMd?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';
  colSpanLg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';
  colSpanXl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 'full';
  colStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 'auto';
  colEnd?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 'auto';
  rowStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 'auto';
  rowEnd?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 'auto';
  justifySelf?: 'auto' | 'start' | 'end' | 'center' | 'stretch';
  alignSelf?: 'auto' | 'start' | 'end' | 'center' | 'stretch';
  className?: string;
  as?: keyof JSX.IntrinsicElements;

export const GridItem: React.FC<GridItemProps> = ({
  children,
  colSpan,
  colSpanSm,
  colSpanMd,
  colSpanLg,
  colSpanXl,
  rowSpan,
  colStart,
  colEnd,
  rowStart,
  rowEnd,
  justifySelf,
  alignSelf,
  className = '',
  as: Component = 'div',
  ...rest
}) => {
  // Column span classes
  const getColSpanClass = (span: GridItemProps['colSpan'], prefix = '') => {
    if (!span) return '';
    const prefixStr = prefix ? `${prefix}:` : '';
    if (span === 'full') return `${prefixStr}col-span-full`;
    return `${prefixStr}col-span-${span}`;
  };

  // Row span classes
  const getRowSpanClass = (span: GridItemProps['rowSpan']) => {
    if (!span) return '';
    if (span === 'full') return 'row-span-full';
    return `row-span-${span}`;
  };

  // Position classes
  const getColStartClass = (start: GridItemProps['colStart']) => {
    if (!start) return '';
    if (start === 'auto') return 'col-start-auto';
    return `col-start-${start}`;
  };

  const getColEndClass = (end: GridItemProps['colEnd']) => {
    if (!end) return '';
    if (end === 'auto') return 'col-end-auto';
    return `col-end-${end}`;
  };

  const getRowStartClass = (start: GridItemProps['rowStart']) => {
    if (!start) return '';
    if (start === 'auto') return 'row-start-auto';
    return `row-start-${start}`;
  };

  const getRowEndClass = (end: GridItemProps['rowEnd']) => {
    if (!end) return '';
    if (end === 'auto') return 'row-end-auto';
    return `row-end-${end}`;
  };

  // Alignment classes
  const justifySelfClasses = {
    auto: 'justify-self-auto',
    start: 'justify-self-start',
    end: 'justify-self-end',
    center: 'justify-self-center',
    stretch: 'justify-self-stretch'
  };

  const alignSelfClasses = {
    auto: 'self-auto',
    start: 'self-start',
    end: 'self-end',
    center: 'self-center',
    stretch: 'self-stretch'
  };

  // Build responsive column span classes
  const responsiveColSpanClasses = cn(
    getColSpanClass(colSpan),
    getColSpanClass(colSpanSm, 'sm'),
    getColSpanClass(colSpanMd, 'md'),
    getColSpanClass(colSpanLg, 'lg'),
    getColSpanClass(colSpanXl, 'xl')
  );

  // Combine all classes
  const combinedClasses = cn(
    responsiveColSpanClasses,
    getRowSpanClass(rowSpan),
    getColStartClass(colStart),
    getColEndClass(colEnd),
    getRowStartClass(rowStart),
    getRowEndClass(rowEnd),
    justifySelf && justifySelfClasses[justifySelf],
    alignSelf && alignSelfClasses[alignSelf],
    className
  );

  return (
    <Component className={combinedClasses} {...rest}>
      {children}
    </Component>
  );
};

export default Grid;
}}}