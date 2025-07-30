import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '../Input';

describe('Input Component', () => {
  describe('Basic Functionality', () => {
    it('renders with label', () => {
      render(<Input label="Test Label" />);
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    });

    it('renders without label', () => {
      render(<Input placeholder="Test placeholder" variant="default" />);
      expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument();
    });

    it('handles value changes', async () => {
      const handleChange = jest.fn();
      
      render(<Input label="Test" onChange={handleChange} />);
      
      const input = screen.getByLabelText('Test');
      await userEvent.type(input, 'test value');
      
      expect(handleChange).toHaveBeenCalled();
    });

    it('handles focus and blur events', async () => {
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();
      
      render(<Input label="Test" onFocus={handleFocus} onBlur={handleBlur} />);
      
      const input = screen.getByLabelText('Test');
      await userEvent.click(input);
      expect(handleFocus).toHaveBeenCalled();
      
      await userEvent.tab();
      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('Floating Label Variant', () => {
    it('renders floating label correctly', () => {
      render(<Input variant="floating" label="Floating Label" />);
      expect(screen.getByLabelText('Floating Label')).toBeInTheDocument();
    });

    it('animates label on focus', async () => {
      render(<Input variant="floating" label="Floating Label" />);
      
      const input = screen.getByLabelText('Floating Label');
      const label = screen.getByText('Floating Label');
      
      // Check initial state
      expect(label).toHaveClass('top-1/2');
      
      // Focus input
      await userEvent.click(input);
      
      // Label should move up
      await waitFor(() => {
        expect(label).toHaveClass('top-2');
      });
    });

    it('keeps label up when input has value', () => {
      render(<Input variant="floating" label="Floating Label" value="test" readOnly />);
      
      const label = screen.getByText('Floating Label');
      expect(label).toHaveClass('top-2');
    });
  });

  describe('Validation States', () => {
    it('displays error state correctly', () => {
      render(<Input label="Test" error="This is an error" />);
      
      expect(screen.getByText('This is an error')).toBeInTheDocument();
      expect(screen.getByLabelText('Test')).toHaveClass('border-error-300');
    });

    it('displays success state correctly', () => {
      render(<Input label="Test" validationState="success" />);
      
      const input = screen.getByLabelText('Test');
      expect(input).toHaveClass('border-success-300');
    });

    it('displays warning state correctly', () => {
      render(<Input label="Test" validationState="warning" />);
      
      const input = screen.getByLabelText('Test');
      expect(input).toHaveClass('border-warning-300');
    });

    it('shows validation icons when enabled', () => {
      const { container } = render(
        <Input label="Test" validationState="success" showValidationIcon={true} />
      );
      
      const successIcon = container.querySelector('svg');
      expect(successIcon).toBeInTheDocument();
      expect(successIcon).toHaveClass('text-success-500');
    });

    it('hides validation icons when disabled', () => {
      const { container } = render(
        <Input label="Test" validationState="success" showValidationIcon={false} />
      );
      
      const icons = container.querySelectorAll('svg');
      expect(icons).toHaveLength(0);
    });
  });

  describe('Helper Text', () => {
    it('displays helper text', () => {
      render(<Input label="Test" helperText="This is helper text" />);
      expect(screen.getByText('This is helper text')).toBeInTheDocument();
    });

    it('hides helper text when error is present', () => {
      render(
        <Input 
          label="Test" 
          helperText="This is helper text" 
          error="This is an error" 
        />
      );
      
      expect(screen.getByText('This is an error')).toBeInTheDocument();
      expect(screen.queryByText('This is helper text')).not.toBeInTheDocument();
    });

    it('colors helper text based on validation state', () => {
      render(
        <Input 
          label="Test" 
          helperText="Success message" 
          validationState="success" 
        />
      );
      
      const helperText = screen.getByText('Success message');
      expect(helperText).toHaveClass('text-success-600');
    });
  });

  describe('Icons', () => {
    const TestIcon = () => <span data-testid="test-icon">🔍</span>;

    it('renders left icon', () => {
      render(<Input label="Test" icon={<TestIcon />} iconPosition="left" />);
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders right icon', () => {
      render(<Input label="Test" icon={<TestIcon />} iconPosition="right" />);
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('adjusts padding for icons', () => {
      render(<Input label="Test" icon={<TestIcon />} iconPosition="left" />);
      
      const input = screen.getByLabelText('Test');
      expect(input).toHaveClass('pl-10');
    });
  });

  describe('Sizes', () => {
    it('renders small size correctly', () => {
      render(<Input label="Test" size="sm" />);
      
      const input = screen.getByLabelText('Test');
      expect(input).toHaveClass('text-sm');
    });

    it('renders medium size correctly', () => {
      render(<Input label="Test" size="md" />);
      
      const input = screen.getByLabelText('Test');
      expect(input).toHaveClass('text-base');
    });

    it('renders large size correctly', () => {
      render(<Input label="Test" size="lg" />);
      
      const input = screen.getByLabelText('Test');
      expect(input).toHaveClass('text-lg');
    });
  });

  describe('Accessibility', () => {
    it('generates unique IDs when not provided', () => {
      render(
        <>
          <Input label="First Input" />
          <Input label="Second Input" />
        </>
      );
      
      const firstInput = screen.getByLabelText('First Input');
      const secondInput = screen.getByLabelText('Second Input');
      
      expect(firstInput.id).toBeTruthy();
      expect(secondInput.id).toBeTruthy();
      expect(firstInput.id).not.toBe(secondInput.id);
    });

    it('uses provided ID', () => {
      render(<Input label="Test" id="custom-id" />);
      
      const input = screen.getByLabelText('Test');
      expect(input.id).toBe('custom-id');
    });

    it('associates label with input correctly', () => {
      render(<Input label="Test Label" />);
      
      const input = screen.getByLabelText('Test Label');
      const label = screen.getByText('Test Label');
      
      expect(label).toHaveAttribute('for', input.id);
    });

    it('supports disabled state', () => {
      render(<Input label="Test" disabled />);
      
      const input = screen.getByLabelText('Test');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:bg-neutral-50');
    });
  });

  describe('Controlled vs Uncontrolled', () => {
    it('works as controlled component', async () => {
      const handleChange = jest.fn();
      
      const { rerender } = render(
        <Input label="Test" value="initial" onChange={handleChange} />
      );
      
      const input = screen.getByLabelText('Test');
      expect(input).toHaveValue('initial');
      
      await userEvent.clear(input);
      await userEvent.type(input, 'new value');
      
      expect(handleChange).toHaveBeenCalled();
      
      // Simulate parent component updating value
      rerender(<Input label="Test" value="updated" onChange={handleChange} />);
      expect(input).toHaveValue('updated');
    });

    it('works as uncontrolled component', async () => {
      render(<Input label="Test" defaultValue="default" />);
      
      const input = screen.getByLabelText('Test');
      expect(input).toHaveValue('default');
      
      await userEvent.clear(input);
      await userEvent.type(input, 'user input');
      
      expect(input).toHaveValue('user input');
    });
  });
});