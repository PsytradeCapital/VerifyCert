import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Star, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../Button/Button';
import Input from '../Input/Input';
import Card from '../Card/Card';

interface FeedbackData {
  category: 'navigation' | 'visual-design' | 'overall-experience';
  rating: number;
  feedback: string;
  page: string;
  timestamp: number;
  userAgent: string;
  screenSize: string;
}

interface FeedbackCollectorProps {
  isOpen: boolean;
  onClose: () => void;
  category?: 'navigation' | 'visual-design' | 'overall-experience';
  context?: string;
}

export const FeedbackCollector: React.FC<FeedbackCollectorProps> = ({
  isOpen,
  onClose,
  category = 'overall-experience',
  context = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const categories = [
    { value: 'navigation', label: 'Navigation & User Flow', icon: '🧭' },
    { value: 'visual-design', label: 'Visual Design & Layout', icon: '🎨' },
    { value: 'overall-experience', label: 'Overall Experience', icon: '⭐' }
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
      setFeedback('');
      setIsSubmitting(false);
    }
  }, [isOpen, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !feedback.trim()) return;

    setIsSubmitting(true);

    const feedbackData: FeedbackData = {
      category: selectedCategory,
      rating,
      feedback: feedback.trim(),
      page: window.location.pathname,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`
    };

    try {
      // Store feedback locally and send to analytics
      const existingFeedback = JSON.parse(localStorage.getItem('verifycert-feedback') || '[]');
      existingFeedback.push(feedbackData);
      localStorage.setItem('verifycert-feedback', JSON.stringify(existingFeedback));

      // Send to analytics service (if available)
      if (window.gtag) {
        window.gtag('event', 'feedback_submitted', {
          category: selectedCategory,
          rating,
          page: window.location.pathname
        });
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      onClose();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = () => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          className={`p-1 transition-colors ${
            star <= rating 
              ? 'text-yellow-400 hover:text-yellow-500' 
              : 'text-gray-300 hover:text-gray-400'
          }`}
          aria-label={`Rate ${star} out of 5 stars`}
        >
          <Star 
            size={24} 
            fill={star <= rating ? 'currentColor' : 'none'}
          />
        </button>
      ))}
      {rating > 0 && (
        <span className="ml-2 text-sm text-gray-600">
          {ratingLabels[rating - 1]}
        </span>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Feedback Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4 z-50"
          >
            <Card className="max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  <MessageSquare className="text-blue-600" size={24} />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Share Your Feedback
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close feedback form"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What would you like to provide feedback on?
                  </label>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <label
                        key={cat.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedCategory === cat.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={cat.value}
                          checked={selectedCategory === cat.value}
                          onChange={(e) => setSelectedCategory(e.target.value as any)}
                          className="sr-only"
                        />
                        <span className="text-lg mr-3">{cat.icon}</span>
                        <span className="font-medium text-gray-900">
                          {cat.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How would you rate this aspect?
                  </label>
                  <StarRating />
                </div>

                {/* Feedback Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tell us more about your experience
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="What did you like? What could be improved? Any specific suggestions?"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={4}
                    required
                  />
                </div>

                {/* Context Information (Expandable) */}
                <div>
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    Technical Details
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-1"
                      >
                        <div>Page: {window.location.pathname}</div>
                        <div>Screen: {window.innerWidth}x{window.innerHeight}</div>
                        <div>Browser: {navigator.userAgent.split(' ').slice(-2).join(' ')}</div>
                        {context && <div>Context: {context}</div>}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={rating === 0 || !feedback.trim() || isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send Feedback
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};