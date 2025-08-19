import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingButton from '../LoadingButton';

describe('LoadingButton', () => {
  it('renders children when not loading', () => {
    render(<LoadingButton>Click me</LoadingButton>);
    
    expect(screen.getByText('Click me')).toBeInTheDocument();
    expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    render(<LoadingButton isLoading>Click me</LoadingButton>);
    
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('shows loading text when provided', () => {
    render(
      <LoadingButton isLoading loadingText="Processing...">
        Click me
      </LoadingButton>
    );
    
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    expect(screen.queryByText('Click me')).not.toBeInTheDocument();
  });

  it('is disabled when loading', () => {
    render(<LoadingButton isLoading>Click me</LoadingButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<LoadingButton disabled>Click me</LoadingButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('calls onClick when clicked and not loading', () => {
    const handleClick = jest.fn();
    render(<LoadingButton onClick={handleClick}>Click me</LoadingButton>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when loading', () => {
    const handleClick = jest.fn();
    render(
      <LoadingButton isLoading onClick={handleClick}>
        Click me
      </LoadingButton>
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies primary variant styles by default', () => {
    render(<LoadingButton>Click me</LoadingButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-600', 'text-white');
  });

  it('applies secondary variant styles', () => {
    render(<LoadingButton variant="secondary">Click me</LoadingButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-600', 'text-white');
  });

  it('applies danger variant styles', () => {
    render(<LoadingButton variant="destructive">Click me</LoadingButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-600', 'text-white');
  });

  it('applies outline variant styles', () => {
    render(<LoadingButton variant="outline">Click me</LoadingButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border', 'border-gray-300', 'text-gray-700', 'bg-white');
  });

  it('applies small size styles', () => {
    render(<LoadingButton size="sm">Click me</LoadingButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-3', 'py-2', 'text-sm');
  });

  it('applies medium size styles by default', () => {
    render(<LoadingButton>Click me</LoadingButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-4', 'py-2', 'text-base');
  });

  it('applies large size styles', () => {
    render(<LoadingButton size="lg">Click me</LoadingButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
  });

  it('applies custom className', () => {
    render(<LoadingButton className="custom-class">Click me</LoadingButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('passes through other button props', () => {
    render(<LoadingButton type="submit" data-testid="submit-btn">Submit</LoadingButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('data-testid', 'submit-btn');
  });
});