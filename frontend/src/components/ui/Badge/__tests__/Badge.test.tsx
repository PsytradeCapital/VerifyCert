import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Badge from '../Badge';

describe('Badge Component', () => {
  it('renders children correctly', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('renders with default variant and size', () => {
    render(<Badge>Default Badge</Badge>);
    const badge = screen.getByText('Default Badge');
    expect(badge).toHaveClass('text-gray-800', 'bg-gray-100', 'px-2.5', 'py-0.5', 'text-sm');
  });

  it('renders different variants correctly', () => {
    const { rerender } = render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success')).toHaveClass('text-green-800', 'bg-green-100');

    rerender(<Badge variant="error">Error</Badge>);
    expect(screen.getByText('Error')).toHaveClass('text-red-800', 'bg-red-100');

    rerender(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText('Warning')).toHaveClass('text-yellow-800', 'bg-yellow-100');

    rerender(<Badge variant="info">Info</Badge>);
    expect(screen.getByText('Info')).toHaveClass('text-blue-800', 'bg-blue-100');

    rerender(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText('Secondary')).toHaveClass('text-purple-800', 'bg-purple-100');
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>);
    expect(screen.getByText('Small')).toHaveClass('px-2', 'py-0.5', 'text-xs');

    rerender(<Badge size="md">Medium</Badge>);
    expect(screen.getByText('Medium')).toHaveClass('px-2.5', 'py-0.5', 'text-sm');

    rerender(<Badge size="lg">Large</Badge>);
    expect(screen.getByText('Large')).toHaveClass('px-3', 'py-1', 'text-base');
  });

  it('renders with rounded corners when rounded is true', () => {
    render(<Badge rounded>Rounded Badge</Badge>);
    expect(screen.getByText('Rounded Badge')).toHaveClass('rounded-full');
  });

  it('renders with outline style when outline is true', () => {
    render(<Badge outline variant="success">Outline Badge</Badge>);
    const badge = screen.getByText('Outline Badge');
    expect(badge).toHaveClass('text-green-700', 'bg-white', 'border', 'border-green-300');
  });

  it('renders as button when onClick is provided', () => {
    const onClick = jest.fn();
    render(<Badge onClick={onClick}>Clickable Badge</Badge>);
    const badge = screen.getByRole('button');
    expect(badge).toHaveClass('cursor-pointer');
  });

  it('calls onClick when clicked', async () => {
    const onClick = jest.fn();
    render(<Badge onClick={onClick}>Clickable Badge</Badge>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders icon when provided', () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>;
    render(<Badge icon={<TestIcon />}>Badge with Icon</Badge>);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders remove button when removable is true', () => {
    const onRemove = jest.fn();
    render(<Badge removable onRemove={onRemove}>Removable Badge</Badge>);
    expect(screen.getByLabelText('Remove badge')).toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', async () => {
    const onRemove = jest.fn();
    const onClick = jest.fn();
    render(
      <Badge removable onRemove={onRemove} onClick={onClick}>
        Removable Badge
      </Badge>
    );
    
    await userEvent.click(screen.getByLabelText('Remove badge'));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled(); // Should not trigger onClick
  });

  it('applies custom className', () => {
    render(<Badge className="custom-badge">Custom Badge</Badge>);
    expect(screen.getByText('Custom Badge')).toHaveClass('custom-badge');
  });

  it('renders as span when not clickable', () => {
    render(<Badge>Static Badge</Badge>);
    const badge = screen.getByText('Static Badge');
    expect(badge.tagName).toBe('SPAN');
    expect(badge).not.toHaveClass('cursor-pointer');
  });

  it('renders icon without children', () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>;
    render(<Badge icon={<TestIcon />} />);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });
});