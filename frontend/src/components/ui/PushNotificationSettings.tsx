import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Settings, Check, X } from 'lucide-react';

interface PushNotificationSettingsProps {
  className?: string;
}

interface NotificationSettings {
  enabled: boolean;
  certificates: boolean;
  reminders: boolean;
  updates: boolean;
}

export const PushNotificationSettings: React.FC<PushNotificationSettingsProps> = ({ 
  className = '' 
}) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    certificates: true,
    reminders: true,
    updates: false
  });
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        setSettings(prev => ({ ...prev, enabled: true }));
      }
    }
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    if (key === 'enabled' && !settings.enabled && permission !== 'granted') {
      requestPermission();
      return;
    }
    
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const testNotification = () => {
    if (settings.enabled && permission === 'granted') {
      new Notification('VerifyCert Test', {
        body: 'Push notifications are working correctly!',
        icon: '/favicon.ico'
      });
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Push Notifications
        </h3>
      </div>

      <div className="space-y-4">
        {/* Main toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-3">
            {settings.enabled ? (
              <Bell className="w-5 h-5 text-green-600" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Enable Notifications
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive push notifications for important updates
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('enabled')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.enabled 
                ? 'bg-blue-600' 
                : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Individual settings */}
        {settings.enabled && (
          <div className="space-y-3 pl-4 border-l-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Certificate Updates
              </label>
              <button
                onClick={() => handleToggle('certificates')}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  settings.certificates 
                    ? 'bg-blue-600' 
                    : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    settings.certificates ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Reminders
              </label>
              <button
                onClick={() => handleToggle('reminders')}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  settings.reminders 
                    ? 'bg-blue-600' 
                    : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    settings.reminders ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                System Updates
              </label>
              <button
                onClick={() => handleToggle('updates')}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  settings.updates 
                    ? 'bg-blue-600' 
                    : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    settings.updates ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Test button */}
        {settings.enabled && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={testNotification}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Test Notification
            </button>
          </div>
        )}

        {/* Permission status */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Permission status: {permission}
        </div>
      </div>
    </div>
  );
};

export default PushNotificationSettings;