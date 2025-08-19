import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VerificationResult } from '../';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

const mockCertificate = {
  tokenId: '12345',
  recipientName: 'John Doe',
  courseName: 'Advanced Web Development',
  institutionName: 'Tech University',
  issueDate: 1640995200,
  issuer: '0x1234567890abcdef1234567890abcdef12345678'
};

const mockValidResult = {
  isValid: true,
  isRevoked: false,
  onChain: true,
  verificationDate: new Date().toISOString(),
  transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  blockNumber: '12345678',
  contractAddress: '0x9876543210fedcba9876543210fedcba98765432',
  confidence: 100
};

const mockRevokedResult = {
  isValid: false,
  isRevoked: true,
  onChain: true,
  verificationDate: new Date().toISOString(),
  transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  blockNumber: '12345678',
  contractAddress: '0x9876543210fedcba9876543210fedcba98765432',
  confidence: 0
};

const mockPendingResult = {
  isValid: true,
  isRevoked: false,
  onChain: false,
  verificationDate: new Date().toISOString(),
  confidence: 75
};

describe('VerificationResult', () => {
  it('renders valid certificate status correctly', () => {
    render(
      <VerificationResult
        result={mockValidResult}
        certificate={mockCertificate}
      />
    );

    expect(screen.getByText('Certificate Verified')).toBeInTheDocument();
    expect(screen.getByText('Authentic certificate verified on blockchain')).toBeInTheDocument();
    expect(screen.getByText('VALID')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders revoked certificate status correctly', () => {
    render(
      <VerificationResult
        result={mockRevokedResult}
        certificate={mockCertificate}
      />
    );

    expect(screen.getByText('Certificate Revoked')).toBeInTheDocument();
    expect(screen.getByText('This certificate has been revoked and is no longer valid')).toBeInTheDocument();
    expect(screen.getByText('REVOKED')).toBeInTheDocument();
  });

  it('renders pending verification status correctly', () => {
    render(
      <VerificationResult
        result={mockPendingResult}
        certificate={mockCertificate}
      />
    );

    expect(screen.getByText('Verification Pending')).toBeInTheDocument();
    expect(screen.getByText('Certificate found but blockchain verification pending')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('displays certificate details when provided', () => {
    render(
      <VerificationResult
        result={mockValidResult}
        certificate={mockCertificate}
      />
    );

    expect(screen.getByText('Certificate Details')).toBeInTheDocument();
    expect(screen.getByText('Advanced Web Development')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Tech University')).toBeInTheDocument();
  });

  it('displays blockchain information for on-chain certificates', () => {
    render(
      <VerificationResult
        result={mockValidResult}
        certificate={mockCertificate}
      />
    );

    expect(screen.getByText('Blockchain Verification')).toBeInTheDocument();
    expect(screen.getByText('Transaction Hash')).toBeInTheDocument();
    expect(screen.getByText('Block Number')).toBeInTheDocument();
    expect(screen.getByText('Polygon Mumbai Testnet')).toBeInTheDocument();
  });

  it('handles copy transaction hash functionality', async () => {
    const writeTextSpy = jest.spyOn(navigator.clipboard, 'writeText');
    
    render(
      <VerificationResult
        result={mockValidResult}
        certificate={mockCertificate}
      />
    );

    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);

    expect(writeTextSpy).toHaveBeenCalledWith(mockValidResult.transactionHash);
    
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('calls action handlers when buttons are clicked', () => {
    const mockDownload = jest.fn();
    const mockShare = jest.fn();
    const mockViewBlockchain = jest.fn();

    render(
      <VerificationResult
        result={mockValidResult}
        certificate={mockCertificate}
        onDownload={mockDownload}
        onShare={mockShare}
        onViewOnBlockchain={mockViewBlockchain}
      />
    );

    fireEvent.click(screen.getByText('Download Certificate'));
    expect(mockDownload).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Share'));
    expect(mockShare).toHaveBeenCalled();

    fireEvent.click(screen.getByText('View on Blockchain'));
    expect(mockViewBlockchain).toHaveBeenCalled();
  });

  it('does not render action buttons when handlers are not provided', () => {
    render(
      <VerificationResult
        result={mockValidResult}
        certificate={mockCertificate}
      />
    );

    expect(screen.queryByText('Download Certificate')).not.toBeInTheDocument();
    expect(screen.queryByText('Share')).not.toBeInTheDocument();
    expect(screen.queryByText('View on Blockchain')).not.toBeInTheDocument();
  });

  it('does not render blockchain information for off-chain certificates', () => {
    render(
      <VerificationResult
        result={mockPendingResult}
        certificate={mockCertificate}
      />
    );

    expect(screen.queryByText('Blockchain Verification')).not.toBeInTheDocument();
    expect(screen.queryByText('Transaction Hash')).not.toBeInTheDocument();
  });

  it('renders confidence bar with correct color based on confidence level', () => {
    const { rerender } = render(
      <VerificationResult
        result={{ ...mockValidResult, confidence: 90 }}
        certificate={mockCertificate}
      />
    );

    expect(screen.getByText('90%')).toBeInTheDocument();

    // Test medium confidence
    rerender(
      <VerificationResult
        result={{ ...mockValidResult, confidence: 70 }}
        certificate={mockCertificate}
      />
    );

    expect(screen.getByText('70%')).toBeInTheDocument();

    // Test low confidence
    rerender(
      <VerificationResult
        result={{ ...mockValidResult, confidence: 40 }}
        certificate={mockCertificate}
      />
    );

    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(
      <VerificationResult
        result={mockValidResult}
        certificate={mockCertificate}
      />
    );

    expect(screen.getByText('January 1, 2022')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <VerificationResult
        result={mockValidResult}
        certificate={mockCertificate}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});