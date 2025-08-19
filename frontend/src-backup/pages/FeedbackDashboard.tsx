import React from 'react';
import { FeedbackDashboard as FeedbackDashboardComponent } from '../components/ui/Feedback';

const FeedbackDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <FeedbackDashboardComponent />
      </div>
    </div>
  );
};

export default FeedbackDashboard;