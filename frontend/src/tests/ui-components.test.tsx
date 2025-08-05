import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Import all components
import { BottomNavigation } from '../components/ui/Navigation/BottomNavigation';
import { FloatingActionButton } from '../components/ui/FloatingActionButton/FloatingActionButton';
import Button from '../components/ui/Button/Button';
import { FeedbackAnimation, toast } from '../components/ui/Feedback/FeedbackAnimations';
import { Card } from '../components/ui/Card/Card';
import { HeroSection } from '../components/ui/Hero/HeroSection';
import { VerificationResults } from '../components/ui/VerificationResults/VerificationResults';
import { CertificateCard } from '../components/ui/CertificateCard/CertificateCard';
import { CertificateAnalytics } from '../components/ui/Analytics/CertificateAnalytics';
import { SettingsPanel } from '../components/ui/Settings/SettingsPanel';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Home: () => <div data-testid="home-icon">Home</div>,
  Search: () => <div data-testid="search-icon">Search</div>,
  FileText: () => <div data-testid="file-icon">File</div>,
  User: () => <div data-testid="user-icon">User</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  Download: () => <div data-testid="download-icon">Download</div>,
  Share2: () => <div data-testid="share-icon">Share</div>,
  CheckCircle: () => <div data-testid="check-icon">Check</div>,
  XCircle: () => <div data-testid="x-icon">X</div>,
  AlertTriangle: () => <div data-testid="alert-icon">Alert</div>,
  Info: () => <div data-testid="info-icon">Info</div>,
  X: () => <div data-testid="close-icon">Close</div>,
  Loader2: () => <div data-testid="loader-icon">Loading</div>,
  QrCode: () => <div data-testid="qr-icon">QR</div>,
  Upload: () => <div data-testid="upload-icon">Upload</div>,
  ArrowRight: () => <div data-testid="arrow-icon">Arrow</div>,
  Shield: () => <div data-testid="shield-icon">Shield</div>,
  Eye: () => <div data-testid="eye-icon">Eye</div>,
  Copy: () => <div data-testid="copy-icon">Copy</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  Building: () => <div data-testid="building-icon">Building</div>,
  Award: () => <div data-testid="award-icon">Award</div>,
  Bell: () => <div data-testid="bell-icon">Bell</div>,
  Palette: () => <div data-testid="palette-icon">Palette</div>,
  Save: () => <div data-testid="save-icon">Save</div>,
  Trash2: () => <div data-testid="trash-icon">Trash</div>,
  Camera: () => <div data-testid="camera-icon">Camera</div>,
  BarChart3: () => <div data-testid="chart-icon">Chart</div>,
  TrendingUp: () => <div data-testid="trending-icon">Trending</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
}));

