import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MetricCard from '../MetricCard';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const mockIcon = (
  <svg data-testid="test-icon" viewBox="0 0 20 20">
    <path d="M10 10" />
  </svg>
);

describe('MetricCard', () => {
  it('renders basic metric card with title and value', () => {
    render(
      <MetricCard
        title="Test Metric"
        value="100"
      />
    );
    
    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('displays trend information when provided', () => {
    const trend = {
      value: 25,
      isPositive: true,
      label: 'vs last month'
    };
    
    render(
      <MetricCard
        title="Test Metric"
        value="100"
        trend={trend}
      />
    );
    
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('vs last month')).toBeInTheDocument();
  });

  it('shows positive trend with up arrow', () => {
    const trend = {
      value: 25,
      isPositive: true,
      label: 'vs last month'
    };
    
    render(
      <MetricCard
        title="Test Metric"
        value="100"
        trend={trend}
      />
    );
    
    const trendElement = screen.getByText('25%').closest('div');
    expect(trendElement).toHaveClass('text-blue-600'); // Default positive color
  });

  it('shows negative trend with down arrow', () => {
    const trend = {
      value: 15,
      isPositive: false,
      label: 'vs last month'
    };
    
    render(
      <MetricCard
        title="Test Metric"
        value="100"
        trend={trend}
      />
    );
    
    const trendElement = screen.getByText('15%').closest('div');
    expect(trendElement).toHaveClass('text-blue-400'); // Default negative color
  });

  it('applies different color schemes', () => {
    const { rerender } = render(
      <MetricCard
        title="Test Metric"
        value="100"
        color="green"
      />
    );
    
    let iconContainer = screen.getByTestId('test-icon').closest('div')?.parentElement;
    expect(iconContainer).toHaveClass('bg-green-500');
    
    rerender(
      <MetricCard
        title="Test Metric"
        value="100"
        color="purple"
      />
    );
    
    iconContainer = screen.getByTestId('test-icon').closest('div')?.parentElement;
    expect(iconContainer).toHaveClass('bg-purple-500');
  });

  it('displays description when provided', () => {
    render(
      <MetricCard
        title="Test Metric"
        value="100"
        description="This is a test description"
      />
    );
    
    expect(screen.getByText('This is a test description')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <MetricCard
        title="Test Metric"
        value="100"
        className="custom-class"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});