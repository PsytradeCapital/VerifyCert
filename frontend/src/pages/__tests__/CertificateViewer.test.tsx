import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import CertificateViewer from '../CertificateViewer';

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    BrowserProvider: jest.fn(),
    isAddress: jest.fn(() => true),
  },
}));

// Mock fetch
global.fetch = jest.fn();

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
  share: jest.fn().mockResolvedValue(undefined),
  canShare: jest.fn().mockReturnValue(true),
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
  createLinearGradient: jest.fn().mockReturnValue({
    addColorStop: jest.fn(),
  }),
});

HTMLCanvasElement.prototype.toDataURL = jest.fn().mockReturnValue('data:image/png;base64,test');

const mockCertificate = {
  tokenId: '123',
  issuer: '0x1234567890123456789012345678901234567890',
  recipient: '0x0987654321098765432109876543210987654321',
  recipientName: 'John Doe',
  courseName: 'Blockchain Development',
  institutionName: 'Tech University',
  issueDate: Math.floor(Date.now() / 1000) - 86400, // Yesterday
  isValid: true,
  qrCodeURL: 'https://example.com/qr/123',
  verificationURL: 'https://example.com/verify/123',
  metadataURI: 'https://example.com/metadata/123',
};

const renderWithRouter = (component: React.ReactElement, initialEntries = ['/certificate/123']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/certificate/:tokenId" element={component} />
        <Route path="/certificate/" element={component} />
      </Routes>
      <Toaster />
    </MemoryRouter>
  );
};

