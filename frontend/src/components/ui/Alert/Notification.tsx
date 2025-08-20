import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X ;;
} from 'lucide-react';

export interface NotificationProps {
  id?: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number; // in milliseconds, 0 means no auto-dismiss
  onClose?: (id?: string) => void;
  closable?: boolean;
  className?: string;
  icon?: React.ReactNode;
  showIcon?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

const Notification: React.FC<NotificationProps> = ({
  id,
  variant = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  closable = true,
  className = '',
  icon,
  showIcon = true,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.(id);
    }, 200); // Wait for exit animation
  };

  const variantStyles = {
    success: {
      container: 'bg-white border-l-4 border-green-400 shadow-lg',
      icon: 'text-green-400',
      title: 'text-gray-900',
      content: 'text-gray-600'
    },
    error: {
      container: 'bg-white border-l-4 border-red-400 shadow-lg',
      icon: 'text-red-400',
      title: 'text-gray-900',
      content: 'text-gray-600'
    },
    warning: {
      container: 'bg-white border-l-4 border-yellow-400 shadow-lg',
      icon: 'text-yellow-400',
      title: 'text-gray-900',
      content: 'text-gray-600'
    },
    info: {
      container: 'bg-white border-l-4 border-blue-400 shadow-lg',
      icon: 'text-blue-400',
      title: 'text-gray-900',
      content: 'text-gray-600'
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  const slideVariants = {
    'top-right': {
      initial: { opacity: 0, x: 100, y: -50 },
      animate: { opacity: 1, x: 0, y: 0 },
      exit: { opacity: 0, x: 100, y: -50
    },
    'top-left': {
      initial: { opacity: 0, x: -100, y: -50 },
      animate: { opacity: 1, x: 0, y: 0 },
      exit: { opacity: 0, x: -100, y: -50
    },
    'bottom-right': {
      initial: { opacity: 0, x: 100, y: 50 },
      animate: { opacity: 1, x: 0, y: 0 },
      exit: { opacity: 0, x: 100, y: 50
    },
    'bottom-left': {
      initial: { opacity: 0, x: -100, y: 50 },
      animate: { opacity: 1, x: 0, y: 0 },
      exit: { opacity: 0, x: -100, y: 50
    },
    'top-center': {
      initial: { opacity: 0, y: -100 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -100
    },
    'bottom-center': {
      initial: { opacity: 0, y: 100 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 100
  };

  const defaultIcons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const IconComponent = icon || defaultIcons[variant];
  const styles = variantStyles[variant];
  const variants = slideVariants[position];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed z-50 ${positionClasses[position]}`}
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div
            className={`
              max-w-sm w-full rounded-lg p-4 ${styles.container} ${className}
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
              
              <div className={`${showIcon ? 'ml-3' : ''} flex-1 pt-0.5`}>
                {title && (
                  <p className={`text-sm font-medium ${styles.title}`}>
                    {title}
                  </p>
                )}
                <p className={`text-sm ${styles.content} ${title ? 'mt-1' : ''}`}>
                  {message}
                </p>
              </div>

              {closable && (
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                    onClick={handleClose}
                    aria-label="Close notification"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Progress bar for auto-dismiss */}
            {duration > 0 && (
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden"
                style={{ width: '100%' }}
              >
                <motion.div
                  className={`h-full ${
                    variant === 'success' ? 'bg-green-400' :
                    variant === 'error' ? 'bg-red-400' :
                    variant === 'warning' ? 'bg-yellow-400' :
                    'bg-blue-400'
                  }`}
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: duration / 1000, ease: 'linear' }}
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;
}}}}}}}}}}