import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Star, Send, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Button } from '../Button/Button';
import Card from '../Card/Card';

interface FeedbackData {
  category: 'navigation' | 'visual-design' | 'overall-experience';
  rating: number;
  comment: string;
  context?: string;

interface FeedbackCollectorProps {
  isOpen: boolean;
  onClose: () => void;
  category?: 'navigation' | 'visual-design' | 'overall-experience';
  context?: string;

export const FeedbackCollector: React.FC<FeedbackCollectorProps> = ({
  isOpen,
  onClose,
  category = 'overall-experience',
  context = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const categories = [
    { value: 'navigation', label: 'Navigation & User Flow', icon: '🧭' },
    { value: 'visual-design', label: 'Visual Design & Layout', icon: '🎨' },
    { value: 'overall-experience', label: 'Overall Experience', icon: '⭐'
  ];

  const ratingLabels = [
    'Poor',
    'Fair', 
    'Good',
    'Very Good',
    'Excellent'
  ];

  useEffect(() => {
    if (isOpen) {
      setSelectedCategory(category);
      setRating(0);
      setHoveredRating(0);
      setFeedback('');
      setIsSubmitting(false);
  }, [isOpen, category]);

  const handleSubmit = async () => {
    if (!rating || !feedback.trim()) return;

    setIsSubmitting(true);
    
    try {
      const feedbackData: FeedbackData = {
        category: selectedCategory,
        rating,
        comment: feedback.trim(),
        context
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Feedback submitted:', feedbackData);
      
      // Reset form and close
      setRating(0);
      setHoveredRating(0);
      setFeedback('');
      onClose();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
  };

  const StarRating = () => (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Rate your experience
      </label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            <Star
              size={28}
              className={`transition-colors ${
                star <= (hoveredRating || rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
        {(rating > 0 || hoveredRating > 0) && (
          <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            {ratingLabels[(hoveredRating || rating) - 1]}
          </span>
        )}
      </div>
    </div>
  );

  const CategorySelector = () => (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Feedback Category
      </label>
      <div className="grid grid-cols-1 gap-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setSelectedCategory(cat.value as any)}
            className={`flex items-center p-3 rounded-lg border-2 transition-all ${
              selectedCategory === cat.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
            }`}
          >
            <span className="text-lg mr-3">{cat.icon}</span>
            <span className="font-medium text-gray-900 dark:text-white">{cat.label}</span>
            {selectedCategory === cat.value && (
              <Check size={20} className="ml-auto text-blue-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-sm w-full max-h-[80vh] overflow-hidden border-2 border-gray-200 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <MessageSquare className="text-blue-500" size={24} />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Share Feedback
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
            <CategorySelector />
            <StarRating />
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tell us more (optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Brief feedback..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {context && (
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Context: {context}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <Button
              onClick={handleSubmit}
              disabled={!rating || isSubmitting}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
              style={{ 
                backgroundColor: '#2563eb !important',
                color: '#ffffff !important',
                border: '2px solid #2563eb'
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span style={{ color: '#ffffff !important' }}>Sending...</span>
                </>
              ) : (
                <>
                  <Send 
                    size={24} 
                    style={{ 
                      color: '#ffffff !important',
                      fill: 'none',
                      stroke: '#ffffff',
                      strokeWidth: '3',
                      zIndex: 20,
                      display: 'block',
                      visibility: 'visible'
                    }} 
                  />
                  <span style={{ color: '#ffffff !important' }}>Send</span>
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FeedbackCollector;