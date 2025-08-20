import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import BlockchainProofIndicator from './BlockchainProofIndicator';

const meta: Meta<typeof BlockchainProofIndicator> = {
  title: 'UI/Badge/BlockchainProofIndicator',
  component: BlockchainProofIndicator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A component that displays detailed blockchain proof information for certificate verification.',
      },
    },
  },
  argTypes: {
    tokenId: {
      control: 'text',
      description: 'Certificate token ID',
    },
    transactionHash: {
      control: 'text',
      description: 'Blockchain transaction hash',
    },
    blockNumber: {
      control: 'text',
      description: 'Block number where the certificate was minted',
    },
    contractAddress: {
      control: 'text',
      description: 'Smart contract address',
    },
    networkName: {
      control: 'text',
      description: 'Blockchain network name',
    },
    chainId: {
      control: 'number',
      description: 'Blockchain chain ID',
    },
    variant: {
      control: 'select',
      options: ['compact', 'detailed', 'inline'],
      description: 'Visual variant of the indicator',
    },
    showCopyButtons: {
      control: 'boolean',
      description: 'Whether to show copy buttons for addresses and hashes',
    },
    autoExpand: {
      control: 'boolean',
      description: 'Whether to auto-expand detailed view',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BlockchainProofIndicator>;

const mockProofData = {
  tokenId: '12345',
  transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  blockNumber: '45678901',
  contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
  verificationTimestamp: Date.now(),
  networkName: 'Polygon Mumbai',
  chainId: 80001,
};

export const Inline: Story = {
  args: {
    ...mockProofData,
    variant: 'inline',
    showCopyButtons: true,
  },
};

export const Compact: Story = {
  args: {
    ...mockProofData,
    variant: 'compact',
    showCopyButtons: true,
  },
  parameters: {
    layout: 'padded',
  },
};

export const Detailed: Story = {
  args: {
    ...mockProofData,
    variant: 'detailed',
    showCopyButtons: true,
    autoExpand: false,
  },
  parameters: {
    layout: 'padded',
  },
};

export const DetailedExpanded: Story = {
  args: {
    ...mockProofData,
    variant: 'detailed',
    showCopyButtons: true,
    autoExpand: true,
  },
  parameters: {
    layout: 'padded',
  },
};

export const WithoutCopyButtons: Story = {
  args: {
    ...mockProofData,
    variant: 'detailed',
    showCopyButtons: false,
    autoExpand: true,
  },
  parameters: {
    layout: 'padded',
  },
};

export const MinimalData: Story = {
  args: {
    tokenId: '12345',
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    variant: 'detailed',
    showCopyButtons: true,
    autoExpand: true,
  },
  parameters: {
    layout: 'padded',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Inline Variant</h3>
        <BlockchainProofIndicator
          {...mockProofData}
          variant="inline"
          showCopyButtons={true}
        />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Compact Variant</h3>
        <BlockchainProofIndicator
          {...mockProofData}
          variant="compact"
          showCopyButtons={true}
        />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Detailed Variant (Collapsed)</h3>
        <BlockchainProofIndicator
          {...mockProofData}
          variant="detailed"
          showCopyButtons={true}
          autoExpand={false}
        />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Detailed Variant (Expanded)</h3>
        <BlockchainProofIndicator
          {...mockProofData}
          variant="detailed"
          showCopyButtons={true}
          autoExpand={true}
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const LoadingState: Story = {
  args: {
    tokenId: '12345',
    variant: 'detailed',
    showCopyButtons: true,
  },
  parameters: {
    layout: 'padded',
  },
};

export const DifferentNetworks: Story = {
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Polygon Mumbai Testnet</h3>
        <BlockchainProofIndicator
          {...mockProofData}
          networkName="Polygon Mumbai"
          chainId={80001}
          variant="compact"
          showCopyButtons={true}
        />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Polygon Mainnet</h3>
        <BlockchainProofIndicator
          {...mockProofData}
          networkName="Polygon"
          chainId={137}
          variant="compact"
          showCopyButtons={true}
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};