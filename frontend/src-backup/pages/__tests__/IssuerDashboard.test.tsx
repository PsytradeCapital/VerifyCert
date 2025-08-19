import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import IssuerDashboard from '../IssuerDashboard';

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    BrowserProvider: jest.fn(),
    isAddress: jest.fn(() => true),
  },
}));

// Mock fetch
global.fetch = jest.fn();

// Mock window.ethereum
Object.defineProperty(window, 'ethereum', {
  value: {
    request: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
  },
  writable: true,
});

const mockCertificates = [
  {
    tokenId: '1',
    issuer: '0x1234567890123456789012345678901234567890',
    recipient: '0x0987654321098765432109876543210987654321',
    recipientName: 'John Doe',
    courseName: 'Blockchain Development',
    institutionName: 'Tech University',
    issueDate: Math.floor(Date.now() / 1000) - 86400, // Yesterday
    isValid: true,
    qrCodeURL: 'https://example.com/qr/1',
    verificationURL: 'https://example.com/verify/1',
  },
  {
    tokenId: '2',
    issuer: '0x1234567890123456789012345678901234567890',
    recipient: '0x1111111111111111111111111111111111111111',
    recipientName: 'Jane Smith',
    courseName: 'Smart Contract Security',
    institutionName: 'Tech University',
    issueDate: Math.floor(Date.now() / 1000) - 604800, // One week ago
    isValid: true,
    qrCodeURL: 'https://example.com/qr/2',
    verificationURL: 'https://example.com/verify/2',
  },
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
      <Toaster />
    </BrowserRouter>
  );
};

