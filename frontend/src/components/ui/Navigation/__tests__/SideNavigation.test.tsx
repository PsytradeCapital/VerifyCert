import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SideNavigation, { NavigationItem } from '../SideNavigation';

// Mock icons for testing
const HomeIcon = () => <svg data-testid="home-icon" />;
const SettingsIcon = () => <svg data-testid="settings-icon" />;
const UserIcon = () => <svg data-testid="user-icon" />;

const mockNavigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    icon: <HomeIcon />,
    active: true
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: <SettingsIcon />,
    children: [
      {
        id: 'profile',
        label: 'Profile',
        href: '/settings/profile',
        icon: <UserIcon />
      },
      {
        id: 'preferences',
        label: 'Preferences',
        href: '/settings/preferences'
      }
    ]
  },
  {
    id: 'disabled',
    label: 'Disabled Item',
    href: '/disabled',
    disabled: true
  }
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

  it('shows icons when provided', () => {
    renderWithRouter(<SideNavigation items={mockNavigationItems} />);
    
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
  });

  it('applies active state correctly', () => {
    renderWithRouter(<SideNavigation items={mockNavigationItems} />);
    
    const homeItem = screen.getByText('Home').closest('div');
    expect(homeItem).toHaveClass('bg-primary-100', 'text-primary-900');
  });

  it('handles disabled items correctly', () => {
    renderWithRouter(<SideNavigation items={mockNavigationItems} />);
    
    const disabledItem = screen.getByText('Disabled Item').closest('div');
    expect(disabledItem).toHaveClass('opacity-50', 'cursor-not-allowed');
  });
});