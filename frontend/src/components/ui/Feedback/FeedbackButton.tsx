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
    'bottom-right': 'bottom-32 right-8',  // Raised higher to avoid overlap
    'bottom-left': 'bottom-32 left-8',    
    'top-right': 'top-8 right-8',
    'top-left': 'top-8 left-8'
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed ${positionClasses[position]} z-50 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 feedback-button border-2 border-white/20 backdrop-blur-sm ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open feedback form"
        style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
      >
        <div className="flex items-center gap-2 px-3 py-2">
          <MessageSquare size={16} style={{ color: '#ffffff', fill: 'none', stroke: '#ffffff' }} />
          <motion.span
            initial={{ width: 0, opacity: 0 }}
            animate={{ 
              width: isHovered ? 'auto' : 0, 
              opacity: isHovered ? 1 : 0 
            }}
            className="overflow-hidden whitespace-nowrap text-xs font-medium"
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