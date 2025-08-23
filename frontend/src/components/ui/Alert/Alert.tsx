import React from 'react';
import { motion } from 'framer-motion';
import { ;;
  CheckCircle, ;;
  AlertCircle, ;;
  AlertTriangle, ;;
  Info, ;;
  X ;;
} from 'lucide-react';

export interface AlertProps {
variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  closable?: boolean;
  className?: string;
  icon?: React.ReactNode;
  showIcon?: boolean;

const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  closable = false,
  className = '',
  icon,
  showIcon = true
}) => {
  const variantStyles = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: 'text-green-400',
      title: 'text-green-800',
      content: 'text-green-700'
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: 'text-red-400',
      title: 'text-red-800',
      content: 'text-red-700'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: 'text-yellow-400',
      title: 'text-yellow-800',
      content: 'text-yellow-700'
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'text-blue-400',
      title: 'text-blue-800',
      content: 'text-blue-700'
  };

  const defaultIcons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const IconComponent = icon || defaultIcons[variant];
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        rounded-md border p-4 ${styles.container} ${className}
      `}
      role="alert"
    >
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0">
            {React.isValidElement(IconComponent) ? (
              IconComponent
            ) : (
              React.createElement(IconComponent as React.ComponentType<any>, { 
                className: `h-5 w-5 ${styles.icon}` 
              })
            )}
          </div>
        )}
        
        <div className={`${showIcon ? 'ml-3' : ''} flex-1`}>
          {title && (
            <h3 className={`text-sm font-medium ${styles.title} mb-1`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${styles.content}`}>
            {children}
          </div>
        </div>

        {closable && onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={`
                  inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2
                  hover:bg-opacity-20 hover:bg-gray-600 transition-colors
                  ${styles.icon}
                `}
                aria-label="Dismiss alert"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Alert;
}}