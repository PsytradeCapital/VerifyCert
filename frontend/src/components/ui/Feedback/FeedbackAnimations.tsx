import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;

export interface FeedbackAnimationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
};

const toastColors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
};

const iconColors = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500'
};

// Toast notification component
export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = toastIcons[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`
            max-w-sm w-full border rounded-lg shadow-lg p-4 mb-4
            ${toastColors[type]}
          `}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start">
            <Icon className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${iconColors[type]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{title}</p>
              {message && (
                <p className="text-sm mt-1 opacity-90">{message}</p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Feedback animation wrapper
export const FeedbackAnimation: React.FC<FeedbackAnimationProps> = ({
  type,
  children,
  className = ''
}) => {
  const animationVariants = {
    success: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { 
        scale: [0.8, 1.1, 1], 
        opacity: 1,
        transition: { duration: 0.5, ease: 'easeOut'
    },
    error: {
      initial: { x: 0 },
      animate: { 
        x: [-10, 10, -10, 10, 0],
        transition: { duration: 0.5, ease: 'easeInOut'
    },
    warning: {
      initial: { y: 0 },
      animate: { 
        y: [-5, 0, -5, 0],
        transition: { duration: 0.6, ease: 'easeInOut'
    },
    info: {
      initial: { opacity: 0, y: 20 },
      animate: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut'
  };

  return (
    <motion.div
      className={className}
      variants={animationVariants[type]}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  );
};

// Toast manager
class ToastManager {
  private toasts: ToastProps[] = [];
  private listeners: ((toasts: ToastProps[]) => void)[] = [];

  subscribe(listener: (toasts: ToastProps[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));

  show(toast: Omit<ToastProps, 'id'>) {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: () => this.remove(id)
    };
    
    this.toasts.push(newToast);
    this.notify();
    
    return id;

  remove(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notify();

  clear() {
    this.toasts = [];
    this.notify();

export const toastManager = new ToastManager();

// Toast container component
export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts);
    return unsubscribe;
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Convenience functions
export const toast = {
  success: (title: string, message?: string, duration?: number) =>
    toastManager.show({ type: 'success', title, message, duration }),
  
  error: (title: string, message?: string, duration?: number) =>
    toastManager.show({ type: 'error', title, message, duration }),
  
  warning: (title: string, message?: string, duration?: number) =>
    toastManager.show({ type: 'warning', title, message, duration }),
  
  info: (title: string, message?: string, duration?: number) =>
    toastManager.show({ type: 'info', title, message, duration }),
};
}}}}}}}}}}}}}}}}}