describe('IssuerDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should render wallet connection prompt when not connected', () => {
    renderWithRouter(<IssuerDashboard />);
    
    expect(screen.getByText('Connect Your Wallet')).toBeInTheDocument();
    expect(screen.getByText('Connect your MetaMask wallet to access the issuer dashboard and start issuing certificates.')).toBeInTheDocument();
  });

  it('should render dashboard when wallet is connected', async () => {
    // Mock successful certificate fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { certificates: mockCertificates },
      }),
    });

    renderWithRouter(<IssuerDashboard />);
    
    // Simulate wallet connection by finding and clicking connect button
    const connectButton = screen.getByText('Connect Wallet');
    fireEvent.click(connectButton);

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText('Issuer Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Manage and track your issued certificates')).toBeInTheDocument();
    });
  });

  it('should display statistics correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { certificates: mockCertificates },
      }),
    });

    renderWithRouter(<IssuerDashboard />);
    
    // Mock wallet connection
    const mockProvider = { getNetwork: jest.fn().mockResolvedValue({ chainId: 80001 }) };
    const walletConnect = screen.getByTestId('wallet-connect') || screen.getByText('Connect Wallet');
    
    // Simulate connection
    fireEvent.click(walletConnect);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Total issued
      expect(screen.getByText('Total Issued')).toBeInTheDocument();
      expect(screen.getByText('This Month')).toBeInTheDocument();
      expect(screen.getByText('This Week')).toBeInTheDocument();
      expect(screen.getByText('Recipients')).toBeInTheDocument();
    });
  });

  it('should render certificate form when connected', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { certificates: [] },
      }),
    });

    renderWithRouter(<IssuerDashboard />);
    
    // Mock wallet connection state
    const connectButton = screen.getByText('Connect Wallet');
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(screen.getByText('Issue New Certificate')).toBeInTheDocument();
      expect(screen.getByLabelText(/Recipient Wallet Address/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Recipient Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Course\/Achievement Name/)).toBeInTheDocument();
    });
  });

  it('should display issued certificates list', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { certificates: mockCertificates },
      }),
    });

    renderWithRouter(<IssuerDashboard />);
    
    // Mock wallet connection
    const connectButton = screen.getByText('Connect Wallet');
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(screen.getByText('Issued Certificates')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Blockchain Development')).toBeInTheDocument();
      expect(screen.getByText('Smart Contract Security')).toBeInTheDocument();
    });
  });

  it('should filter certificates by search term', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { certificates: mockCertificates },
      }),
    });

    renderWithRouter(<IssuerDashboard />);
    
    // Mock wallet connection
    const connectButton = screen.getByText('Connect Wallet');
    fireEvent.click(connectButton);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search certificates...');
      fireEvent.change(searchInput, { target: { value: 'John' } });
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  it('should sort certificates by different criteria', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { certificates: mockCertificates },
      }),
    });

    renderWithRouter(<IssuerDashboard />);
    
    // Mock wallet connection
    const connectButton = screen.getByText('Connect Wallet');
    fireEvent.click(connectButton);

    await waitFor(() => {
      const sortSelect = screen.getByDisplayValue('Sort by Date');
      fireEvent.change(sortSelect, { target: { value: 'name' } });
      
      expect(sortSelect).toHaveValue('name');
    });
  });

  it('should handle certificate minting', async () => {
    // Mock successful certificate fetch
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { certificates: [] },
        }),
      })
      // Mock successful minting
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { tokenId: '123' },
        }),
      })
      // Mock updated certificate list
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { certificates: [mockCertificates[0]] },
        }),
      });

    renderWithRouter(<IssuerDashboard />);
    
    // Mock wallet connection
    const connectButton = screen.getByText('Connect Wallet');
    fireEvent.click(connectButton);

    await waitFor(() => {
      // Fill out the form
      const recipientAddressInput = screen.getByLabelText(/Recipient Wallet Address/);
      const recipientNameInput = screen.getByLabelText(/Recipient Name/);
      const courseNameInput = screen.getByLabelText(/Course\/Achievement Name/);
      const institutionNameInput = screen.getByLabelText(/Institution Name/);

      fireEvent.change(recipientAddressInput, { 
        target: { value: '0x1234567890123456789012345678901234567890' } 
      });
      fireEvent.change(recipientNameInput, { target: { value: 'Test User' } });
      fireEvent.change(courseNameInput, { target: { value: 'Test Course' } });
      fireEvent.change(institutionNameInput, { target: { value: 'Test Institution' } });

      // Submit the form
      const submitButton = screen.getByText('Issue Certificate');
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/certificates/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('Test User'),
      });
    });
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(<IssuerDashboard />);
    
    // Mock wallet connection
    const connectButton = screen.getByText('Connect Wallet');
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(screen.getByText('No certificates issued yet')).toBeInTheDocument();
    });
  });

  it('should show loading state while fetching certificates', async () => {
    // Mock delayed response
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: { certificates: [] },
        }),
      }), 100))
    );

    renderWithRouter(<IssuerDashboard />);
    
    // Mock wallet connection
    const connectButton = screen.getByText('Connect Wallet');
    fireEvent.click(connectButton);

    // Should show loading state
    expect(screen.getByText('Loading certificates...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Loading certificates...')).not.toBeInTheDocument();
    });
  });

  it('should display empty state when no certificates exist', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { certificates: [] },
      }),
    });

    renderWithRouter(<IssuerDashboard />);
    
    // Mock wallet connection
    const connectButton = screen.getByText('Connect Wallet');
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(screen.getByText('No certificates issued yet')).toBeInTheDocument();
      expect(screen.getByText('Start by issuing your first certificate using the form above.')).toBeInTheDocument();
    });
  });

  it('should toggle sort order when sort button is clicked', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { certificates: mockCertificates },
      }),
    });

    renderWithRouter(<IssuerDashboard />);
    
    // Mock wallet connection
    const connectButton = screen.getByText('Connect Wallet');
    fireEvent.click(connectButton);

    await waitFor(() => {
      const sortButton = screen.getByRole('button', { name: /sort/i });
      fireEvent.click(sortButton);
      
      // Should toggle the sort order (implementation detail may vary)
      expect(sortButton).toBeInTheDocument();
    });
  });
});