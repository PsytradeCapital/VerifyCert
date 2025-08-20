import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CertificateList from '../CertificateList';
import { Certificate } from '../../../CertificateCard';
import { FeedbackProvider } from '../../Feedback';

// Mock certificate data
const mockCertificates: Certificate[] = [
  {
    tokenId: '1',
    issuer: '0x1234567890123456789012345678901234567890',
    recipient: '0x0987654321098765432109876543210987654321',
    recipientName: 'John Doe',
    courseName: 'Advanced React Development',
    institutionName: 'Tech University',
    issueDate: Math.floor(Date.now() / 1000) - 86400 * 7, // 1 week ago
    isValid: true,
    qrCodeURL: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=verify/1',
    verificationURL: 'https://verifycert.com/verify/1',
  },
  {
    tokenId: '2',
    issuer: '0x1234567890123456789012345678901234567890',
    recipient: '0x1111111111111111111111111111111111111111',
    recipientName: 'Jane Smith',
    courseName: 'Data Science Fundamentals',
    institutionName: 'Data Institute',
    issueDate: Math.floor(Date.now() / 1000) - 86400 * 14, // 2 weeks ago
    isValid: true,
    qrCodeURL: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=verify/2',
    verificationURL: 'https://verifycert.com/verify/2',
  },
  {
    tokenId: '3',
    issuer: '0x2222222222222222222222222222222222222222',
    recipient: '0x3333333333333333333333333333333333333333',
    recipientName: 'Bob Johnson',
    courseName: 'Machine Learning Basics',
    institutionName: 'AI Academy',
    issueDate: Math.floor(Date.now() / 1000) - 86400 * 30, // 1 month ago
    isValid: false,
    qrCodeURL: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=verify/3',
    verificationURL: 'https://verifycert.com/verify/3',
  },
];

describe('CertificateList', () => {
  const mockOnCertificateAction = jest.fn();

  beforeEach(() => {
    mockOnCertificateAction.mockClear();
  });

  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<FeedbackProvider>{ui}</FeedbackProvider>);
  };

  it('renders certificate list correctly', () => {
    renderWithProvider(
      <CertificateList
        certificates={mockCertificates}
        onCertificateAction={mockOnCertificateAction}
      />
    );

    expect(screen.getByText('Certificates')).toBeInTheDocument();
    expect(screen.getByText('3 of 3 certificates')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('shows loading state correctly', () => {
    renderWithProvider(<CertificateList certificates={[]} isLoading={true} />);

    expect(screen.getByText('Certificates')).toBeInTheDocument();
    // Loading skeleton should be present
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows empty state when no certificates', () => {
    renderWithProvider(<CertificateList certificates={[]} />);

    expect(screen.getByText('No certificates found')).toBeInTheDocument();
    expect(screen.getByText('Certificates will appear here once they are issued.')).toBeInTheDocument();
  });

  it('filters certificates by search term', async () => {
    renderWithProvider(
      <CertificateList
        certificates={mockCertificates}
        onCertificateAction={mockOnCertificateAction}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search by recipient/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });

    await waitFor(() => {
      expect(screen.getByText(/1 of 3 certificates/)).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  it('filters certificates by status', async () => {
    renderWithProvider(
      <CertificateList
        certificates={mockCertificates}
        onCertificateAction={mockOnCertificateAction}
      />
    );

    // Open advanced filters
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);

    // Change status filter to invalid only
    const statusSelect = screen.getByDisplayValue('All Certificates');
    fireEvent.change(statusSelect, { target: { value: 'invalid' } });

    await waitFor(() => {
      expect(screen.getByText('1 of 3 certificates')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  it('sorts certificates correctly', async () => {
    renderWithProvider(
      <CertificateList
        certificates={mockCertificates}
        onCertificateAction={mockOnCertificateAction}
      />
    );

    // Open advanced filters
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);

    // Change sort to name
    const sortSelect = screen.getByDisplayValue('Date');
    fireEvent.change(sortSelect, { target: { value: 'name' } });

    await waitFor(() => {
      const certificateElements = screen.getAllByText(/John Doe|Jane Smith|Bob Johnson/);
      expect(certificateElements[0]).toHaveTextContent('Bob Johnson');
      expect(certificateElements[1]).toHaveTextContent('Jane Smith');
      expect(certificateElements[2]).toHaveTextContent('John Doe');
    });
  });

  it('toggles view mode between list and grid', async () => {
    renderWithProvider(
      <CertificateList
        certificates={mockCertificates}
        onCertificateAction={mockOnCertificateAction}
      />
    );

    // Should start in list view
    expect(document.querySelector('.space-y-4')).toBeInTheDocument();

    // Switch to grid view
    const gridButton = screen.getAllByRole('button')[1]; // Second button is grid view
    fireEvent.click(gridButton);

    await waitFor(() => {
      expect(document.querySelector('.grid')).toBeInTheDocument();
    });
  });

  it('handles bulk selection when enabled', async () => {
    renderWithProvider(
      <CertificateList
        certificates={mockCertificates}
        showBulkActions={true}
        onCertificateAction={mockOnCertificateAction}
      />
    );

    // Select all checkbox should be present
    const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i });
    expect(selectAllCheckbox).toBeInTheDocument();

    // Click select all
    fireEvent.click(selectAllCheckbox);

    await waitFor(() => {
      expect(screen.getByText('3 certificates selected')).toBeInTheDocument();
    });
  });

  it('calls onCertificateAction when action buttons are clicked', async () => {
    renderWithProvider(
      <CertificateList
        certificates={mockCertificates}
        onCertificateAction={mockOnCertificateAction}
      />
    );

    // Click view button for first certificate
    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);

    expect(mockOnCertificateAction).toHaveBeenCalledWith('view', mockCertificates[0]);
  });

  it('resets filters when reset button is clicked', async () => {
    renderWithProvider(
      <CertificateList
        certificates={mockCertificates}
        onCertificateAction={mockOnCertificateAction}
      />
    );

    // Open advanced filters
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);

    // Apply a filter
    const searchInput = screen.getByPlaceholderText(/search by recipient/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });

    // Reset filters
    const resetButton = screen.getByText('Reset Filters');
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText('3 of 3 certificates')).toBeInTheDocument();
      expect(searchInput).toHaveValue('');
    });
  });

  it('filters by institution correctly', async () => {
    renderWithProvider(
      <CertificateList
        certificates={mockCertificates}
        onCertificateAction={mockOnCertificateAction}
      />
    );

    // Open advanced filters
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);

    // Filter by institution
    const institutionSelect = screen.getByDisplayValue('All Institutions');
    fireEvent.change(institutionSelect, { target: { value: 'Tech University' } });

    await waitFor(() => {
      expect(screen.getByText('1 of 3 certificates')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  it('shows no results message when filters return empty', async () => {
    renderWithProvider(
      <CertificateList
        certificates={mockCertificates}
        onCertificateAction={mockOnCertificateAction}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search by recipient/i);
    fireEvent.change(searchInput, { target: { value: 'NonexistentName' } });

    await waitFor(() => {
      expect(screen.getByText('No certificates match your filters')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search terms or filters.')).toBeInTheDocument();
    });
  });

  it('handles date range filtering', async () => {
    renderWithProvider(
      <CertificateList
        certificates={mockCertificates}
        onCertificateAction={mockOnCertificateAction}
      />
    );

    // Open advanced filters
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);

    // Filter by last week
    const dateRangeSelect = screen.getByDisplayValue('All Time');
    fireEvent.change(dateRangeSelect, { target: { value: 'week' } });

    await waitFor(() => {
      expect(screen.getByText(/1 of 3 certificates/)).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});