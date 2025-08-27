import React, { createContext, useContext, useState } from 'react';

interface NavigationState {
  currentPath: string;
  history: string[];
}

interface NavigationContextType {
  state: NavigationState;
  navigate: (path: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationStateManagerProps {
  children: React.ReactNode;
  initialPath?: string;
}

export const NavigationStateManager: React.FC<NavigationStateManagerProps> = ({
  children,
  initialPath = '/'
}) => {
  const [state, setState] = useState<NavigationState>({
    currentPath: initialPath,
    history: [initialPath]
  });

  const navigate = (path: string) => {
    setState(prev => ({
      currentPath: path,
      history: [...prev.history, path]
    }));
  };

  const value: NavigationContextType = {
    state,
    navigate
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
    throw new Error('useNavigation must be used within a NavigationStateManager');
  }
  return context;
};

export default NavigationStateManager;
export type { NavigationStateManagerProps };