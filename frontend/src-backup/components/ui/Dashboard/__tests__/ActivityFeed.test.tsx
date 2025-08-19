import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActivityFeed from '../ActivityFeed';
import { ActivityItem } from '../ActivityFeed';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'issued',
    title: 'Certificate issued to John Doe',
    description: 'React Development Course',
    timestamp: new Date('2024-01-01T10:00:00Z'),
    recipient: 'John Doe',
    certificateId: 'CERT-001',
  },
  {
    id: '2',
    type: 'verified',
    title: 'Certificate verified',
    description: 'JavaScript Fundamentals',
    timestamp: new Date('2024-01-01T09:00:00Z'),
    certificateId: 'CERT-002',
  },
];

describe('ActivityFeed', () => {
  it('renders activity items correctly', () => {
    render(<ActivityFeed activities={mockActivities} />);
    
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('Certificate issued to John Doe')).toBeInTheDocument();
    expect(screen.getByText('Certificate verified')).toBeInTheDocument();
    expect(screen.getByText('React Development Course')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(<ActivityFeed activities={[]} isLoading={true} />);
    
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    const loadingElements = screen.getAllByRole('generic');
    expect(loadingElements.some(el => el.classList.contains('animate-pulse'))).toBe(true);
  });

  it('shows empty state when no activities', () => {
    render(<ActivityFeed activities={[]} />);
    
    expect(screen.getByText('No recent activity')).toBeInTheDocument();
  });

  it('limits activities to maxItems', () => {
    render(<ActivityFeed activities={mockActivities} maxItems={1} />);
    
    expect(screen.getByText('Certificate issued to John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Certificate verified')).not.toBeInTheDocument();
  });

  it('shows view all button when activities exceed maxItems', () => {
    render(<ActivityFeed activities={mockActivities} maxItems={1} />);
    
    expect(screen.getByText('View all')).toBeInTheDocument();
  });
});