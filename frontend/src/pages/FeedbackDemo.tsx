import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, BarChart3, Settings, Users } from 'lucide-react';
import Card from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button/Button';
import { 
  FeedbackButton, 
  FeedbackCollector, ;;
  NavigationFeedback,;;
  VisualDesignFeedback,;;
  OverallExperienceFeedback,;;
  useFeedbackIntegration,;;
  feedbackService;;
} from '../components/ui/Feedback';

const FeedbackDemo: React.FC = () => {
  const [showCollector, setShowCollector] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'navigation' | 'visual-design' | 'overall-experience'>('overall-experience');
  const [analytics, setAnalytics] = useState(feedbackService.getAnalytics());
  
  const { triggerFeedback, FeedbackComponent } = useFeedbackIntegration();

  const refreshAnalytics = () => {
    setAnalytics(feedbackService.getAnalytics());
  };

  const demoScenarios = [
    {
      title: 'Navigation Feedback',
      description: 'Test feedback collection for navigation and user flow issues',
      category: 'navigation' as const,
      icon: <Settings className="text-blue-600" size={24} />,
      context: 'Demo: Navigation experience testing'
    },
    {
      title: 'Visual Design Feedback',
      description: 'Collect feedback on visual design and layout',
      category: 'visual-design' as const,
      icon: <Users className="text-green-600" size={24} />,
      context: 'Demo: Visual design evaluation'
    },
    {
      title: 'Overall Experience',
      description: 'General feedback about the overall user experience',
      category: 'overall-experience' as const,
      icon: <MessageSquare className="text-purple-600" size={24} />,
      context: 'Demo: Overall experience assessment'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Feedback System Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience our comprehensive feedback collection system designed to gather insights 
            on navigation, visual design, and overall user experience.
          </p>
        </div>

        {/* Analytics Overview */}
        <Card className="mb-8 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
              <BarChart3 className="text-blue-600" size={28} />
              Current Feedback Analytics
            </h2>
            <Button onClick={refreshAnalytics} variant="secondary">
              Refresh
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {analytics.totalFeedback}
              </div>
              <div className="text-gray-600">Total Feedback</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {analytics.averageRating.toFixed(1)}
              </div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {Object.keys(analytics.categoryBreakdown).length}
              </div>
              <div className="text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {analytics.trends.urgentIssues.length}
              </div>
              <div className="text-gray-600">Urgent Issues</div>
            </div>
          </div>
        </Card>

        {/* Demo Scenarios */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {demoScenarios.map((scenario, index) => (
            <motion.div
              key={scenario.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  {scenario.icon}
                  <h3 className="text-xl font-semibold text-gray-900">
                    {scenario.title}
                  </h3>
                </div>
                <p className="text-gray-600 mb-6">
                  {scenario.description}
                </p>
                <Button
                  onClick={() => triggerFeedback(scenario.category, scenario.context)}
                  className="w-full"
                >
                  Test {scenario.title}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Integration Examples */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Integration Examples
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Floating Button Example */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Floating Feedback Button
              </h3>
              <div className="relative bg-gray-100 rounded-lg p-8 min-h-[200px]">
                <p className="text-gray-600 mb-4">
                  This demonstrates the floating feedback button that appears on every page.
                </p>
                <FeedbackButton 
                  position="bottom-right"
                  context="Demo: Floating button example"
                />
              </div>
            </div>

            {/* Auto-trigger Example */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Auto-triggered Feedback
              </h3>
              <div className="bg-gray-100 rounded-lg p-8 min-h-[200px]">
                <p className="text-gray-600 mb-4">
                  Feedback can be automatically triggered based on user behavior like time on page or scroll percentage.
                </p>
                <Button
                  onClick={() => {
                    setSelectedCategory('overall-experience');
                    setShowCollector(true);
                  }}
                  variant="secondary"
                >
                  Simulate Auto-trigger
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Specialized Components */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Specialized Feedback Components
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Navigation Feedback</h3>
                <p className="text-gray-600 text-sm">Optimized for collecting navigation and user flow feedback</p>
              </div>
              <NavigationFeedback showFloatingButton={false} showAutoTrigger={false} />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Visual Design Feedback</h3>
                <p className="text-gray-600 text-sm">Focused on visual design and layout feedback</p>
              </div>
              <VisualDesignFeedback showFloatingButton={false} showAutoTrigger={false} />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Overall Experience Feedback</h3>
                <p className="text-gray-600 text-sm">General feedback about the overall user experience</p>
              </div>
              <OverallExperienceFeedback showFloatingButton={false} showAutoTrigger={false} />
            </div>
          </div>
        </Card>

        {/* Features List */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Feedback System Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Collection Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Star rating system (1-5 stars)</li>
                <li>• Category-specific feedback (Navigation, Visual Design, Overall)</li>
                <li>• Contextual information capture</li>
                <li>• Device and browser information</li>
                <li>• Automatic page and timestamp tracking</li>
                <li>• Rich text feedback with validation</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Analytics Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Real-time analytics dashboard</li>
                <li>• Category and page breakdown</li>
                <li>• Trend analysis and insights</li>
                <li>• Common issues identification</li>
                <li>• Positive aspects highlighting</li>
                <li>• Export functionality for external analysis</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Feedback Collector Modal */}
        <FeedbackCollector
          isOpen={showCollector}
          onClose={() => setShowCollector(false)}
          category={selectedCategory}
          context="Demo: Manual feedback trigger"
        />

        {/* Programmatic Feedback Component */}
        <FeedbackComponent />
      </div>
    </div>
  );
};

export default FeedbackDemo;
}