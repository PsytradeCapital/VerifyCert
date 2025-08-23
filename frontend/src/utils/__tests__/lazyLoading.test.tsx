import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { createLazyComponent, LazyImage, LazyComponentWrapper } from '../lazyLoading';

// Mock component for testing
const MockComponent: React.FC<{ message: string }> = ({ message }) => (
  <div data-testid="mock-component">{message}</div>
);

// Create lazy version
const LazyMockComponent = createLazyComponent(
  () => Promise.resolve({ default: MockComponent })
);

describe('Lazy Loading Utilities', () => {
  describe('createLazyComponent', () => {
    it('should create a lazy component that loads successfully', async () => {
      render(
        <React.Suspense fallback={<div>Loading...</div>>
          <LazyMockComponent message="Hello World" />
        </React.Suspense>
      );

      // Should show loading initially
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Should load the component
      await waitFor(() => {
        expect(screen.getByTestId('mock-component')).toBeInTheDocument();
        expect(screen.getByText('Hello World')).toBeInTheDocument();
      });
    });
  });

  describe('LazyImage', () => {
    beforeEach(() => {
      // Mock IntersectionObserver
      global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
        observe: jest.fn().mockImplementation((element) => {
          // Simulate immediate intersection
          callback([{ isIntersecting: true, target: element }]);
        }),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      }));
    });

    it('should render loading state initially', () => {
      render(
        <LazyImage
          src="test-image.jpg"
          alt="Test Image"
          className="test-class"
        />
      );

      // Should show loading placeholder
      const placeholder = screen.getByRole('img', { hidden: true });
      expect(placeholder).toHaveClass('animate-pulse');
    });

    it('should render with custom loading component', () => {
      const CustomLoading = () => <div data-testid="custom-loading">Custom Loading</div>;
      
      render(
        <LazyImage
          src="test-image.jpg"
          alt="Test Image"
          loadingComponent={CustomLoading}
        />
      );

      expect(screen.getByTestId('custom-loading')).toBeInTheDocument();
    });
  });

  describe('LazyComponentWrapper', () => {
    it('should render children with suspense boundary', async () => {
      render(
        <LazyComponentWrapper fallback={<div>Loading wrapper...</div>>
          <LazyMockComponent message="Wrapped Component" />
        </LazyComponentWrapper>
      );

      // Should show loading initially
      expect(screen.getByText('Loading wrapper...')).toBeInTheDocument();

      // Should load the wrapped component
      await waitFor(() => {
        expect(screen.getByText('Wrapped Component')).toBeInTheDocument();
      });
    });
  });
});
}