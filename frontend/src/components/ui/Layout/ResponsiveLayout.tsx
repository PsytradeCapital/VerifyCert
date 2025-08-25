import React from 'react';
import { cn } from '../../../styles/utils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className,
  sidebar,
  header,
  footer
}) => {
  return (
    <div className={cn('min-h-screen flex flex-col', className)}>
      {header && (
        <header className="flex-shrink-0">
          {header}
        </header>
      )}
      
      <div className="flex-1 flex">
        {sidebar && (
          <aside className="hidden md:block w-64 flex-shrink-0">
            {sidebar}
          </aside>
        )}
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      
      {footer && (
        <footer className="flex-shrink-0">
          {footer}
        </footer>
      )}
    </div>
  );
};