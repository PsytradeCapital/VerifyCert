import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from "../Modal";

describe('Modal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    children: <div>Modal content</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Reset body overflow
    document.body.style.overflow = 'unset';
  });

  it('renders modal when isOpen is true', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Modal {...defaultProps} title="Test Modal" />);
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('renders close button by default', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
  });

  it('hides close button when showCloseButton is false', () => {
    render(<Modal {...defaultProps} showCloseButton={false} />);
    expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    render(<Modal {...defaultProps} />);
    
    await userEvent.click(screen.getByLabelText('Close modal'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', async () => {
    render(<Modal {...defaultProps} />);
    
    const backdrop = screen.getByRole('dialog').parentElement?.firstChild;
    if (backdrop) {
      await userEvent.click(backdrop as Element);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when backdrop is clicked and closeOnBackdropClick is false', async () => {
    render(<Modal {...defaultProps} closeOnBackdropClick={false} />);
    
    const backdrop = screen.getByRole('dialog').parentElement?.firstChild;
    if (backdrop) {
      await userEvent.click(backdrop as Element);
      expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', () => {
    render(<Modal {...defaultProps} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when Escape key is pressed and closeOnEscape is false', () => {
    render(<Modal {...defaultProps} closeOnEscape={false} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Modal {...defaultProps} size="sm" />);
    expect(screen.getByRole('dialog')).toHaveClass('max-w-sm');

    rerender(<Modal {...defaultProps} size="default" />);
    expect(screen.getByRole('dialog')).toHaveClass('max-w-md');

    rerender(<Modal {...defaultProps} size="lg" />);
    expect(screen.getByRole('dialog')).toHaveClass('max-w-lg');

    rerender(<Modal {...defaultProps} size="xl" />);
    expect(screen.getByRole('dialog')).toHaveClass('max-w-xl');

    rerender(<Modal {...defaultProps} size="full" />);
    expect(screen.getByRole('dialog')).toHaveClass('max-w-full');
  });

  it('applies custom className', () => {
    render(<Modal {...defaultProps} className="custom-modal" />);
    expect(screen.getByRole('dialog')).toHaveClass('custom-modal');
  });

  it('applies custom backdrop className', () => {
    render(<Modal {...defaultProps} backdropClassName="custom-backdrop" />);
    const backdrop = screen.getByRole('dialog').parentElement?.firstChild;
    expect(backdrop).toHaveClass('custom-backdrop');
  });

  it('locks body scroll when modal is open', () => {
    render(<Modal {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when modal is closed', () => {
    const { rerender } = render(<Modal {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');

    rerender(<Modal {...defaultProps} isOpen={false} />);
    expect(document.body.style.overflow).toBe('unset');
  });

  it('has proper accessibility attributes', () => {
    render(<Modal {...defaultProps} title="Test Modal" />);
    const modal = screen.getByRole('dialog');
    
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
    expect(modal).toHaveAttribute('tabIndex', '-1');
  });

  it('focuses modal when opened', async () => {
    render(<Modal {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toHaveFocus();
    });
  });
});
}
}}