import React, { useState, useEffect } from 'react';
import { User, Shield, Bell, Palette, Globe, Key, Download, Trash2 } from 'lucide-react';
import { Card, Button, Input, Select, Modal } from '../components/ui';
import toast from 'react-hot-toast';

interface UserProfile {
  name: string;
  email: string;
  organization: string;
  role: string;
  avatar?: string;
  walletAddress?: string;
  bio?: string;
  website?: string;
  location?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  certificateIssued: boolean;
  certificateVerified: boolean;
  systemUpdates: boolean;
  marketingEmails: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  loginNotifications: boolean;
  apiKeyEnabled: boolean;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john.doe@university.edu',
    organization: 'University of Technology',
    role: 'Certificate Administrator',
    bio: 'Experienced certificate administrator with 5+ years in educational technology.',
    website: 'https://university.edu',
    location: 'San Francisco, CA',
    walletAddress: '0x1234...5678'
  });

  // Notification settings state
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    certificateIssued: true,
    certificateVerified: false,
    systemUpdates: true,
    marketingEmails: false
  });

  // Security settings state
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginNotifications: true,
    apiKeyEnabled: false
  });

  // Appearance settings state
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: 'system',
    language: 'en',
    timezone: 'America/Los_Angeles',
    dateFormat: 'MM/DD/YYYY'
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'advanced', label: 'Advanced', icon: Globe }
  ];

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Account deletion initiated');
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
          <Input
            label="Organization"
            value={profile.organization}
            onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
          />
          <Input
            label="Role"
            value={profile.role}
            onChange={(e) => setProfile({ ...profile, role: e.target.value })}
          />
          <Input
            label="Website"
            value={profile.website || ''}
            onChange={(e) => setProfile({ ...profile, website: e.target.value })}
          />
          <Input
            label="Location"
            value={profile.location || ''}
            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={profile.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Wallet Information</h3>
        <Input
          label="Wallet Address"
          value={profile.walletAddress || ''}
          disabled
          helperText="Your connected wallet address"
        />
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Authentication</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Two-Factor Authentication</label>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <Button
              variant={security.twoFactorEnabled ? 'danger' : 'primary'}
              size="sm"
              onClick={() => setSecurity({ ...security, twoFactorEnabled: !security.twoFactorEnabled })}
            >
              {security.twoFactorEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Login Notifications</label>
              <p className="text-sm text-gray-500">Get notified when someone logs into your account</p>
            </div>
            <input
              type="checkbox"
              checked={security.loginNotifications}
              onChange={(e) => setSecurity({ ...security, loginNotifications: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Session Management</h3>
        <Select
          label="Session Timeout"
          value={security.sessionTimeout.toString()}
          onChange={(value) => setSecurity({ ...security, sessionTimeout: parseInt(value) })}
          options={[
            { value: '15', label: '15 minutes' },
            { value: '30', label: '30 minutes' },
            { value: '60', label: '1 hour' },
            { value: '240', label: '4 hours' }
          ]}
        />
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">API Access</h3>
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-900">API Key Access</label>
            <p className="text-sm text-gray-500">Enable API key for programmatic access</p>
          </div>
          <Button
            variant={security.apiKeyEnabled ? 'danger' : 'primary'}
            size="sm"
            icon={<Key className="w-4 h-4" />}
            onClick={() => setSecurity({ ...security, apiKeyEnabled: !security.apiKeyEnabled })}
          >
            {security.apiKeyEnabled ? 'Revoke' : 'Generate'}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <p className="text-sm text-gray-500">
                  {key === 'emailNotifications' && 'Receive email notifications for important updates'}
                  {key === 'certificateIssued' && 'Get notified when you issue a new certificate'}
                  {key === 'certificateVerified' && 'Get notified when someone verifies your certificates'}
                  {key === 'systemUpdates' && 'Receive notifications about system updates and maintenance'}
                  {key === 'marketingEmails' && 'Receive promotional emails and newsletters'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Theme</h3>
        <Select
          label="Color Theme"
          value={appearance.theme}
          onChange={(value) => setAppearance({ ...appearance, theme: value as 'light' | 'dark' | 'system' })}
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' }
          ]}
        />
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Localization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Language"
            value={appearance.language}
            onChange={(value) => setAppearance({ ...appearance, language: value })}
            options={[
              { value: 'en', label: 'English' },
              { value: 'es', label: 'Spanish' },
              { value: 'fr', label: 'French' },
              { value: 'de', label: 'German' }
            ]}
          />
          <Select
            label="Timezone"
            value={appearance.timezone}
            onChange={(value) => setAppearance({ ...appearance, timezone: value })}
            options={[
              { value: 'America/Los_Angeles', label: 'Pacific Time' },
              { value: 'America/New_York', label: 'Eastern Time' },
              { value: 'Europe/London', label: 'GMT' },
              { value: 'Asia/Tokyo', label: 'JST' }
            ]}
          />
        </div>
        <Select
          label="Date Format"
          value={appearance.dateFormat}
          onChange={(value) => setAppearance({ ...appearance, dateFormat: value })}
          options={[
            { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
            { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
            { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
          ]}
        />
      </div>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Management</h3>
        <div className="space-y-4">
          <Button
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
            onClick={() => toast.success('Data export initiated')}
          >
            Export Data
          </Button>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-red-900 mb-4">Danger Zone</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-red-900">Delete Account</h4>
              <p className="text-sm text-red-700">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button
              variant="danger"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <Card className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Card className="p-6">
              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'security' && renderSecurityTab()}
              {activeTab === 'notifications' && renderNotificationsTab()}
              {activeTab === 'appearance' && renderAppearanceTab()}
              {activeTab === 'advanced' && renderAdvancedTab()}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t">
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Delete Account Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Account"
        >
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Are you sure you want to delete your account?
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                loading={isLoading}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Settings;