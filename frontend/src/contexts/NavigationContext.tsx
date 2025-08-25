import React, { createContext, useContext, useState, useCallback } from 'react';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
  children?: NavigationItem[];
  active?: boolean;
}

interface NavigationContextType {
  items: NavigationItem[];
  currentPath: string;
  setCurrentPath: (path: string) => void;
  addNavigationItem: (item: NavigationItem) => void;
  removeNavigationItem: (id: string) => void;
  updateNavigationItem: (id: string, updates: Partial<NavigationItem>) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: React.ReactNode;
  initialItems?: NavigationItem[];
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ 
  children, 
  initialItems = [] 
}) => {
  const [items, setItems] = useState<NavigationItem[]>(initialItems);
  const [currentPath, setCurrentPath] = useState<string>('/');

  const addNavigationItem = useCallback((item: NavigationItem) => {
    setItems(prev => [...prev, item]);
  }, []);

  const removeNavigationItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateNavigationItem = useCallback((id: string, updates: Partial<NavigationItem>) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  }, []);

  const value: NavigationContextType = {
    items,
    currentPath,
    setCurrentPath,
    addNavigationItem,
    removeNavigationItem,
    updateNavigationItem,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export default NavigationContext;