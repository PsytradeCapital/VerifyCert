import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { createModalRelationships, ariaLabels } from '../../../utils/ariaUtils';
import { ModalFocusManager } from '../../../utils/focusManagement';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  backdropClassName?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = '',
  backdropClassName = ''
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const focusManagerRef = useRef<ModalFocusManager | null>(null);
  
  // Create modal relationships for accessibility
  const modalRelationships = createModalRelationships('modal');
  const titleId = title ? modalRelationships.titleId : undefined;
  const descriptionId = modalRelationships.descriptionId;

  // Initialize focus manager
  useEffect(() => {
    if (modalRef.current && !focusManagerRef.current) {
      focusManagerRef.current = new ModalFocusManager(modalRef.current, {
        onEscape: closeOnEscape ? onClose : undefined,
        restoreFocusOnClose: true,
      });
    }
  }, [closeOnEscape, onClose]);

  // Manage focus when modal opens/closes
  useEffect(() => {
    if (focusManagerRef.current) {
      if (isOpen) {
        focusManagerRef.current.activate();
      } else {
        focusManagerRef.current.deactivate();
      }
    }

    // Cleanup on unmount
    return () => {
      if (focusManagerRef.current) {
        focusManagerRef.current.deactivate();
      }
    };
  }, [isOpen]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className={`fixed inset-0 bg-black bg-opacity-50 ${backdropClassName}`}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            className={`
              relative bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]}
              max-h-[90vh] overflow-hidden focus:outline-none
              ${className}
            `}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
          >
            {/* Screen reader description */}
            <div id={descriptionId} className="sr-only">
              Modal dialog. Press Escape to close or use the close button.
            </div>
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                {title && (
                  <h2 id={titleId} className="text-lg font-semibold text-gray-900">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label={ariaLabels.buttons.close}
                    aria-describedby="close-button-description"
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                    <span id="close-button-description" className="sr-only">
                      Close this modal dialog
                    </span>
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-4rem)]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;