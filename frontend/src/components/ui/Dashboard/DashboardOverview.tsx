import React from 'react';
import { motion } from 'framer-motion';
import MetricCard from './MetricCard';

export interface DashboardStats {
  totalIssued: number;
  thisMonth: number;
  thisWeek: number;
  activeRecipients: number;
  previousMonth?: number;
  previousWeek?: number;
  growthRate?: number;
}

export interface DashboardOverviewProps {
  stats: DashboardStats;
  isLoading?: boolean;
  className?: string;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  isLoading = false,
  className = ''
}) => {
  // Calculate trends
  const monthlyTrend = stats.previousMonth !== undefined 
    ? {
        value: stats.previousMonth === 0 
          ? 100 
          : Math.round(((stats.thisMonth - stats.previousMonth) / stats.previousMonth) * 100),
        isPositive: stats.thisMonth >= (stats.previousMonth || 0),
        label: 'vs last month'
      }
    : undefined;

  const weeklyTrend = stats.previousWeek !== undefined
    ? {
        value: stats.previousWeek === 0 
          ? 100 
          : Math.round(((stats.thisWeek - stats.previousWeek) / stats.previousWeek) * 100),
        isPositive: stats.thisWeek >= (stats.previousWeek || 0),
        label: 'vs last week'
      }
    : undefined;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <MetricCard
          title="Total Certificates"
          value={stats.totalIssued.toLocaleString()}
          icon={
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="blue"
          description="All time certificates issued"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <MetricCard
          title="This Month"
          value={stats.thisMonth.toLocaleString()}
          icon={
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          }
          color="green"
          trend={monthlyTrend}
          description="Certificates issued this month"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <MetricCard
          title="This Week"
          value={stats.thisWeek.toLocaleString()}
          icon={
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          }
          color="yellow"
          trend={weeklyTrend}
          description="Certificates issued this week"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <MetricCard
          title="Active Recipients"
          value={stats.activeRecipients.toLocaleString()}
          icon={
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          }
          color="purple"
          description="Unique certificate recipients"
        />
      </motion.div>
    </motion.div>
  );
};

export default DashboardOverview;