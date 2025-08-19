import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const IssuerDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 dark:text-white">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please log in to access the issuer dashboard.
          </p>
          <a 
            href="/login" 
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Issuer Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Welcome back, {user?.name}! Manage your certificates here.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📜</div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Certificates</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1,234</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">✅</div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Verified Today</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">56</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">👥</div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Issuers</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">⏳</div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
            Issue New Certificate
          </button>
          <button className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700">
            Batch Upload
          </button>
          <button className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700">
            Export Reports
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <p className="font-medium dark:text-white">Certificate #1234 issued</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">2 hours ago</p>
              </div>
              <span className="text-green-600 text-sm">✅ Completed</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <p className="font-medium dark:text-white">Batch upload completed</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">4 hours ago</p>
              </div>
              <span className="text-green-600 text-sm">✅ Completed</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium dark:text-white">Certificate verified</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">6 hours ago</p>
              </div>
              <span className="text-blue-600 text-sm">🔍 Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssuerDashboard;