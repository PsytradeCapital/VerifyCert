import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BlockchainErrorBoundary from '../BlockchainErrorBoundary';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

import toast from 'react-hot-toast';

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Component that throws different types of errors for testing
const ThrowError = ({ errorType }: { errorType: string }) => {
  const errors = {
    wallet: new Error('User rejected the request'),
    network: new Error('Network connection failed'),
    contract: new Error('execution reverted: insufficient balance'),
    transaction: new Error('transaction failed: out of gas'),
    unknown: new Error('Unknown error'),
  };
  
  throw errors[errorType as keyof typeof errors] || new Error('Test error');
};

const NoError = () => <div>No error</div>;

describe('BlockchainErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <BlockchainErrorBoundary>
        <NoError />
      </BlockchainErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('categorizes wallet errors correctly', () => {
    render(
      <BlockchainErrorBoundary>
        <ThrowError errorType="wallet" />
      </BlockchainErrorBoundary>
    );

    expect(screen.getByText('Wallet Connection Issue')).toBeInTheDocument();
    expect(screen.getByText(/problem with your wallet connection/)).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('Transaction was cancelled by user');
  });

  it('categorizes network errors correctly', () => {
    render(
      <BlockchainErrorBoundary>
        <ThrowError errorType="network" />
      </BlockchainErrorBoundary>
    );

    expect(screen.getByText('Network Connection Error')).toBeInTheDocument();
    expect(screen.getByText(/Unable to connect to the Polygon Mumbai network/)).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('Network connection error. Please check your connection and try again.');
  });

  it('categorizes contract errors correctly', () => {
    render(
      <BlockchainErrorBoundary>
        <ThrowError errorType="contract" />
      </BlockchainErrorBoundary>
    );

    expect(screen.getByText('Smart Contract Error')).toBeInTheDocument();
    expect(screen.getByText(/smart contract operation failed/)).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('Smart contract error. Please verify your inputs and try again.');
  });

  it('categorizes transaction errors correctly', () => {
    render(
      <BlockchainErrorBoundary>
        <ThrowError errorType="transaction" />
      </BlockchainErrorBoundary>
    );

    expect(screen.getByText('Transaction Failed')).toBeInTheDocument();
    expect(screen.getByText(/blockchain transaction could not be completed/)).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('Transaction failed. Please check your gas settings and try again.');
  });

  it('handles unknown errors correctly', () => {
    render(
      <BlockchainErrorBoundary>
        <ThrowError errorType="unknown" />
      </BlockchainErrorBoundary>
    );

    expect(screen.getByText('Blockchain Error')).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('An unexpected blockchain error occurred');
  });

  it('displays Try Again button for all error types', () => {
    render(
      <BlockchainErrorBoundary>
        <ThrowError errorType="contract" />
      </BlockchainErrorBoundary>
    );

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('displays Connect Wallet button for wallet errors', () => {
    render(
      <BlockchainErrorBoundary>
        <ThrowError errorType="wallet" />
      </BlockchainErrorBoundary>
    );

    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument();
  });

  it('does not display Connect Wallet button for non-wallet errors', () => {
    render(
      <BlockchainErrorBoundary>
        <ThrowError errorType="network" />
      </BlockchainErrorBoundary>
    );

    expect(screen.queryByRole('button', { name: /connect wallet/i })).not.toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const onError = jest.fn();
    
    render(
      <BlockchainErrorBoundary onError={onError}>
        <ThrowError errorType="contract" />
      </BlockchainErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('resets error state when Try Again is clicked', () => {
    const TestComponent = ({ hasError, key }: { hasError: boolean; key: string }) => (
      <BlockchainErrorBoundary key={key}>
        {hasError ? <ThrowError errorType="contract" /> : <NoError />
      </BlockchainErrorBoundary>
    );

    const { rerender } = render(<TestComponent hasError={true} key="error" />);

    expect(screen.getByText('Smart Contract Error')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    // Re-render with no error and different key to force reset
    rerender(<TestComponent hasError={false} key="no-error" />);

    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(screen.queryByText('Smart Contract Error')).not.toBeInTheDocument();
  });

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <BlockchainErrorBoundary>
        <ThrowError errorType="contract" />
      </BlockchainErrorBoundary>
    );

    expect(screen.getByText('Error Details (Development Only)')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('reloads page when Connect Wallet is clicked', () => {
    // Mock window.location.reload
    const mockReload = jest.fn();
    delete (window as any).location;
    window.location = { reload: mockReload } as any;

    render(
      <BlockchainErrorBoundary>
        <ThrowError errorType="wallet" />
      </BlockchainErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /connect wallet/i }));

    expect(mockReload).toHaveBeenCalled();
  });
});
}