import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProgressBar from '../ProgressBar';

describe('ProgressBar', () => {
  it('renders with correct progress value', () => {
    render(<ProgressBar progress={50} showLabel />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('clamps progress value between 0 and 100', () => {
    const { rerender } = render(<ProgressBar progress={150} showLabel />);
    expect(screen.getByText('100%')).toBeInTheDocument();

    rerender(<ProgressBar progress={-10} showLabel />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('shows custom label when provided', () => {
    render(<ProgressBar progress={75} showLabel label="Upload Progress" />);
    expect(screen.getByText('Upload Progress')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('applies correct color classes', () => {
    const { container } = render(<ProgressBar progress={50} color="success" />);
    const progressBar = container.querySelector('.bg-green-600');
    expect(progressBar).toBeInTheDocument();
  });

  it('hides label when showLabel is false', () => {
    render(<ProgressBar progress={50} showLabel={false} />);
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });
});