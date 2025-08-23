import React, { useRef, useEffect, Children, cloneElement, isValidElement } from 'react';
import { useRovingTabIndex } from '../../../hooks/useFocusManagement';

interface RovingTabIndexProps {
children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  wrap?: boolean;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  className?: string;

const RovingTabIndex: React.FC<RovingTabIndexProps> = ({
  children,
  orientation = 'vertical',
  wrap = true,
  defaultIndex = 0,
  onIndexChange,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<HTMLElement[]>([]);
  const currentIndexRef = useRef(defaultIndex);

  // Update item refs when children change
  useEffect(() => {
    if (containerRef.current) {
      const items = Array.from(
        containerRef.current.querySelectorAll('[data-roving-tab-item]')
      ) as HTMLElement[];
      itemRefs.current = items;
  }, [children]);

  const { handleKeyDown } = useRovingTabIndex(itemRefs.current, currentIndexRef.current);

  const handleContainerKeyDown = (event: React.KeyboardEvent) => {
    const newIndex = handleKeyDown(event.nativeEvent, currentIndexRef.current);
    if (newIndex !== currentIndexRef.current) {
      currentIndexRef.current = newIndex;
      onIndexChange?.(newIndex);
  };

  const enhancedChildren = Children.map(children, (child, index) => {
    if (isValidElement(child)) {
      return cloneElement(child, {
        ...child.props,
        'data-roving-tab-item': true,
        tabIndex: index === currentIndexRef.current ? 0 : -1,
        onFocus: (event: React.FocusEvent) => {
          currentIndexRef.current = index;
          onIndexChange?.(index);
          child.props.onFocus?.(event);
        },
      });
    return child;
  });

  return (
    <div
      ref={containerRef}
      className={className}
      onKeyDown={handleContainerKeyDown}
      role="group"
      aria-orientation={orientation}
    >
      {enhancedChildren}
    </div>
  );
};

export default RovingTabIndex;
}
}