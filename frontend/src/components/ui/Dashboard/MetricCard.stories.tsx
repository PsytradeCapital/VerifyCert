import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import MetricCard from './MetricCard';

const meta: Meta<typeof MetricCard> = {
  title: 'UI/Dashboard/MetricCard',
  component: MetricCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A metric card component that displays key performance indicators with icons, trends, and visual styling.',
      },
    },
  },
  argTypes: {
    color: {
      control: 'select',
      options: ['blue', 'green', 'yellow', 'purple', 'red', 'indigo'],
      description: 'Color scheme for the card',
    },
    trend: {
      control: 'object',
      description: 'Trend information with value, direction, and label',
    },
  },
};

export default meta;
type Story = StoryObj<typeof MetricCard>;

const certificateIcon = (
  <svg fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const calendarIcon = (
  <svg fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
);

const usersIcon = (
  <svg fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
  </svg>
);

export const Default: Story = {
  args: {
    title: 'Total Certificates',
    value: '1,250',
    icon: certificateIcon,
    color: 'blue',
    description: 'All time certificates issued',
  },
};

export const WithPositiveTrend: Story = {
  args: {
    title: 'This Month',
    value: '85',
    icon: calendarIcon,
    color: 'green',
    trend: {
      value: 18,
      isPositive: true,
      label: 'vs last month',
    },
    description: 'Certificates issued this month',
  },
};

export const WithNegativeTrend: Story = {
  args: {
    title: 'This Week',
    value: '12',
    icon: calendarIcon,
    color: 'yellow',
    trend: {
      value: 25,
      isPositive: false,
      label: 'vs last week',
    },
    description: 'Certificates issued this week',
  },
};

export const LargeNumbers: Story = {
  args: {
    title: 'Active Recipients',
    value: '12,450',
    icon: usersIcon,
    color: 'purple',
    description: 'Unique certificate recipients',
  },
};

export const SmallNumbers: Story = {
  args: {
    title: 'New This Week',
    value: '3',
    icon: certificateIcon,
    color: 'indigo',
    trend: {
      value: 50,
      isPositive: true,
      label: 'vs last week',
    },
  },
};

export const RedColorScheme: Story = {
  args: {
    title: 'Revoked Certificates',
    value: '2',
    icon: (
      <svg fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    color: 'red',
    description: 'Certificates revoked this month',
  },
};

export const AllColors: Story = {
  render: () => (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <MetricCard
        title="Blue Theme"
        value="100"
        color="blue"
      />
      <MetricCard
        title="Green Theme"
        value="200"
        color="green"
      />
      <MetricCard
        title="Yellow Theme"
        value="300"
        color="yellow"
      />
      <MetricCard
        title="Purple Theme"
        value="400"
        color="purple"
      />
      <MetricCard
        title="Red Theme"
        value="500"
        color="red"
      />
      <MetricCard
        title="Indigo Theme"
        value="600"
        color="indigo"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available color schemes for the MetricCard component.',
      },
    },
  },
};