import React from 'react';
import { motion } from 'framer-motion';

interface CircularProgressProps {
}
}
}
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 'md',
  color = 'primary',
  strokeWidth,
  showLabel = false,
  className = ''
}) => {
  const sizeMap = {
    sm: { dimension: 40, defaultStroke: 3 },
    md: { dimension: 60, defaultStroke: 4 },
    lg: { dimension: 80, defaultStroke: 5 },
    xl: { dimension: 120, defaultStroke: 6 },
  };

  const colorClasses = {
    primary: 'stroke-blue-600',
    secondary: 'stroke-gray-600',
    success: 'stroke-green-600',
    warning: 'stroke-yellow-600',
    error: 'stroke-red-600',
  };

  const { dimension, defaultStroke } = sizeMap[size];
  const stroke = strokeWidth || defaultStroke;
  const radius = (dimension - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={dimension}
        height={dimension}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="none"
          className="text-gray-200"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          className={colorClasses[color]}
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-700">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default CircularProgress;