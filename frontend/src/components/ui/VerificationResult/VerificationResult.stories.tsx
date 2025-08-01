import type { Meta, StoryObj } from '@storybook/react';
import { VerificationResult } from './';

const meta: Meta<typeof VerificationResult> = {
  title: 'UI/VerificationResult',
  component: VerificationResult,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Enhanced verification results display with better visual feedback, animations, and comprehensive information presentation.'
      }
    }
  },
  argTypes: {
    onDownload: { action: 'download' },
    onShare: { action: 'share' },
    onViewOnBlockchain: { action: 'view-blockchain' }
  }
};

export default meta;
type Story = StoryObj<typeof VerificationResult>;

const mockCertificate = {
  tokenId: '12345',
  recipientName: 'John Doe',
  courseName: 'Advanced Web Development',
  institutionName: 'Tech University',
  issueDate: 1640995200, // Jan 1, 2022
  issuer: '0x1234567890abcdef1234567890abcdef12345678'
};

export const ValidCertificate: Story = {
  args: {
    result: {
      isValid: true,
      isRevoked: false,
      onChain: true,
      verificationDate: new Date().toISOString(),
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      blockNumber: '12345678',
      contractAddress: '0x9876543210fedcba9876543210fedcba98765432',
      confidence: 100
    },
    certificate: mockCertificate
  }
};

export const RevokedCertificate: Story = {
  args: {
    result: {
      isValid: false,
      isRevoked: true,
      onChain: true,
      verificationDate: new Date().toISOString(),
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      blockNumber: '12345678',
      contractAddress: '0x9876543210fedcba9876543210fedcba98765432',
      confidence: 0
    },
    certificate: mockCertificate
  }
};

export const PendingVerification: Story = {
  args: {
    result: {
      isValid: true,
      isRevoked: false,
      onChain: false,
      verificationDate: new Date().toISOString(),
      confidence: 75
    },
    certificate: mockCertificate
  }
};

export const InvalidCertificate: Story = {
  args: {
    result: {
      isValid: false,
      isRevoked: false,
      onChain: false,
      verificationDate: new Date().toISOString(),
      confidence: 0
    }
  }
};

export const HighConfidenceValid: Story = {
  args: {
    result: {
      isValid: true,
      isRevoked: false,
      onChain: true,
      verificationDate: new Date().toISOString(),
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      blockNumber: '12345678',
      contractAddress: '0x9876543210fedcba9876543210fedcba98765432',
      confidence: 95
    },
    certificate: mockCertificate
  }
};

export const MediumConfidenceValid: Story = {
  args: {
    result: {
      isValid: true,
      isRevoked: false,
      onChain: true,
      verificationDate: new Date().toISOString(),
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      blockNumber: '12345678',
      contractAddress: '0x9876543210fedcba9876543210fedcba98765432',
      confidence: 70
    },
    certificate: mockCertificate
  }
};

export const WithoutActions: Story = {
  args: {
    result: {
      isValid: true,
      isRevoked: false,
      onChain: true,
      verificationDate: new Date().toISOString(),
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      blockNumber: '12345678',
      contractAddress: '0x9876543210fedcba9876543210fedcba98765432',
      confidence: 100
    },
    certificate: mockCertificate,
    onDownload: undefined,
    onShare: undefined,
    onViewOnBlockchain: undefined
  }
};