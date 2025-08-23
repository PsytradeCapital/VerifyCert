import React from 'react';
import { 
  Home, 
  FileText, 
  Settings, 
  User, 
  Shield, ;
  BarChart3,;;
  HelpCircle,;;
  Bell;;
} from 'lucide-react';
import AppLayout from '../components/ui/Layout/AppLayout';
import { NavigationItem } from '../components/ui/Navigation/SideNavigation';
import { BottomNavItem } from '../components/ui/Navigation/BottomNavigation';
import { Card } from '../components/ui';

const LayoutDemo: React.FC = () => {
  // Sample navigation items for sidebar
  const navigationItems: NavigationItem[] = [
    {
      id: 'home',
      label: 'Home',
      href: '/',
      icon: <Home className="w-5 h-5" />,
      active: true
    },
    {
      id: 'verify',
      label: 'Verify Certificate',
      href: '/verify',
      icon: <Shield className="w-5 h-5" />,
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: <BarChart3 className="w-5 h-5" />,
      children: [
        {
          id: 'overview',
          label: 'Overview',
          href: '/dashboard/overview',
          icon: <BarChart3 className="w-4 h-4" />,
        {
          id: 'certificates',
          label: 'Certificates',
          href: '/dashboard/certificates',
          icon: <FileText className="w-4 h-4" />
      ]
    },
    {
      id: 'profile',
      label: 'Profile',
      href: '/profile',
      icon: <User className="w-5 h-5" />,
    {
      id: 'settings',
      label: 'Settings',
      href: '/settings',
      icon: <Settings className="w-5 h-5" />,
    {
      id: 'help',
      label: 'Help & Support',
      href: '/help',
      icon: <HelpCircle className="w-5 h-5" />
  ];

  // Sample bottom navigation items for mobile
  const bottomNavItems: BottomNavItem[] = [
    {
      id: 'home',
      label: 'Home',
      href: '/',
      icon: <Home className="w-6 h-6" />,
      active: true
    },
    {
      id: 'verify',
      label: 'Verify',
      href: '/verify',
      icon: <Shield className="w-6 h-6" />,
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: <BarChart3 className="w-6 h-6" />,
      badge: 3
    },
    {
      id: 'profile',
      label: 'Profile',
      href: '/profile',
      icon: <User className="w-6 h-6" />
  ];

  return (
    <AppLayout
      showSidebar={true}
      showBottomNav={true}
      navigationItems={navigationItems}
      bottomNavItems={bottomNavItems}
      title="VerifyCert"
      showSearch={true}
      onSearchClick={() => alert('Search clicked!')}
      userMenu={{
        walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
        isWalletConnected: true,
        notifications: 3,
        onWalletConnect: () => alert('Connect wallet clicked!'),
        onWalletDisconnect: () => alert('Disconnect wallet clicked!'),
        onProfileClick: () => alert('Profile clicked!'),
        onSettingsClick: () => alert('Settings clicked!')
      }}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            AppLayout Demo
          </h1>
          <p className="text-neutral-600">
            This page demonstrates the responsive AppLayout component with sidebar navigation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">
              Responsive Design
            </h3>
            <p className="text-neutral-600 text-sm">
              The layout adapts to different screen sizes. On desktop, you'll see a collapsible sidebar. 
              On mobile, the sidebar becomes a slide-out menu and bottom navigation appears.
            </p>
          </Card>

          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">
              Navigation Features
            </h3>
            <ul className="text-neutral-600 text-sm space-y-1">
              <li>• Collapsible sidebar on desktop</li>
              <li>• Mobile slide-out menu</li>
              <li>• Bottom navigation on mobile</li>
              <li>• Active state indicators</li>
              <li>• Nested navigation support</li>
            </ul>
          </Card>

          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">
              Header Features
            </h3>
            <ul className="text-neutral-600 text-sm space-y-1">
              <li>• Sticky header with branding and logo</li>
              <li>• Sidebar toggle with proper icons</li>
              <li>• Search functionality (desktop bar, mobile button)</li>
              <li>• Primary "Verify Now" CTA button</li>
              <li>• User menu with wallet integration</li>
              <li>• Notification badges</li>
              <li>• Profile, settings, and disconnect options</li>
              <li>• Responsive behavior across devices</li>
            </ul>
          </Card>
        </div>

        <Card variant="outlined" padding="lg">
          <h3 className="text-lg font-semibold text-neutral-900 mb-3">
            Testing Instructions
          </h3>
          <div className="space-y-3 text-sm text-neutral-600">
            <p>
              <strong>Desktop:</strong> Try clicking the collapse button next to the logo to toggle the sidebar width.
            </p>
            <p>
              <strong>Mobile:</strong> Resize your browser window or use developer tools to test mobile view. 
              The hamburger menu will appear and bottom navigation will show.
            </p>
            <p>
              <strong>Navigation:</strong> Click on navigation items to see active states. 
              Try expanding the "Dashboard" item to see nested navigation.
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="default" padding="lg">
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">
              Content Area
            </h3>
            <p className="text-neutral-600 text-sm mb-4">
              This is the main content area. It automatically adjusts its width based on the sidebar state.
            </p>
            <div className="bg-neutral-100 rounded-lg p-4">
              <p className="text-neutral-700 text-sm">
                Content flows naturally and maintains proper spacing regardless of sidebar state.
              </p>
            </div>
          </Card>

          <Card variant="default" padding="lg">
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">
              Responsive Behavior
            </h3>
            <p className="text-neutral-600 text-sm mb-4">
              The layout uses design tokens for consistent spacing and colors.
            </p>
            <div className="space-y-2">
              <div className="bg-primary-100 text-primary-800 px-3 py-2 rounded text-sm">
                Primary colors from design tokens
              </div>
              <div className="bg-neutral-100 text-neutral-800 px-3 py-2 rounded text-sm">
                Neutral colors for content
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default LayoutDemo;
}}}}}}}}