import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../auth/ProtectedRoute';
import { AuthContext } from '../../contexts/AuthContext';

const mockAuthContext = {
  user: null,
  login: jest.fn(),
  logout: jest.fn(),
  loading: false
};

const TestComponent = () => <div>Protected Content</div>;

const renderWithAuth = (authValue: any) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={authValue}>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('ProtectedRoute', () => {
  it('renders children when user is authenticated', () => {
    const authValue = { ...mockAuthContext, user: { id: '1', email: 'test@example.com' } };
    renderWithAuth(authValue);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects when user is not authenticated', () => {
    renderWithAuth(mockAuthContext);
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
