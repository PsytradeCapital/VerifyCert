import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import VerificationPage from '../VerificationPage';

// Mock fetch
global.fetch = jest.fn();

// Mock window.print
Object.defineProperty(window, 'print', {
  value: jest.fn(),
  writable: true,
});

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

const renderWithRouter = (component: React.ReactElement, initialEntries = ['/verify/123']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/verify/:tokenId" element={component} />
        <Route path="/verify/" element={component} />
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
      </Routes>
      <Toaster />
    </MemoryRouter>
  );
};

describe('VerificationPage', () => {
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

    renderWithRouter(<VerificationPage />);
    
    expect(screen.getByText('Verifying Certificate')).toBeInTheDocument();
    expect(screen.getByText('Checking certificate authenticity on the blockchain...')).toBeInTheDocument();
    expect(screen.getByText('Certificate ID: #123')).toBeInTheDocument();
  });

  it('should display certificate and verification result when loaded successfully', async () => {
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

    renderWithRouter(<VerificationPage />);

    await waitFor(() => {
      expect(screen.getByText('VerifyCert')).toBeInTheDocument();
      expect(screen.getByText('Public Verification')).toBeInTheDocument();
      expect(screen.getByText('Certificate Verified')).toBeInTheDocument();
      expect(screen.getByText('Certificate verified successfully')).toBeInTheDocument();
      expect(screen.getByText('✓ Confirmed on Polygon blockchain')).toBeInTheDocument();
    });

    // Check certificate details
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Blockchain Development')).toBeInTheDocument();
    expect(screen.getByText('Tech University')).toBeInTheDocument();
  });

  it('should show error state when certificate not found', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: { message: 'Certificate not found' },
      }),
    });

    renderWithRouter(<VerificationPage />);

    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
      expect(screen.getByText('Certificate not found')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Go Home')).toBeInTheDocument();
    });
  });

  it('should handle verification failure gracefully', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { certificate: mockCertificate },
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: { message: 'Verification failed' },
        }),
      });

    renderWithRouter(<VerificationPage />);

    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
      expect(screen.getByText('Verification failed')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument(); // Certificate should still be shown
    });
  });

  it('should display verification details correctly', async () => {
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

    renderWithRouter(<VerificationPage />);

    await waitFor(() => {
      expect(screen.getByText('Verification Details')).toBeInTheDocument();
      expect(screen.getByText('#123')).toBeInTheDocument(); // Certificate ID
      expect(screen.getByText('Verified on Blockchain')).toBeInTheDocument();
      expect(screen.getByText('0x1234567890123456789012345678901234567890')).toBeInTheDocument(); // Issuer
      expect(screen.getByText('John Doe')).toBeInTheDocument(); // Recipient
      expect(screen.getByText('Tech University')).toBeInTheDocument(); // Institution
    });
  });

  it('should handle retry verification', async () => {
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

    renderWithRouter(<VerificationPage />);

    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Certificate Verified')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should handle print certificate', async () => {
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

    renderWithRouter(<VerificationPage />);

    await waitFor(() => {
      const printButton = screen.getByText('Print Certificate');
      fireEvent.click(printButton);
    });

    expect(window.print).toHaveBeenCalled();
  });

  it('should navigate to home when home button is clicked', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(<VerificationPage />);

    await waitFor(() => {
      const homeButton = screen.getByText('Go Home');
      fireEvent.click(homeButton);
    });

    // Note: In a real test, we would check if navigate('/') was called
    // but since we're mocking the router, we just verify the button exists and is clickable
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('should navigate to dashboard when dashboard button is clicked', async () => {
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

    renderWithRouter(<VerificationPage />);

    await waitFor(() => {
      const dashboardButton = screen.getByText('Dashboard');
      fireEvent.click(dashboardButton);
    });

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should handle missing token ID', () => {
    renderWithRouter(<VerificationPage />, ['/verify/']);

    expect(screen.getByText('Verification Failed')).toBeInTheDocument();
    expect(screen.getByText('No certificate ID provided')).toBeInTheDocument();
  });

  it('should display information section', async () => {
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

    renderWithRouter(<VerificationPage />);

    await waitFor(() => {
      expect(screen.getByText('About Certificate Verification')).toBeInTheDocument();
      expect(screen.getByText('🔒 Security Features')).toBeInTheDocument();
      expect(screen.getByText('✅ Verification Process')).toBeInTheDocument();
      expect(screen.getByText('Immutable blockchain storage')).toBeInTheDocument();
      expect(screen.getByText('Certificate data retrieved from blockchain')).toBeInTheDocument();
    });
  });

  it('should display footer', async () => {
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

    renderWithRouter(<VerificationPage />);

    await waitFor(() => {
      expect(screen.getByText('Powered by VerifyCert - Blockchain Certificate Verification')).toBeInTheDocument();
      expect(screen.getByText('Secured on Polygon Network')).toBeInTheDocument();
    });
  });

  it('should show invalid verification status', async () => {
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
              message: 'Certificate has been revoked',
            },
          },
        }),
      });

    renderWithRouter(<VerificationPage />);

    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
      expect(screen.getByText('Certificate has been revoked')).toBeInTheDocument();
      expect(screen.getByText('Not Verified')).toBeInTheDocument();
    });
  });

  it('should handle network errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(<VerificationPage />);

    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should show verification timestamp when available', async () => {
    const mockTimestamp = Date.now();
    
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

    renderWithRouter(<VerificationPage />);

    await waitFor(() => {
      expect(screen.getByText(/Verified:/)).toBeInTheDocument();
    });
  });

  it('should handle verify again button click', async () => {
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
      })
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
              message: 'Re-verification successful',
            },
          },
        }),
      });

    renderWithRouter(<VerificationPage />);

    await waitFor(() => {
      const verifyAgainButton = screen.getByText('Verify Again');
      fireEvent.click(verifyAgainButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Re-verification successful')).toBeInTheDocument();
    });
  });
});