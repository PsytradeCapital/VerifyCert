import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SideNavigation from '../SideNavigation';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('SideNavigation - Simple Tests', () => {
  it('renders without crashing', () => {
    renderWithRouter(<SideNavigation />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders default navigation items', () => {
    renderWithRouter(<SideNavigation />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Verify Certificate')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders in collapsed state', () => {
    renderWithRouter(<SideNavigation collapsed={true} />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('w-16');
  });

  it('renders in expanded state', () => {
    renderWithRouter(<SideNavigation collapsed={false} />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('w-64');
  });
});