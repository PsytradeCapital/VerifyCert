import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import VerificationPage from '../VerificationPage';
import getBlockchainService from '../../services/blockchainService';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ tokenId: '1' }),
  useNavigate: () => jest.fn(),
}));

jest.mock('react-hot-toast');

jest.mock('../../services/blockchainService', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../components/CertificateCard', () => {
  return function MockCertificateCard({ certificate }: any) {
    return (
      <div data-testid="certificate-card">
        <div>{certificate.recipientName}</div>
        <div>{certificate.courseName}</div>
        <div>{certificate.institutionName}</div>
      </div>
    );
  };
});

const mockGetBlockchainService = getBlockchainService as jest.MockedFunction<typeof getBlockchainService>;

const mockBlockchainService = {
  getCertificate: jest.fn(),
  verifyCertificate: jest.fn(),
  getNetworkInfo: jest.fn(),
  isConfigured: jest.fn(),
};
const mockToast = toast as jest.Mocked<typeof toast>;

const mockCertificate = {
  tokenId: '1',
  issuer: '0x1234567890123456789012345678901234567890',
  recipient: '0x0987654321098765432109876543210987654321',
  recipientName: 'John Doe',
  courseName: 'Blockchain Development',
  institutionName: 'Tech University',
  issueDate: 1640995200,
  metadataURI: 'https://example.com/metadata/1',
  isValid: true,
  verificationURL: 'https://example.com/verify/1',
  qrCodeURL: 'https://example.com/qr/1',
};

const mockVerificationResult = {
  isValid: true,
  onChain: true,
  message: 'Certificate is valid and verified on blockchain',
  verificationTimestamp: Date.now(),
};

