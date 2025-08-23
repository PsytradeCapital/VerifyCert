import React from 'react';

export interface FeedbackAnimationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  onComplete?: () => void;
}

export const FeedbackAnimations: React.FC<FeedbackAnimationProps> = ({
  type,
  message,
  duration = 3000,
  onComplete
}) => {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onComplete]);
  
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };
  
  return (
    <div className={`p-4 rounded-md border ${getTypeStyles()} animate-fade-in`}>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

export default FeedbackAnimations;
