import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MultiSelect from '../MultiSelect';
import { SelectOption } from '../Select';

const mockOptions: SelectOption[] = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3', disabled: true },
  { 
    value: 'option4', 
    label: 'Option 4', 
    description: 'This is option 4',
    icon: <span data-testid="option4-icon">🔥</span>
];

describe('MultiSelect Component', () => {
  const defaultProps = {
    options: mockOptions,
    'data-testid': 'test-multiselect'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('renders correctly with default props', () => {
      render(<MultiSelect {...defaultProps} />);
      
      const multiselect = screen.getByTestId('test-multiselect');
      expect(multiselect).toBeInTheDocument();
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Select options');
    });

    it('opens dropdown when clicked', async () => {
      render(<MultiSelect {...defaultProps} />);
      
      const button = screen.getByRole('button');
      
      await act(async () => {
        fireEvent.click(button);
      });
      
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });
  });

  describe('Multiple Selection', () => {
    it('selects multiple options', async () => {
      const onChange = jest.fn();
      render(<MultiSelect {...defaultProps} onChange={onChange} />);
      
      const button = screen.getByRole('button');
      
      await act(async () => {
        fireEvent.click(button);
      });
      
      const option1 = screen.getByText('Option 1');
      
      await act(async () => {
        fireEvent.click(option1);
      });
      
      expect(onChange).toHaveBeenCalledWith(['option1']);
    });

    it('displays selected options as tags', () => {
      render(<MultiSelect {...defaultProps} value={['option1', 'option2']} />);
      
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('shows search input when searchable is true', async () => {
      render(<MultiSelect {...defaultProps} searchable />);
      
      const button = screen.getByRole('button');
      
      await act(async () => {
        fireEvent.click(button);
      });
      
      const searchInput = screen.getByPlaceholderText('Search options...');
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('disables multiselect when disabled prop is true', () => {
      render(<MultiSelect {...defaultProps} disabled />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('displays error message', () => {
      render(<MultiSelect {...defaultProps} error="This field is required" />);
      
      const errorMessage = screen.getByText('This field is required');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<MultiSelect {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
    });
  });
});
}