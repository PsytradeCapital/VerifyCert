import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import CertificateCard, { Certificate } from '../CertificateCard';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => {
  const mockFn = () => {};
  return {
    __esModule: true,
    default: {
      success: mockFn,
      error: mockFn,
    },
  };
});

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
  share: jest.fn().mockResolvedValue(undefined),
});

// Mock canvas
HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  font: '',
  textAlign: '',
  fillRect: jest.fn(),
  strokeRect: jest.fn(),
  fillText: jest.fn(),
});

HTMLCanvasElement.prototype.toDataURL = jest.fn().mockReturnValue('data:image/png;base64,test');

describe('CertificateCard Component', () => {
  const mockCertificate: Certificate = {
    tokenId: '123',
    issuer: '0x1234567890123456789012345678901234567890',
    recipient: '0x0987654321098765432109876543210987654321',
    recipientName: 'John Doe',
    courseName: 'Blockchain Development',
    institutionName: 'Tech University',
    issueDate: 1640995200, // Jan 1, 2022
    isValid: true,
    qrCodeURL: 'https://example.com/qr-code.png',
    verificationURL: 'https://example.com/verify/123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Certificate Display', () => {
    it('should render certificate information correctly', () => {
      render(<CertificateCard certificate={mockCertificate} />);

      expect(screen.getByText('Certificate of Completion')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Blockchain Development')).toBeInTheDocument();
      expect(screen.getByText('Tech University')).toBeInTheDocument();
      expect(screen.getByText('January 1, 2022')).toBeInTheDocument();
      expect(screen.getByText('123')).toBeInTheDocument();
    });

    it('should show verified status for valid certificates', () => {
      render(<CertificateCard certificate={mockCertificate} />);

      expect(screen.getByText('Verified')).toBeInTheDocument();
      expect(screen.getByText('Verified on Blockchain')).toBeInTheDocument();
    });

    it('should show invalid status for invalid certificates', () => {
      const invalidCertificate = { ...mockCertificate, isValid: false };
      render(<CertificateCard certificate={invalidCertificate} />);

      expect(screen.getByText('Invalid')).toBeInTheDocument();
    });

    it('should format addresses correctly', () => {
      render(<CertificateCard certificate={mockCertificate} />);

      expect(screen.getByText('0x1234...7890')).toBeInTheDocument();
      expect(screen.getByText('0x0987...4321')).toBeInTheDocument();
    });

    it('should hide recipient address in public view', () => {
      render(<CertificateCard certificate={mockCertificate} isPublicView={true} />);

      expect(screen.getByText('0x1234...7890')).toBeInTheDocument(); // Issuer
      expect(screen.queryByText('0x0987...4321')).not.toBeInTheDocument(); // Recipient
    });
  });

  describe('QR Code Display', () => {
    it('should display QR code when showQR is true and qrCodeURL exists', () => {
      render(<CertificateCard certificate={mockCertificate} showQR={true} />);

      const qrImage = screen.getByAltText('Certificate QR Code');
      expect(qrImage).toBeInTheDocument();
      expect(qrImage).toHaveAttribute('src', mockCertificate.qrCodeURL);
    });

    it('should not display QR code when showQR is false', () => {
      render(<CertificateCard certificate={mockCertificate} showQR={false} />);

      expect(screen.queryByAltText('Certificate QR Code')).not.toBeInTheDocument();
    });

    it('should show placeholder when QR code fails to load', () => {
      render(<CertificateCard certificate={mockCertificate} showQR={true} />);

      const qrImage = screen.getByAltText('Certificate QR Code');
      fireEvent.error(qrImage);

      expect(screen.getByText('Scan to verify')).toBeInTheDocument();
    });

    it('should not display QR section when qrCodeURL is not provided', () => {
      const certificateWithoutQR = { ...mockCertificate, qrCodeURL: undefined };
      render(<CertificateCard certificate={certificateWithoutQR} showQR={true} />);

      expect(screen.queryByText('Verification QR Code')).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render all action buttons', () => {
      render(<CertificateCard certificate={mockCertificate} />);

      expect(screen.getByText('Download')).toBeInTheDocument();
      expect(screen.getByText('Share')).toBeInTheDocument();
      expect(screen.getByText('Copy Link')).toBeInTheDocument();
    });

    it('should call custom onDownload when provided', () => {
      const mockOnDownload = jest.fn();
      render(<CertificateCard certificate={mockCertificate} onDownload={mockOnDownload} />);

      const downloadButton = screen.getByText('Download');
      fireEvent.click(downloadButton);

      expect(mockOnDownload).toHaveBeenCalled();
    });

    it('should call custom onShare when provided', () => {
      const mockOnShare = jest.fn();
      render(<CertificateCard certificate={mockCertificate} onShare={mockOnShare} />);

      const shareButton = screen.getByText('Share');
      fireEvent.click(shareButton);

      expect(mockOnShare).toHaveBeenCalled();
    });

    it('should generate and download certificate image', async () => {
      const mockCreateElement = jest.spyOn(document, 'createElement');
      const mockLink = {
        download: '',
        href: '',
        click: jest.fn(),
      };
      mockCreateElement.mockReturnValue(mockLink as any);

      render(<CertificateCard certificate={mockCertificate} />);

      const downloadButton = screen.getByText('Download');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockLink.download).toBe('certificate-123.png');
        expect(mockLink.href).toBe('data:image/png;base64,test');
        expect(mockLink.click).toHaveBeenCalled();
      });

      mockCreateElement.mockRestore();
    });

    it('should show loading state during download', async () => {
      render(<CertificateCard certificate={mockCertificate} />);

      const downloadButton = screen.getByText('Download');
      fireEvent.click(downloadButton);

      expect(screen.getByText('Downloading...')).toBeInTheDocument();
    });
  });

  describe('Share Functionality', () => {
    it('should use native share API when available', async () => {
      render(<CertificateCard certificate={mockCertificate} />);

      const shareButton = screen.getByText('Share');
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(navigator.share).toHaveBeenCalledWith({
          title: 'Certificate: Blockchain Development',
          text: 'John Doe has completed Blockchain Development from Tech University',
          url: mockCertificate.verificationURL,
        });
      });
    });

    it('should fallback to clipboard when native share is not available', async () => {
      // Mock navigator.share to be undefined
      const originalShare = navigator.share;
      (navigator as any).share = undefined;

      render(<CertificateCard certificate={mockCertificate} />);

      const shareButton = screen.getByText('Share');
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockCertificate.verificationURL);
      });

      // Restore original
      (navigator as any).share = originalShare;
    });
  });

  describe('Copy Link Functionality', () => {
    it('should copy verification URL to clipboard', async () => {
      render(<CertificateCard certificate={mockCertificate} />);

      const copyButton = screen.getByText('Copy Link');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockCertificate.verificationURL);
      });
    });

    it('should copy current URL when verification URL is not available', async () => {
      const certificateWithoutURL = { ...mockCertificate, verificationURL: undefined };
      render(<CertificateCard certificate={certificateWithoutURL} />);

      const copyButton = screen.getByText('Copy Link');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href);
      });
    });

    it('should copy link from verification URL input field', async () => {
      render(<CertificateCard certificate={mockCertificate} />);

      // Find the copy button next to the verification URL input
      const verificationSection = screen.getByDisplayValue(mockCertificate.verificationURL!);
      const copyButton = verificationSection.parentElement?.querySelector('button');
      
      if (copyButton) {
        fireEvent.click(copyButton);

        await waitFor(() => {
          expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockCertificate.verificationURL);
        });
      }
    });
  });

  describe('Verification URL Display', () => {
    it('should display verification URL input when available', () => {
      render(<CertificateCard certificate={mockCertificate} />);

      const urlInput = screen.getByDisplayValue(mockCertificate.verificationURL!);
      expect(urlInput).toBeInTheDocument();
      expect(urlInput).toHaveAttribute('readOnly');
    });

    it('should not display verification URL section when not available', () => {
      const certificateWithoutURL = { ...mockCertificate, verificationURL: undefined };
      render(<CertificateCard certificate={certificateWithoutURL} />);

      expect(screen.queryByText('Verification URL')).not.toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <CertificateCard certificate={mockCertificate} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should have responsive grid layout', () => {
      render(<CertificateCard certificate={mockCertificate} />);

      const gridContainer = screen.getByText('Certificate Details').closest('.grid');
      expect(gridContainer).toHaveClass('md:grid-cols-2');
    });

    it('should display footer with branding', () => {
      render(<CertificateCard certificate={mockCertificate} />);

      expect(screen.getByText('Powered by VerifyCert')).toBeInTheDocument();
      expect(screen.getByText('Secured on Polygon Blockchain')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle download errors gracefully', async () => {
      // Mock canvas getContext to return null
      HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(null);

      render(<CertificateCard certificate={mockCertificate} />);

      const downloadButton = screen.getByText('Download');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(screen.getByText('Download')).toBeInTheDocument(); // Button should be back to normal state
      });
    });

    it('should handle share errors gracefully', async () => {
      // Mock navigator.share to reject
      (navigator.share as jest.Mock).mockRejectedValue(new Error('Share failed'));
      (navigator as any).clipboard = undefined;

      render(<CertificateCard certificate={mockCertificate} />);

      const shareButton = screen.getByText('Share');
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(navigator.share).toHaveBeenCalled();
      });
    });

    it('should handle clipboard errors gracefully', async () => {
      // Mock clipboard to reject
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValue(new Error('Clipboard failed'));

      render(<CertificateCard certificate={mockCertificate} />);

      const copyButton = screen.getByText('Copy Link');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
      });
    });
  });
});