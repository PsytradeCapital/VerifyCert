import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Home, Settings, User } from 'lucide-react';
import AppLayout from '../AppLayout';
import { NavigationItem } from '../../Navigation/SideNavigation';
import { BottomNavItem } from '../../Navigation/BottomNavigation';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const mockNavigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    icon: <Home className="w-5 h-5" />,
    active: true
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: <Settings className="w-5 h-5" />
];

const mockBottomNavItems: BottomNavItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    icon: <Home className="w-6 h-6" />,
    active: true
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/profile',
    icon: <User className="w-6 h-6" />
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AppLayout', () => {
  it('renders children content', () => {
    renderWithRouter(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('displays the title in header', () => {
    renderWithRouter(
      <AppLayout title="Custom Title">
        <div>Content</div>
      </AppLayout>
    );

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('renders navigation items when sidebar is shown', () => {
    renderWithRouter(
      <AppLayout 
        showSidebar={true}
        navigationItems={mockNavigationItems}
      >
        <div>Content</div>
      </AppLayout>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders bottom navigation when enabled', () => {
    renderWithRouter(
      <AppLayout 
        showBottomNav={true}
        bottomNavItems={mockBottomNavItems}
      >
        <div>Content</div>
      </AppLayout>
    );

    // Bottom nav should be present (though may be hidden on desktop)
    const bottomNavLinks = screen.getAllByText('Home');
    expect(bottomNavLinks.length).toBeGreaterThan(0);
  });

  it('shows wallet address when connected', () => {
    renderWithRouter(
      <AppLayout 
        isWalletConnected={true}
        walletAddress="0x1234567890abcdef1234567890abcdef12345678"
      >
        <div>Content</div>
      </AppLayout>
    );

    expect(screen.getByText('0x1234...5678')).toBeInTheDocument();
  });

  it('renders verify button in header', () => {
    renderWithRouter(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    );

    expect(screen.getByText('Verify Now')).toBeInTheDocument();
  });

  it('toggles mobile menu when hamburger is clicked', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 800,
    });

    renderWithRouter(
      <AppLayout 
        showSidebar={true}
        navigationItems={mockNavigationItems}
      >
        <div>Content</div>
      </AppLayout>
    );

    // Find and click the mobile menu toggle button
    const menuButton = screen.getByLabelText('Toggle navigation menu');
    fireEvent.click(menuButton);

    // Navigation should be visible after clicking
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = renderWithRouter(
      <AppLayout className="custom-class">
        <div>Content</div>
      </AppLayout>
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('hides sidebar when showSidebar is false', () => {
    renderWithRouter(
      <AppLayout 
        showSidebar={false}
        navigationItems={mockNavigationItems}
      >
        <div>Content</div>
      </AppLayout>
    );

    // Navigation items should not be visible
    expect(screen.queryByText('Navigation')).not.toBeInTheDocument();
  });
});
}}