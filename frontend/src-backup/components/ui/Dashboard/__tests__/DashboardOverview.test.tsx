import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardOverview from '../DashboardOverview';
import { DashboardStats } from '../DashboardOverview';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const mockStats: DashboardStats = {
  totalIssued: 150,
  thisMonth: 25,
  thisWeek: 8,
  activeRecipients: 120,
  previousMonth: 20,
  previousWeek: 5,
  growthRate: 25,
};

describe('DashboardOverview', () => {
  it('renders all metric cards with correct values', () => {
    render(<DashboardOverview stats={mockStats} />);
    
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
  });

  it('displays correct labels for each metric', () => {
    render(<DashboardOverview stats={mockStats} />);
    
    expect(screen.getByText('Total Certificates')).toBeInTheDocument();
    expect(screen.getByText('This Month')).toBeInTheDocument();
    expect(screen.getByText('This Week')).toBeInTheDocument();
    expect(screen.getByText('Active Recipients')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(<DashboardOverview stats={mockStats} isLoading={true} />);
    
    const loadingElements = screen.getAllByRole('generic');
    expect(loadingElements.some(el => el.classList.contains('animate-pulse'))).toBe(true);
  });

  it('calculates and displays trends correctly', () => {
    render(<DashboardOverview stats={mockStats} />);
    
    // Should show positive trend for monthly growth
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('vs last month')).toBeInTheDocument();
    
    // Should show positive trend for weekly growth
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('vs last week')).toBeInTheDocument();
  });

  it('handles zero previous values correctly', () => {
    const statsWithZeroPrevious: DashboardStats = {
      ...mockStats,
      previousMonth: 0,
      previousWeek: 0,
    };
    
    render(<DashboardOverview stats={statsWithZeroPrevious} />);
    
    // Should show 100% growth when previous value is 0
    expect(screen.getAllByText('100%')).toHaveLength(2);
  });

  it('applies custom className', () => {
    const { container } = render(
      <DashboardOverview stats={mockStats} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});