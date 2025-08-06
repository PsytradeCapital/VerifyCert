import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Tag } from './index';
import { Star, Heart, User, Mail, Phone } from 'lucide-react';

const meta: Meta<typeof Tag> = {
  title: 'UI/Tag',
  component: Tag,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tag>;

export const TagColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Tag color="gray">Gray</Tag>
      <Tag color="red">Red</Tag>
      <Tag color="yellow">Yellow</Tag>
      <Tag color="green">Green</Tag>
      <Tag color="blue">Blue</Tag>
      <Tag color="indigo">Indigo</Tag>
      <Tag color="purple">Purple</Tag>
      <Tag color="pink">Pink</Tag>
    </div>
  ),
};

export const TagSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Tag size="sm" color="blue">Small</Tag>
      <Tag size="md" color="green">Medium</Tag>
      <Tag size="lg" color="purple">Large</Tag>
    </div>
  ),
};

export const TagsWithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Tag color="blue" icon={<User />}>
        User
      </Tag>
      <Tag color="green" icon={<Mail />}>
        Email
      </Tag>
      <Tag color="purple" icon={<Phone />}>
        Phone
      </Tag>
      <Tag color="red" icon={<Heart />}>
        Favorite
      </Tag>
    </div>
  ),
};

export const ClickableTags: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Tag color="blue" onClick={() => alert('Blue tag clicked!')}>
        Clickable Blue
      </Tag>
      <Tag color="green" onClick={() => alert('Green tag clicked!')}>
        Clickable Green
      </Tag>
      <Tag color="purple" onClick={() => alert('Purple tag clicked!')} icon={<Star />}>
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
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
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
          <p className="text-gray-500 text-center py-4">
            All tags have been removed
          </p>
        )}
      </div>
    );
  },
};

export const TagShowcase: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Skills</h3>
        <div className="flex flex-wrap gap-2">
          <Tag color="blue" icon={<Star />}>React</Tag>
          <Tag color="green">TypeScript</Tag>
          <Tag color="purple">Node.js</Tag>
          <Tag color="yellow">JavaScript</Tag>
          <Tag color="indigo">GraphQL</Tag>
          <Tag color="pink">MongoDB</Tag>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Categories</h3>
        <div className="flex flex-wrap gap-2">
          <Tag color="red" size="sm">Urgent</Tag>
          <Tag color="yellow" size="sm">Important</Tag>
          <Tag color="green" size="sm">Completed</Tag>
          <Tag color="gray" size="sm">Draft</Tag>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Interactive Tags</h3>
        <div className="flex flex-wrap gap-2">
          <Tag color="blue" onClick={() => alert('Frontend clicked!')} icon={<User />}>
            Frontend
          </Tag>
          <Tag color="green" onClick={() => alert('Backend clicked!')} icon={<Mail />}>
            Backend
          </Tag>
          <Tag color="purple" removable onRemove={() => alert('Design removed!')}>
            Design
          </Tag>
        </div>
      </div>
    </div>
  ),
};