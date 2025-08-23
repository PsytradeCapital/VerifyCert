import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { FeedbackCollector } from './FeedbackCollector';

interface FeedbackButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  category?: 'navigation' | 'visual-design' | 'overall-experience';
  context?: string;
  className?: string;
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  position = 'bottom-right',
  category,
  context,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',    
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed ${positionClasses[position]} z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Open feedback form"
        style={{ 
          width: '48px',
          height: '48px',
          minWidth: '48px',
          minHeight: '48px'
        }}
      >
        <div className="flex items-center justify-center w-full h-full">
          <MessageSquare size={20} />
        </div>
      </motion.button>

      <FeedbackCollector
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        category={category}
        context={context}
      />
    </>
  );
};

export default FeedbackButton;