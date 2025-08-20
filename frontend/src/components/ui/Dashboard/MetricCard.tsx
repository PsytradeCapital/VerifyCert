import React from 'react';
import { motion } from 'framer-motion';
import Card from '../Card/Card';

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'indigo';
  description?: string;
  className?: string;

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  description,
  className = ''
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-500',
      text: 'text-blue-600',
      lightBg: 'bg-blue-50',
      trendPositive: 'text-blue-600',
      trendNegative: 'text-blue-400'
    },
    green: {
      bg: 'bg-green-500',
      text: 'text-green-600',
      lightBg: 'bg-green-50',
      trendPositive: 'text-green-600',
      trendNegative: 'text-green-400'
    },
    yellow: {
      bg: 'bg-yellow-500',
      text: 'text-yellow-600',
      lightBg: 'bg-yellow-50',
      trendPositive: 'text-yellow-600',
      trendNegative: 'text-yellow-400'
    },
    purple: {
      bg: 'bg-purple-500',
      text: 'text-purple-600',
      lightBg: 'bg-purple-50',
      trendPositive: 'text-purple-600',
      trendNegative: 'text-purple-400'
    },
    red: {
      bg: 'bg-red-500',
      text: 'text-red-600',
      lightBg: 'bg-red-50',
      trendPositive: 'text-red-600',
      trendNegative: 'text-red-400'
    },
    indigo: {
      bg: 'bg-indigo-500',
      text: 'text-indigo-600',
      lightBg: 'bg-indigo-50',
      trendPositive: 'text-indigo-600',
      trendNegative: 'text-indigo-400'
  };

  const colors = colorClasses[color];

  return (
    <Card 
      variant="elevated" 
      padding="lg" 
      hover={true}
      className={`transition-all duration-200 hover:shadow-lg ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <div className={`flex-shrink-0 p-3 rounded-lg ${colors.bg}`}>
              <div className="w-6 h-6 text-white">
                {icon}
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">
                {title}
              </p>
              <div className="flex items-baseline">
                <motion.p 
                  className="text-2xl font-bold text-gray-900"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {value}
                </motion.p>
                {trend && (
                  <motion.div 
                    className="ml-2 flex items-center"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <div className={`flex items-center text-sm font-medium ${
                      trend.isPositive ? colors.trendPositive : colors.trendNegative
                    }`}>
                      {trend.isPositive ? (
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {trend.value}%
                    </div>
                  </motion.div>
                )}
              </div>
              {description && (
                <p className="text-xs text-gray-500 mt-1">
                  {description}
                </p>
              )}
              {trend && (
                <p className="text-xs text-gray-500 mt-1">
                  {trend.label}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MetricCard;
}}