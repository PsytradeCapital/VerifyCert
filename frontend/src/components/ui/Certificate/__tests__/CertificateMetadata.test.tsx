import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CertificateMetadata, { CertificateMetadata as MetadataType } from '../CertificateMetadata';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

const mockMetadata: MetadataType = {
  tokenId: '12345',
  issuer: '0x1234567890123456789012345678901234567890',
  recipient: '0x0987654321098765432109876543210987654321',
  recipientName: 'John Smith',
  courseName: 'Advanced React Development',
  institutionName: 'Tech University',
  issueDate: 1640995200, // Jan 1, 2022
  certificateType: 'Course Completion',
  grade: 'A+',
  credits: 3,
  duration: '12 weeks',
  description: 'This comprehensive course covers advanced React concepts.',
  instructorName: 'Dr. Sarah Johnson',
  location: 'Online',
  completionDate: 1641081600, // Jan 2, 2022
  blockNumber: 12345678,
  transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  networkName: 'Polygon Mumbai',
  skills: ['React Hooks', 'State Management', 'Performance Optimization'],
  learningOutcomes: ['Build complex React applications', 'Implement advanced state management'],
  prerequisites: ['Basic JavaScript', 'HTML/CSS'],
  assessmentMethods: ['Project Portfolio', 'Code Review']
};

const minimalMetadata: MetadataType = {
  tokenId: '67890',
  issuer: '0x1111111111111111111111111111111111111111',
  recipient: '0x2222222222222222222222222222222222222222',
  recipientName: 'Jane Doe',
  courseName: 'Introduction to Web Development',
  institutionName: 'Code Academy',
  issueDate: 1640995200,
};

