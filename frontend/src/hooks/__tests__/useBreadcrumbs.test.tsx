import React from 'react';
import { renderHook } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { useBreadcrumbs } from '../useBreadcrumbs';

// Mock the route configuration
jest.mock('../../config/routes', () => ({
  matchRoute: jest.fn(),
  routeConfig: [
    { path: '/', label: 'Home' },
    { path: '/verify', label: 'Verify Certificate' },
    { path: '/verify/:tokenId', label: 'Certificate Verification', parent: '/verify', dynamic: true, generateLabel: (params: any) => `Verify Certificate #${params.tokenId}` },
    { path: '/certificate/:tokenId', label: 'Certificate Details', dynamic: true, generateLabel: (params: any) => `Certificate #${params.tokenId}` },
    { path: '/dashboard', label: 'Issuer Dashboard'
  ]
}));

const renderHookWithRouter = (initialEntries: string[] = ['/']) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={initialEntries}>
      {children}
    </MemoryRouter>
  );
  
  return renderHook(() => useBreadcrumbs(), { wrapper });
};

describe('useBreadcrumbs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns home breadcrumb for root path', () => {
    const mockMatchRoute = require('../../config/routes').matchRoute;
    mockMatchRoute.mockReturnValue({
      config: { path: '/', label: 'Home' },
      params: {}
    });

    const { result } = renderHookWithRouter(['/']);
    
    expect(result.current).toEqual([
      { label: 'Home', active: true
    ]);
  });

  it('generates breadcrumbs for simple path', () => {
    const mockMatchRoute = require('../../config/routes').matchRoute;
    mockMatchRoute.mockReturnValue({
      config: { path: '/dashboard', label: 'Issuer Dashboard' },
      params: {}
    });

    const { result } = renderHookWithRouter(['/dashboard']);
    
    expect(result.current).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Issuer Dashboard', active: true
    ]);
  });

  it('generates breadcrumbs with parent relationship', () => {
    const mockMatchRoute = require('../../config/routes').matchRoute;
    mockMatchRoute.mockReturnValue({
      config: { 
        path: '/verify/:tokenId', 
        label: 'Certificate Verification', 
        parent: '/verify', 
        dynamic: true, 
        generateLabel: (params: any) => `Verify Certificate #${params.tokenId}` 
      },
      params: { tokenId: '123'
    });

    const { result } = renderHookWithRouter(['/verify/123']);
    
    expect(result.current).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Verify Certificate', href: '/verify' },
      { label: 'Verify Certificate #123', active: true
    ]);
  });

  it('generates breadcrumbs for dynamic routes', () => {
    const mockMatchRoute = require('../../config/routes').matchRoute;
    mockMatchRoute.mockReturnValue({
      config: { 
        path: '/certificate/:tokenId', 
        label: 'Certificate Details', 
        dynamic: true, 
        generateLabel: (params: any) => `Certificate #${params.tokenId}` 
      },
      params: { tokenId: '456'
    });

    const { result } = renderHookWithRouter(['/certificate/456']);
    
    expect(result.current).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Certificate #456', active: true
    ]);
  });

  it('handles unknown routes gracefully', () => {
    const mockMatchRoute = require('../../config/routes').matchRoute;
    mockMatchRoute.mockReturnValue(null);

    const { result } = renderHookWithRouter(['/unknown-path']);
    
    expect(result.current).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Unknown Page', active: true
    ]);
  });

  it('updates breadcrumbs when location changes', () => {
    const mockMatchRoute = require('../../config/routes').matchRoute;
    
    // First render - dashboard
    mockMatchRoute.mockReturnValue({
      config: { path: '/dashboard', label: 'Issuer Dashboard' },
      params: {}
    });

    const { result } = renderHookWithRouter(['/dashboard']);
    
    expect(result.current).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Issuer Dashboard', active: true
    ]);

    // Second render - verify (simulate new hook call with different route)
    mockMatchRoute.mockReturnValue({
      config: { path: '/verify', label: 'Verify Certificate' },
      params: {}
    });

    const { result: result2 } = renderHookWithRouter(['/verify']);
    
    expect(result2.current).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Verify Certificate', active: true
    ]);
  });
});
}
}}}}}}}}}