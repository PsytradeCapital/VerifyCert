import React from 'react';
import Modal, { ModalProps } from './Modal';

export interface DialogProps extends Omit<ModalProps, 'children'> {
  children: React.ReactNode;
  actions?: React.ReactNode;
  description?: string;
}

const Dialog: React.FC<DialogProps> = ({
  children,
  actions,
  description,
  className = '',
  ...modalProps
}) => {
  return (
    <Modal
      {...modalProps}
      className={`${className}`}
    >
      <div className="p-6">
        {/* Content */}
        <div className="mb-6">
          {description && (
            <p className="text-gray-600 mb-4">{description}</p>
          )}
          {children}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            {actions}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default Dialog;