describe('CertificateMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Default variant', () => {
    it('renders all metadata sections correctly', () => {
      render(<CertificateMetadata metadata={mockMetadata} />);

      expect(screen.getByText('Certificate Details')).toBeInTheDocument();
      expect(screen.getByText('Course Details')).toBeInTheDocument();
      expect(screen.getByText('Learning Information')).toBeInTheDocument();
      expect(screen.getByText('Blockchain Verification')).toBeInTheDocument();
    });

    it('displays core certificate information', () => {
      render(<CertificateMetadata metadata={mockMetadata} />);

      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('Advanced React Development')).toBeInTheDocument();
      expect(screen.getByText('Tech University')).toBeInTheDocument();
      expect(screen.getByText('January 1, 2022')).toBeInTheDocument();
      expect(screen.getByText('Course Completion')).toBeInTheDocument();
      expect(screen.getByText('A+')).toBeInTheDocument();
    });

    it('displays extended course information', () => {
      render(<CertificateMetadata metadata={mockMetadata} />);

      expect(screen.getByText('3 Credits')).toBeInTheDocument();
      expect(screen.getByText('12 weeks')).toBeInTheDocument();
      expect(screen.getByText('Dr. Sarah Johnson')).toBeInTheDocument();
      expect(screen.getByText('Online')).toBeInTheDocument();
    });

    it('displays blockchain information', () => {
      render(<CertificateMetadata metadata={mockMetadata} />);

      expect(screen.getByText('12345')).toBeInTheDocument();
      expect(screen.getByText('0x1234...7890')).toBeInTheDocument();
      expect(screen.getByText('0x0987...4321')).toBeInTheDocument();
      expect(screen.getByText('Polygon Mumbai')).toBeInTheDocument();
      expect(screen.getByText('12345678')).toBeInTheDocument();
    });

    it('displays skills and learning outcomes as tags', () => {
      render(<CertificateMetadata metadata={mockMetadata} />);

      expect(screen.getByText('React Hooks')).toBeInTheDocument();
      expect(screen.getByText('State Management')).toBeInTheDocument();
      expect(screen.getByText('Performance Optimization')).toBeInTheDocument();
      expect(screen.getByText('Build complex React applications')).toBeInTheDocument();
    });

    it('displays description in prose format', () => {
      render(<CertificateMetadata metadata={mockMetadata} />);

      expect(screen.getByText('This comprehensive course covers advanced React concepts.')).toBeInTheDocument();
    });
  });

  describe('Compact variant', () => {
    it('renders only essential information in grid layout', () => {
      render(<CertificateMetadata metadata={mockMetadata} variant="compact" />);

      expect(screen.getByText('January 1, 2022')).toBeInTheDocument();
      expect(screen.getByText('Tech University')).toBeInTheDocument();
      expect(screen.getByText('12345')).toBeInTheDocument();
      expect(screen.getByText('A+')).toBeInTheDocument();

      // Should not show extended sections
      expect(screen.queryByText('Course Details')).not.toBeInTheDocument();
      expect(screen.queryByText('Learning Information')).not.toBeInTheDocument();
    });
  });

  describe('Collapsible functionality', () => {
    it('renders collapsed by default when collapsible is true', () => {
      render(<CertificateMetadata metadata={mockMetadata} collapsible={true} />);

      expect(screen.getByText('Certificate Information')).toBeInTheDocument();
      expect(screen.queryByText('Certificate Details')).not.toBeInTheDocument();
    });

    it('expands when clicked', async () => {
      render(<CertificateMetadata metadata={mockMetadata} collapsible={true} />);

      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText('Certificate Details')).toBeInTheDocument();
      });
    });

    it('collapses when clicked again', async () => {
      render(<CertificateMetadata metadata={mockMetadata} collapsible={true} />);

      const toggleButton = screen.getByRole('button');
      
      // Expand
      fireEvent.click(toggleButton);
      await waitFor(() => {
        expect(screen.getByText('Certificate Details')).toBeInTheDocument();
      });

      // Collapse
      fireEvent.click(toggleButton);
      await waitFor(() => {
        expect(screen.queryByText('Certificate Details')).not.toBeInTheDocument();
      });
    });
  });

  describe('Copy functionality', () => {
    it('copies certificate ID to clipboard when copy button is clicked', async () => {
      render(<CertificateMetadata metadata={mockMetadata} />);

      const copyButtons = screen.getAllByTitle(/Copy/);
      const certIdCopyButton = copyButtons.find(button => 
        button.closest('div')?.textContent?.includes('12345')
      );

      expect(certIdCopyButton).toBeInTheDocument();
      
      if (certIdCopyButton) {
        fireEvent.click(certIdCopyButton);
        
        await waitFor(() => {
          expect(navigator.clipboard.writeText).toHaveBeenCalledWith('12345');
        });
    });

    it('shows success indicator after copying', async () => {
      render(<CertificateMetadata metadata={mockMetadata} />);

      const copyButtons = screen.getAllByTitle(/Copy/);
      const certIdCopyButton = copyButtons[0];
      
      fireEvent.click(certIdCopyButton);

      await waitFor(() => {
        expect(screen.getByText('✓')).toBeInTheDocument();
      });
    });
  });

  describe('Conditional rendering', () => {
    it('hides blockchain info when showBlockchainInfo is false', () => {
      render(<CertificateMetadata metadata={mockMetadata} showBlockchainInfo={false} />);

      expect(screen.queryByText('Blockchain Verification')).not.toBeInTheDocument();
      expect(screen.queryByText('Certificate ID')).not.toBeInTheDocument();
    });

    it('hides extended info when showExtendedInfo is false', () => {
      render(<CertificateMetadata metadata={mockMetadata} showExtendedInfo={false} />);

      expect(screen.queryByText('Course Details')).not.toBeInTheDocument();
      expect(screen.queryByText('Learning Information')).not.toBeInTheDocument();
      expect(screen.queryByText('Description')).not.toBeInTheDocument();
    });

    it('handles minimal metadata gracefully', () => {
      render(<CertificateMetadata metadata={minimalMetadata} />);

      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('Introduction to Web Development')).toBeInTheDocument();
      expect(screen.getByText('Code Academy')).toBeInTheDocument();

      // Should not show sections that don't have data
      expect(screen.queryByText('Course Details')).not.toBeInTheDocument();
      expect(screen.queryByText('Learning Information')).not.toBeInTheDocument();
    });
  });

  describe('External links', () => {
    it('renders transaction hash as external link when present', () => {
      render(<CertificateMetadata metadata={mockMetadata} />);

      const transactionLink = screen.getByRole('link');
      expect(transactionLink).toHaveAttribute('href', 'https://mumbai.polygonscan.com/tx/0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890');
      expect(transactionLink).toHaveAttribute('target', '_blank');
      expect(transactionLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<CertificateMetadata metadata={mockMetadata} collapsible={true} />);

      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(<CertificateMetadata metadata={mockMetadata} />);

      const copyButtons = screen.getAllByTitle(/Copy/);
      copyButtons.forEach(button => {
        expect(button).toBeInTheDocument();
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });

  describe('Date formatting', () => {
    it('formats dates correctly', () => {
      render(<CertificateMetadata metadata={mockMetadata} />);

      expect(screen.getByText('January 1, 2022')).toBeInTheDocument();
      expect(screen.getByText('January 2, 2022')).toBeInTheDocument();
    });
  });

  describe('Address formatting', () => {
    it('formats blockchain addresses correctly', () => {
      render(<CertificateMetadata metadata={mockMetadata} />);

      expect(screen.getByText('0x1234...7890')).toBeInTheDocument();
      expect(screen.getByText('0x0987...4321')).toBeInTheDocument();
      expect(screen.getByText('0xabcd...7890')).toBeInTheDocument();
    });
  });
});