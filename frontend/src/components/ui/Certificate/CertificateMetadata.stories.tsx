import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import CertificateMetadata, { CertificateMetadata as MetadataType } from './CertificateMetadata';

const meta: Meta<typeof CertificateMetadata> = {
  title: 'UI/Certificate/CertificateMetadata',
  component: CertificateMetadata,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A comprehensive metadata display component for certificates with organized information layout.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'compact', 'detailed'],
      description: 'Visual variant of the metadata display',
    },
    showBlockchainInfo: {
      control: 'boolean',
      description: 'Whether to show blockchain-related information',
    },
    showExtendedInfo: {
      control: 'boolean',
      description: 'Whether to show extended course and learning information',
    },
    collapsible: {
      control: 'boolean',
      description: 'Whether the metadata section can be collapsed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CertificateMetadata>;

const sampleMetadata: MetadataType = {
  tokenId: '12345',
  issuer: '0x1234567890123456789012345678901234567890',
  recipient: '0x0987654321098765432109876543210987654321',
  recipientName: 'John Smith',
  courseName: 'Advanced React Development',
  institutionName: 'Tech University',
  issueDate: Math.floor(Date.now() / 1000) - 86400 * 30, // 30 days ago
  certificateType: 'Course Completion',
  grade: 'A+',
  credits: 3,
  duration: '12 weeks',
  description: 'This comprehensive course covers advanced React concepts including hooks, context, performance optimization, and modern development patterns. Students learn to build scalable, maintainable React applications using industry best practices.',
  instructorName: 'Dr. Sarah Johnson',
  location: 'Online',
  completionDate: Math.floor(Date.now() / 1000) - 86400 * 7, // 7 days ago
  blockNumber: 12345678,
  transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  networkName: 'Polygon Mumbai',
  skills: ['React Hooks', 'State Management', 'Performance Optimization', 'Testing', 'TypeScript'],
  learningOutcomes: [
    'Build complex React applications',
    'Implement advanced state management',
    'Optimize application performance',
    'Write comprehensive tests'
  ],
  prerequisites: ['Basic JavaScript', 'HTML/CSS', 'React Fundamentals'],
  assessmentMethods: ['Project Portfolio', 'Code Review', 'Final Exam']
};

const minimalMetadata: MetadataType = {
  tokenId: '67890',
  issuer: '0x1111111111111111111111111111111111111111',
  recipient: '0x2222222222222222222222222222222222222222',
  recipientName: 'Jane Doe',
  courseName: 'Introduction to Web Development',
  institutionName: 'Code Academy',
  issueDate: Math.floor(Date.now() / 1000) - 86400 * 7, // 7 days ago
};

export const Default: Story = {
  args: {
    metadata: sampleMetadata,
    variant: 'default',
    showBlockchainInfo: true,
    showExtendedInfo: true,
    collapsible: false,
  },
};

export const Compact: Story = {
  args: {
    metadata: sampleMetadata,
    variant: 'compact',
    showBlockchainInfo: false,
    showExtendedInfo: false,
    collapsible: false,
  },
};

export const Collapsible: Story = {
  args: {
    metadata: sampleMetadata,
    variant: 'default',
    showBlockchainInfo: true,
    showExtendedInfo: true,
    collapsible: true,
  },
};

export const MinimalData: Story = {
  args: {
    metadata: minimalMetadata,
    variant: 'default',
    showBlockchainInfo: true,
    showExtendedInfo: true,
    collapsible: false,
  },
};

export const BlockchainOnly: Story = {
  args: {
    metadata: sampleMetadata,
    variant: 'default',
    showBlockchainInfo: true,
    showExtendedInfo: false,
    collapsible: false,
  },
};

export const ExtendedInfoOnly: Story = {
  args: {
    metadata: sampleMetadata,
    variant: 'default',
    showBlockchainInfo: false,
    showExtendedInfo: true,
    collapsible: false,
  },
};