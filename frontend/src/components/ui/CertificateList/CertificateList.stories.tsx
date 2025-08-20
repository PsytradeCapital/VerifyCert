import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CertificateList } from './index';
import { Certificate } from '../../CertificateCard';

// Mock certificate data
const mockCertificates: Certificate[] = [
  {
    tokenId: '1',
    issuer: '0x1234567890123456789012345678901234567890',
    recipient: '0x0987654321098765432109876543210987654321',
    recipientName: 'John Doe',
    courseName: 'Advanced React Development',
    institutionName: 'Tech University',
    issueDate: Math.floor(Date.now() / 1000) - 86400 * 7, // 1 week ago
    isValid: true,
    qrCodeURL: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=verify/1',
    verificationURL: 'https://verifycert.com/verify/1',
  },
  {
    tokenId: '2',
    issuer: '0x1234567890123456789012345678901234567890',
    recipient: '0x1111111111111111111111111111111111111111',
    recipientName: 'Jane Smith',
    courseName: 'Data Science Fundamentals',
    institutionName: 'Data Institute',
    issueDate: Math.floor(Date.now() / 1000) - 86400 * 14, // 2 weeks ago
    isValid: true,
    qrCodeURL: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=verify/2',
    verificationURL: 'https://verifycert.com/verify/2',
  },
  {
    tokenId: '3',
    issuer: '0x2222222222222222222222222222222222222222',
    recipient: '0x3333333333333333333333333333333333333333',
    recipientName: 'Bob Johnson',
    courseName: 'Machine Learning Basics',
    institutionName: 'AI Academy',
    issueDate: Math.floor(Date.now() / 1000) - 86400 * 30, // 1 month ago
    isValid: false,
    qrCodeURL: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=verify/3',
    verificationURL: 'https://verifycert.com/verify/3',
  },
  {
    tokenId: '4',
    issuer: '0x1234567890123456789012345678901234567890',
    recipient: '0x4444444444444444444444444444444444444444',
    recipientName: 'Alice Brown',
    courseName: 'Web Development Bootcamp',
    institutionName: 'Code School',
    issueDate: Math.floor(Date.now() / 1000) - 86400 * 60, // 2 months ago
    isValid: true,
    qrCodeURL: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=verify/4',
    verificationURL: 'https://verifycert.com/verify/4',
  },
  {
    tokenId: '5',
    issuer: '0x5555555555555555555555555555555555555555',
    recipient: '0x6666666666666666666666666666666666666666',
    recipientName: 'Charlie Wilson',
    courseName: 'Blockchain Development',
    institutionName: 'Crypto University',
    issueDate: Math.floor(Date.now() / 1000) - 86400 * 90, // 3 months ago
    isValid: true,
    qrCodeURL: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=verify/5',
    verificationURL: 'https://verifycert.com/verify/5',
  },
];

const meta: Meta<typeof CertificateList> = {
  title: 'UI/CertificateList',
  component: CertificateList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'An enhanced certificate list component with advanced filtering, search, and sorting capabilities.',
      },
    },
  },
  argTypes: {
    certificates: {
      description: 'Array of certificates to display',
    },
    isLoading: {
      description: 'Whether the component is in loading state',
      control: 'boolean',
    },
    showBulkActions: {
      description: 'Whether to show bulk selection and actions',
      control: 'boolean',
    },
    onCertificateAction: {
      description: 'Callback for certificate actions (view, download, share)',
      action: 'certificateAction',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CertificateList>;

export const Default: Story = {
  args: {
    certificates: mockCertificates,
    isLoading: false,
    showBulkActions: false,
  },
};

export const Loading: Story = {
  args: {
    certificates: [],
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    certificates: [],
    isLoading: false,
  },
};

export const WithBulkActions: Story = {
  args: {
    certificates: mockCertificates,
    isLoading: false,
    showBulkActions: true,
  },
};

export const SingleCertificate: Story = {
  args: {
    certificates: [mockCertificates[0]],
    isLoading: false,
  },
};

export const MixedValidityStatus: Story = {
  args: {
    certificates: mockCertificates,
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows certificates with both valid and invalid status for testing filter functionality.',
      },
    },
  },
};

export const LargeCertificateList: Story = {
  args: {
    certificates: [
      ...mockCertificates,
      ...mockCertificates.map((cert, index) => ({
        ...cert,
        tokenId: `${cert.tokenId}-${index + 10}`,
        recipientName: `${cert.recipientName} ${index + 10}`,
      })),
      ...mockCertificates.map((cert, index) => ({
        ...cert,
        tokenId: `${cert.tokenId}-${index + 20}`,
        recipientName: `${cert.recipientName} ${index + 20}`,
      })),
    ],
    isLoading: false,
    showBulkActions: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a larger list of certificates to test filtering and pagination.',
      },
    },
  },
};