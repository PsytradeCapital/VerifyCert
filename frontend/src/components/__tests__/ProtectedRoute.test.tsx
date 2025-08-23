import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';

const TestComponent = () => <div>Protected Content</div>;
const HomeComponent = () => <div>Home Page</div>;

const renderWithRouter = (
  component: React.ReactElement,
  initialEntries = ['/protected']
) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={<HomeComponent /> />
        <Route path="/protected" element={component} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute Component', () => {
  it('should render children when wallet is connected and wallet is required', () => {
    renderWithRouter(
      <ProtectedRoute isWalletConnected={true} requireWallet={true}>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should render children when wallet is not required', () => {
    renderWithRouter(
      <ProtectedRoute isWalletConnected={false} requireWallet={false}>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to home when wallet is required but not connected', () => {
    renderWithRouter(
      <ProtectedRoute isWalletConnected={false} requireWallet={true}>
        <TestComponent />
      </ProtectedRoute>
    );

    // Should redirect to home page instead of showing protected content
    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should use requireWallet=true as default when not specified', () => {
    renderWithRouter(
      <ProtectedRoute isWalletConnected={false}>
        <TestComponent />
      </ProtectedRoute>
    );

    // Should redirect to home page since requireWallet defaults to true
    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should preserve location state when redirecting', () => {
    const { container } = renderWithRouter(
      <ProtectedRoute isWalletConnected={false} requireWallet={true}>
        <TestComponent />
      </ProtectedRoute>,
      ['/protected']
    );

    // Should redirect to home
    expect(screen.getByText('Home Page')).toBeInTheDocument();
    
    // Note: Testing the actual state preservation would require more complex setup
    // with a custom component that can access location state
  });

  describe('Different wallet connection states', () => {
    it('should handle undefined wallet connection state', () => {
      renderWithRouter(
        <ProtectedRoute isWalletConnected={undefined as any} requireWallet={true}>
          <TestComponent />
        </ProtectedRoute>
      );

      // Should treat undefined as false and redirect
      expect(screen.getByText('Home Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should handle null wallet connection state', () => {
      renderWithRouter(
        <ProtectedRoute isWalletConnected={null as any} requireWallet={true}>
          <TestComponent />
        </ProtectedRoute>
      );

      // Should treat null as false and redirect
      expect(screen.getByText('Home Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Complex routing scenarios', () => {
    it('should work with nested routes', () => {
      render(
        <MemoryRouter initialEntries={['/dashboard/settings']}>
          <Routes>
            <Route path="/" element={<HomeComponent /> />
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute isWalletConnected={true} requireWallet={true}>
                  <Routes>
                    <Route path="settings" element={<div>Dashboard Settings</div> />
                  </Routes>
                </ProtectedRoute> 
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Dashboard Settings')).toBeInTheDocument();
    });

    it('should redirect nested routes when wallet not connected', () => {
      render(
        <MemoryRouter initialEntries={['/dashboard/settings']}>
          <Routes>
            <Route path="/" element={<HomeComponent /> />
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute isWalletConnected={false} requireWallet={true}>
                  <Routes>
                    <Route path="settings" element={<div>Dashboard Settings</div> />
                  </Routes>
                </ProtectedRoute> 
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Home Page')).toBeInTheDocument();
      expect(screen.queryByText('Dashboard Settings')).not.toBeInTheDocument();
    });
  });

  describe('Multiple children handling', () => {
    it('should render multiple children when wallet is connected', () => {
      renderWithRouter(
        <ProtectedRoute isWalletConnected={true} requireWallet={true}>
          <div>First Child</div>
          <div>Second Child</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
    });

    it('should not render any children when redirecting', () => {
      renderWithRouter(
        <ProtectedRoute isWalletConnected={false} requireWallet={true}>
          <div>First Child</div>
          <div>Second Child</div>
        </ProtectedRoute>
      );

      expect(screen.queryByText('First Child')).not.toBeInTheDocument();
      expect(screen.queryByText('Second Child')).not.toBeInTheDocument();
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  });
});
}
}}}}}}