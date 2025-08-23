import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Star, ;;
  AlertTriangle,;;
  Download,;;
  RefreshCw,;;
  Filter;;
} from 'lucide-react';
import Card from '../Card/Card';
import { Button } from '../Button/Button';
import { feedbackService, FeedbackAnalytics, FeedbackData } from '../../../services/feedbackService';

interface FeedbackDashboardProps {
className?: string;

export const FeedbackDashboard: React.FC<FeedbackDashboardProps> = ({ className = ''
}) => {
  const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPage, setSelectedPage] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    setIsLoading(true);
    try {
      const data = feedbackService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
  };

  const handleExport = () => {
    const data = feedbackService.exportFeedback();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verifycert-feedback-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingBgColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-100';
    if (rating >= 3) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="animate-spin text-blue-600" size={32} />
        </div>
      </div>
    );

  if (!analytics || analytics.totalFeedback === 0) {
    return (
      <div className={`p-6 ${className}`}>
        <Card className="text-center py-12">
          <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Yet</h3>
          <p className="text-gray-600">
            Start collecting user feedback to see analytics here.
          </p>
        </Card>
      </div>
    );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Feedback Analytics</h2>
          <p className="text-gray-600">User feedback insights and trends</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={loadAnalytics}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </Button>
          <Button
            variant="secondary"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Feedback</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalFeedback}</p>
            </div>
            <Users className="text-blue-600" size={24} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className={`text-2xl font-bold ${getRatingColor(analytics.averageRating)}`}>
                {analytics.averageRating.toFixed(1)}
              </p>
            </div>
            <Star className="text-yellow-500" size={24} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(analytics.categoryBreakdown).length}
              </p>
            </div>
            <Filter className="text-green-600" size={24} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Urgent Issues</p>
              <p className="text-2xl font-bold text-red-600">
                {analytics.trends.urgentIssues.length}
              </p>
            </div>
            <AlertTriangle className="text-red-600" size={24} />
          </div>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
        <div className="space-y-4">
          {Object.entries(analytics.categoryBreakdown).map(([category, data]) => (
            <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 capitalize">
                    {category.replace('-', ' ')}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getRatingBgColor(data.averageRating)} ${getRatingColor(data.averageRating)}`}>
                      {data.averageRating.toFixed(1)} ⭐
                    </span>
                    <span className="text-sm text-gray-600">
                      {data.count} responses
                    </span>
                  </div>
                </div>
                {data.commonIssues.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {data.commonIssues.map((issue, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded"
                      >
                        {issue}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Page Performance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Page Performance</h3>
        <div className="space-y-3">
          {Object.entries(analytics.pageBreakdown)
            .sort(([,a], [,b]) => b.count - a.count)
            .map(([page, data]) => (
            <div key={page} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <span className="font-medium text-gray-900">{page}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {data.count} responses
                </span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${getRatingBgColor(data.averageRating)} ${getRatingColor(data.averageRating)}`}>
                  {data.averageRating.toFixed(1)} ⭐
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Trends Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Improvement Areas */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="text-red-600" size={20} />
            Needs Improvement
          </h3>
          <div className="space-y-2">
            {analytics.trends.improvementAreas.map((area, index) => (
              <div key={index} className="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm">
                {area}
              </div>
            ))}
            {analytics.trends.improvementAreas.length === 0 && (
              <p className="text-gray-500 text-sm">No major issues identified</p>
            )}
          </div>
        </Card>

        {/* Positive Aspects */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="text-green-600" size={20} />
            Positive Feedback
          </h3>
          <div className="space-y-2">
            {analytics.trends.positiveAspects.map((aspect, index) => (
              <div key={index} className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
                {aspect}
              </div>
            ))}
            {analytics.trends.positiveAspects.length === 0 && (
              <p className="text-gray-500 text-sm">No positive trends identified</p>
            )}
          </div>
        </Card>

        {/* Urgent Issues */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-orange-600" size={20} />
            Urgent Issues
          </h3>
          <div className="space-y-2">
            {analytics.trends.urgentIssues.map((issue, index) => (
              <div key={index} className="px-3 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm">
                {issue}
              </div>
            ))}
            {analytics.trends.urgentIssues.length === 0 && (
              <p className="text-gray-500 text-sm">No urgent issues</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Feedback */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Feedback</h3>
        <div className="space-y-4">
          {analytics.recentFeedback.map((feedback, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 border rounded-lg"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getRatingBgColor(feedback.rating)} ${getRatingColor(feedback.rating)}`}>
                    {feedback.rating} ⭐
                  </span>
                  <span className="text-sm text-gray-600 capitalize">
                    {feedback.category.replace('-', ' ')}
                  </span>
                  <span className="text-sm text-gray-500">
                    {feedback.page}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(feedback.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 text-sm">{feedback.feedback}</p>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
};
}
}}}