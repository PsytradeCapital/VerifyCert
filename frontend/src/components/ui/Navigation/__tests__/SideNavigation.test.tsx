import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SideNavigation, { NavigationItem } from '../SideNavigation';
import { Home, Settings, User } from 'lucide-react';

const mockNavigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    icon: Home,
    active: true
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    children: [
      {
        id: 'profile',
        label: 'Profile',
        path: '/settings/profile',
        icon: User
      },
      {
        id: 'preferences',
        label: 'Preferences',
        path: '/settings/preferences',
        icon: Settings
    ]
  },
  {
    id: 'disabled',
    label: 'Disabled Item',
    path: '/disabled',
    icon: Settings,
    disabled: true
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('SideNavigation', () => {
  beforeEach(() => {
    // Mock window.location.href
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  it('renders navigation items correctly', () => {
    renderWithRouter(<SideNavigation items={mockNavigationItems} />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Disabled Item')).toBeInTheDocument();
  });

  it('renders collapsed state correctly', () => {
    renderWithRouter(<SideNavigation items={mockNavigationItems} collapsed={true} />);
    
    // In collapsed state, labels should not be visible
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('handles toggle functionality', () => {
    const mockToggle = jest.fn();
    renderWithRouter(
      <SideNavigation 
        items={mockNavigationItems} 
        collapsed={false} 
        onToggle={mockToggle}
        showToggleButton={true}
      />
    );
    
    const toggleButton = screen.getByLabelText('Collapse sidebar');
    fireEvent.click(toggleButton);
    
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('applies active state correctly', () => {
    renderWithRouter(<SideNavigation items={mockNavigationItems} />);
    
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveClass('bg-blue-50', 'text-blue-700');
  });

  it('handles disabled items correctly', () => {
    renderWithRouter(<SideNavigation items={mockNavigationItems} />);
    
    const disabledItem = screen.getByText('Disabled Item').closest('a');
    expect(disabledItem).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('expands and collapses child items', () => {
    renderWithRouter(<SideNavigation items={mockNavigationItems} />);
    
    // Initially, child items should not be visible
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    expect(screen.queryByText('Preferences')).not.toBeInTheDocument();
    
    // Click on Settings to expand
    const settingsButton = screen.getByText('Settings').closest('button');
    if (settingsButton) {
      fireEvent.click(settingsButton);
      
      // Child items should now be visible
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Preferences')).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    renderWithRouter(<SideNavigation items={mockNavigationItems} />);
    
    const homeLink = screen.getByText('Home').closest('a');
    if (homeLink) {
      homeLink.focus();
      
      // Test arrow down navigation
      fireEvent.keyDown(homeLink, { key: 'ArrowDown' });
      
      const settingsButton = screen.getByText('Settings').closest('button');
      expect(document.activeElement).toBe(settingsButton);
  });

  it('shows branding when enabled', () => {
    renderWithRouter(
      <SideNavigation 
        items={mockNavigationItems} 
        showBranding={true}
      />
    );
    
    expect(screen.getByText('VerifyCert')).toBeInTheDocument();
  });

  it('hides branding when disabled', () => {
    renderWithRouter(
      <SideNavigation 
        items={mockNavigationItems} 
        showBranding={false}
      />
    );
    
    expect(screen.queryByText('VerifyCert')).not.toBeInTheDocument();
  });
});
}
}}}