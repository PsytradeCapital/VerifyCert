import React from 'react';

interface CircularProgressProps {
  size?: number;
  progress?: number;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  size = 40,
  progress = 0,
  className = ''
}) => {
  const radius = (size - 4) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`inline-block ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="2"
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="2"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-blue-600 transition-all duration-300"
        />
      </svg>
    </div>
  );
};

export default CircularProgress;