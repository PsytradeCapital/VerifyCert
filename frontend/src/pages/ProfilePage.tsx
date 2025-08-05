import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Award, BarChart3, Download, Share2 } from 'lucide-react';
import { SettingsPanel } from '../components/ui/Settings';
import { CertificateAnalytics } from '../components/ui/Analytics';
import { CertificateCard } from '../components/ui/CertificateCard';
import { Card } from '../components/ui/Card/Card';
import Button from '../components/ui/Button/Button';

interface UserProfile {
  name: string;
  email: string;
  institution: string;
  role: string;
  avatar?: string;
  joinDate: string;
  totalCertificates: number;
  verifiedCertificates: number;
}

interface Certificate {
  tokenId: string;
  issuer: string;
  recipient: string;
  recipientName: string;
  courseName: string;
  institutionName: string;
  issueDate: number;
  isValid: boolean;
  qrCodeURL?: string;
  verificationURL?: string;
  grade?: string;
}

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    institution: 'University of Technology',
    role: 'student',
    joinDate: '2023-01-15',
    totalCertificates: 12,
    verifiedCertificates: 11
  });

  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      tokenId: '1',
      issuer: '0x1234...5678',
      recipient: '0x8765...4321',
      recipientName: 'John Doe',
      courseName: 'Advanced React Development',
      institutionName: 'Tech Academy',
      issueDate: Date.now() / 1000,
      isValid: true,
      grade: 'A+'
    },
    {
      tokenId: '2',
      issuer: '0x1234...5678',
      recipient: '0x8765...4321',
      recipientName: 'John Doe',
      courseName: 'Blockchain Fundamentals',
      institutionName: 'Crypto University',
      issueDate: (Date.now() - 86400000) / 1000,
      isValid: true,
      grade: 'A'
    }
  ]);

  const analyticsData = {
    totalCertificates: 12,
    totalInstitutions: 5,
    totalRecipients: 1,
    verificationRate: 92,
    monthlyIssuance: [
      { month: 'Jan', count: 2 },
      { month: 'Feb', count: 3 },
      { month: 'Mar', count: 1 },
      { month: 'Apr', count: 4 },
      { month: 'May', count: 2 }
    ],
    topInstitutions: [
      { name: 'Tech Academy', count: 5, percentage: 42 },
      { name: 'Crypto University', count: 3, percentage: 25 },
      { name: 'Design Institute', count: 2, percentage: 17 },
      { name: 'Business School', count: 2, percentage: 16 }
    ]
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleSettingsSave = (settings: any) => {
    setUserProfile(prev => ({ ...prev, ...settings.profile }));
    console.log('Settings saved:', settings);
  };

  const ProfileOverview = () => (
    <div className="space-y-6">
      <Card variant="elevated" padding="lg">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{userProfile.name}</h2>
            <p className="text-gray-600">{userProfile.email}</p>
            <p className="text-gray-600">{userProfile.institution}</p>
            <p className="text-sm text-gray-500 capitalize">
              {userProfile.role} • Joined {new Date(userProfile.joinDate).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <Button variant="outline" size="sm">
              Edit Profile
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="elevated" padding="lg" className="text-center">
          <Award className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{userProfile.totalCertificates}</div>
          <div className="text-sm text-gray-600">Total Certificates</div>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Award className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{userProfile.verifiedCertificates}</div>
          <div className="text-sm text-gray-600">Verified</div>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round((userProfile.verifiedCertificates / userProfile.totalCertificates) * 100)}%
          </div>
          <div className="text-sm text-gray-600">Success Rate</div>
        </Card>
      </div>

      <Card variant="elevated" padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Certificates</h3>
        <div className="space-y-4">
          {certificates.slice(0, 3).map((cert) => (
            <div key={cert.tokenId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{cert.courseName}</div>
                  <div className="text-sm text-gray-600">{cert.institutionName}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">
                  {new Date(cert.issueDate * 1000).toLocaleDateString()}
                </span>
                <Button variant="ghost" size="sm" icon={<Download />}>
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => setActiveTab('certificates')}>
            View All Certificates
          </Button>
        </div>
      </Card>
    </div>
  );

  const CertificatesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Certificates</h2>
        <div className="flex space-x-3">
          <Button variant="outline" icon={<Download />}>
            Download All
          </Button>
          <Button variant="outline" icon={<Share2 />}>
            Share Portfolio
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {certificates.map((certificate) => (
          <CertificateCard
            key={certificate.tokenId}
            certificate={certificate}
            showQR={true}
          />
        ))}
      </div>
    </div>
  );

  const AnalyticsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Certificate Analytics</h2>
      <CertificateAnalytics data={analyticsData} />
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
      <SettingsPanel
        userProfile={userProfile}
        notificationSettings={{
          emailNotifications: true,
          pushNotifications: false,
          certificateIssued: true,
          certificateVerified: true,
          systemUpdates: false
        }}
        privacySettings={{
          profileVisibility: 'public',
          showEmail: false,
          showInstitution: true,
          dataSharing: false
        }}
        appearanceSettings={{
          theme: 'light',
          language: 'en',
          dateFormat: 'MM/DD/YYYY',
          timezone: 'UTC'
        }}
        onSave={handleSettingsSave}
      />
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ProfileOverview />;
      case 'certificates':
        return <CertificatesTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <ProfileOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your certificates and account settings</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;