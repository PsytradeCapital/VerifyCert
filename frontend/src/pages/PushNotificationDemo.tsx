import React, { useState } from 'react';
import { Bell, Send, Settings, CheckCircle, XCircle } from 'lucide-react';
import PushNotificationSettings from '../components/ui/PushNotificationSettings';
import { usePushNotifications } from '../hooks/usePushNotifications';

const PushNotificationDemo: React.FC = () => {
  const [userId, setUserId] = useState('demo-user-123');
  const [showSettings, setShowSettings] = useState(true);
  const [testResults, setTestResults] = useState<Array<{
    type: string;
    success: boolean;
    message: string;
    timestamp: Date;
  }>>([]);

  const {
    isSupported,
    isSubscribed,
    permission,
    sendTestNotification
  } = usePushNotifications();

  const handleSendTestNotification = async () => {
    const success = await sendTestNotification(userId);
    
    setTestResults(prev => [...prev, {
      type: 'Test Notification',
      success,
      message: success ? 'Test notification sent successfully' : 'Failed to send test notification',
      timestamp: new Date()
    }]);
  };

  const simulateCertificateNotifications = async () => {
    // Simulate different types of certificate notifications
    const notifications = [
      {
        type: 'Certificate Issued',
        endpoint: '/api/v1/notifications/send',
        payload: {
          title: 'New Certificate Issued',
          body: 'You have received a certificate for "Advanced React Development"',
          icon: '/icon-192.png',
          tag: 'certificate-issued',
          data: {
            type: 'certificate-issued',
            certificateId: '123',
            courseName: 'Advanced React Development',
            url: '/certificate/123'
          },
          actions: [
            { action: 'view', title: 'View Certificate' },
            { action: 'share', title: 'Share'
          ]
      },
      {
        type: 'Certificate Verified',
        endpoint: '/api/v1/notifications/send',
        payload: {
          title: 'Certificate Verified',
          body: 'Your certificate for "Advanced React Development" has been verified',
          icon: '/icon-192.png',
          tag: 'certificate-verified',
          data: {
            type: 'certificate-verified',
            certificateId: '123',
            courseName: 'Advanced React Development',
            url: '/certificate/123'
          },
          actions: [
            { action: 'view', title: 'View Details'
          ]
    ];

    for (const notification of notifications) {
      try {
        const response = await fetch(notification.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userIds: [userId],
            payload: notification.payload
          })
        });

        const data = await response.json();
        
        setTestResults(prev => [...prev, {
          type: notification.type,
          success: data.success,
          message: data.message || (data.success ? 'Notification sent' : 'Failed to send'),
          timestamp: new Date()
        }]);

        // Add delay between notifications
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        setTestResults(prev => [...prev, {
          type: notification.type,
          success: false,
          message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date()
        }]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Bell className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Push Notification Demo
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Test and configure push notifications for certificate updates. 
            This demo shows how users can receive real-time notifications when certificates are issued, verified, or updated.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${isSupported ? 'bg-green-100' : 'bg-red-100'}`}>
                {isSupported ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Browser Support</h3>
                <p className="text-sm text-gray-600">
                  {isSupported ? 'Supported' : 'Not Supported'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${permission === 'granted' ? 'bg-green-100' : permission === 'denied' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                {permission === 'granted' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : permission === 'denied' ? (
                  <XCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <Settings className="h-5 w-5 text-yellow-600" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Permission</h3>
                <p className="text-sm text-gray-600 capitalize">
                  {permission}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${isSubscribed ? 'bg-green-100' : 'bg-gray-100'}`}>
                {isSubscribed ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Bell className="h-5 w-5 text-gray-600" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Subscription</h3>
                <p className="text-sm text-gray-600">
                  {isSubscribed ? 'Active' : 'Not Active'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings Panel */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-blue-600 hover:text-blue-800"
              >
                {showSettings ? 'Hide' : 'Show'} Settings
              </button>
            </div>

            {showSettings && (
              <PushNotificationSettings userId={userId} />
            )}

            {/* User ID Input */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Test Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                    User ID for Testing
                  </label>
                  <input
                    type="text"
                    id="userId"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter user ID"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Test Panel */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Test Notifications</h2>

            {/* Test Buttons */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Send Test Notifications</h3>
              <div className="space-y-3">
                <button
                  onClick={handleSendTestNotification}
                  disabled={!isSubscribed}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Simple Test</span>
                </button>

                <button
                  onClick={simulateCertificateNotifications}
                  disabled={!isSubscribed}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Bell className="h-4 w-4" />
                  <span>Simulate Certificate Notifications</span>
                </button>
              </div>

              {!isSubscribed && (
                <p className="text-sm text-gray-600 mt-3">
                  Please subscribe to notifications first to test sending notifications.
                </p>
              )}
            </div>

            {/* Test Results */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Test Results</h3>
              
              {testResults.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  No tests run yet. Click the buttons above to test notifications.
                </p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {testResults.slice().reverse().map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        result.success 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium text-sm">
                            {result.type}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {result.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">
                        {result.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {testResults.length > 0 && (
                <button
                  onClick={() => setTestResults([])}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear Results
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Documentation */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h2>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              This push notification system allows VerifyCert to send real-time updates to users about their certificates:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li><strong>Certificate Issued:</strong> Notifies recipients when a new certificate is minted for them</li>
              <li><strong>Certificate Verified:</strong> Confirms when someone verifies a certificate</li>
              <li><strong>Certificate Revoked:</strong> Alerts users if their certificate status changes</li>
            </ul>
            <p className="text-gray-600 mt-4">
              The system uses Web Push API with VAPID keys for secure, reliable delivery. 
              Notifications work even when the app is closed, providing a native app-like experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PushNotificationDemo;
}
}}}}}}