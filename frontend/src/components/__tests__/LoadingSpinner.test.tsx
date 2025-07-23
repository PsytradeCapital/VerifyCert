import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin', 'h-6', 'w-6', 'text-blue-600');
  });

  it('renders with small size', () => {
    render(<LoadingSpinner size="sm" />);
    
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('h-4', 'w-4');
  });

  it('renders with large size', () => {
    render(<LoadingSpinner size="lg" />);
    
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('renders with extra large size', () => {
    render(<LoadingSpinner size="xl" />);
    
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('h-12', 'w-12');
  });

  it('renders with white color', () => {
    render(<LoadingSpinner color="white" />);
    
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('text-white');
  });

  it('renders with secondary color', () => {
    render(<LoadingSpinner color="secondary" />);
    
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('text-gray-600');
  });

  it('renders with gray color', () => {
    render(<LoadingSpinner color="gray" />);
    
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('text-gray-400');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('custom-class');
  });

  it('has spinning animation', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('animate-spin');
  });
});