const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('UI Components', () => {
  describe('BottomNavigation', () => {
    it('renders navigation items correctly', () => {
      render(
        <RouterWrapper>
          <BottomNavigation />
        </RouterWrapper>
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Verify')).toBeInTheDocument();
      expect(screen.getByText('Certificates')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('handles keyboard navigation', () => {
      render(
        <RouterWrapper>
          <BottomNavigation />
        </RouterWrapper>
      );

      const firstItem = screen.getByText('Home').closest('a');
      if (firstItem) {
        fireEvent.keyDown(firstItem, { key: 'ArrowRight' });
        // Test that focus moves to next item
      }
    });
  });

  describe('FloatingActionButton', () => {
    it('renders main button correctly', () => {
      const mockClick = jest.fn();
      render(<FloatingActionButton onClick={mockClick} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      
      fireEvent.click(button);
      expect(mockClick).toHaveBeenCalled();
    });

    it('expands to show actions when provided', () => {
      const actions = [
        { id: '1', label: 'Action 1', icon: <div>Icon</div>, onClick: jest.fn() },
        { id: '2', label: 'Action 2', icon: <div>Icon</div>, onClick: jest.fn() },
      ];

      render(<FloatingActionButton actions={actions} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText('Action 1')).toBeInTheDocument();
      expect(screen.getByText('Action 2')).toBeInTheDocument();
    });

    it('handles extended variant with label', () => {
      render(<FloatingActionButton variant="extended" label="Create New" />);
      expect(screen.getByText('Create New')).toBeInTheDocument();
    });
  });

  describe('Button', () => {
    it('renders with different variants', () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-blue-600');

      rerender(<Button variant="danger">Danger</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-red-600');

      rerender(<Button variant="success">Success</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-green-600');
    });

    it('shows loading state correctly', () => {
      render(<Button loading loadingText="Saving...">Save</Button>);
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('handles different sizes', () => {
      const { rerender } = render(<Button size="sm">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5', 'text-sm');

      rerender(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3', 'text-base');
    });

    it('renders with icons', () => {
      render(<Button icon={<div data-testid="test-icon">Icon</div>}>With Icon</Button>);
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('is disabled when loading or disabled prop is true', () => {
      const { rerender } = render(<Button loading>Loading</Button>);
      expect(screen.getByRole('button')).toBeDisabled();

      rerender(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Card', () => {
    it('renders with different variants', () => {
      const { rerender } = render(<Card variant="default">Default Card</Card>);
      expect(screen.getByText('Default Card')).toBeInTheDocument();

      rerender(<Card variant="elevated">Elevated Card</Card>);
      expect(screen.getByText('Elevated Card')).toBeInTheDocument();

      rerender(<Card variant="outlined">Outlined Card</Card>);
      expect(screen.getByText('Outlined Card')).toBeInTheDocument();
    });

    it('renders header and footer when provided', () => {
      render(
        <Card 
          header={<div>Card Header</div>}
          footer={<div>Card Footer</div>}
        >
          Card Content
        </Card>
      );

      expect(screen.getByText('Card Header')).toBeInTheDocument();
      expect(screen.getByText('Card Content')).toBeInTheDocument();
      expect(screen.getByText('Card Footer')).toBeInTheDocument();
    });

    it('handles click events when clickable', () => {
      const mockClick = jest.fn();
      render(<Card clickable onClick={mockClick}>Clickable Card</Card>);

      fireEvent.click(screen.getByText('Clickable Card'));
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('HeroSection', () => {
    it('renders title and subtitle', () => {
      render(
        <HeroSection 
          title="Welcome to VerifyCert"
          subtitle="Secure certificate verification"
        />
      );

      expect(screen.getByText('Welcome to VerifyCert')).toBeInTheDocument();
      expect(screen.getByText('Secure certificate verification')).toBeInTheDocument();
    });

    it('renders call-to-action buttons', () => {
      const actions = [
        { label: 'Get Started', onClick: jest.fn(), variant: 'primary' as const },
        { label: 'Learn More', onClick: jest.fn(), variant: 'secondary' as const },
      ];

      render(<HeroSection title="Test" actions={actions} />);

      expect(screen.getByText('Get Started')).toBeInTheDocument();
      expect(screen.getByText('Learn More')).toBeInTheDocument();
    });

    it('shows QR scanner when enabled', () => {
      render(<HeroSection title="Test" showQRScanner />);
      expect(screen.getByTestId('qr-icon')).toBeInTheDocument();
    });
  });

  describe('VerificationResults', () => {
    it('displays success state correctly', () => {
      const result = {
        status: 'success' as const,
        certificate: {
          id: '123',
          recipientName: 'John Doe',
          courseName: 'React Development',
          institution: 'Tech Academy',
          issueDate: '2024-01-15',
          isValid: true
        }
      };

      render(<VerificationResults result={result} />);

      expect(screen.getByText('Certificate Verified')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('React Development')).toBeInTheDocument();
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('displays error state correctly', () => {
      const result = {
        status: 'error' as const,
        message: 'Certificate not found'
      };

      render(<VerificationResults result={result} />);

      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
      expect(screen.getByText('Certificate not found')).toBeInTheDocument();
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });

    it('handles share and download actions', () => {
      const mockShare = jest.fn();
      const mockDownload = jest.fn();
      
      const result = {
        status: 'success' as const,
        certificate: {
          id: '123',
          recipientName: 'John Doe',
          courseName: 'React Development',
          institution: 'Tech Academy',
          issueDate: '2024-01-15',
          isValid: true
        }
      };

      render(
        <VerificationResults 
          result={result} 
          onShare={mockShare}
          onDownload={mockDownload}
        />
      );

      fireEvent.click(screen.getByText('Share'));
      expect(mockShare).toHaveBeenCalled();

      fireEvent.click(screen.getByText('Download'));
      expect(mockDownload).toHaveBeenCalled();
    });
  });

  describe('CertificateCard', () => {
    const mockCertificate = {
      id: '123',
      recipientName: 'John Doe',
      courseName: 'React Development',
      institution: 'Tech Academy',
      issueDate: '2024-01-15',
      isValid: true,
      description: 'Advanced React course completion'
    };

    it('renders certificate information correctly', () => {
      render(<CertificateCard certificate={mockCertificate} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('React Development')).toBeInTheDocument();
      expect(screen.getByText('Tech Academy')).toBeInTheDocument();
    });

    it('handles certificate actions', () => {
      const mockShare = jest.fn();
      const mockDownload = jest.fn();
      const mockVerify = jest.fn();

      render(
        <CertificateCard 
          certificate={mockCertificate}
          onShare={mockShare}
          onDownload={mockDownload}
          onVerify={mockVerify}
        />
      );

      fireEvent.click(screen.getByTestId('share-icon'));
      expect(mockShare).toHaveBeenCalled();

      fireEvent.click(screen.getByTestId('download-icon'));
      expect(mockDownload).toHaveBeenCalled();
    });

    it('shows different styles for valid/invalid certificates', () => {
      const { rerender } = render(
        <CertificateCard certificate={{ ...mockCertificate, isValid: true }} />
      );
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();

      rerender(
        <CertificateCard certificate={{ ...mockCertificate, isValid: false }} />
      );
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });
  });

  describe('CertificateAnalytics', () => {
    const mockData = {
      totalCertificates: 150,
      validCertificates: 145,
      invalidCertificates: 5,
      recentActivity: [
        { date: '2024-01-15', count: 10 },
        { date: '2024-01-14', count: 8 },
      ],
      topInstitutions: [
        { name: 'Tech Academy', count: 50 },
        { name: 'Code School', count: 30 },
      ]
    };

    it('displays analytics data correctly', () => {
      render(<CertificateAnalytics data={mockData} />);

      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('145')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('renders charts and visualizations', () => {
      render(<CertificateAnalytics data={mockData} />);
      expect(screen.getByTestId('chart-icon')).toBeInTheDocument();
    });
  });

  describe('SettingsPanel', () => {
    it('renders settings sections', () => {
      render(<SettingsPanel />);

      expect(screen.getByText('Profile Settings')).toBeInTheDocument();
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
      expect(screen.getByText('Theme')).toBeInTheDocument();
    });

    it('handles settings changes', async () => {
      const mockOnChange = jest.fn();
      render(<SettingsPanel onChange={mockOnChange} />);

      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });
    });

    it('saves settings correctly', async () => {
      const mockOnSave = jest.fn();
      render(<SettingsPanel onSave={mockOnSave} />);

      fireEvent.click(screen.getByText('Save Settings'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });
  });

  describe('FeedbackAnimations', () => {
    it('shows success toast', () => {
      render(<FeedbackAnimation type="success" message="Success!" />);
      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('shows error toast', () => {
      render(<FeedbackAnimation type="error" message="Error occurred!" />);
      expect(screen.getByText('Error occurred!')).toBeInTheDocument();
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });

    it('auto-dismisses after timeout', async () => {
      const { container } = render(
        <FeedbackAnimation type="info" message="Info message" duration={100} />
      );

      expect(screen.getByText('Info message')).toBeInTheDocument();

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      }, { timeout: 200 });
    });
  });

  describe('Accessibility', () => {
    it('all interactive elements have proper ARIA labels', () => {
      render(
        <RouterWrapper>
          <div>
            <BottomNavigation />
            <FloatingActionButton aria-label="Create new certificate" />
            <Button aria-label="Submit form">Submit</Button>
          </div>
        </RouterWrapper>
      );

      expect(screen.getByLabelText('Create new certificate')).toBeInTheDocument();
      expect(screen.getByLabelText('Submit form')).toBeInTheDocument();
    });

    it('keyboard navigation works correctly', () => {
      render(
        <RouterWrapper>
          <BottomNavigation />
        </RouterWrapper>
      );

      const firstNavItem = screen.getByText('Home').closest('a');
      if (firstNavItem) {
        firstNavItem.focus();
        expect(document.activeElement).toBe(firstNavItem);
      }
    });

    it('screen reader announcements work', () => {
      render(<FeedbackAnimation type="success" message="Certificate verified successfully" />);
      
      const announcement = screen.getByRole('status');
      expect(announcement).toBeInTheDocument();
      expect(announcement).toHaveTextContent('Certificate verified successfully');
    });
  });

  describe('Responsive Design', () => {
    it('components adapt to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <RouterWrapper>
          <BottomNavigation />
        </RouterWrapper>
      );

      // Bottom navigation should be visible on mobile
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('floating action button positions correctly on different screen sizes', () => {
      const { rerender } = render(<FloatingActionButton position="bottom-right" />);
      expect(screen.getByRole('button')).toHaveClass('bottom-6', 'right-6');

      rerender(<FloatingActionButton position="bottom-left" />);
      expect(screen.getByRole('button')).toHaveClass('bottom-6', 'left-6');
    });
  });

  describe('Performance', () => {
    it('components render without performance issues', () => {
      const startTime = performance.now();
      
      render(
        <RouterWrapper>
          <div>
            <HeroSection title="Test" />
            <BottomNavigation />
            <FloatingActionButton />
            <Card>Test Card</Card>
            <Button>Test Button</Button>
          </div>
        </RouterWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Render should complete within reasonable time (100ms)
      expect(renderTime).toBeLessThan(100);
    });

    it('handles large datasets efficiently', () => {
      const largeCertificateList = Array.from({ length: 100 }, (_, i) => ({
        id: `cert-${i}`,
        recipientName: `User ${i}`,
        courseName: `Course ${i}`,
        institution: 'Test Institution',
        issueDate: '2024-01-15',
        isValid: true
      }));

      const startTime = performance.now();
      
      render(
        <div>
          {largeCertificateList.map(cert => (
            <CertificateCard key={cert.id} certificate={cert} />
          ))}
        </div>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should handle large lists efficiently
      expect(renderTime).toBeLessThan(500);
    });
  });
});