const mockNetworkInfo = {
  name: 'maticmum',
  chainId: 80001,
  isCorrectNetwork: true,
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('VerificationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBlockchainService.isConfigured.mockReturnValue(true);
    mockGetBlockchainService.mockReturnValue(mockBlockchainService as any);
  });

  it('should display loading state initially', () => {
    mockBlockchainService.getCertificate.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderWithRouter(<VerificationPage />);
    
    expect(screen.getByText('Verifying Certificate')).toBeInTheDocument();
    expect(screen.getByText('Checking certificate authenticity on the blockchain...')).toBeInTheDocument();
    expect(screen.getByText('Certificate ID: #1')).toBeInTheDocument();
  });

  it('should successfully verify and display certificate', async () => {
    mockBlockchainService.getCertificate.mockResolvedValue(mockCertificate);
    mockBlockchainService.verifyCertificate.mockResolvedValue(mockVerificationResult);
    mockBlockchainService.getNetworkInfo.mockResolvedValue(mockNetworkInfo);

    renderWithRouter(<VerificationPage />);

    await waitFor(() => {
      expect(screen.getByText('Certificate Verified')).toBeInTheDocument();
    });

    expect(screen.getByText('Certificate is valid and verified on blockchain')).toBeInTheDocument();
    expect(screen.getByText('✓ Confirmed on Polygon blockchain')).toBeInTheDocument();
    expect(screen.getByTestId('certificate-card')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Blockchain Development')).toBeInTheDocument();
    expect(screen.getByText('Tech University')).toBeInTheDocument();

    // Check verification details
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('Verified on Blockchain')).toBeInTheDocument();
    expect(screen.getByText('0x1234567890123456789012345678901234567890')).toBeInTheDocument();
    expect(screen.getByText('Direct Blockchain Query')).toBeInTheDocument();
    expect(screen.getByText('maticmum (Chain ID: 80001)')).toBeInTheDocument();

    expect(mockToast.success).toHaveBeenCalledWith('Certificate verified successfully on blockchain!');
  });

  it('should handle certificate verification failure', async () => {
    const failedVerificationResult = {
      ...mockVerificationResult,
      isValid: false,
      message: 'Certificate is not valid or has been revoked',
    };

    mockBlockchainService.getCertificate.mockResolvedValue(mockCertificate);
    mockBlockchainService.verifyCertificate.mockResolvedValue(failedVerificationResult);
    mockBlockchainService.getNetworkInfo.mockResolvedValue(mockNetworkInfo);

    renderWithRouter(<VerificationPage />);

    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
    });

    expect(screen.getByText('Certificate is not valid or has been revoked')).toBeInTheDocument();
    expect(screen.getByText('Not Verified')).toBeInTheDocument();
    expect(mockToast.error).toHaveBeenCalledWith('Certificate verification failed');
  });

  it('should handle certificate not found error', async () => {
    mockBlockchainService.getCertificate.mockRejectedValue(new Error('Certificate not found on blockchain'));

    renderWithRouter(<VerificationPage />);

    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
    });

    expect(screen.getByText('Certificate not found on blockchain')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
    expect(mockToast.error).toHaveBeenCalledWith('Certificate not found on blockchain');
  });

  it('should handle blockchain service not configured error', async () => {
    mockBlockchainService.isConfigured.mockReturnValue(false);

    renderWithRouter(<VerificationPage />);

    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
    });

    expect(screen.getByText('Blockchain service not properly configured')).toBeInTheDocument();
    expect(mockToast.error).toHaveBeenCalledWith('Blockchain service not properly configured');
  });

  it('should handle network connection errors', async () => {
    mockBlockchainService.getCertificate.mockRejectedValue(new Error('Network connection error. Please check your internet connection.'));

    renderWithRouter(<VerificationPage />);

    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
    });

    expect(screen.getByText('Network connection error. Please check your internet connection.')).toBeInTheDocument();
  });

  it('should display network warning for incorrect network', async () => {
    const incorrectNetworkInfo = {
      name: 'mainnet',
      chainId: 1,
      isCorrectNetwork: false,
    };

    mockBlockchainService.getCertificate.mockResolvedValue(mockCertificate);
    mockBlockchainService.verifyCertificate.mockResolvedValue(mockVerificationResult);
    mockBlockchainService.getNetworkInfo.mockResolvedValue(incorrectNetworkInfo);

    renderWithRouter(<VerificationPage />);

    await waitFor(() => {
      expect(screen.getByText('Certificate Verified')).toBeInTheDocument();
    });

    // Should show network info with warning styling
    expect(screen.getByText('mainnet (Chain ID: 1)')).toBeInTheDocument();
    const networkBadge = screen.getByText('mainnet (Chain ID: 1)').closest('span');
    expect(networkBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('should handle retry functionality', async () => {
    mockBlockchainService.getCertificate.mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockCertificate);
    mockBlockchainService.verifyCertificate.mockResolvedValue(mockVerificationResult);
    mockBlockchainService.getNetworkInfo.mockResolvedValue(mockNetworkInfo);

    renderWithRouter(<VerificationPage />);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
    });

    // Click retry button
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    // Should show loading state again
    expect(screen.getByText('Verifying Certificate')).toBeInTheDocument();

    // Wait for successful verification
    await waitFor(() => {
      expect(screen.getByText('Certificate Verified')).toBeInTheDocument();
    });

    expect(mockBlockchainService.getCertificate).toHaveBeenCalledTimes(2);
  });

  it('should handle print functionality', async () => {
    const mockPrint = jest.fn();
    Object.defineProperty(window, 'print', {
      value: mockPrint,
      writable: true,
    });

    mockBlockchainService.getCertificate.mockResolvedValue(mockCertificate);
    mockBlockchainService.verifyCertificate.mockResolvedValue(mockVerificationResult);
    mockBlockchainService.getNetworkInfo.mockResolvedValue(mockNetworkInfo);

    renderWithRouter(<VerificationPage />);

    await waitFor(() => {
      expect(screen.getByText('Certificate Verified')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /print certificate/i }));
    expect(mockPrint).toHaveBeenCalled();
  });

  it('should handle missing token ID', async () => {
    // Mock useParams to return undefined tokenId
    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useParams: () => ({ tokenId: undefined }),
      useNavigate: () => jest.fn(),
    }));

    const { VerificationPage: VerificationPageWithoutToken } = await import('../VerificationPage');
    
    renderWithRouter(<VerificationPageWithoutToken />);

    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
    });

    expect(screen.getByText('No certificate ID provided')).toBeInTheDocument();
  });

  it('should display information section', async () => {
    mockBlockchainService.getCertificate.mockResolvedValue(mockCertificate);
    mockBlockchainService.verifyCertificate.mockResolvedValue(mockVerificationResult);
    mockBlockchainService.getNetworkInfo.mockResolvedValue(mockNetworkInfo);

    renderWithRouter(<VerificationPage />);

    await waitFor(() => {
      expect(screen.getByText('Certificate Verified')).toBeInTheDocument();
    });

    expect(screen.getByText('About Certificate Verification')).toBeInTheDocument();
    expect(screen.getByText('🔒 Security Features')).toBeInTheDocument();
    expect(screen.getByText('✅ Verification Process')).toBeInTheDocument();
    expect(screen.getByText('• Certificate data retrieved from blockchain')).toBeInTheDocument();
    expect(screen.getByText('• Authenticity confirmed via smart contract')).toBeInTheDocument();
  });
});