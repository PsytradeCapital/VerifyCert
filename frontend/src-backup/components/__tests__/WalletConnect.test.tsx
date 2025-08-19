import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import WalletConnect from '../WalletConnect';

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    BrowserProvider: jest.fn().mockImplementation(() => ({
      getNetwork: jest.fn().mockResolvedValue({ chainId: BigInt(80001) }),
    })),
  },
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock window.ethereum
const mockEthereum = {
  isMetaMask: true,
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
};

describe('WalletConnect Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup window.ethereum mock
    Object.defineProperty(window, 'ethereum', {
      value: mockEthereum,
      writable: true,
    });
  });

  afterEach(() => {
    // Clean up
    delete (window as any).ethereum;
  });

  describe('MetaMask not installed', () => {
    beforeEach(() => {
      delete (window as any).ethereum;
    });

    it('should display MetaMask installation prompt when MetaMask is not installed', () => {
      render(<WalletConnect />);
      
      expect(screen.getByText('MetaMask Required')).toBeInTheDocument();
      expect(screen.getByText('Please install MetaMask to connect your wallet.')).toBeInTheDocument();
      expect(screen.getByText('Install MetaMask')).toBeInTheDocument();
    });

    it('should open MetaMask download page when install button is clicked', () => {
      const mockOpen = jest.fn();
      window.open = mockOpen;
      
      render(<WalletConnect />);
      
      const installButton = screen.getByText('Install MetaMask');
      fireEvent.click(installButton);
      
      expect(mockOpen).toHaveBeenCalledWith('https://metamask.io/download/', '_blank');
    });
  });

  describe('MetaMask installed', () => {
    it('should display connect wallet button when not connected', () => {
      mockEthereum.request.mockResolvedValue([]);
      
      render(<WalletConnect />);
      
      expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
    });

    it('should show connecting state when connection is in progress', async () => {
      mockEthereum.request.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<WalletConnect />);
      
      const connectButton = screen.getByText('Connect Wallet');
      fireEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText('Connecting...')).toBeInTheDocument();
      });
    });

    it('should connect wallet successfully', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';
      const mockOnConnect = jest.fn();
      
      mockEthereum.request
        .mockResolvedValueOnce([]) // Initial eth_accounts call
        .mockResolvedValueOnce([mockAddress]); // eth_requestAccounts call
      
      render(<WalletConnect onConnect={mockOnConnect} />);
      
      const connectButton = screen.getByText('Connect Wallet');
      fireEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText('0x1234...7890')).toBeInTheDocument();
      });
      
      expect(mockOnConnect).toHaveBeenCalledWith(mockAddress, expect.any(Object));
    });

    it('should handle connection rejection', async () => {
      const mockError = { code: 4001 };
      mockEthereum.request
        .mockResolvedValueOnce([]) // Initial eth_accounts call
        .mockRejectedValueOnce(mockError); // eth_requestAccounts call
      
      render(<WalletConnect />);
      
      const connectButton = screen.getByText('Connect Wallet');
      fireEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
      });
    });

    it('should disconnect wallet', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';
      const mockOnDisconnect = jest.fn();
      
      mockEthereum.request
        .mockResolvedValueOnce([mockAddress]) // Initial eth_accounts call
        .mockResolvedValueOnce([mockAddress]); // eth_requestAccounts call
      
      render(<WalletConnect onDisconnect={mockOnDisconnect} />);
      
      // Wait for initial connection check
      await waitFor(() => {
        expect(screen.getByText('0x1234...7890')).toBeInTheDocument();
      });
      
      const disconnectButton = screen.getByText('Disconnect');
      fireEvent.click(disconnectButton);
      
      await waitFor(() => {
        expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
      });
      
      expect(mockOnDisconnect).toHaveBeenCalled();
    });

    it('should display network name when connected', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';
      
      mockEthereum.request.mockResolvedValueOnce([mockAddress]);
      
      render(<WalletConnect />);
      
      await waitFor(() => {
        expect(screen.getByText('Polygon Mumbai')).toBeInTheDocument();
      });
    });

    it('should show network switch prompt for wrong network', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';
      
      // Mock different network (Ethereum mainnet)
      const { ethers } = await import('ethers');
      (ethers.BrowserProvider as jest.Mock).mockImplementation(() => ({
        getNetwork: jest.fn().mockResolvedValue({ chainId: BigInt(1) }),
      }));
      
      mockEthereum.request.mockResolvedValueOnce([mockAddress]);
      
      render(<WalletConnect requiredNetwork="polygon-mumbai" />);
      
      await waitFor(() => {
        expect(screen.getByText('Please switch to Polygon Mumbai')).toBeInTheDocument();
        expect(screen.getByText('Switch Network')).toBeInTheDocument();
      });
    });

    it('should handle network switching', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';
      
      mockEthereum.request
        .mockResolvedValueOnce([mockAddress]) // Initial connection
        .mockResolvedValueOnce(undefined); // wallet_switchEthereumChain
      
      render(<WalletConnect requiredNetwork="polygon-mumbai" />);
      
      await waitFor(() => {
        expect(screen.getByText('Switch Network')).toBeInTheDocument();
      });
      
      const switchButton = screen.getByText('Switch Network');
      fireEvent.click(switchButton);
      
      await waitFor(() => {
        expect(mockEthereum.request).toHaveBeenCalledWith({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13881' }],
        });
      });
    });

    it('should add network if not exists', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';
      const switchError = { code: 4902 };
      
      mockEthereum.request
        .mockResolvedValueOnce([mockAddress]) // Initial connection
        .mockRejectedValueOnce(switchError) // wallet_switchEthereumChain fails
        .mockResolvedValueOnce(undefined); // wallet_addEthereumChain succeeds
      
      render(<WalletConnect requiredNetwork="polygon-mumbai" />);
      
      await waitFor(() => {
        expect(screen.getByText('Switch Network')).toBeInTheDocument();
      });
      
      const switchButton = screen.getByText('Switch Network');
      fireEvent.click(switchButton);
      
      await waitFor(() => {
        expect(mockEthereum.request).toHaveBeenCalledWith({
          method: 'wallet_addEthereumChain',
          params: [expect.objectContaining({
            chainId: '0x13881',
            chainName: 'Polygon Mumbai',
          })],
        });
      });
    });

    it('should apply custom className', () => {
      render(<WalletConnect className="custom-class" />);
      
      const container = screen.getByText('Connect Wallet').closest('div');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Event listeners', () => {
    it('should set up event listeners on mount', () => {
      render(<WalletConnect />);
      
      expect(mockEthereum.on).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
      expect(mockEthereum.on).toHaveBeenCalledWith('chainChanged', expect.any(Function));
    });

    it('should handle account changes', async () => {
      const mockAddress1 = '0x1111111111111111111111111111111111111111';
      const mockAddress2 = '0x2222222222222222222222222222222222222222';
      const mockOnConnect = jest.fn();
      
      mockEthereum.request.mockResolvedValueOnce([mockAddress1]);
      
      render(<WalletConnect onConnect={mockOnConnect} />);
      
      // Wait for initial connection
      await waitFor(() => {
        expect(screen.getByText('0x1111...1111')).toBeInTheDocument();
      });
      
      // Simulate account change
      const accountsChangedHandler = mockEthereum.on.mock.calls.find(
        call => call[0] === 'accountsChanged'
      )[1];
      
      accountsChangedHandler([mockAddress2]);
      
      await waitFor(() => {
        expect(mockOnConnect).toHaveBeenCalledWith(mockAddress2, expect.any(Object));
      });
    });

    it('should disconnect when no accounts', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';
      const mockOnDisconnect = jest.fn();
      
      mockEthereum.request.mockResolvedValueOnce([mockAddress]);
      
      render(<WalletConnect onDisconnect={mockOnDisconnect} />);
      
      // Wait for initial connection
      await waitFor(() => {
        expect(screen.getByText('0x1234...7890')).toBeInTheDocument();
      });
      
      // Simulate account disconnection
      const accountsChangedHandler = mockEthereum.on.mock.calls.find(
        call => call[0] === 'accountsChanged'
      )[1];
      
      accountsChangedHandler([]);
      
      await waitFor(() => {
        expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
      });
      
      expect(mockOnDisconnect).toHaveBeenCalled();
    });
  });
});