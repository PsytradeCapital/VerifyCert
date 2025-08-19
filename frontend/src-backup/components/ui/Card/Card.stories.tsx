import type { Meta, StoryObj } from '@storybook/react';
import Card from './Card';
import { User, Mail, Phone, MapPin, Star, Heart, Share2 } from 'lucide-react';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A versatile Card component with multiple variants, padding options, and interactive animations.'
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outlined'],
      description: 'Visual style variant of the card'
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Internal padding of the card'
    },
    hover: {
      control: 'boolean',
      description: 'Enable hover animations'
    },
    enableAnimations: {
      control: 'boolean',
      description: 'Enable/disable all animations'
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler function'
};

export default meta;
type Story = StoryObj<typeof Card>;

// Basic variants
export const Default: Story = {
  args: {
    variant: 'default',
    padding: 'md',
    children: (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Default Card</h3>
        <p className="text-gray-600">
          This is a default card with a subtle border and clean appearance.
        </p>
      </div>
    )
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    padding: 'md',
    children: (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Elevated Card</h3>
        <p className="text-gray-600">
          This card has a shadow that gives it an elevated appearance above the background.
        </p>
      </div>
    )
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    padding: 'md',
    children: (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Outlined Card</h3>
        <p className="text-gray-600">
          This card has a prominent border that clearly defines its boundaries.
        </p>
      </div>
    )
};

// Padding variations
export const PaddingVariations: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card variant="default" padding="none">
        <div className="p-2 bg-blue-50 text-blue-700 text-sm">
          <strong>No Padding</strong><br />
          Content touches edges
        </div>
      </Card>
      <Card variant="default" padding="sm">
        <div className="text-sm">
          <strong>Small Padding</strong><br />
          Compact spacing
        </div>
      </Card>
      <Card variant="default" padding="md">
        <div className="text-sm">
          <strong>Medium Padding</strong><br />
          Default comfortable spacing
        </div>
      </Card>
      <Card variant="default" padding="lg">
        <div className="text-sm">
          <strong>Large Padding</strong><br />
          Generous spacing for important content
        </div>
      </Card>
    </div>
  )
};

// Interactive cards
export const Interactive: Story = {
  args: {
    variant: 'elevated',
    padding: 'md',
    hover: true,
    onClick: () => alert('Card clicked!'),
    children: (
      <div className="text-center">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Card</h3>
        <p className="text-gray-600 text-sm">
          Click me to see the interaction! Hover for smooth animations.
        </p>
      </div>
    )
};

// Real-world examples
export const UserProfile: Story = {
  args: {
    variant: 'elevated',
    padding: 'lg',
    hover: true,
    children: (
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">John Doe</h3>
          <p className="text-gray-600 mb-3">Senior Software Engineer</p>
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>john.doe@example.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>San Francisco, CA</span>
            </div>
          </div>
        </div>
      </div>
    )
};

export const ProductCard: Story = {
  args: {
    variant: 'outlined',
    padding: 'none',
    hover: true,
    children: (
      <div>
        <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 rounded-t-lg"></div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Premium Course</h3>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">4.9</span>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Learn advanced concepts with hands-on projects and expert guidance.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">$99</span>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
};

export const StatCard: Story = {
  args: {
    variant: 'default',
    padding: 'md',
    children: (
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600 mb-1">1,234</div>
        <div className="text-sm text-gray-500 uppercase tracking-wide">Total Users</div>
        <div className="mt-2 text-xs text-green-600 flex items-center justify-center space-x-1">
          <span>↗</span>
          <span>+12% from last month</span>
        </div>
      </div>
    )
};

// Variant comparison
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card variant="default" padding="md">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Default</h3>
        <p className="text-gray-600 text-sm">
          Clean and minimal with a subtle border. Perfect for content that needs clear boundaries.
        </p>
      </Card>
      <Card variant="elevated" padding="md">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Elevated</h3>
        <p className="text-gray-600 text-sm">
          Floating appearance with shadow. Great for highlighting important content.
        </p>
      </Card>
      <Card variant="outlined" padding="md">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Outlined</h3>
        <p className="text-gray-600 text-sm">
          Prominent border for strong definition. Ideal for forms and structured content.
        </p>
      </Card>
    </div>
  )
};

// Animation showcase
export const AnimationShowcase: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card variant="default" padding="md" hover={true} onClick={() => {}}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Default Animation</h3>
        <p className="text-gray-600 text-sm">
          Hover me to see the subtle lift and shadow effect.
        </p>
      </Card>
      <Card variant="elevated" padding="md" hover={true} onClick={() => {}}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Elevated Animation</h3>
        <p className="text-gray-600 text-sm">
          Enhanced shadow and lift for a more dramatic effect.
        </p>
      </Card>
      <Card variant="outlined" padding="md" hover={true} onClick={() => {}}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Outlined Animation</h3>
        <p className="text-gray-600 text-sm">
          Border color change with subtle lift animation.
        </p>
      </Card>
    </div>
  )
};

// Disabled animations
export const NoAnimations: Story = {
  args: {
    variant: 'elevated',
    padding: 'md',
    hover: true,
    enableAnimations: false,
    onClick: () => alert('Clicked without animations!'),
    children: (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Animations</h3>
        <p className="text-gray-600">
          This card has animations disabled for accessibility or performance reasons.
        </p>
      </div>
    )
};