import React from 'react';
import { motion } from 'framer-motion';
import Card from '../Card/Card';

export interface QuickStatsProps {
verificationRate?: number;
  averageProcessingTime?: string;
  successRate?: number;
  isLoading?: boolean;
  className?: string;

const QuickStats: React.FC<QuickStatsProps> = ({
  verificationRate = 0,
  averageProcessingTime = '0s',
  successRate = 0,
  isLoading = false,
  className = ''
}) => {
  const stats = [
    {
      label: 'Verification Rate',
      value: `${verificationRate}%`,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      color: 'text-green-600'
    },
    {
      label: 'Avg. Processing',
      value: averageProcessingTime,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
      color: 'text-blue-600'
    },
    {
      label: 'Success Rate',
      value: `${successRate}%`,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      color: 'text-purple-600'
  ];

  if (isLoading) {
    return (
      <Card variant="elevated" padding="lg" className={className}>
        <div className="space-y-4">
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="w-8 h-8 bg-gray-200 rounded mx-auto animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );

  return (
    <Card variant="elevated" padding="lg" className={className}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="text-center"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-50 ${stat.color} mb-2`}>
                {stat.icon}
              </div>
              <div className="text-lg font-bold text-gray-900">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default QuickStats;
}
}}