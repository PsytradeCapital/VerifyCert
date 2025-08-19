import React from 'react';
import { DashboardOverview, ActivityFeed, QuickStats, DashboardStats, ActivityItem } from './ui';

const DashboardDemo: React.FC = () => {
  const mockStats: DashboardStats = {
    totalIssued: 1250,
    thisMonth: 85,
    thisWeek: 23,
    activeRecipients: 890,
    previousMonth: 72,
    previousWeek: 18,
    growthRate: 18,
  };

  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'issued',
      title: 'Certificate issued to John Doe',
      description: 'React Development Course - Tech University',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      recipient: 'John Doe',
      certificateId: 'CERT-001',
    },
    {
      id: '2',
      type: 'verified',
      title: 'Certificate verified by employer',
      description: 'JavaScript Fundamentals - Code Academy',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      recipient: 'Jane Smith',
      certificateId: 'CERT-002',
    },
    {
      id: '3',
      type: 'issued',
      title: 'Certificate issued to Alice Johnson',
      description: 'Web Design Bootcamp - Design Institute',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      recipient: 'Alice Johnson',
      certificateId: 'CERT-003',
    },
    {
      id: '4',
      type: 'verified',
      title: 'Certificate verified by university',
      description: 'Advanced Python Programming - Tech College',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      recipient: 'Bob Wilson',
      certificateId: 'CERT-004',
    },
    {
      id: '5',
      type: 'issued',
      title: 'Certificate issued to Carol Brown',
      description: 'Data Science Fundamentals - Analytics Academy',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      recipient: 'Carol Brown',
      certificateId: 'CERT-005',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Components Demo</h1>
          <p className="text-gray-600">
            Enhanced dashboard overview with key metrics and visual indicators
          </p>
        </div>

        {/* Dashboard Overview */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboard Overview</h2>
          <DashboardOverview stats={mockStats} />
        </div>

        {/* Activity Feed and Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Feed</h2>
            <ActivityFeed activities={mockActivities} maxItems={5} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <QuickStats 
              verificationRate={95}
              averageProcessingTime="2.3s"
              successRate={98}
            />
          </div>
        </div>

        {/* Loading States */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Loading States</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ActivityFeed activities={[]} isLoading={true} />
            </div>
            <div>
              <QuickStats isLoading={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDemo;