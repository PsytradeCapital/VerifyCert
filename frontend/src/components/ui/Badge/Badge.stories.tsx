import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Badge, Tag } from './index';
import { Star, Heart, Zap, User, Mail, Phone } from 'lucide-react';

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
    <div className=\"flex flex-wrap gap-2\">
      <Badge variant=\"default\">Default</Badge>
      <Badge variant=\"success\">Success</Badge>
      <Badge variant=\"error\">Error</Badge>
      <Badge variant=\"warning\">Warning</Badge>
      <Badge variant=\"info\">Info</Badge>
      <Badge variant=\"secondary\">Secondary</Badge>
    </div>
  ),
};

export const BadgeSizes: Story = {
  render: () => (
    <div className=\"flex flex-wrap items-center gap-4\">
      <div className=\"flex items-center gap-2\">
        <Badge size=\"sm\">Small</Badge>
        <Badge size=\"md\">Medium</Badge>
        <Badge size=\"lg\">Large</Badge>
      </div>
    </div>
  ),
};

export const RoundedBadges: Story = {
  render: () => (
    <div className=\"flex flex-wrap gap-2\">
      <Badge variant=\"default\" rounded>Default</Badge>
      <Badge variant=\"success\" rounded>Success</Badge>
      <Badge variant=\"error\" rounded>Error</Badge>
      <Badge variant=\"warning\" rounded>Warning</Badge>
      <Badge variant=\"info\" rounded>Info</Badge>
      <Badge variant=\"secondary\" rounded>Secondary</Badge>
    </div>
  ),
};

export const OutlineBadges: Story = {
  render: () => (
    <div className=\"flex flex-wrap gap-2\">
      <Badge variant=\"default\" outline>Default</Badge>
      <Badge variant=\"success\" outline>Success</Badge>
      <Badge variant=\"error\" outline>Error</Badge>
      <Badge variant=\"warning\" outline>Warning</Badge>
      <Badge variant=\"info\" outline>Info</Badge>
      <Badge variant=\"secondary\" outline>Secondary</Badge>
    </div>
  ),
};

export const BadgesWithIcons: Story = {
  render: () => (
    <div className=\"flex flex-wrap gap-2\">
      <Badge variant=\"success\" icon={<Star className=\"w-3 h-3\" />}>
        Featured
      </Badge>
      <Badge variant=\"error\" icon={<Heart className=\"w-3 h-3\" />}>
        Favorite
      </Badge>
      <Badge variant=\"warning\" icon={<Zap className=\"w-3 h-3\" />}>
        Premium
      </Badge>
      <Badge variant=\"info\" icon={<User className=\"w-3 h-3\" />}>
        Admin
      </Badge>
    </div>
  ),
};

export const ClickableBadges: Story = {
  render: () => (
    <div className=\"flex flex-wrap gap-2\">
      <Badge variant=\"default\" onClick={() => alert('Default clicked!')}>
        Clickable
      </Badge>
      <Badge variant=\"success\" onClick={() => alert('Success clicked!')}>
        Click me
      </Badge>
      <Badge variant=\"info\" onClick={() => alert('Info clicked!')} icon={<Star className=\"w-3 h-3\" />}>
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
      <div className=\"space-y-4\">
        <div className=\"flex flex-wrap gap-2\">
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
          <p className=\"text-gray-500 text-center py-4\">
            All badges have been removed
          </p>
        )}
      </div>
    );
  },
};

// Tag Stories
export const TagColors: Story = {
  render: () => (
    <div className=\"flex flex-wrap gap-2\">
      <Tag color=\"gray\">Gray</Tag>
      <Tag color=\"red\">Red</Tag>
      <Tag color=\"yellow\">Yellow</Tag>
      <Tag color=\"green\">Green</Tag>
      <Tag color=\"blue\">Blue</Tag>
      <Tag color=\"indigo\">Indigo</Tag>
      <Tag color=\"purple\">Purple</Tag>
      <Tag color=\"pink\">Pink</Tag>
    </div>
  ),
};

export const TagSizes: Story = {
  render: () => (
    <div className=\"flex flex-wrap items-center gap-4\">
      <Tag size=\"sm\" color=\"blue\">Small</Tag>
      <Tag size=\"md\" color=\"green\">Medium</Tag>
      <Tag size=\"lg\" color=\"purple\">Large</Tag>
    </div>
  ),
};

export const TagsWithIcons: Story = {
  render: () => (
    <div className=\"flex flex-wrap gap-2\">
      <Tag color=\"blue\" icon={<User />}>
        User
      </Tag>
      <Tag color=\"green\" icon={<Mail />}>
        Email
      </Tag>
      <Tag color=\"purple\" icon={<Phone />}>
        Phone
      </Tag>
      <Tag color=\"red\" icon={<Heart />}>
        Favorite
      </Tag>
    </div>
  ),
};

export const ClickableTags: Story = {
  render: () => (
    <div className=\"flex flex-wrap gap-2\">
      <Tag color=\"blue\" onClick={() => alert('Blue tag clicked!')}>
        Clickable Blue
      </Tag>
      <Tag color=\"green\" onClick={() => alert('Green tag clicked!')}>
        Clickable Green
      </Tag>
      <Tag color=\"purple\" onClick={() => alert('Purple tag clicked!')} icon={<Star />}>
        With Icon
      </Tag>
    </div>
  ),
};

export const RemovableTags: Story = {
  render: () => {
    const [tags, setTags] = useState([
      { id: 1, text: 'JavaScript', color: 'yellow' as const },
      { id: 2, text: 'React', color: 'blue' as const },
      { id: 3, text: 'Node.js', color: 'green' as const },
      { id: 4, text: 'MongoDB', color: 'gray' as const },
      { id: 5, text: 'GraphQL', color: 'pink' as const },
    ]);

    const removeTag = (id: number) => {
      setTags(tags.filter(tag => tag.id !== id));
    };

    return (
      <div className=\"space-y-4\">
        <div className=\"flex flex-wrap gap-2\">
          {tags.map(tag => (
            <Tag
              key={tag.id}
              color={tag.color}
              removable
              onRemove={() => removeTag(tag.id)}
            >
              {tag.text}
            </Tag>
          ))}
        </div>
        {tags.length === 0 && (
          <p className=\"text-gray-500 text-center py-4\">
            All tags have been removed
          </p>
        )}
      </div>
    );
  },
};

export const StatusBadges: Story = {
  render: () => (
    <div className=\"space-y-4\">
      <div className=\"flex items-center space-x-4\">
        <span className=\"text-sm font-medium\">User Status:</span>
        <Badge variant=\"success\" size=\"sm\">Online</Badge>
      </div>
      <div className=\"flex items-center space-x-4\">
        <span className=\"text-sm font-medium\">Order Status:</span>
        <Badge variant=\"warning\" size=\"sm\">Pending</Badge>
      </div>
      <div className=\"flex items-center space-x-4\">
        <span className=\"text-sm font-medium\">Payment Status:</span>
        <Badge variant=\"error\" size=\"sm\">Failed</Badge>
      </div>
      <div className=\"flex items-center space-x-4\">
        <span className=\"text-sm font-medium\">Verification:</span>
        <Badge variant=\"info\" size=\"sm\" icon={<Star className=\"w-3 h-3\" />}>
          Verified
        </Badge>
      </div>
    </div>
  ),
};

export const NotificationBadges: Story = {
  render: () => (
    <div className=\"space-y-4\">
      <div className=\"flex items-center space-x-4\">
        <span className=\"text-sm font-medium\">Messages</span>
        <Badge variant=\"error\" size=\"sm\" rounded>3</Badge>
      </div>
      <div className=\"flex items-center space-x-4\">
        <span className=\"text-sm font-medium\">Notifications</span>
        <Badge variant=\"info\" size=\"sm\" rounded>12</Badge>
      </div>
      <div className=\"flex items-center space-x-4\">
        <span className=\"text-sm font-medium\">Updates</span>
        <Badge variant=\"success\" size=\"sm\" rounded>New</Badge>
      </div>
    </div>
  ),
};