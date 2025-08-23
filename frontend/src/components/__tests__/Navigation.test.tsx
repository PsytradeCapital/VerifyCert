import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Navigation from '../Navigation';

// Mock WalletConnect component
jest.mock('../WalletConnect', () => {
  return function MockWalletConnect({ onConnect, onDisconnect }: any) {
    return (
      <div data-testid="wallet-connect">
        <button onClick={() => onConnect?.('0x123', {})}>Connect</button>
        <button onClick={() => onDisconnect?.()}>Disconnect</button>
      </div>
    );
  };
});

const renderWithRouter = (component: React.ReactElement, initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {component}
    </MemoryRouter>
  );
};

describe('Navigation Component', () => {
  const mockOnWalletConnect = jest.fn();
  const mockOnWalletDisconnect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render navigation with logo and brand name', () => {
    renderWithRouter(
      <Navigation
        onWalletConnect={mockOnWalletConnect}
        onWalletDisconnect={mockOnWalletDisconnect}
      />
    );

    expect(screen.getByText('VerifyCert')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /verifycert/i })).toHaveAttribute('href', '/');
  });

  it('should show public navigation items when wallet is not connected', () => {
    renderWithRouter(
      <Navigation
        isWalletConnected={false}
        onWalletConnect={mockOnWalletConnect}
        onWalletDisconnect={mockOnWalletDisconnect}
      />
    );

    // Public routes should be visible
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Verify Certificate' })).toBeInTheDocument();
    
    // Private routes should not be visible
    expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument();
  });

  it('should show all navigation items when wallet is connected', () => {
    renderWithRouter(
      <Navigation
        isWalletConnected={true}
        walletAddress="0x123456789"
        onWalletConnect={mockOnWalletConnect}
        onWalletDisconnect={mockOnWalletDisconnect}
      />
    );

    // All routes should be visible when wallet is connected
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Verify Certificate' })).toBeInTheDocument();
  });

  it('should highlight active navigation item', () => {
    renderWithRouter(
      <Navigation
        isWalletConnected={true}
        onWalletConnect={mockOnWalletConnect}
        onWalletDisconnect={mockOnWalletDisconnect}
      />,
      ['/dashboard']
    );

    const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
    expect(dashboardLink).toHaveClass('border-blue-500', 'text-gray-900');
  });

  it('should render wallet connect component', () => {
    renderWithRouter(
      <Navigation
        onWalletConnect={mockOnWalletConnect}
        onWalletDisconnect={mockOnWalletDisconnect}
      />
    );

    expect(screen.getByTestId('wallet-connect')).toBeInTheDocument();
  });

  it('should handle wallet connection callback', () => {
    renderWithRouter(
      <Navigation
        onWalletConnect={mockOnWalletConnect}
        onWalletDisconnect={mockOnWalletDisconnect}
      />
    );

    const connectButton = screen.getByText('Connect');
    fireEvent.click(connectButton);

    expect(mockOnWalletConnect).toHaveBeenCalledWith('0x123', {});
  });

  it('should handle wallet disconnection callback', () => {
    renderWithRouter(
      <Navigation
        isWalletConnected={true}
        onWalletConnect={mockOnWalletConnect}
        onWalletDisconnect={mockOnWalletDisconnect}
      />
    );

    const disconnectButton = screen.getByText('Disconnect');
    fireEvent.click(disconnectButton);

    expect(mockOnWalletDisconnect).toHaveBeenCalled();
  });

  describe('Mobile Navigation', () => {
    it('should show mobile menu button on small screens', () => {
      renderWithRouter(
        <Navigation
          onWalletConnect={mockOnWalletConnect}
          onWalletDisconnect={mockOnWalletDisconnect}
        />
      );

      const mobileMenuButton = screen.getByRole('button', { name: /open main menu/i });
      expect(mobileMenuButton).toBeInTheDocument();
    });

    it('should toggle mobile menu when button is clicked', async () => {
      renderWithRouter(
        <Navigation
          isWalletConnected={true}
          onWalletConnect={mockOnWalletConnect}
          onWalletDisconnect={mockOnWalletDisconnect}
        />
      );

      const mobileMenuButton = screen.getByRole('button', { name: /open main menu/i });
      
      // Mobile menu should not be visible initially
      expect(screen.queryByText('Home')).toBeInTheDocument(); // Desktop version
      
      // Click to open mobile menu
      fireEvent.click(mobileMenuButton);
      
      // Mobile menu items should be visible
      await waitFor(() => {
        const mobileHomeLinks = screen.getAllByText('Home');
        expect(mobileHomeLinks.length).toBeGreaterThan(1); // Desktop + Mobile versions
      });
    });

    it('should close mobile menu when navigation item is clicked', async () => {
      renderWithRouter(
        <Navigation
          isWalletConnected={true}
          onWalletConnect={mockOnWalletConnect}
          onWalletDisconnect={mockOnWalletDisconnect}
        />
      );

      const mobileMenuButton = screen.getByRole('button', { name: /open main menu/i });
      
      // Open mobile menu
      fireEvent.click(mobileMenuButton);
      
      await waitFor(() => {
        const mobileHomeLinks = screen.getAllByText('Home');
        expect(mobileHomeLinks.length).toBeGreaterThan(1);
      });

      // Click on a mobile navigation item
      const mobileLinks = screen.getAllByText('Home');
      const mobileHomeLink = mobileLinks.find(link => 
        link.closest('.sm\\:hidden') !== null
      );
      
      if (mobileHomeLink) {
        fireEvent.click(mobileHomeLink);
        
        // Menu should close (button should show "Open main menu" again)
        await waitFor(() => {
          expect(screen.getByRole('button', { name: /open main menu/i })).toBeInTheDocument();
        });
    });

    it('should show mobile wallet connection in mobile menu', async () => {
      renderWithRouter(
        <Navigation
          onWalletConnect={mockOnWalletConnect}
          onWalletDisconnect={mockOnWalletDisconnect}
        />
      );

      const mobileMenuButton = screen.getByRole('button', { name: /open main menu/i });
      fireEvent.click(mobileMenuButton);

      await waitFor(() => {
        // Should have both desktop and mobile wallet connect components
        const walletConnectComponents = screen.getAllByTestId('wallet-connect');
        expect(walletConnectComponents.length).toBe(2); // Desktop + Mobile
      });
    });
  });

  describe('Navigation Paths', () => {
    it('should correctly identify active path for home route', () => {
      renderWithRouter(
        <Navigation
          onWalletConnect={mockOnWalletConnect}
          onWalletDisconnect={mockOnWalletDisconnect}
        />,
        ['/']
      );

      const homeLink = screen.getByRole('link', { name: 'Home' });
      expect(homeLink).toHaveClass('border-blue-500', 'text-gray-900');
    });

    it('should correctly identify active path for dashboard route', () => {
      renderWithRouter(
        <Navigation
          isWalletConnected={true}
          onWalletConnect={mockOnWalletConnect}
          onWalletDisconnect={mockOnWalletDisconnect}
        />,
        ['/dashboard']
      );

      const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
      expect(dashboardLink).toHaveClass('border-blue-500', 'text-gray-900');
    });

    it('should correctly identify active path for verify route', () => {
      renderWithRouter(
        <Navigation
          onWalletConnect={mockOnWalletConnect}
          onWalletDisconnect={mockOnWalletDisconnect}
        />,
        ['/verify']
      );

      const verifyLink = screen.getByRole('link', { name: 'Verify Certificate' });
      expect(verifyLink).toHaveClass('border-blue-500', 'text-gray-900');
    });

    it('should handle sub-paths correctly', () => {
      renderWithRouter(
        <Navigation
          onWalletConnect={mockOnWalletConnect}
          onWalletDisconnect={mockOnWalletDisconnect}
        />,
        ['/verify/123']
      );

      const verifyLink = screen.getByRole('link', { name: 'Verify Certificate' });
      expect(verifyLink).toHaveClass('border-blue-500', 'text-gray-900');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for mobile menu button', () => {
      renderWithRouter(
        <Navigation
          onWalletConnect={mockOnWalletConnect}
          onWalletDisconnect={mockOnWalletDisconnect}
        />
      );

      const mobileMenuButton = screen.getByRole('button', { name: /open main menu/i });
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have screen reader text for mobile menu button', () => {
      renderWithRouter(
        <Navigation
          onWalletConnect={mockOnWalletConnect}
          onWalletDisconnect={mockOnWalletDisconnect}
        />
      );

      expect(screen.getByText('Open main menu')).toHaveClass('sr-only');
    });

    it('should have proper link structure for navigation items', () => {
      renderWithRouter(
        <Navigation
          isWalletConnected={true}
          onWalletConnect={mockOnWalletConnect}
          onWalletDisconnect={mockOnWalletDisconnect}
        />
      );

      const homeLink = screen.getByRole('link', { name: 'Home' });
      const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
      const verifyLink = screen.getByRole('link', { name: 'Verify Certificate' });

      expect(homeLink).toHaveAttribute('href', '/');
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
      expect(verifyLink).toHaveAttribute('href', '/verify');
    });
  });
});
}