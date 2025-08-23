import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { FeedbackCollector } from './FeedbackCollector';

interface FeedbackButtonProps {
position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  category?: 'navigation' | 'visual-design' | 'overall-experience';
  context?: string;
  className?: string;

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  position = 'bottom-right',
  category,
  context,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',  // Smaller, corner position
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
        className={fixed ${positionClasses[position]} z-[9999] bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 feedback-button border-2 border-blue-500 dark:border-blue-600 ${className}}
        whileHover={{ scale: 1.1 }
        whileTap={{ scale: 0.9 }
        aria-label="Open feedback form"
        style={{ 
          backgroundColor: '#2563eb !important', 
          color: '#ffffff !important',
          width: '40px',
          height: '40px',
          minWidth: '40px',
          minHeight: '40px'
        }
      >
        <div className="flex items-center justify-center w-full h-full">
          <MessageSquare 
            size={16}
            style={{ 
              color: '#ffffff !important', 
              fill: 'none', 
              stroke: '#ffffff',
              strokeWidth: '2'
            }
          />
          <motion.span
            initial={{ width: 0, opacity: 0 }
            animate={{ 
              width: isHovered ? 'auto' : 0, 
              opacity: isHovered ? 1 : 0 
            }
            className="overflow-hidden whitespace-nowrap text-xs font-medium ml-2"
            style={{ color: '#ffffff !important' }
          >
            Feedback
          </motion.span>
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
}