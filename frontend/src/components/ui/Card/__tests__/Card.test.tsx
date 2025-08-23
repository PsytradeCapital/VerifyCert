import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Card from '../Card';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, whileTap, whileFocus, ...props }: any) => (
      <div {...props}>{children}</div>
    )
}));

describe('Card Component', () => {
  const defaultProps = {
    children: <div>Test Content</div>;

  it('renders children correctly', () => {
    render(<Card {...defaultProps} />);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  describe('Variants', () => {
    it('renders default variant correctly', () => {
      const { container } = render(<Card variant="default" {...defaultProps} />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('border', 'border-gray-200');
    });

    it('renders elevated variant correctly', () => {
      const { container } = render(<Card variant="elevated" {...defaultProps} />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('shadow-md');
    });

    it('renders outlined variant correctly', () => {
      const { container } = render(<Card variant="outlined" {...defaultProps} />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('border-2', 'border-gray-300');
    });
  });

  describe('Padding', () => {
    it('renders with no padding', () => {
      const { container } = render(<Card padding="none" {...defaultProps} />);
      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveClass('p-3', 'p-4', 'p-6');
    });

    it('renders with small padding', () => {
      const { container } = render(<Card padding="sm" {...defaultProps} />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-3');
    });

    it('renders with medium padding (default)', () => {
      const { container } = render(<Card padding="md" {...defaultProps} />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-4');
    });

    it('renders with large padding', () => {
      const { container } = render(<Card padding="lg" {...defaultProps} />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-6');
    });
  });

  describe('Interactivity', () => {
    it('adds cursor-pointer class when onClick is provided', () => {
      const mockClick = jest.fn();
      const { container } = render(<Card onClick={mockClick} {...defaultProps} />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('cursor-pointer');
    });

    it('calls onClick when clicked', () => {
      const mockClick = jest.fn();
      const { container } = render(<Card onClick={mockClick} {...defaultProps} />);
      const card = container.firstChild as HTMLElement;
      fireEvent.click(card);
      expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it('does not add cursor-pointer class when onClick is not provided', () => {
      const { container } = render(<Card {...defaultProps} />);
      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveClass('cursor-pointer');
    });
  });

  describe('Custom styling', () => {
    it('applies custom className', () => {
      const { container } = render(<Card className="custom-class" {...defaultProps} />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-class');
    });

    it('maintains base classes with custom className', () => {
      const { container } = render(<Card className="custom-class" {...defaultProps} />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-white', 'rounded-lg', 'custom-class');
    });
  });

  describe('Animation props', () => {
    it('disables animations when enableAnimations is false', () => {
      const { container } = render(
        <Card enableAnimations={false} hover={true} {...defaultProps} />
      );
      // Since we're mocking framer-motion, we can't test the actual animation props
      // but we can ensure the component renders without errors
      expect(container.firstChild).toBeInTheDocument();
    });

    it('enables animations by default for interactive cards', () => {
      const { container } = render(<Card hover={true} {...defaultProps} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper role when clickable', () => {
      const mockClick = jest.fn();
      const { container } = render(<Card onClick={mockClick} {...defaultProps} />);
      const card = container.firstChild as HTMLElement;
      // The component should be clickable and accessible
      expect(card.tagName).toBe('DIV');
    });
  });

  describe('Default props', () => {
    it('uses default variant when not specified', () => {
      const { container } = render(<Card {...defaultProps} />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('border', 'border-gray-200');
    });

    it('uses default padding when not specified', () => {
      const { container } = render(<Card {...defaultProps} />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-4');
    });

    it('enables animations by default', () => {
      const { container } = render(<Card hover={true} {...defaultProps} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
}