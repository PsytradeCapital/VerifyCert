import { useMemo } from 'react';

interface ActiveIndicatorStyles {
  containerClasses: string;
  indicatorClasses: string;
  itemClasses: string;
  transitionClasses: string;
}

export const useActiveIndicator = (itemId: string, isActive: boolean = false): ActiveIndicatorStyles => {
  return useMemo(() => {
    const baseClasses = {
      containerClasses: 'relative overflow-hidden',
      indicatorClasses: `absolute inset-0 transition-all duration-300 ${
        isActive 
          ? 'bg-blue-100 dark:bg-blue-900/20 border-l-4 border-blue-500' 
          : 'bg-transparent'
      }`,
      itemClasses: `relative z-10 transition-colors duration-200 ${
        isActive 
          ? 'text-blue-700 dark:text-blue-300 font-medium' 
          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
      }`,
      transitionClasses: 'transition-all duration-300 ease-in-out'
    };

    return baseClasses;
  }, [itemId, isActive]);
};