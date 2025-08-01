import type { Meta, StoryObj } from '@storybook/react';
import VerificationBadge from './VerificationBadge';

const meta: Meta<typeof VerificationBadge> = {
  title: 'UI/Badge/VerificationBadge',
  component: VerificationBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A comprehensive verification badge component that shows certificate verification status with blockchain proof indicators.',
      },
    },
  },
  argTypes: {
    tokenId: {
      control: 'text',
      description: 'Certificate token ID for blockchain verification',
    },
    isValid: {
      control: 'boolean',
      description: 'Whether the certificate is valid',
    },
    isRevoked: {
      control: 'boolean',
      description: 'Whether the certificate has been revoked',
    },
    showDetails: {
      control: 'boolean',
      description: 'Whether to show detailed verification information',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the badge',
    },
    variant: {
      control: 'select',
      options: ['minimal', 'detailed', 'premium'],
      description: 'Visual variant of the badge',
    },
  },
};

export default meta;
type Story = StoryObj<typeof VerificationBadge>;

export const Minimal: Story = {
  args: {
    tokenId: '12345',
    isValid: true,
    isRevoked: false,
    variant: 'minimal',
    size: 'md',
  },
};

export const MinimalRevoked: Story = {
  args: {
    tokenId: '12345',
    isValid: false,
    isRevoked: true,
    variant: 'minimal',
    size: 'md',
  },
};

export const Detailed: Story = {
  args: {
    tokenId: '12345',
    isValid: true,
    isRevoked: false,
    variant: 'detailed',
    size: 'md',
    showDetails: true,
  },
};

export const DetailedInvalid: Story = {
  args: {
    tokenId: '12345',
    isValid: false,
    isRevoked: false,
    variant: 'detailed',
    size: 'md',
    showDetails: true,
  },
};

export const DetailedRevoked: Story = {
  args: {
    tokenId: '12345',
    isValid: false,
    isRevoked: true,
    variant: 'detailed',
    size: 'md',
    showDetails: true,
  },
};

export const Premium: Story = {
  args: {
    tokenId: '12345',
    isValid: true,
    isRevoked: false,
    variant: 'premium',
    showDetails: true,
  },
  parameters: {
    layout: 'padded',
  },
};

export const PremiumRevoked: Story = {
  args: {
    tokenId: '12345',
    isValid: false,
    isRevoked: true,
    variant: 'premium',
    showDetails: true,
  },
  parameters: {
    layout: 'padded',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Small</h3>
        <VerificationBadge
          tokenId="12345"
          isValid={true}
          variant="minimal"
          size="sm"
        />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Medium</h3>
        <VerificationBadge
          tokenId="12345"
          isValid={true}
          variant="minimal"
          size="md"
        />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Large</h3>
        <VerificationBadge
          tokenId="12345"
          isValid={true}
          variant="minimal"
          size="lg"
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Minimal Variant</h3>
        <div className="flex space-x-4">
          <VerificationBadge
            tokenId="12345"
            isValid={true}
            variant="minimal"
            size="md"
          />
          <VerificationBadge
            tokenId="12345"
            isValid={false}
            variant="minimal"
            size="md"
          />
          <VerificationBadge
            tokenId="12345"
            isValid={false}
            isRevoked={true}
            variant="minimal"
            size="md"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Detailed Variant</h3>
        <div className="space-y-4">
          <VerificationBadge
            tokenId="12345"
            isValid={true}
            variant="detailed"
            showDetails={true}
            size="md"
          />
          <VerificationBadge
            tokenId="12345"
            isValid={false}
            variant="detailed"
            showDetails={true}
            size="md"
          />
          <VerificationBadge
            tokenId="12345"
            isValid={false}
            isRevoked={true}
            variant="detailed"
            showDetails={true}
            size="md"
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const WithCallbacks: Story = {
  args: {
    tokenId: '12345',
    isValid: true,
    variant: 'detailed',
    showDetails: true,
    onVerificationComplete: (result) => {
      console.log('Verification completed:', result);
      alert(`Verification result: ${result.isValid ? 'Valid' : 'Invalid'}`);
    },
  },
  parameters: {
    layout: 'padded',
  },
};