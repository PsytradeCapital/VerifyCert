import React, { useEffect, useRef } from 'react';
import { useFocusTrap } from '../../../hooks/useFocusManagement';

interface FocusTrapProps {
}
}
}
  children: React.ReactNode;
  isActive?: boolean;
  restoreFocus?: boolean;
  className?: string;
  as?: keyof JSX.IntrinsicElements;

const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  isActive = true,
  restoreFocus = true,
  className = '',
  as: Component = 'div',
}) => {
  const { containerRef } = useFocusTrap(isActive);

  return (
    <Component
      ref={containerRef}
      className={className}
      tabIndex={-1}
    >
      {children}
    </Component>
  );
};

export default FocusTrap;