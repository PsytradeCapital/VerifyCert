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

export interface DashboardOverviewProps {
  stats: DashboardStats;
  isLoading?: boolean;
  className?: string;

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
    : undefined;

  const weeklyTrend = stats.previousWeek !== undefined
    ? {
        value: stats.previousWeek === 0 
          ? 100 
          : Math.round(((stats.thisWeek - stats.previousWeek) / stats.previousWeek) * 100),
        isPositive: stats.thisWeek >= (stats.previousWeek || 0),
        label: 'vs last week'
    : undefined;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
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
          color="blue"
          description="All time certificates issued"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <MetricCard
          title="This Month"
          value={stats.thisMonth.toLocaleString()}
          color="green"
          trend={monthlyTrend}
          description="Certificates issued this month"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <MetricCard
          title="This Week"
          value={stats.thisWeek.toLocaleString()}
          color="yellow"
          trend={weeklyTrend}
          description="Certificates issued this week"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <MetricCard
          title="Active Recipients"
          value={stats.activeRecipients.toLocaleString()}
          color="purple"
          description="Unique certificate recipients"
        />
      </motion.div>
    </motion.div>
  );
};

export default DashboardOverview;
}}}}}}}}}