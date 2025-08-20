import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { CertificateWizard } from './CertificateWizard';

const meta: Meta<typeof CertificateWizard> = {
  title: 'UI/Wizard/CertificateWizard',
  component: CertificateWizard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A step-by-step wizard for issuing certificates with validation and progress tracking.',
      },
    },
  },
  argTypes: {
    isLoading: {
      control: 'boolean',
      description: 'Whether the wizard is in a loading state',
    },
    isConnected: {
      control: 'boolean',
      description: 'Whether the wallet is connected',
    },
    walletAddress: {
      control: 'text',
      description: 'Connected wallet address',
    },
    onSubmit: {
      action: 'submitted',
      description: 'Callback when the certificate is submitted',
    },
    onCancel: {
      action: 'cancelled',
      description: 'Callback when the wizard is cancelled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CertificateWizard>;

// Mock wallet address for stories
const mockWalletAddress = '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87';

export const Default: Story = {
  args: {
    isLoading: false,
    isConnected: true,
    walletAddress: mockWalletAddress,
    onSubmit: action('certificate-submitted'),
    onCancel: action('wizard-cancelled'),
  },
};

export const WalletNotConnected: Story = {
  args: {
    isLoading: false,
    isConnected: false,
    walletAddress: null,
    onSubmit: action('certificate-submitted'),
    onCancel: action('wizard-cancelled'),
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    isConnected: true,
    walletAddress: mockWalletAddress,
    onSubmit: action('certificate-submitted'),
    onCancel: action('wizard-cancelled'),
  },
};

export const WithoutCancel: Story = {
  args: {
    isLoading: false,
    isConnected: true,
    walletAddress: mockWalletAddress,
    onSubmit: action('certificate-submitted'),
    // No onCancel prop
  },
};

export const CustomClassName: Story = {
  args: {
    isLoading: false,
    isConnected: true,
    walletAddress: mockWalletAddress,
    onSubmit: action('certificate-submitted'),
    onCancel: action('wizard-cancelled'),
    className: 'max-w-4xl mx-auto',
  },
};

// Interactive story that simulates the full flow
export const InteractiveFlow: Story = {
  args: {
    isLoading: false,
    isConnected: true,
    walletAddress: mockWalletAddress,
    onSubmit: async (data) => {
      action('certificate-submitted')(data);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
    },
    onCancel: action('wizard-cancelled'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive wizard that demonstrates the complete certificate issuance flow with all validation steps.',
      },
    },
  },
};