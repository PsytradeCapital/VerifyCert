import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import CertificateForm, { CertificateFormData } from '../CertificateForm';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock ethers
jest.mock('ethers', () => ({
  isAddress: jest.fn(),
}));

const mockEthers = require('ethers');

describe('CertificateForm', () => {
  const mockOnSubmit = jest.fn();
  const mockWalletAddress = '0x1234567890123456789012345678901234567890';
  
  const defaultProps = {
    onSubmit: mockOnSubmit,
    isLoading: false,
    walletAddress: mockWalletAddress,
    isConnected: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockEthers.isAddress.mockReturnValue(true);
  });

  describe('Wallet Connection', () => {
    it('should show wallet connection required message when not connected', () => {
      render(
        <CertificateForm
          {...defaultProps}
          isConnected={false}
          walletAddress={null}
        />
      );

      expect(screen.getByText('Wallet Connection Required')).toBeInTheDocument();
      expect(screen.getByText('Please connect your wallet to issue certificates.')).toBeInTheDocument();
    });

    it('should show form when wallet is connected', () => {
      render(<CertificateForm {...defaultProps} />);

      expect(screen.getByText('Issue New Certificate')).toBeInTheDocument();
      expect(screen.getByLabelText(/Recipient Wallet Address/)).toBeInTheDocument();
    });

    it('should display connected wallet address', () => {
      render(<CertificateForm {...defaultProps} />);

      expect(screen.getByText(Connected as: ${mockWalletAddress.slice(0, 6)}...${mockWalletAddress.slice(-4)})).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('should render all required form fields', () => {
      render(<CertificateForm {...defaultProps} />);

      expect(screen.getByLabelText(/Recipient Wallet Address/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Recipient Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Course\/Achievement Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Institution Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Issue Date/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
    });

    it('should set default institution name when wallet connects', () => {
      render(
        <CertificateForm
          {...defaultProps}
          isConnected={true}
          walletAddress={mockWalletAddress}
        />
      );

      const institutionInput = screen.getByLabelText(/Institution Name/) as HTMLInputElement;
      expect(institutionInput.value).toBe('My Institution');
    });

    it('should set today\'s date as default issue date', () => {
      render(<CertificateForm {...defaultProps} />);

      const dateInput = screen.getByLabelText(/Issue Date/) as HTMLInputElement;
      const today = new Date().toISOString().split('T')[0];
      expect(dateInput.value).toBe(today);
    });
  });

  describe('Form Validation', () => {
    it('should validate recipient address is required', async () => {
      const user = userEvent.setup();
      render(<CertificateForm {...defaultProps} />);

      const addressInput = screen.getByLabelText(/Recipient Wallet Address/);
      await user.click(addressInput);
      await user.tab(); // Trigger blur

      expect(screen.getByText('Recipient address is required')).toBeInTheDocument();
    });

    it('should validate recipient address format', async () => {
      const user = userEvent.setup();
      mockEthers.isAddress.mockReturnValue(false);
      
      render(<CertificateForm {...defaultProps} />);

      const addressInput = screen.getByLabelText(/Recipient Wallet Address/);
      await user.type(addressInput, 'invalid-address');
      await user.tab();

      expect(screen.getByText('Please enter a valid Ethereum address')).toBeInTheDocument();
    });

    it('should prevent issuing certificate to self', async () => {
      const user = userEvent.setup();
      render(<CertificateForm {...defaultProps} />);

      const addressInput = screen.getByLabelText(/Recipient Wallet Address/);
      await user.type(addressInput, mockWalletAddress);
      await user.tab();

      expect(screen.getByText('Cannot issue certificate to yourself')).toBeInTheDocument();
    });

    it('should validate recipient name length', async () => {
      const user = userEvent.setup();
      render(<CertificateForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Recipient Name/);
      
      // Test minimum length
      await user.type(nameInput, 'A');
      await user.tab();
      expect(screen.getByText('Name must be at least 2 characters long')).toBeInTheDocument();

      // Test maximum length
      await user.clear(nameInput);
      await user.type(nameInput, 'A'.repeat(101));
      await user.tab();
      expect(screen.getByText('Name must be less than 100 characters')).toBeInTheDocument();
    });

    it('should validate course name length', async () => {
      const user = userEvent.setup();
      render(<CertificateForm {...defaultProps} />);

      const courseInput = screen.getByLabelText(/Course\/Achievement Name/);
      
      // Test minimum length
      await user.type(courseInput, 'AB');
      await user.tab();
      expect(screen.getByText('Course name must be at least 3 characters long')).toBeInTheDocument();

      // Test maximum length
      await user.clear(courseInput);
      await user.type(courseInput, 'A'.repeat(201));
      await user.tab();
      expect(screen.getByText('Course name must be less than 200 characters')).toBeInTheDocument();
    });

    it('should validate issue date is not in future', async () => {
      const user = userEvent.setup();
      render(<CertificateForm {...defaultProps} />);

      const dateInput = screen.getByLabelText(/Issue Date/);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      await user.clear(dateInput);
      await user.type(dateInput, futureDate.toISOString().split('T')[0]);
      await user.tab();

      expect(screen.getByText('Issue date cannot be in the future')).toBeInTheDocument();
    });

    it('should validate issue date is not too old', async () => {
      const user = userEvent.setup();
      render(<CertificateForm {...defaultProps} />);

      const dateInput = screen.getByLabelText(/Issue Date/);
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 11);
      
      await user.clear(dateInput);
      await user.type(dateInput, oldDate.toISOString().split('T')[0]);
      await user.tab();

      expect(screen.getByText('Issue date cannot be more than 10 years ago')).toBeInTheDocument();
    });

    it('should validate description length', async () => {
      const user = userEvent.setup();
      render(<CertificateForm {...defaultProps} />);

      const descriptionInput = screen.getByLabelText(/Description/);
      await user.type(descriptionInput, 'A'.repeat(501));
      await user.tab();

      expect(screen.getByText('Description must be less than 500 characters')).toBeInTheDocument();
    });

    it('should show character count for description', async () => {
      const user = userEvent.setup();
      render(<CertificateForm {...defaultProps} />);

      const descriptionInput = screen.getByLabelText(/Description/);
      await user.type(descriptionInput, 'Test description');

      expect(screen.getByText('16/500 characters')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    const validFormData = {
      recipientAddress: '0x9876543210987654321098765432109876543210',
      recipientName: 'John Doe',
      courseName: 'Web Development Bootcamp',
      institutionName: 'Tech University',
      issueDate: '2024-01-15',
      description: 'Completed advanced web development course',
    };

    const fillValidForm = async (user: any) => {
      await user.type(screen.getByLabelText(/Recipient Wallet Address/), validFormData.recipientAddress);
      await user.type(screen.getByLabelText(/Recipient Name/), validFormData.recipientName);
      await user.type(screen.getByLabelText(/Course\/Achievement Name/), validFormData.courseName);
      await user.clear(screen.getByLabelText(/Institution Name/));
      await user.type(screen.getByLabelText(/Institution Name/), validFormData.institutionName);
      await user.clear(screen.getByLabelText(/Issue Date/));
      await user.type(screen.getByLabelText(/Issue Date/), validFormData.issueDate);
      await user.type(screen.getByLabelText(/Description/), validFormData.description);
    };

    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);
      
      render(<CertificateForm {...defaultProps} />);

      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: /Issue Certificate/ }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(validFormData);
      });

      const toast = require('react-hot-toast').default;
      expect(toast.success).toHaveBeenCalledWith('Certificate issued successfully!');
    });

    it('should prevent submission when wallet not connected', async () => {
      const user = userEvent.setup();
      render(
        <CertificateForm
          {...defaultProps}
          isConnected={false}
          walletAddress={null}
        />
      );

      // Form should not be visible when not connected
      expect(screen.queryByRole('button', { name: /Issue Certificate/ })).not.toBeInTheDocument();
    });

    it('should prevent submission with invalid form data', async () => {
      const user = userEvent.setup();
      render(<CertificateForm {...defaultProps} />);

      // Submit without filling required fields
      await user.click(screen.getByRole('button', { name: /Issue Certificate/ }));

      const toast = require('react-hot-toast').default;
      expect(toast.error).toHaveBeenCalledWith('Please fix the errors in the form');
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should handle submission errors', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Network error';
      mockOnSubmit.mockRejectedValue(new Error(errorMessage));
      
      render(<CertificateForm {...defaultProps} />);

      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: /Issue Certificate/ }));

      await waitFor(() => {
        const toast = require('react-hot-toast').default;
        expect(toast.error).toHaveBeenCalledWith(errorMessage);
      });
    });

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);
      
      render(<CertificateForm {...defaultProps} />);

      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: /Issue Certificate/ }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      // Check that form fields are reset (except institution name)
      expect((screen.getByLabelText(/Recipient Wallet Address/) as HTMLInputElement).value).toBe('');
      expect((screen.getByLabelText(/Recipient Name/) as HTMLInputElement).value).toBe('');
      expect((screen.getByLabelText(/Course\/Achievement Name/) as HTMLInputElement).value).toBe('');
      expect((screen.getByLabelText(/Institution Name/) as HTMLInputElement).value).toBe(validFormData.institutionName);
      expect((screen.getByLabelText(/Description/) as HTMLTextAreaElement).value).toBe('');
    });
  });

  describe('Loading States', () => {
    it('should disable form fields when loading', () => {
      render(<CertificateForm {...defaultProps} isLoading={true} />);

      expect(screen.getByLabelText(/Recipient Wallet Address/)).toBeDisabled();
      expect(screen.getByLabelText(/Recipient Name/)).toBeDisabled();
      expect(screen.getByLabelText(/Course\/Achievement Name/)).toBeDisabled();
      expect(screen.getByLabelText(/Institution Name/)).toBeDisabled();
      expect(screen.getByLabelText(/Issue Date/)).toBeDisabled();
      expect(screen.getByLabelText(/Description/)).toBeDisabled();
    });

    it('should show loading state in submit button', () => {
      render(<CertificateForm {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByRole('button');
      expect(submitButton).toBeDisabled();
      expect(screen.getByText('Issuing Certificate...')).toBeInTheDocument();
    });

    it('should show normal state in submit button when not loading', () => {
      render(<CertificateForm {...defaultProps} isLoading={false} />);

      const submitButton = screen.getByRole('button');
      expect(submitButton).not.toBeDisabled();
      expect(screen.getByText('Issue Certificate')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should clear errors when user starts typing', async () => {
      const user = userEvent.setup();
      render(<CertificateForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Recipient Name/);
      
      // Trigger error
      await user.click(nameInput);
      await user.tab();
      expect(screen.getByText('Recipient name is required')).toBeInTheDocument();

      // Start typing to clear error
      await user.type(nameInput, 'J');
      expect(screen.queryByText('Recipient name is required')).not.toBeInTheDocument();
    });

    it('should show field-specific error styling', async () => {
      const user = userEvent.setup();
      render(<CertificateForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Recipient Name/);
      await user.click(nameInput);
      await user.tab();

      expect(nameInput).toHaveClass('border-red-300', 'focus:ring-red-500', 'focus:border-red-500');
    });

    it('should show normal styling for valid fields', () => {
      render(<CertificateForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Recipient Name/);
      expect(nameInput).toHaveClass('border-gray-300', 'focus:ring-blue-500', 'focus:border-blue-500');
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all form fields', () => {
      render(<CertificateForm {...defaultProps} />);

      expect(screen.getByLabelText(/Recipient Wallet Address/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Recipient Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Course\/Achievement Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Institution Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Issue Date/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
    });

    it('should have proper form structure', () => {
      render(<CertificateForm {...defaultProps} />);

      expect(screen.getByRole('form')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Issue Certificate/ })).toBeInTheDocument();
    });

    it('should associate error messages with form fields', async () => {
      const user = userEvent.setup();
      render(<CertificateForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Recipient Name/);
      await user.click(nameInput);
      await user.tab();

      const errorMessage = screen.getByText('Recipient name is required');
      expect(errorMessage).toHaveAttribute('class', expect.stringContaining('text-red-600'));
    });
  });
});