import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';
import type { HeaderProps, UserMenuProps } from '../Header';

// Mock router for Link components
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Header Component', () => {
  const defaultProps: HeaderProps = {
    title: 'VerifyCert',
    showSidebarToggle: true,
    sidebarCollapsed: false,
    isMobile: false,
    mobileMenuOpen: false,
    onSidebarToggle: jest.fn(),
    onMobileMenuToggle: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders the header with default title', () => {
      renderWithRouter(<Header {...defaultProps} />);
      
      expect(screen.getByText('VerifyCert')).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('renders with custom title', () => {
      renderWithRouter(<Header {...defaultProps} title="Custom Title" />);
      
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('renders the Verify Now button', () => {
      renderWithRouter(<Header {...defaultProps} />);
      
      const verifyButton = screen.getByRole('link', { name: /verify now/i });
      expect(verifyButton).toBeInTheDocument();
      expect(verifyButton).toHaveAttribute('href', '/verify');
    });

    it('renders the logo with correct link', () => {
      renderWithRouter(<Header {...defaultProps} />);
      
      const logoLink = screen.getByRole('link', { name: /verifycert/i });
      expect(logoLink).toHaveAttribute('href', '/');
    });
  });

  describe('Sidebar Toggle', () => {
    it('shows desktop sidebar toggle when not mobile', () => {
      renderWithRouter(
        <Header {...defaultProps} isMobile={false} showSidebarToggle={true} />
      );
      
      const toggleButton = screen.getByLabelText(/collapse sidebar|expand sidebar/i);
      expect(toggleButton).toBeInTheDocument();
    });

    it('shows mobile menu toggle when mobile', () => {
      renderWithRouter(
        <Header {...defaultProps} isMobile={true} showSidebarToggle={true} />
      );
      
      const toggleButton = screen.getByLabelText(/open navigation menu|close navigation menu/i);
      expect(toggleButton).toBeInTheDocument();
    });

    it('calls onSidebarToggle when desktop toggle is clicked', () => {
      const mockToggle = jest.fn();
      renderWithRouter(
        <Header {...defaultProps} isMobile={false} onSidebarToggle={mockToggle} />
      );
      
      const toggleButton = screen.getByLabelText(/collapse sidebar|expand sidebar/i);
      fireEvent.click(toggleButton);
      
      expect(mockToggle).toHaveBeenCalledTimes(1);
    });

    it('calls onMobileMenuToggle when mobile toggle is clicked', () => {
      const mockToggle = jest.fn();
      renderWithRouter(
        <Header {...defaultProps} isMobile={true} onMobileMenuToggle={mockToggle} />
      );
      
      const toggleButton = screen.getByLabelText(/open navigation menu|close navigation menu/i);
      fireEvent.click(toggleButton);
      
      expect(mockToggle).toHaveBeenCalledTimes(1);
    });

    it('shows correct icon for collapsed sidebar', () => {
      renderWithRouter(
        <Header {...defaultProps} isMobile={false} sidebarCollapsed={true} />
      );
      
      const toggleButton = screen.getByLabelText(/expand sidebar/i);
      expect(toggleButton).toBeInTheDocument();
    });

    it('shows correct icon for expanded sidebar', () => {
      renderWithRouter(
        <Header {...defaultProps} isMobile={false} sidebarCollapsed={false} />
      );
      
      const toggleButton = screen.getByLabelText(/collapse sidebar/i);
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('shows search bar on desktop when enabled', () => {
      renderWithRouter(
        <Header {...defaultProps} showSearch={true} />
      );
      
      expect(screen.getByText(/search certificates/i)).toBeInTheDocument();
    });

    it('shows search button on mobile when enabled', () => {
      renderWithRouter(
        <Header {...defaultProps} showSearch={true} isMobile={true} />
      );
      
      const searchButton = screen.getByLabelText(/search/i);
      expect(searchButton).toBeInTheDocument();
    });

    it('calls onSearchClick when search is clicked', () => {
      const mockSearch = jest.fn();
      renderWithRouter(
        <Header {...defaultProps} showSearch={true} onSearchClick={mockSearch} />
      );
      
      const searchButton = screen.getByText(/search certificates/i);
      fireEvent.click(searchButton);
      
      expect(mockSearch).toHaveBeenCalledTimes(1);
    });

    it('does not show search when disabled', () => {
      renderWithRouter(
        <Header {...defaultProps} showSearch={false} />
      );
      
      expect(screen.queryByText(/search certificates/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/search/i)).not.toBeInTheDocument();
    });
  });

  describe('User Menu', () => {
    const mockUserMenu: UserMenuProps = {
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      isWalletConnected: true,
      onWalletConnect: jest.fn(),
      onWalletDisconnect: jest.fn(),
      onProfileClick: jest.fn(),
      onSettingsClick: jest.fn(),
    };

    it('shows connect wallet button when not connected', () => {
      const disconnectedUserMenu: UserMenuProps = {
        ...mockUserMenu,
        isWalletConnected: false,
        walletAddress: null,
      };

      renderWithRouter(
        <Header {...defaultProps} userMenu={disconnectedUserMenu} />
      );
      
      expect(screen.getByText(/connect wallet/i)).toBeInTheDocument();
    });

    it('shows user menu when wallet is connected', () => {
      renderWithRouter(
        <Header {...defaultProps} userMenu={mockUserMenu} />
      );
      
      expect(screen.getByText(/0x1234...5678/i)).toBeInTheDocument();
    });

    it('opens user menu dropdown when clicked', async () => {
      renderWithRouter(
        <Header {...defaultProps} userMenu={mockUserMenu} />
      );
      
      const userButton = screen.getByText(/0x1234...5678/i);
      fireEvent.click(userButton);
      
      await waitFor(() => {
        expect(screen.getByText(/profile/i)).toBeInTheDocument();
        expect(screen.getByText(/settings/i)).toBeInTheDocument();
        expect(screen.getByText(/disconnect wallet/i)).toBeInTheDocument();
      });
    });

    it('calls onWalletConnect when connect button is clicked', () => {
      const disconnectedUserMenu: UserMenuProps = {
        ...mockUserMenu,
        isWalletConnected: false,
        walletAddress: null,
      };

      renderWithRouter(
        <Header {...defaultProps} userMenu={disconnectedUserMenu} />
      );
      
      const connectButton = screen.getByText(/connect wallet/i);
      fireEvent.click(connectButton);
      
      expect(mockUserMenu.onWalletConnect).toHaveBeenCalledTimes(1);
    });

    it('shows notification badge when notifications exist', () => {
      const userMenuWithNotifications: UserMenuProps = {
        ...mockUserMenu,
        notifications: 3,
      };

      renderWithRouter(
        <Header {...defaultProps} userMenu={userMenuWithNotifications} />
      );
      
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('shows 9+ for notifications over 9', () => {
      const userMenuWithManyNotifications: UserMenuProps = {
        ...mockUserMenu,
        notifications: 15,
      };

      renderWithRouter(
        <Header {...defaultProps} userMenu={userMenuWithManyNotifications} />
      );
      
      expect(screen.getByText('9+')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for buttons', () => {
      renderWithRouter(
        <Header {...defaultProps} isMobile={true} mobileMenuOpen={false} />
      );
      
      const mobileToggle = screen.getByLabelText(/open navigation menu/i);
      expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');
    });

    it('updates ARIA expanded state for mobile menu', () => {
      renderWithRouter(
        <Header {...defaultProps} isMobile={true} mobileMenuOpen={true} />
      );
      
      const mobileToggle = screen.getByLabelText(/close navigation menu/i);
      expect(mobileToggle).toHaveAttribute('aria-expanded', 'true');
    });

    it('has proper role for header element', () => {
      renderWithRouter(<Header {...defaultProps} />);
      
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });

  describe('Custom Content', () => {
    it('renders children in the header', () => {
      renderWithRouter(
        <Header {...defaultProps}>
          <div data-testid="custom-content">Custom Content</div>
        </Header>
      );
      
      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      expect(screen.getByText('Custom Content')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('hides sidebar toggle when showSidebarToggle is false', () => {
      renderWithRouter(
        <Header {...defaultProps} showSidebarToggle={false} />
      );
      
      expect(screen.queryByLabelText(/toggle|expand|collapse/i)).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = renderWithRouter(
        <Header {...defaultProps} className="custom-header-class" />
      );
      
      const header = container.querySelector('header');
      expect(header).toHaveClass('custom-header-class');
    });
  });
});