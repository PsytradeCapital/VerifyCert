import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingButton from '../LoadingButton';

describe('LoadingButton', () => {
  it('renders children when not loading', () => {
    render(<LoadingButton>Click me</LoadingButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('shows loading text when loading', () => {
    render(
      <LoadingButton loading loadingText="Processing...">
        Click me
      </LoadingButton>
    );
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('shows spinner when loading', () => {
    render(<LoadingButton loading>Click me</LoadingButton>);
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('is disabled when loading', () => {
    render(<LoadingButton loading>Click me</LoadingButton>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('calls onClick when not loading', () => {
    const handleClick = jest.fn();
    render(<LoadingButton onClick={handleClick}>Click me</LoadingButton>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when loading', () => {
    const handleClick = jest.fn();
    render(
      <LoadingButton loading onClick={handleClick}>
        Click me
      </LoadingButton>
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies correct variant classes', () => {
    const { rerender } = render(<LoadingButton variant="default">Click me</LoadingButton>);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-600');

    rerender(<LoadingButton variant="outline">Click me</LoadingButton>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('border', 'border-gray-300');
  });
});