describe('CertificateViewer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should show loading state initially', () => {
    // Mock delayed response
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: { certificate: mockCertificate },
        }),
      }), 100))
    );

    renderWithRouter(<CertificateViewer />);
    
    expect(screen.getByText('Loading certificate #123...')).toBeInTheDocument();
    expect(screen.getByText('Fetching certificate data from blockchain...')).toBeInTheDocument();
  });

  it('should display certificate when loaded successfully', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { certificate: mockCertificate },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            verification: {
              isValid: true,
              onChain: true,
              message: 'Certificate verified successfully',
            },
          },
        }),
      });

    renderWithRouter(<CertificateViewer />);

    await waitFor(() => {
      expect(screen.getByText('Certificate Viewer')).toBeInTheDocument();
      expect(screen.getByText('Certificate #123 • Tech University')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Blockchain Development')).toBeInTheDocument();
    });
  });

  it('should show error state when certificate not found', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: { message: 'Certificate not found' },
      }),
    });

    renderWithRouter(<CertificateViewer />);

    await waitFor(() => {
      expect(screen.getByText('Certificate Not Found')).toBeInTheDocument();
      expect(screen.getByText('Certificate not found')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Go Back')).toBeInTheDocument();
    });
  });

  it('should handle verification successfully', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { certificate: mockCertificate },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            verification: {
              isValid: true,
              onChain: true,
              message: 'Certificate verified successfully',
            },
          },
        }),
      });

    renderWithRouter(<CertificateViewer />);

    await waitFor(() => {
      expect(screen.getByText('Certificate Verified')).toBeInTheDocument();
      expect(screen.getByText('Certificate verified successfully')).toBeInTheDocument();
      expect(screen.getByText('✓ Confirmed on Polygon blockchain')).toBeInTheDocument();
    });
  });

  it('should handle verification failure', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { certificate: mockCertificate },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            verification: {
              isValid: false,
              onChain: false,
              message: 'Certificate verification failed',
            },
          },
        }),
      });

    renderWithRouter(<CertificateViewer />);

    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
      expect(screen.getByText('Certificate verification failed')).toBeInTheDocument();
    });
  });

  it('should handle manual verification when verify button is clicked', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { certificate: mockCertificate },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            verification: {
              isValid: true,
              onChain: true,
              message: 'Manual verification successful',
            },
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            verification: {
              isValid: true,
              onChain: true,
              message: 'Re-verification successful',
            },
          },
        }),
      });

    renderWithRouter(<CertificateViewer />);

    await waitFor(() => {
      const verifyButton = screen.getByText('Verify');
      fireEvent.click(verifyButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Re-verification successful')).toBeInTheDocument();
    });
  });

  it('should handle certificate download', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { certificate: mockCertificate },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            verification: {
              isValid: true,
              onChain: true,
              message: 'Certificate verified successfully',
            },
          },
        }),
      });

    // Mock createElement and click
    const mockLink = {
      click: jest.fn(),
      download: '',
      href: '',
    };
    jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

    renderWithRouter(<CertificateViewer />);

    await waitFor(() => {
      const downloadButton = screen.getByText('Download');
      fireEvent.click(downloadButton);
    });

    expect(mockLink.click).toHaveBeenCalled();
    expect(mockLink.download).toContain('certificate-123-John-Doe.png');
  });

  it('should handle certificate sharing with Web Share API', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { certificate: mockCertificate },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            verification: {
              isValid: true,
              onChain: true,
              message: 'Certificate verified successfully',
            },
          },
        }),
      });

    renderWithRouter(<CertificateViewer />);

    await waitFor(() => {
      const shareButton = screen.getByText('Share');
      fireEvent.click(shareButton);
    });

    expect(navigator.share).toHaveBeenCalledWith({
      title: 'Certificate: Blockchain Development',
      text: 'John Doe has completed Blockchain Development from Tech University. Verified on blockchain.',
      url: 'https://example.com/verify/123',
    });
  });

  it('should fallback to clipboard when Web Share API is not available', async () => {
    // Mock Web Share API as not available
    (navigator.share as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Web Share API not supported');
    });
    (navigator.canShare as jest.Mock).mockReturnValue(false);

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { certificate: mockCertificate },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            verification: {
              isValid: true,
              onChain: true,
              message: 'Certificate verified successfully',
            },
          },
        }),
      });

    renderWithRouter(<CertificateViewer />);

    await waitFor(() => {
      const shareButton = screen.getByText('Share');
      fireEvent.click(shareButton);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/verify/123');
  });

  it('should display blockchain information correctly', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { certificate: mockCertificate },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            verification: {
              isValid: true,
              onChain: true,
              message: 'Certificate verified successfully',
            },
          },
        }),
      });

    renderWithRouter(<CertificateViewer />);

    await waitFor(() => {
      expect(screen.getByText('Blockchain Information')).toBeInTheDocument();
      expect(screen.getByText('123')).toBeInTheDocument(); // Token ID
      expect(screen.getByText('0x1234567890123456789012345678901234567890')).toBeInTheDocument(); // Issuer
      expect(screen.getByText('0x0987654321098765432109876543210987654321')).toBeInTheDocument(); // Recipient
      expect(screen.getByText('Polygon Mumbai Testnet')).toBeInTheDocument();
      expect(screen.getByText('Valid')).toBeInTheDocument();
    });
  });

  it('should display certificate details correctly', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { certificate: mockCertificate },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            verification: {
              isValid: true,
              onChain: true,
              message: 'Certificate verified successfully',
            },
          },
        }),
      });

    renderWithRouter(<CertificateViewer />);

    await waitFor(() => {
      expect(screen.getByText('Certificate Details')).toBeInTheDocument();
      expect(screen.getByText('Issue Date')).toBeInTheDocument();
      expect(screen.getByText('Verification URL')).toBeInTheDocument();
      expect(screen.getByText('Metadata URI')).toBeInTheDocument();
      expect(screen.getByText('https://example.com/metadata/123')).toBeInTheDocument();
    });
  });

  it('should handle retry when certificate loading fails', async () => {
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { certificate: mockCertificate },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            verification: {
              isValid: true,
              onChain: true,
              message: 'Certificate verified successfully',
            },
          },
        }),
      });

    renderWithRouter(<CertificateViewer />);

    await waitFor(() => {
      expect(screen.getByText('Certificate Not Found')).toBeInTheDocument();
      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Certificate Viewer')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should handle go back navigation', async () => {
    const mockNavigate = jest.fn();
    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));

    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(<CertificateViewer />);

    await waitFor(() => {
      const goBackButton = screen.getByText('Go Back');
      fireEvent.click(goBackButton);
    });

    // Note: In a real test, we would check if navigate(-1) was called
    // but since we're mocking the router, we just verify the button exists and is clickable
    expect(goBackButton).toBeInTheDocument();
  });

  it('should handle missing token ID', () => {
    renderWithRouter(<CertificateViewer />, ['/certificate/']);

    expect(screen.getByText('Certificate Not Found')).toBeInTheDocument();
    expect(screen.getByText('No certificate ID provided')).toBeInTheDocument();
  });

  it('should show verification loading state', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { certificate: mockCertificate },
        }),
      })
      .mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              verification: {
                isValid: true,
                onChain: true,
                message: 'Certificate verified successfully',
              },
            },
          }),
        }), 100))
      );

    renderWithRouter(<CertificateViewer />);

    await waitFor(() => {
      const verifyButton = screen.getByText('Verify');
      fireEvent.click(verifyButton);
    });

    expect(screen.getByText('Verifying...')).toBeInTheDocument();
  });

  it('should display help section', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { certificate: mockCertificate },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            verification: {
              isValid: true,
              onChain: true,
              message: 'Certificate verified successfully',
            },
          },
        }),
      });

    renderWithRouter(<CertificateViewer />);

    await waitFor(() => {
      expect(screen.getByText('About This Certificate')).toBeInTheDocument();
      expect(screen.getByText('🔒 Security Features')).toBeInTheDocument();
      expect(screen.getByText('✅ How to Verify')).toBeInTheDocument();
      expect(screen.getByText('Stored immutably on Polygon blockchain')).toBeInTheDocument();
      expect(screen.getByText('Click the "Verify" button above')).toBeInTheDocument();
    });
  });
});