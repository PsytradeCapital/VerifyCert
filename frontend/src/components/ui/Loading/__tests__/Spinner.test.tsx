import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Spinner from '../Spinner';

describe('Spinner', () => {
  it('renders with default props', () => {
    render(<Spinner />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Spinner size="sm" />);
    let spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('h-4', 'w-4');

    rerender(<Spinner size="lg" />);
    spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('applies correct color classes', () => {
    const { rerender } = render(<Spinner color="primary" />);
    let spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('text-blue-600');

    rerender(<Spinner color="success" />);
    spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('text-green-600');
  });

  it('applies custom className', () => {
    render(<Spinner className="custom-class" />);
    const spinnerContainer = screen.getByLabelText('Loading').parentElement;
    expect(spinnerContainer).toHaveClass('custom-class');
  });
});