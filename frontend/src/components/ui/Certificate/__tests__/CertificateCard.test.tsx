import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CertificateCard, { Certificate } from '../CertificateCard';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock feedback animations hook
jest.mock('../../../../hooks/useFeedbackAnimations', () => ({
  useFeedbackAnimations: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
  }),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
  share: jest.fn(() => Promise.resolve()),
});

const mockCertificate: Certificate = {
  tokenId: '12345',
  issuer: '0x1234567890123456789012345678901234567890',
  recipient: '0x0987654321098765432109876543210987654321',
  recipientName: 'John Smith',
  courseName: 'Advanced Web Development',
  institutionName: 'Tech University',
  issueDate: 1640995200, // Jan 1, 2022
  isValid: true,
  isRevoked: false,
  qrCodeURL: 'https://example.com/qr.png',
  verificationURL: 'https://example.com/verify/12345',
  certificateType: 'Course Completion',
  grade: 'A+',
  credits: 3,
  description: 'Test course description',
};

describe('CertificateCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Premium Variant', () => {
    it('renders certificate information correctly', () => {
      render(<CertificateCard certificate={mockCertificate} variant="premium" />);

      expect(screen.getByText('Certificate of Achievement')).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('Advanced Web Development')).toBeInTheDocument();
      expect(screen.getByText('Tech University')).toBeInTheDocument();
      expect(screen.getByText('January 1, 2022')).toBeInTheDocument();
      expect(screen.getByText('#12345')).toBeInTheDocument();
    });

    it('shows verified status for valid certificates', () => {
      render(<CertificateCard certificate={mockCertificate} variant="premium" />);

      expect(screen.getByText('Verified')).toBeInTheDocument();
      expect(screen.getByText('Blockchain Verified')).toBeInTheDocument();
    });

    it('shows revoked status for revoked certificates', () => {
      const revokedCertificate = { ...mockCertificate, isRevoked: true };
      render(<CertificateCard certificate={revokedCertificate} variant="premium" />);

      expect(screen.getByText('Revoked')).toBeInTheDocument();
    });

    it('shows pending status for invalid certificates', () => {
      const pendingCertificate = { ...mockCertificate, isValid: false };
      render(<CertificateCard certificate={pendingCertificate} variant="premium" />);

      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('displays QR code when showQR is true', () => {
      render(<CertificateCard certificate={mockCertificate} variant="premium" showQR={true} />);

      const qrImage = screen.getByAltText('Certificate QR Code');
      expect(qrImage).toBeInTheDocument();
      expect(qrImage).toHaveAttribute('src', mockCertificate.qrCodeURL);
    });

    it('hides QR code when showQR is false', () => {
      render(<CertificateCard certificate={mockCertificate} variant="premium" showQR={false} />);

      expect(screen.queryByAltText('Certificate QR Code')).not.toBeInTheDocument();
    });

    it('shows action buttons when showActions is true', () => {
      render(<CertificateCard certificate={mockCertificate} variant="premium" showActions={true} />);

      expect(screen.getByText('Download Certificate')).toBeInTheDocument();
      expect(screen.getByText('Share')).toBeInTheDocument();
      expect(screen.getByText('Print')).toBeInTheDocument();
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });

    it('hides action buttons when showActions is false', () => {
      render(<CertificateCard certificate={mockCertificate} variant="premium" showActions={false} />);

      expect(screen.queryByText('Download Certificate')).not.toBeInTheDocument();
      expect(screen.queryByText('Share')).not.toBeInTheDocument();
      expect(screen.queryByText('Print')).not.toBeInTheDocument();
    });

    it('calls onDownload when download button is clicked', async () => {
      const onDownload = jest.fn();
      render(
        <CertificateCard 
          certificate={mockCertificate}
          variant="premium" 
          showActions={true}
          onDownload={onDownload}
        />
      );

      fireEvent.click(screen.getByText('Download Certificate'));
      expect(onDownload).toHaveBeenCalledWith(mockCertificate);
    });

    it('calls onShare when share button is clicked', async () => {
      const onShare = jest.fn();
      render(
        <CertificateCard 
          certificate={mockCertificate}
          variant="premium" 
          showActions={true}
          onShare={onShare}
        />
      );

      fireEvent.click(screen.getByText('Share'));
      expect(onShare).toHaveBeenCalledWith(mockCertificate);
    });
  });

  describe('Compact Variant', () => {
    it('renders in compact mode with minimal information', () => {
      render(<CertificateCard certificate={mockCertificate} variant="compact" />);

      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('Advanced Web Development')).toBeInTheDocument();
      expect(screen.getByText('Tech University')).toBeInTheDocument();
    });

    it('shows verification link in compact mode', () => {
      render(<CertificateCard certificate={mockCertificate} variant="compact" />);

      const verifyLink = screen.getByText('Verify Certificate');
      expect(verifyLink).toBeInTheDocument();
      expect(verifyLink.closest('a')).toHaveAttribute('href', mockCertificate.verificationURL);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<CertificateCard certificate={mockCertificate} variant="premium" />);

      expect(screen.getByRole('article')).toHaveAttribute('aria-label', 'Certificate for John Smith');
    });

    it('has proper heading structure', () => {
      render(<CertificateCard certificate={mockCertificate} variant="premium" />);

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Certificate of Achievement');
    });
  });
});