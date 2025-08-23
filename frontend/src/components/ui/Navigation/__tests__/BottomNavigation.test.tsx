import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Home, Settings, User, Bell } from 'lucide-react';
import BottomNavigation, { BottomNavItem } from '../BottomNavigation';

// Mock useLocation
const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default'
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockLocation
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

const mockItems: BottomNavItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    icon: <Home data-testid="home-icon" />,
  {
    id: 'profile',
    label: 'Profile',
    href: '/profile',
    icon: <User data-testid="profile-icon" />,
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: <Settings data-testid="settings-icon" />,
    badge: 3
  },
  {
    id: 'notifications',
    label: 'Notifications',
    href: '/notifications',
    icon: <Bell data-testid="notifications-icon" />,
    badge: 'new'
];

describe('BottomNavigation', () => {
  beforeEach(() => {
    mockLocation.pathname = '/';
  });

  it('renders all navigation items', () => {
    renderWithRouter(<BottomNavigation items={mockItems} />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('renders icons for all items', () => {
    renderWithRouter(<BottomNavigation items={mockItems} />);
    
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    expect(screen.getByTestId('profile-icon')).toBeInTheDocument();
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
    expect(screen.getByTestId('notifications-icon')).toBeInTheDocument();
  });

  it('displays badges correctly', () => {
    renderWithRouter(<BottomNavigation items={mockItems} />);
    
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('new')).toBeInTheDocument();
  });

  it('handles large badge numbers correctly', () => {
    const itemsWithLargeBadge: BottomNavItem[] = [
      {
        id: 'test',
        label: 'Test',
        href: '/test',
        icon: <Home />,
        badge: 150
    ];
    
    renderWithRouter(<BottomNavigation items={itemsWithLargeBadge} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('applies active state based on current route', () => {
    mockLocation.pathname = '/profile';
    renderWithRouter(<BottomNavigation items={mockItems} />);
    
    const profileLink = screen.getByRole('link', { name: 'Profile' });
    expect(profileLink).toHaveClass('text-primary-600');
    expect(profileLink).toHaveAttribute('aria-current', 'page');
  });

  it('respects explicit active state', () => {
    const itemsWithExplicitActive: BottomNavItem[] = [
      {
        id: 'home',
        label: 'Home',
        href: '/',
        icon: <Home />,
        active: true
    ];
    
    mockLocation.pathname = '/other';
    renderWithRouter(<BottomNavigation items={itemsWithExplicitActive} />);
    
    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveClass('text-primary-600');
  });

  it('handles click events for button items', () => {
    const mockClick = jest.fn();
    const buttonItems: BottomNavItem[] = [
      {
        id: 'action',
        label: 'Action',
        href: '#',
        icon: <Home />,
        onClick: mockClick
    ];
    
    renderWithRouter(<BottomNavigation items={buttonItems} />);
    
    const button = screen.getByRole('button', { name: 'Action' });
    fireEvent.click(button);
    
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('handles disabled state correctly', () => {
    const disabledItems: BottomNavItem[] = [
      {
        id: 'disabled',
        label: 'Disabled',
        href: '/disabled',
        icon: <Home />,
        disabled: true
    ];
    
    renderWithRouter(<BottomNavigation items={disabledItems} />);
    
    const disabledLink = screen.getByRole('link', { name: 'Disabled' });
    expect(disabledLink).toHaveClass('disabled:opacity-50');
  });

  it('renders floating variant correctly', () => {
    renderWithRouter(
      <BottomNavigation items={mockItems} variant="floating" />
    );
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('rounded-2xl');
    expect(nav).toHaveClass('bottom-4');
  });

  it('hides labels when showLabels is false', () => {
    renderWithRouter(
      <BottomNavigation items={mockItems} showLabels={false} />
    );
    
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    renderWithRouter(
      <BottomNavigation items={mockItems} className="custom-class" />
    );
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('custom-class');
  });

  it('handles different grid layouts based on item count', () => {
    // Test with 2 items
    const twoItems = mockItems.slice(0, 2);
    const { rerender } = renderWithRouter(<BottomNavigation items={twoItems} />);
    
    let container = screen.getByRole('navigation').firstChild;
    expect(container).toHaveClass('grid-cols-2');
    
    // Test with 3 items
    const threeItems = mockItems.slice(0, 3);
    rerender(
      <BrowserRouter>
        <BottomNavigation items={threeItems} />
      </BrowserRouter>
    );
    
    container = screen.getByRole('navigation').firstChild;
    expect(container).toHaveClass('grid-cols-3');
  });

  it('has proper accessibility attributes', () => {
    renderWithRouter(<BottomNavigation items={mockItems} />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Bottom navigation');
    
    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveAttribute('aria-label', 'Home');
  });

  it('provides proper badge accessibility', () => {
    renderWithRouter(<BottomNavigation items={mockItems} />);
    
    const badgeElement = screen.getByLabelText('3 notifications');
    expect(badgeElement).toBeInTheDocument();
  });

  it('handles focus states correctly', () => {
    renderWithRouter(<BottomNavigation items={mockItems} />);
    
    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveClass('focus:outline-none');
    expect(homeLink).toHaveClass('focus:ring-2');
    expect(homeLink).toHaveClass('focus:ring-primary-500');
  });

  it('applies safe area padding for default variant', () => {
    renderWithRouter(<BottomNavigation items={mockItems} />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveStyle({
      paddingBottom: 'env(safe-area-inset-bottom)'
    });
  });

  it('does not apply safe area padding for floating variant', () => {
    renderWithRouter(
      <BottomNavigation items={mockItems} variant="floating" />
    );
    
    const nav = screen.getByRole('navigation');
    expect(nav).not.toHaveStyle({
      paddingBottom: 'env(safe-area-inset-bottom)'
    });
  });
});
}
}