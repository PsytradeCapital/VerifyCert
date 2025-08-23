import React from 'react';
import { render, screen } from '@testing-library/react';
import OptimizedImage from '../ui/OptimizedImage';

describe('OptimizedImage', () => {
  const defaultProps = {
    src: 'test-image.jpg',
    alt: 'Test image',
    width: 300,
    height: 200
  };

  it('renders image with correct attributes', () => {
    render(<OptimizedImage {...defaultProps} />);
    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'test-image.jpg');
  });

  it('applies custom className', () => {
    render(<OptimizedImage {...defaultProps} className="custom-class" />);
    const image = screen.getByAltText('Test image');
    expect(image).toHaveClass('custom-class');
  });
});
