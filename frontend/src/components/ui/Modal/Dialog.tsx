import React from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = ''
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className={`
          inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all 
          sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${className}
        `}>
          {title && (
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            </div>
          )}
          
          <div className="px-4 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dialog;