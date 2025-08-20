import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import DashboardOverview from './DashboardOverview';
import { DashboardStats } from './DashboardOverview';

const meta: Meta<typeof DashboardOverview> = {
  title: 'UI/Dashboard/DashboardOverview',
  component: DashboardOverview,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A comprehensive dashboard overview component that displays key metrics with visual indicators and trend information.',
      },
    },
  },
  argTypes: {
    isLoading: {
      control: 'boolean',
      description: 'Shows loading skeleton when true',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DashboardOverview>;

const mockStats: DashboardStats = {
  totalIssued: 1250,
  thisMonth: 85,
  thisWeek: 23,
  activeRecipients: 890,
  previousMonth: 72,
  previousWeek: 18,
  growthRate: 18,
};

const lowActivityStats: DashboardStats = {
  totalIssued: 45,
  thisMonth: 3,
  thisWeek: 1,
  activeRecipients: 32,
  previousMonth: 5,
  previousWeek: 2,
  growthRate: -40,
};

const highGrowthStats: DashboardStats = {
  totalIssued: 2500,
  thisMonth: 180,
  thisWeek: 45,
  activeRecipients: 1200,
  previousMonth: 120,
  previousWeek: 30,
  growthRate: 50,
};

export const Default: Story = {
  args: {
    stats: mockStats,
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    stats: mockStats,
    isLoading: true,
  },
};

export const LowActivity: Story = {
  args: {
    stats: lowActivityStats,
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Dashboard with low activity showing negative trends.',
      },
    },
  },
};

export const HighGrowth: Story = {
  args: {
    stats: highGrowthStats,
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Dashboard showing high growth and positive trends.',
      },
    },
  },
};

export const NoTrendData: Story = {
  args: {
    stats: {
      totalIssued: 100,
      thisMonth: 15,
      thisWeek: 4,
      activeRecipients: 75,
    },
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Dashboard without trend data (no previous period comparisons).',
      },
    },
  },
};