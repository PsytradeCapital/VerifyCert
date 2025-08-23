import React, { useState } from 'react';
import { Bell, BellOff, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { usePushNotifications } from '../../hooks/usePushNotifications';

interface PushNotificationSettingsProps {
userId?: string;
  className?: string;

const PushNotificationSettings: React.FC<PushNotificationSettingsProps> = ({
  userId = 'demo-user',
  className = ''
}) => {
  const {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    sendTestNotification,
    requestPermission,
    clearError
  } = usePushNotifications();

  const [testLoading, setTestLoading] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const handleSubscribe = async () => {
    const success = await subscribe(userId);
    if (success) {
      console.log('Successfully subscribed to push notifications');
  };

  const handleUnsubscribe = async () => {
    const success = await unsubscribe();
    if (success) {
      console.log('Successfully unsubscribed from push notifications');
  };

  const handleTestNotification = async () => {
    setTestLoading(true);
    setTestSuccess(false);
    
    const success = await sendTestNotification(userId);
    
    setTestLoading(false);
    if (success) {
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 3000);
  };

  const handleRequestPermission = async () => {
    await requestPermission();
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { text: 'Granted', color: 'text-green-600', icon: Check };
      case 'denied':
        return { text: 'Denied', color: 'text-red-600', icon: X };
      default:
        return { text: 'Not requested', color: 'text-yellow-600', icon: AlertCircle };
  };

  const permissionStatus = getPermissionStatus();
  const PermissionIcon = permissionStatus.icon;

  if (!isSupported) {
    return (
      <div className={bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}}>
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Push Notifications Not Supported
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, or Safari.
            </p>
          </div>
        </div>
      </div>
    );

  return (
    <div className={bg-white border border-gray-200 rounded-lg p-6 ${className}}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">
            Push Notifications
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <PermissionIcon className={h-4 w-4 ${permissionStatus.color}} />
          <span className={text-sm ${permissionStatus.color}}>
            {permissionStatus.text}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Get notified when certificates are issued, verified, or updated. 
        Stay informed about important certificate activities.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <X className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {/* Permission Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-900">Permission Status</p>
            <p className="text-xs text-gray-600">
              {permission === 'granted' 
                ? 'Notifications are allowed' 
                : permission === 'denied'
                ? 'Notifications are blocked'
                : 'Permission not requested yet'
            </p>
          </div>
          {permission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Request Permission'
              )}
            </button>
          )}
        </div>

        {/* Subscription Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-900">Subscription Status</p>
            <p className="text-xs text-gray-600">
              {isSubscribed 
                ? 'You will receive push notifications' 
                : 'You are not subscribed to notifications'
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isSubscribed ? (
              <button
                onClick={handleUnsubscribe}
                disabled={isLoading || permission !== 'granted'}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <BellOff className="h-4 w-4" />
                    <span>Unsubscribe</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={isLoading || permission !== 'granted'}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Bell className="h-4 w-4" />
                    <span>Subscribe</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Test Notification */}
        {isSubscribed && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Test Notification</p>
              <p className="text-xs text-gray-600">
                Send a test notification to verify everything is working
              </p>
            </div>
            <button
              onClick={handleTestNotification}
              disabled={testLoading || !isSubscribed}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {testLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : testSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Sent!</span>
                </>
              ) : (
                <span>Send Test</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Notification Types */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Notification Types
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Certificate Issued</span>
            <span className="text-green-600">✓ Enabled</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Certificate Verified</span>
            <span className="text-green-600">✓ Enabled</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Certificate Revoked</span>
            <span className="text-green-600">✓ Enabled</span>
          </div>
        </div>
      </div>

      {/* Browser Support Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> Push notifications work best when VerifyCert is installed as a PWA. 
          Notifications may not work in private/incognito mode.
        </p>
      </div>
    </div>
  );
};

export default PushNotificationSettings;
}
}