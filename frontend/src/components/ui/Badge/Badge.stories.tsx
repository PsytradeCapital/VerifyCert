import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Badge } from './index';
import { Star, Heart, Zap, User } from 'lucide-react';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Badge>;

// Badge Stories
export const BadgeVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="secondary">Secondary</Badge>
    </div>
  ),
};

export const BadgeSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <Badge size="sm">Small</Badge>
        <Badge size="default">Medium</Badge>
        <Badge size="lg">Large</Badge>
      </div>
    </div>
  ),
};

export const RoundedBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default" rounded>Default</Badge>
      <Badge variant="success" rounded>Success</Badge>
      <Badge variant="error" rounded>Error</Badge>
      <Badge variant="warning" rounded>Warning</Badge>
      <Badge variant="info" rounded>Info</Badge>
      <Badge variant="secondary" rounded>Secondary</Badge>
    </div>
  ),
};

export const OutlineBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default" outline>Default</Badge>
      <Badge variant="success" outline>Success</Badge>
      <Badge variant="error" outline>Error</Badge>
      <Badge variant="warning" outline>Warning</Badge>
      <Badge variant="info" outline>Info</Badge>
      <Badge variant="secondary" outline>Secondary</Badge>
    </div>
  ),
};

export const BadgesWithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="success">
        Featured
      </Badge>
      <Badge variant="error">
        Favorite
      </Badge>
      <Badge variant="warning">
        Premium
      </Badge>
      <Badge variant="info">
        Admin
      </Badge>
    </div>
  ),
};

export const ClickableBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default" onClick={() => alert('Default clicked!')}>
        Clickable
      </Badge>
      <Badge variant="success" onClick={() => alert('Success clicked!')}>
        Click me
      </Badge>
      <Badge variant="info" onClick={() => alert('Info clicked!')}>
        With Icon
      </Badge>
    </div>
  ),
};

export const RemovableBadges: Story = {
  render: () => {
    const [badges, setBadges] = useState([
      { id: 1, text: 'React', variant: 'info' as const },
      { id: 2, text: 'TypeScript', variant: 'success' as const },
      { id: 3, text: 'Tailwind', variant: 'secondary' as const },
      { id: 4, text: 'Storybook', variant: 'warning' as const },
    ]);

    const removeBadge = (id: number) => {
      setBadges(badges.filter(badge => badge.id !== id));
    };

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {badges.map(badge => (
            <Badge
              key={badge.id}
              variant={badge.variant}
              removable
              onRemove={() => removeBadge(badge.id)}
            >
              {badge.text}
            </Badge>
          ))}
        </div>
        {badges.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            All badges have been removed
          </p>
        )}
      </div>
    );
  },
};

export const StatusBadges: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium">User Status:</span>
        <Badge variant="success" size="sm">Online</Badge>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium">Order Status:</span>
        <Badge variant="warning" size="sm">Pending</Badge>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium">Payment Status:</span>
        <Badge variant="error" size="sm">Failed</Badge>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium">Verification:</span>
        <Badge variant="info" size="sm">
          Verified
        </Badge>
      </div>
    </div>
  ),
};

export const NotificationBadges: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium">Messages</span>
        <Badge variant="error" size="sm" rounded>3</Badge>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium">Notifications</span>
        <Badge variant="info" size="sm" rounded>12</Badge>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium">Updates</span>
        <Badge variant="success" size="sm" rounded>New</Badge>
      </div>
    </div>
  ),
};

export const BadgeShowcase: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Certificate Status</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">Verified</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="error">Revoked</Badge>
          <Badge variant="info">Draft</Badge>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">User Roles</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" size="sm">Student</Badge>
          <Badge variant="info" size="sm">Instructor</Badge>
          <Badge variant="success" size="sm">Admin</Badge>
          <Badge variant="warning" size="sm">Moderator</Badge>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Interactive Badges</h3>
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant="info" 
            onClick={() => alert('Profile clicked!')}
          >
            Profile
          </Badge>
          <Badge 
            variant="success" 
            removable 
            onRemove={() => alert('Achievement removed!')}
          >
            Achievement
          </Badge>
          <Badge variant="warning" outline rounded>Premium</Badge>
        </div>
      </div>
    </div>
  ),
};