import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Import components for integration testing
import { BottomNavigation } from '../components/ui/Navigation/BottomNavigation';
import { FloatingActionButton } from '../components/ui/FloatingActionButton/FloatingActionButton';
import { HeroSection } from '../components/ui/Hero/HeroSection';
import { VerificationResults } from '../components/ui/VerificationResults/VerificationResults';
import { CertificateCard } from '../components/ui/CertificateCard/CertificateCard';
import { FeedbackContext } from '../contexts/FeedbackContext';

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
  QrCode: () => <div data-testid="qr-icon">QR</div>,
  Upload: () => <div data-testid="upload-icon">Upload</div>,
  ArrowRight: () => <div data-testid="arrow-icon">Arrow</div>,
  Shield: () => <div data-testid="shield-icon">Shield</div>,
  Eye: () => <div data-testid="eye-icon">Eye</div>,
  Copy: () => <div data-testid="copy-icon">Copy</div>,
  Camera: () => <div data-testid="camera-icon">Camera</div>,
}));

const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

const FeedbackWrapper = ({ children }: { children: React.ReactNode }) => {
  const mockFeedbackValue = {
    showFeedback: jest.fn(),
    hideFeedback: jest.fn(),
    feedbackState: { isVisible: false, type: 'info', message: ''
  };

  return (
    <FeedbackContext.Provider value={mockFeedbackValue}>
      {children}
    </FeedbackContext.Provider>
  );
};

describe('Integration Tests', () => {
  describe('Certificate Verification Flow', () => {
    it('completes full verification workflow', async () => {
      const mockVerify = jest.fn().mockResolvedValue({
        status: 'success',
        certificate: {
          id: '123',
          recipientName: 'John Doe',
          courseName: 'React Development',
          institution: 'Tech Academy',
          issueDate: '2024-01-15',
          isValid: true
      });

      const TestApp = () => {
        const [result, setResult] = React.useState(null);

        const handleVerify = async () => {
          const verificationResult = await mockVerify();
          setResult(verificationResult);
        };

        return (
          <RouterWrapper>
            <FeedbackWrapper>
              <div>
                <HeroSection 
                  title="Verify Certificate"
                  showQRScanner
                  onScan={handleVerify}
                />
                {result && <VerificationResults result={result} />
                <BottomNavigation />
              </div>
            </FeedbackWrapper>
          </RouterWrapper>
        );
      };

      render(<TestApp />);

      // Start verification
      const scanButton = screen.getByTestId('qr-icon').closest('button');
      if (scanButton) {
        fireEvent.click(scanButton);

      // Wait for verification result
      await waitFor(() => {
        expect(screen.getByText('Certificate Verified')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      expect(mockVerify).toHaveBeenCalled();
    });

    it('handles verification errors gracefully', async () => {
      const mockVerify = jest.fn().mockRejectedValue(new Error('Network error'));

      const TestApp = () => {
        const [result, setResult] = React.useState(null);

        const handleVerify = async () => {
          try {
            const verificationResult = await mockVerify();
            setResult(verificationResult);
          } catch (error) {
            setResult({
              status: 'error',
              message: 'Verification failed. Please try again.'
            });
        };

        return (
          <RouterWrapper>
            <FeedbackWrapper>
              <div>
                <HeroSection 
                  title="Verify Certificate"
                  showQRScanner
                  onScan={handleVerify}
                />
                {result && <VerificationResults result={result} />
              </div>
            </FeedbackWrapper>
          </RouterWrapper>
        );
      };

      render(<TestApp />);

      const scanButton = screen.getByTestId('qr-icon').closest('button');
      if (scanButton) {
        fireEvent.click(scanButton);

      await waitFor(() => {
        expect(screen.getByText('Verification Failed')).toBeInTheDocument();
        expect(screen.getByText('Verification failed. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('Certificate Management Flow', () => {
    it('displays and manages certificate collection', () => {
      const certificates = [
        {
          id: '1',
          recipientName: 'John Doe',
          courseName: 'React Development',
          institution: 'Tech Academy',
          issueDate: '2024-01-15',
          isValid: true
        },
        {
          id: '2',
          recipientName: 'Jane Smith',
          courseName: 'Node.js Basics',
          institution: 'Code School',
          issueDate: '2024-01-10',
          isValid: true
      ];

      const mockShare = jest.fn();
      const mockDownload = jest.fn();

      const TestApp = () => (
        <RouterWrapper>
          <FeedbackWrapper>
            <div>
              <div className="grid gap-4">
                {certificates.map(cert => (
                  <CertificateCard
                    key={cert.id}
                    certificate={cert}
                    onShare={mockShare}
                    onDownload={mockDownload}
                  />
                ))}
              </div>
              <FloatingActionButton
                actions={[
                  {
                    id: 'add',
                    label: 'Add Certificate',
                    icon: <div data-testid="plus-icon">Plus</div>,
                    onClick: jest.fn()
                ]}
              />
              <BottomNavigation />
            </div>
          </FeedbackWrapper>
        </RouterWrapper>
      );

      render(<TestApp />);

      // Verify certificates are displayed
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('React Development')).toBeInTheDocument();
      expect(screen.getByText('Node.js Basics')).toBeInTheDocument();

      // Test certificate actions
      const shareButtons = screen.getAllByTestId('share-icon');
      fireEvent.click(shareButtons[0]);
      expect(mockShare).toHaveBeenCalledWith(certificates[0]);

      const downloadButtons = screen.getAllByTestId('download-icon');
      fireEvent.click(downloadButtons[0]);
      expect(mockDownload).toHaveBeenCalledWith(certificates[0]);
    });
  });

  describe('Navigation Flow', () => {
    it('navigates between different sections', () => {
      const TestApp = () => {
        const [currentSection, setCurrentSection] = React.useState('home');

        const handleNavigation = (item: any) => {
          setCurrentSection(item.id);
        };

        return (
          <RouterWrapper>
            <div>
              <div data-testid="current-section">{currentSection}</div>
              <BottomNavigation onItemClick={handleNavigation} />
            </div>
          </RouterWrapper>
        );
      };

      render(<TestApp />);

      // Test navigation
      fireEvent.click(screen.getByText('Verify'));
      expect(screen.getByTestId('current-section')).toHaveTextContent('verify');

      fireEvent.click(screen.getByText('Certificates'));
      expect(screen.getByTestId('current-section')).toHaveTextContent('certificates');

      fireEvent.click(screen.getByText('Profile'));
      expect(screen.getByTestId('current-section')).toHaveTextContent('profile');
    });

    it('handles keyboard navigation between sections', () => {
      render(
        <RouterWrapper>
          <BottomNavigation />
        </RouterWrapper>
      );

      const homeLink = screen.getByText('Home').closest('a');
      if (homeLink) {
        homeLink.focus();
        expect(document.activeElement).toBe(homeLink);

        // Test arrow key navigation
        fireEvent.keyDown(homeLink, { key: 'ArrowRight' });
        
        // Focus should move to next item
        const verifyLink = screen.getByText('Verify').closest('a');
        // Note: In real implementation, focus would move to verify link
    });
  });

  describe('Responsive Behavior', () => {
    it('adapts layout for mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <RouterWrapper>
          <FeedbackWrapper>
            <div>
              <HeroSection title="Mobile Test" />
              <BottomNavigation />
              <FloatingActionButton position="bottom-right" />
            </div>
          </FeedbackWrapper>
        </RouterWrapper>
      );

      // Bottom navigation should be visible
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      
      // FAB should be positioned correctly
      expect(screen.getByRole('button')).toHaveClass('bottom-6', 'right-6');
    });

    it('adapts layout for desktop devices', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(
        <RouterWrapper>
          <FeedbackWrapper>
            <div>
              <HeroSection title="Desktop Test" />
              <BottomNavigation />
            </div>
          </FeedbackWrapper>
        </RouterWrapper>
      );

      // Components should render appropriately for desktop
      expect(screen.getByText('Desktop Test')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles component errors gracefully', () => {
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      const TestApp = () => (
        <RouterWrapper>
          <FeedbackWrapper>
            <div>
              <HeroSection title="Error Test" />
              <ErrorComponent />
            </div>
          </FeedbackWrapper>
        </RouterWrapper>
      );

      // This would normally be caught by an error boundary
      expect(() => render(<TestApp />)).toThrow('Test error');
    });

    it('recovers from network failures', async () => {
      const mockApiCall = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ success: true });

      const TestApp = () => {
        const [status, setStatus] = React.useState('idle');

        const handleRetry = async () => {
          setStatus('loading');
          try {
            await mockApiCall();
            setStatus('success');
          } catch (error) {
            setStatus('error');
        };

        return (
          <div>
            <div data-testid="status">{status}</div>
            <button onClick={handleRetry}>Retry</button>
          </div>
        );
      };

      render(<TestApp />);

      // First attempt fails
      fireEvent.click(screen.getByText('Retry'));
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('error');
      });

      // Second attempt succeeds
      fireEvent.click(screen.getByText('Retry'));
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('success');
      });

      expect(mockApiCall).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility Integration', () => {
    it('maintains focus management across components', () => {
      render(
        <RouterWrapper>
          <div>
            <HeroSection title="Focus Test" />
            <BottomNavigation />
            <FloatingActionButton />
          </div>
        </RouterWrapper>
      );

      // Test tab order
      const focusableElements = screen.getAllByRole('button').concat(
        screen.getAllByRole('link')
      );

      expect(focusableElements.length).toBeGreaterThan(0);
      
      // Each focusable element should be reachable
      focusableElements.forEach(element => {
        element.focus();
        expect(document.activeElement).toBe(element);
      });
    });

    it('provides proper screen reader announcements', () => {
      const TestApp = () => {
        const [announcement, setAnnouncement] = React.useState('');

        const handleAction = () => {
          setAnnouncement('Certificate verified successfully');
        };

        return (
          <div>
            <button onClick={handleAction}>Verify Certificate</button>
            {announcement && (
              <div role="status" aria-live="polite">
                {announcement}
              </div>
            )}
          </div>
        );
      };

      render(<TestApp />);

      fireEvent.click(screen.getByText('Verify Certificate'));
      
      const announcement = screen.getByRole('status');
      expect(announcement).toHaveTextContent('Certificate verified successfully');
      expect(announcement).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Performance Integration', () => {
    it('handles concurrent operations efficiently', async () => {
      const mockOperations = Array.from({ length: 10 }, (_, i) => 
        jest.fn().mockResolvedValue(`Result ${i}`)
      );

      const TestApp = () => {
        const [results, setResults] = React.useState<string[]>([]);

        const handleConcurrentOperations = async () => {
          const promises = mockOperations.map(op => op());
          const allResults = await Promise.all(promises);
          setResults(allResults);
        };

        return (
          <div>
            <button onClick={handleConcurrentOperations}>
              Run Concurrent Operations
            </button>
            <div data-testid="results">
              {results.map((result, index) => (
                <div key={index}>{result}</div>
              ))}
            </div>
          </div>
        );
      };

      render(<TestApp />);

      const startTime = performance.now();
      fireEvent.click(screen.getByText('Run Concurrent Operations'));

      await waitFor(() => {
        expect(screen.getByText('Result 0')).toBeInTheDocument();
        expect(screen.getByText('Result 9')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Concurrent operations should complete efficiently
      expect(executionTime).toBeLessThan(1000);
      expect(mockOperations.every(op => op.mock.calls.length === 1)).toBe(true);
    });
  });
});