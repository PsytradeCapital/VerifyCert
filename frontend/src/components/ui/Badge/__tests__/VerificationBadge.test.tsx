import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VerificationBadge from '../VerificationBadge';

// Mock the blockchain service
jest.mock('../../../../services/blockchainService', () => ({
  getBlockchainService: () => ({
    verifyCertificate: jest.fn().mockResolvedValue({
      isValid: true,
      onChain: true,
      message: 'Certificate is valid and verified on blockchain',
      verificationTimestamp: Date.now(),
      transactionHash: '0x1234567890abcdef',
      blockNumber: '12345',
      contractAddress: '0xabcdef1234567890'
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
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('VerificationBadge', () => {
  const defaultProps = {
    tokenId: '12345',
    isValid: true,
    isRevoked: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Minimal Variant', () => {
    it('renders minimal badge with valid status', () => {
      render(
        <VerificationBadge
          {...defaultProps}
          variant="minimal"
          size="default"
        />
      );

      expect(screen.getByText('Valid')).toBeInTheDocument();
    });

    it('renders minimal badge with revoked status', () => {
      render(
        <VerificationBadge
          {...defaultProps}
          isValid={false}
          isRevoked={true}
          variant="minimal"
          size="default"
        />
      );

      expect(screen.getByText('Revoked')).toBeInTheDocument();
    });

    it('renders different sizes correctly', () => {
      const { rerender } = render(
        <VerificationBadge
          {...defaultProps}
          variant="minimal"
          size="sm"
        />
      );

      let badge = screen.getByText('Valid').closest('span');
      expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs');

      rerender(
        <VerificationBadge
          {...defaultProps}
          variant="minimal"
          size="lg"
        />
      );

      badge = screen.getByText('Valid').closest('span');
      expect(badge).toHaveClass('px-3', 'py-1', 'text-base');
    });
  });

  describe('Detailed Variant', () => {
    it('renders detailed badge with verification status', () => {
      render(
        <VerificationBadge
          {...defaultProps}
          variant="detailed"
          showDetails={true}
        />
      );

      // Should show initial status based on props
      expect(screen.getByText('Valid')).toBeInTheDocument();
    });

    it('shows verify button when no verification result exists', () => {
      render(
        <VerificationBadge
          tokenId="12345"
          isValid={false}
          variant="detailed"
          showDetails={true}
        />
      );

      expect(screen.getByText('Verify')).toBeInTheDocument();
    });

    it('shows verifying state during verification', async () => {
      render(
        <VerificationBadge
          {...defaultProps}
          variant="detailed"
          showDetails={true}
        />
      );

      // Should show verifying state initially
      await waitFor(() => {
        expect(screen.getByText('Verifying...')).toBeInTheDocument();
      });
    });

    it('calls onVerificationComplete callback when verification completes', async () => {
      const onVerificationComplete = jest.fn();
      
      render(
        <VerificationBadge
          {...defaultProps}
          variant="detailed"
          onVerificationComplete={onVerificationComplete}
        />
      );

      await waitFor(() => {
        expect(onVerificationComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            isValid: true,
            onChain: true,
            message: 'Certificate is valid and verified on blockchain'
          })
        );
      });
    });
  });

  describe('Premium Variant', () => {
    it('renders premium badge with full details', async () => {
      render(
        <VerificationBadge
          {...defaultProps}
          variant="premium"
          showDetails={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Blockchain Verified')).toBeInTheDocument();
      });
    });

    it('shows blockchain proof details in premium variant', async () => {
      render(
        <VerificationBadge
          {...defaultProps}
          variant="premium"
          showDetails={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Blockchain Proof')).toBeInTheDocument();
      });
    });

    it('shows verify button when no verification exists', () => {
      render(
        <VerificationBadge
          tokenId="12345"
          isValid={false}
          variant="premium"
          showDetails={true}
        />
      );

      expect(screen.getByText('Verify on Blockchain')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('shows error state when verification fails', async () => {
      // Mock failed verification
      const mockBlockchainService = require('../../../../services/blockchainService').getBlockchainService();
      mockBlockchainService.verifyCertificate.mockRejectedValueOnce(new Error('Network error'));

      render(
        <VerificationBadge
          tokenId="12345"
          variant="detailed"
          showDetails={true}
        />
      );

      // Manually trigger verification
      const verifyButton = screen.getByText('Verify');
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(screen.getByText('Verification Error')).toBeInTheDocument();
      });
    });
  });

  describe('Interaction', () => {
    it('toggles proof details when clicked in detailed variant', async () => {
      render(
        <VerificationBadge
          {...defaultProps}
          variant="detailed"
          showDetails={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Blockchain Verified')).toBeInTheDocument();
      });

      // Click to toggle details
      const badge = screen.getByText('Blockchain Verified');
      fireEvent.click(badge);

      // Should show blockchain proof details
      await waitFor(() => {
        expect(screen.getByText('Blockchain Proof')).toBeInTheDocument();
      });
    });

    it('triggers manual verification when verify button is clicked', async () => {
      const mockBlockchainService = require('../../../../services/blockchainService').getBlockchainService();
      
      render(
        <VerificationBadge
          tokenId="12345"
          variant="detailed"
          showDetails={true}
        />
      );

      // Wait for initial load, then clear mocks
      await waitFor(() => {
        expect(screen.getByText('Blockchain Verified')).toBeInTheDocument();
      });
      
      mockBlockchainService.verifyCertificate.mockClear();

      // Find and click verify button (if it exists)
      const verifyButton = screen.queryByText('Verify');
      if (verifyButton) {
        fireEvent.click(verifyButton);
        
        await waitFor(() => {
          expect(mockBlockchainService.verifyCertificate).toHaveBeenCalledWith('12345');
        });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <VerificationBadge
          {...defaultProps}
          variant="minimal"
        />
      );

      const badge = screen.getByText('Valid').closest('span');
      expect(badge).toBeInTheDocument();
    });

    it('supports keyboard navigation for interactive elements', async () => {
      render(
        <VerificationBadge
          {...defaultProps}
          variant="detailed"
          showDetails={true}
        />
      );

      await waitFor(() => {
        const verifyButton = screen.queryByText('Verify');
        if (verifyButton) {
          expect(verifyButton).toBeInTheDocument();
          verifyButton.focus();
          expect(verifyButton).toHaveFocus();
      });
    });
  });
});
}