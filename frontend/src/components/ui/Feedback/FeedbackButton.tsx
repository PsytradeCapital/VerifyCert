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
        className={`fixed ${positionClasses[position]} z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 feedback-button ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open feedback form"
        style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
      >
        <div className="flex items-center gap-2 px-4 py-3">
          <MessageSquare size={20} style={{ color: '#ffffff', fill: 'none', stroke: '#ffffff' }} />
          <motion.span
            initial={{ width: 0, opacity: 0 }}
            animate={{ 
              width: isHovered ? 'auto' : 0, 
              opacity: isHovered ? 1 : 0 
            }}
            className="overflow-hidden whitespace-nowrap text-sm font-medium"
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