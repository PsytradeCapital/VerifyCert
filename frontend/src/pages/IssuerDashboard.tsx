import React, { useState, useEffect } from 'react';
import { Plus, Award, Users, TrendingUp, Calendar } from 'lucide-react';

interface DashboardStats {
  totalCertificates: number;
  activeCertificates: number;
  totalRecipients: number;
  monthlyGrowth: number;
}

const IssuerDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCertificates: 0,
    activeCertificates: 0,
    totalRecipients: 0,
    monthlyGrowth: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = () => {
      setTimeout(() => {
        setStats({
          totalCertificates: 156,
          activeCertificates: 142,
          totalRecipients: 89,
          monthlyGrowth: 12.5
        });
        setIsLoading(false);
      }, 1000);
    };

    loadDashboardData();
  }, []);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    trend?: number;
  }> = ({ title, value, icon: Icon, trend }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last month
            </p>
          )}
        </div>
        <Icon className="h-8 w-8 text-blue-600" />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6 w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Issuer Dashboard</h1>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Issue Certificate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Certificates"
          value={stats.totalCertificates}
          icon={Award}
          trend={stats.monthlyGrowth}
        />
        <StatCard
          title="Active Certificates"
          value={stats.activeCertificates}
          icon={TrendingUp}
        />
        <StatCard
          title="Total Recipients"
          value={stats.totalRecipients}
          icon={Users}
        />
        <StatCard
          title="This Month"
          value={Math.floor(stats.monthlyGrowth)}
          icon={Calendar}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Certificate issued to John Doe</span>
              <span className="text-xs text-gray-400">2 hours ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Certificate verified by Jane Smith</span>
              <span className="text-xs text-gray-400">4 hours ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Certificate updated for Mike Johnson</span>
              <span className="text-xs text-gray-400">1 day ago</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <div className="font-medium text-gray-900">Issue New Certificate</div>
              <div className="text-sm text-gray-500">Create and issue a new certificate</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <div className="font-medium text-gray-900">Manage Templates</div>
              <div className="text-sm text-gray-500">Create and edit certificate templates</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <div className="font-medium text-gray-900">View Analytics</div>
              <div className="text-sm text-gray-500">See detailed analytics and reports</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssuerDashboard;