import type { Meta, StoryObj } from '@storybook/react';
import CertificateCard from './CertificateCard';
import { Certificate } from './CertificateCard';

const meta: Meta<typeof CertificateCard> = {
  title: 'UI/Certificate/CertificateCard',
  component: CertificateCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A professional certificate card component that mimics physical certificates while providing digital verification features.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'premium', 'compact'],
      description: 'Visual variant of the certificate card',
    },
    showQR: {
      control: 'boolean',
      description: 'Whether to show the QR code for verification',
    },
    showActions: {
      control: 'boolean',
      description: 'Whether to show action buttons',
    },
    isPublicView: {
      control: 'boolean',
      description: 'Whether this is a public view (hides sensitive info)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CertificateCard>;

// Sample certificate data
const sampleCertificate: Certificate = {
  tokenId: '12345',
  issuer: '0x1234567890123456789012345678901234567890',
  recipient: '0x0987654321098765432109876543210987654321',
  recipientName: 'John Smith',
  courseName: 'Advanced Web Development',
  institutionName: 'Tech University',
  issueDate: Math.floor(Date.now() / 1000) - 86400 * 30, // 30 days ago
  isValid: true,
  isRevoked: false,
  qrCodeURL: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://verifycert.com/verify/12345',
  verificationURL: 'https://verifycert.com/verify/12345',
  certificateType: 'Course Completion',
  grade: 'A+',
  credits: 3,
  description: 'This comprehensive course covered modern web development technologies including React, TypeScript, and blockchain integration.',
};

const revokedCertificate: Certificate = {
  ...sampleCertificate,
  tokenId: '54321',
  recipientName: 'Jane Doe',
  courseName: 'Data Science Fundamentals',
  isValid: false,
  isRevoked: true,
  grade: 'B+',
};

const pendingCertificate: Certificate = {
  ...sampleCertificate,
  tokenId: '67890',
  recipientName: 'Mike Johnson',
  courseName: 'Machine Learning Basics',
  isValid: false,
  isRevoked: false,
  grade: 'A-',
};

export const Premium: Story = {
  args: {
    certificate: sampleCertificate,
    variant: 'premium',
    showQR: true,
    showActions: true,
    isPublicView: false,
  },
};

export const Compact: Story = {
  args: {
    certificate: sampleCertificate,
    variant: 'compact',
    showQR: false,
    showActions: true,
    isPublicView: false,
  },
};

export const PublicView: Story = {
  args: {
    certificate: sampleCertificate,
    variant: 'premium',
    showQR: true,
    showActions: false,
    isPublicView: true,
  },
};

export const RevokedCertificate: Story = {
  args: {
    certificate: revokedCertificate,
    variant: 'premium',
    showQR: true,
    showActions: true,
    isPublicView: false,
  },
};

export const PendingCertificate: Story = {
  args: {
    certificate: pendingCertificate,
    variant: 'premium',
    showQR: true,
    showActions: true,
    isPublicView: false,
  },
};

export const WithoutQR: Story = {
  args: {
    certificate: {
      ...sampleCertificate,
      qrCodeURL: undefined,
    },
    variant: 'premium',
    showQR: false,
    showActions: true,
    isPublicView: false,
  },
};

export const MinimalData: Story = {
  args: {
    certificate: {
      tokenId: '99999',
      issuer: '0x1234567890123456789012345678901234567890',
      recipient: '0x0987654321098765432109876543210987654321',
      recipientName: 'Alice Brown',
      courseName: 'Basic Programming',
      institutionName: 'Code Academy',
      issueDate: Math.floor(Date.now() / 1000) - 86400 * 7, // 7 days ago
      isValid: true,
      // Minimal data - no optional fields
    },
    variant: 'premium',
    showQR: false,
    showActions: true,
    isPublicView: false,
  },
};

export const CompactGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CertificateCard
        certificate={sampleCertificate}
        variant="compact"
        showActions={true}
      />
      <CertificateCard
        certificate={revokedCertificate}
        variant="compact"
        showActions={true}
      />
      <CertificateCard
        certificate={pendingCertificate}
        variant="compact"
        showActions={true}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple compact certificate cards displayed in a grid layout.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Premium Certificate</h3>
        <CertificateCard
          certificate={sampleCertificate}
          variant="premium"
          showQR={true}
          showActions={true}
          onDownload={() => alert('Download clicked!')}
          onShare={() => alert('Share clicked!')}
          onPrint={() => alert('Print clicked!')}
          onVerify={() => alert('Verify clicked!')}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Compact View</h3>
        <div className="max-w-md">
          <CertificateCard
            certificate={sampleCertificate}
            variant="compact"
            showActions={true}
            onVerify={() => alert('Verify clicked!')}
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo showing different certificate card variants with click handlers.',
      },
    },
  },
};