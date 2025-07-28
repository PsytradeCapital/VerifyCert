import React from 'react';
import { render, screen } from '@testing-library/react';
import Container from '../Container';

describe('Container', () => {
  it('renders children correctly', () => {
    render(
      <Container>
        <div>Test content</div>
      </Container>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    const { container } = render(
      <Container>
        <div>Test content</div>
      </Container>
    );
    
    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement).toHaveClass('w-full', 'mx-auto', 'max-w-6xl');
  });

  it('applies size classes correctly', () => {
    const { container } = render(
      <Container size="sm">
        <div>Test content</div>
      </Container>
    );
    
    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement).toHaveClass('max-w-2xl');
  });

  it('applies fluid sizing when fluid prop is true', () => {
    const { container } = render(
      <Container fluid>
        <div>Test content</div>
      </Container>
    );
    
    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement).toHaveClass('max-w-full');
  });

  it('applies padding classes correctly', () => {
    const { container } = render(
      <Container padding="lg">
        <div>Test content</div>
      </Container>
    );
    
    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement).toHaveClass('px-6', 'sm:px-8', 'lg:px-12');
  });

  it('applies separate paddingX and paddingY classes', () => {
    const { container } = render(
      <Container paddingX="md" paddingY="lg">
        <div>Test content</div>
      </Container>
    );
    
    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
    expect(containerElement).toHaveClass('py-6', 'sm:py-8', 'lg:py-12');
  });

  it('does not center when center prop is false', () => {
    const { container } = render(
      <Container center={false}>
        <div>Test content</div>
      </Container>
    );
    
    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement).not.toHaveClass('mx-auto');
  });

  it('applies custom className', () => {
    const { container } = render(
      <Container className="custom-class">
        <div>Test content</div>
      </Container>
    );
    
    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement).toHaveClass('custom-class');
  });

  it('renders as different HTML element when as prop is provided', () => {
    render(
      <Container as="section" data-testid="container">
        <div>Test content</div>
      </Container>
    );
    
    const containerElement = screen.getByTestId('container');
    expect(containerElement.tagName).toBe('SECTION');
  });

  it('handles all size variants', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'] as const;
    const expectedClasses = [
      'max-w-sm',
      'max-w-2xl',
      'max-w-4xl',
      'max-w-6xl',
      'max-w-7xl',
      'max-w-screen-2xl',
      'max-w-full'
    ];

    sizes.forEach((size, index) => {
      const { container } = render(
        <Container size={size}>
          <div>Test content</div>
        </Container>
      );
      
      const containerElement = container.firstChild as HTMLElement;
      expect(containerElement).toHaveClass(expectedClasses[index]);
    });
  });

  it('handles all padding variants', () => {
    const paddings = ['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const;
    
    paddings.forEach((padding) => {
      const { container } = render(
        <Container padding={padding}>
          <div>Test content</div>
        </Container>
      );
      
      const containerElement = container.firstChild as HTMLElement;
      
      if (padding === 'none') {
        expect(containerElement).not.toHaveClass('px-2', 'px-3', 'px-4', 'px-6', 'px-8');
      } else {
        // Should have some padding class
        expect(containerElement.className).toMatch(/px-\d+/);
      }
    });
  });
});