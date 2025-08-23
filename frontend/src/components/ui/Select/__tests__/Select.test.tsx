import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Select, { SelectOption } from '../Select';

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

describe('Select Component', () => {
  const defaultProps = {
    options: mockOptions,
    'data-testid': 'test-select'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('renders correctly with default props', () => {
      render(<Select {...defaultProps} />);
      
      const select = screen.getByTestId('test-select');
      expect(select).toBeInTheDocument();
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Select an option');
    });

    it('renders with custom placeholder', () => {
      render(<Select {...defaultProps} placeholder="Choose an option" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Choose an option');
    });

    it('renders with label', () => {
      render(<Select {...defaultProps} label="Test Label" />);
      
      const label = screen.getByText('Test Label');
      expect(label).toBeInTheDocument();
      expect(label.tagName).toBe('LABEL');
    });

    it('opens dropdown when clicked', async () => {
      render(<Select {...defaultProps} />);
      
      const button = screen.getByRole('button');
      
      await act(async () => {
        fireEvent.click(button);
      });
      
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('closes dropdown when clicking outside', async () => {
      render(
        <div>
          <Select {...defaultProps} />
          <div data-testid="outside">Outside</div>
        </div>
      );
      
      const button = screen.getByRole('button');
      
      await act(async () => {
        fireEvent.click(button);
      });
      
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      
      const outside = screen.getByTestId('outside');
      
      await act(async () => {
        fireEvent.mouseDown(outside);
      });
      
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Option Selection', () => {
    it('selects option when clicked', async () => {
      const onChange = jest.fn();
      render(<Select {...defaultProps} onChange={onChange} />);
      
      const button = screen.getByRole('button');
      
      await act(async () => {
        fireEvent.click(button);
      });
      
      const option1 = screen.getByText('Option 1');
      
      await act(async () => {
        fireEvent.click(option1);
      });
      
      expect(onChange).toHaveBeenCalledWith('option1');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('displays selected option', () => {
      render(<Select {...defaultProps} value="option2" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Option 2');
    });

    it('does not select disabled option', async () => {
      const onChange = jest.fn();
      render(<Select {...defaultProps} onChange={onChange} />);
      
      const button = screen.getByRole('button');
      
      await act(async () => {
        fireEvent.click(button);
      });
      
      const disabledOption = screen.getByText('Option 3');
      
      await act(async () => {
        fireEvent.click(disabledOption);
      });
      
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Search Functionality', () => {
    it('shows search input when searchable is true', async () => {
      render(<Select {...defaultProps} searchable />);
      
      const button = screen.getByRole('button');
      
      await act(async () => {
        fireEvent.click(button);
      });
      
      const searchInput = screen.getByPlaceholderText('Search options...');
      expect(searchInput).toBeInTheDocument();
    });

    it('filters options based on search term', async () => {
      render(<Select {...defaultProps} searchable />);
      
      const button = screen.getByRole('button');
      
      await act(async () => {
        fireEvent.click(button);
      });
      
      const searchInput = screen.getByPlaceholderText('Search options...');
      
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'Option 1' } });
      });
      
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
    });
  });

  describe('Clearable Functionality', () => {
    it('shows clear button when clearable and has value', () => {
      render(<Select {...defaultProps} value="option1" clearable />);
      
      const clearButton = screen.getByLabelText('Clear selection');
      expect(clearButton).toBeInTheDocument();
    });

    it('clears selection when clear button is clicked', async () => {
      const onChange = jest.fn();
      render(<Select {...defaultProps} value="option1" clearable onChange={onChange} />);
      
      const clearButton = screen.getByLabelText('Clear selection');
      
      await act(async () => {
        fireEvent.click(clearButton);
      });
      
      expect(onChange).toHaveBeenCalledWith('');
    });
  });

  describe('Disabled State', () => {
    it('disables select when disabled prop is true', () => {
      render(<Select {...defaultProps} disabled />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('displays error message', () => {
      render(<Select {...defaultProps} error="This field is required" />);
      
      const errorMessage = screen.getByText('This field is required');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Select {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
    });
  });
});
}