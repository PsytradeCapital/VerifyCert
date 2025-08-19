import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BlockchainProofIndicator from '../BlockchainProofIndicator';

// Mock the blockchain service
jest.mock('../../../../services/blockchainService', () => ({
  getBlockchainService: () => ({
    verifyCertificate: jest.fn().mockResolvedValue({
      isValid: true,
      onChain: true,
      message: 'Certificate is valid and verified on blockchain',
      verificationTimestamp: Date.now(),
      transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      blockNumber: '12345',
      contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12'
    }),
    getNetworkInfo: jest.fn().mockResolvedValue({
      name: 'Polygon Mumbai',
      chainId: 80001,
      isCorrectNetwork: true
    })
  })
}));

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
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

// Mock window.open
global.open = jest.fn();

describe('BlockchainProofIndicator', () => {
  const mockProofData = {
    tokenId: '12345',
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    blockNumber: '12345',
    contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    verificationTimestamp: Date.now(),
    networkName: 'Polygon Mumbai',
    chainId: 80001,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Inline Variant', () => {
    it('renders inline variant with basic proof info', () => {
      render(
        <BlockchainProofIndicator
          {...mockProofData}
          variant="inline"
        />
      );

      expect(screen.getByText('Blockchain Verified')).toBeInTheDocument();
      expect(screen.getByText('Tx:')).toBeInTheDocument();
    });

    it('shows truncated transaction hash', () => {
      render(
        <BlockchainProofIndicator
          {...mockProofData}
          variant="inline"
        />
      );

      expect(screen.getByText('0x1234...cdef')).toBeInTheDocument();
    });

    it('includes copy and explorer buttons when enabled', () => {
      render(
        <BlockchainProofIndicator
          {...mockProofData}
          variant="inline"
          showCopyButtons={true}
        />
      );

      const copyButton = screen.getByTitle('Copy transaction');
      const explorerButton = screen.getByTitle('View on block explorer');
      
      expect(copyButton).toBeInTheDocument();
      expect(explorerButton).toBeInTheDocument();
    });
  });

  describe('Compact Variant', () => {
    it('renders compact variant with verification status', () => {
      render(
        <BlockchainProofIndicator
          {...mockProofData}
          variant="compact"
        />
      );

      expect(screen.getByText('Blockchain Verified')).toBeInTheDocument();
      expect(screen.getByText('On-Chain')).toBeInTheDocument();
    });

    it('shows transaction hash in compact format', () => {
      render(
        <BlockchainProofIndicator
          {...mockProofData}
          variant="compact"
        />
      );

      expect(screen.getByText('Transaction:')).toBeInTheDocument();
      expect(screen.getByText('0x1234...cdef')).toBeInTheDocument();
    });
  });

  describe('Detailed Variant', () => {
    it('renders detailed variant with expandable content', () => {
      render(
        <BlockchainProofIndicator
          {...mockProofData}
          variant="detailed"
        />
      );

      expect(screen.getByText('Blockchain Proof')).toBeInTheDocument();
      expect(screen.getByText('Verified on Polygon network')).toBeInTheDocument();
    });

    it('expands content when clicked', () => {
      render(
        <BlockchainProofIndicator
          {...mockProofData}
          variant="detailed"
          autoExpand={false}
        />
      );

      const header = screen.getByText('Blockchain Proof').closest('div');
      fireEvent.click(header!);

      expect(screen.getByText('Transaction Hash')).toBeInTheDocument();
      expect(screen.getByText('Block Number')).toBeInTheDocument();
      expect(screen.getByText('Contract Address')).toBeInTheDocument();
    });

    it('auto-expands when autoExpand is true', () => {
      render(
        <BlockchainProofIndicator
          {...mockProofData}
          variant="detailed"
          autoExpand={true}
        />
      );

      expect(screen.getByText('Transaction Hash')).toBeInTheDocument();
      expect(screen.getByText('Block Number')).toBeInTheDocument();
    });

    it('shows all proof details when expanded', () => {
      render(
        <BlockchainProofIndicator
          {...mockProofData}
          variant="detailed"
          autoExpand={true}
        />
      );

      expect(screen.getByText('Transaction Hash')).toBeInTheDocument();
      expect(screen.getByText('Block Number')).toBeInTheDocument();
      expect(screen.getByText('Contract Address')).toBeInTheDocument();
      expect(screen.getByText('Network')).toBeInTheDocument();
      expect(screen.getByText('Verified On')).toBeInTheDocument();
    });
  });

  describe('Data Fetching', () => {
    it('fetches proof data when not provided', async () => {
      const mockBlockchainService = require('../../../../services/blockchainService').getBlockchainService();
      
      render(
        <BlockchainProofIndicator
          tokenId="12345"
          variant="detailed"
          autoExpand={true}
        />
      );

      await waitFor(() => {
        expect(mockBlockchainService.verifyCertificate).toHaveBeenCalledWith('12345');
        expect(mockBlockchainService.getNetworkInfo).toHaveBeenCalled();
      });
    });

    it('shows loading state while fetching data', () => {
      render(
        <BlockchainProofIndicator
          tokenId="12345"
          variant="detailed"
        />
      );

      expect(screen.getByText('Loading blockchain proof...')).toBeInTheDocument();
    });

    it('handles fetch errors gracefully', async () => {
      const mockBlockchainService = require('../../../../services/blockchainService').getBlockchainService();
      mockBlockchainService.verifyCertificate.mockRejectedValueOnce(new Error('Network error'));

      render(
        <BlockchainProofIndicator
          tokenId="12345"
          variant="detailed"
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading blockchain proof...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Copy Functionality', () => {
    it('copies transaction hash to clipboard', async () => {
      render(
        <BlockchainProofIndicator
          {...mockProofData}
          variant="detailed"
          autoExpand={true}
          showCopyButtons={true}
        />
      );

      const copyButton = screen.getByTitle('Copy transaction');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockProofData.transactionHash);
      });
    });

    it('copies contract address to clipboard', async () => {
      render(
        <BlockchainProofIndicator
          {...mockProofData}
          variant="detailed"
          autoExpand={true}
          showCopyButtons={true}
        />
      );

      const copyButton = screen.getByTitle('Copy contract');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockProofData.contractAddress);
      });
    });

    it('shows check icon after successful copy', async () => {
      render(
        <BlockchainProofIndicator
          {...mockProofData}
          variant="detailed"
          autoExpand={true}
          showCopyButtons={true}
        />
      );

      const copyButton = screen.getByTitle('Copy transaction');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByTitle('Copy transaction')).toBeInTheDocument();
      });
    });
  });

  describe('Explorer Links', () => {
    it('opens transaction in block explorer', () => {
      render(
        <BlockchainProofIndicator
          {...mockProofData}
          variant="detailed"
          autoExpand={true}
        />
      );

      const explorerButton = screen.getByTitle('View on block explorer');
      fireEvent.click(explorerButton);

      expect(global.open).toHaveBeenCalledWith(
        `https://mumbai.polygonscan.com/tx/${mockProofData.transactionHash}`,
        '_blank'
      );
    });

    it('uses correct explorer URL for different networks', () => {
      render(
        <BlockchainProofIndicator
          {...mockProofData}
          chainId={137} // Polygon mainnet
          variant="detailed"
          autoExpand={true}
        />
      );

      const explorerButton = screen.getByTitle('View on block explorer');
      fireEvent.click(explorerButton);

      expect(global.open).toHaveBeenCalledWith(
        `https://polygonscan.com/tx/${mockProofData.transactionHash}`,
        '_blank'
      );
    });
  });

  describe('Accessibility', () => {
    it('has proper button titles for screen readers', () => {
      render(
        <BlockchainProofIndicator
          {...mockProofData}
          variant="detailed"
          autoExpand={true}
          showCopyButtons={true}
        />
      );

      expect(screen.getByTitle('Copy transaction')).toBeInTheDocument();
      expect(screen.getByTitle('View on block explorer')).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(
        <BlockchainProofIndicator
          {...mockProofData}
          variant="detailed"
          autoExpand={true}
          showCopyButtons={true}
        />
      );

      const copyButton = screen.getByTitle('Copy transaction');
      copyButton.focus();
      expect(copyButton).toHaveFocus();
    });
  });

  describe('Formatting', () => {
    it('formats addresses correctly', () => {
      render(
        <BlockchainProofIndicator
          {...mockProofData}
          variant="inline"
        />
      );

      expect(screen.getByText('0x1234...cdef')).toBeInTheDocument();
    });

    it('formats timestamps correctly', () => {
      const timestamp = new Date('2023-01-01T12:00:00Z').getTime();
      
      render(
        <BlockchainProofIndicator
          {...mockProofData}
          verificationTimestamp={timestamp}
          variant="detailed"
          autoExpand={true}
        />
      );

      expect(screen.getByText(/1\/1\/2023/)).toBeInTheDocument();
    });

    it('displays block number with hash prefix', () => {
      render(
        <BlockchainProofIndicator
          {...mockProofData}
          variant="detailed"
          autoExpand={true}
        />
      );

      expect(screen.getByText('#12345')).toBeInTheDocument();
    });
  });
});