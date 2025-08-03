import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OptimizedImage } from '../OptimizedImage';

// Mock the image optimization utilities
jest.mock('../../../utils/imageOptimization', () => ({
  getOptimalImageFormat: jest.fn((src) => Promise.resolve(src.replace('.png', '.webp'))),
  generateImageSrcSet: jest.fn((src) => `${src} 320w, ${src} 640w, ${src} 1024w`),
  optimizeImageUrl: jest.fn((src) => src),
  imagePerformanceMonitor: {
    startLoad: jest.fn(),
    endLoad: jest.fn()
  },
  createBlurPlaceholder: jest.fn(() => 'data:image/jpeg;base64,blur'),
  isWebPSupported: jest.fn(() => Promise.resolve(true))
}));

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
});
(window as any).IntersectionObserver = mockIntersectionObserver;

// Mock Image constructor
const mockImage = {
  onload: null as any,
  onerror: null as any,
  src: '',
  srcset: '',
  naturalWidth: 100,
  naturalHeight: 100
};

(global as any).Image = jest.fn(() => mockImage);

describe('OptimizedImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <OptimizedImage
        src="/test-image.png"
        alt="Test image"
        className="test-class"
      />
    );

    const container = screen.getByRole('generic');
    expect(container).toHaveClass('test-class');
    expect(container).toHaveClass('animate-pulse');
  });

  it('renders with priority loading', async () => {
    render(
      <OptimizedImage
        src="/test-image.png"
        alt="Test image"
        priority={true}
      />
    );

    // Priority images should start loading immediately
    setTimeout(() => {
      if (mockImage.onload) mockImage.onload();
    }, 0);

    await waitFor(() => {
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Test image');
  });

  it('applies aspect ratio classes correctly', () => {
    render(
      <OptimizedImage
        src="/test-image.png"
        alt="Test image"
        aspectRatio="square"
      />
    );

    expect(screen.getByRole('generic')).toHaveClass('aspect-square');
  });

  it('handles error state', async () => {
    render(
      <OptimizedImage
        src="/nonexistent.png"
        alt="Test image"
        priority={true}
      />
    );

    // Simulate image error
    setTimeout(() => {
      if (mockImage.onerror) mockImage.onerror();
    }, 0);

    await waitFor(() => {
      expect(screen.getByText('Failed to load image')).toBeInTheDocument();
    });

    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('uses custom loading component', () => {
    const CustomLoading = () => <div data-testid="custom-loading">Loading...</div>;
    
    render(
      <OptimizedImage
        src="/test-image.png"
        alt="Test image"
        loadingComponent={CustomLoading}
      />
    );

    expect(screen.getByTestId('custom-loading')).toBeInTheDocument();
  });

  it('disables responsive images when specified', async () => {
    render(
      <OptimizedImage
        src="/test-image.png"
        alt="Test image"
        responsive={false}
        priority={true}
      />
    );

    setTimeout(() => {
      if (mockImage.onload) mockImage.onload();
    }, 0);

    await waitFor(() => {
      const img = screen.getByRole('img');
      expect(img).not.toHaveAttribute('srcset');
      expect(img).not.toHaveAttribute('sizes');
    });
  });

  it('applies optimization options', () => {
    const { optimizeImageUrl } = require('../../../utils/imageOptimization');
    
    render(
      <OptimizedImage
        src="/test-image.png"
        alt="Test image"
        priority={true}
        optimization={{
          quality: 85,
          width: 800,
          height: 600
        }}
      />
    );

    expect(optimizeImageUrl).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        quality: 85,
        width: 800,
        height: 600
      })
    );
  });
});