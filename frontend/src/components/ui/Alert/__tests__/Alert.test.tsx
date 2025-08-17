import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Alert from '../Alert';

describe('Alert Component', () => {
  it('renders children correctly', () => {
    render(<Alert>Test alert message</Alert>);
    expect(screen.getByText('Test alert message')).toBeInTheDocument();
  });

  it('renders with default info variant', () => {
    render(<Alert>Test message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-800');
  });

  it('renders different variants correctly', () => {
    const { rerender } = render(<Alert variant="success">Success message</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-green-50', 'border-green-200');

    rerender(<Alert variant="error">Error message</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50', 'border-red-200');

    rerender(<Alert variant="warning">Warning message</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-yellow-50', 'border-yellow-200');

    rerender(<Alert variant="info">Info message</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-blue-50', 'border-blue-200');
  });

  it('renders title when provided', () => {
    render(<Alert title="Alert Title">Alert content</Alert>);
    expect(screen.getByText('Alert Title')).toBeInTheDocument();
    expect(screen.getByText('Alert content')).toBeInTheDocument();
  });

  it('shows default icon by default', () => {
    render(<Alert variant="success">Success message</Alert>);
    // Check if icon container exists
    const alert = screen.getByRole('alert');
    const iconContainer = alert.querySelector('svg');
    expect(iconContainer).toBeInTheDocument();
  });

  it('hides icon when showIcon is false', () => {
    render(<Alert showIcon={false}>No icon message</Alert>);
    const alert = screen.getByRole('alert');
    const iconContainer = alert.querySelector('svg');
    expect(iconContainer).not.toBeInTheDocument();
  });

  it('renders custom icon when provided', () => {
    const CustomIcon = () => <div data-testid="custom-icon">Custom</div>;
    render(<Alert>Custom icon message</Alert>);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('shows close button when closable is true', () => {
    const onClose = jest.fn();
    render(<Alert closable onClose={onClose}>Closable alert</Alert>);
    expect(screen.getByLabelText('Dismiss alert')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = jest.fn();
    render(<Alert closable onClose={onClose}>Closable alert</Alert>);
    
    await userEvent.click(screen.getByLabelText('Dismiss alert'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not show close button when closable is false', () => {
    render(<Alert closable={false}>Non-closable alert</Alert>);
    expect(screen.queryByLabelText('Dismiss alert')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Alert className="custom-alert">Custom class alert</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('custom-alert');
  });

  it('has proper accessibility attributes', () => {
    render(<Alert>Accessible alert</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders without title correctly', () => {
    render(<Alert>Just content</Alert>);
    expect(screen.getByText('Just content')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});