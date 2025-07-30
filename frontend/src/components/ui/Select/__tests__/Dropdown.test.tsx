import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dropdown, { DropdownItem } from '../Dropdown';

const mockItems: DropdownItem[] = [
  { id: 'item1', label: 'Item 1', onClick: jest.fn() },
  { id: 'item2', label: 'Item 2', onClick: jest.fn(), icon: <span data-testid="item2-icon">📄</span> },
  { id: 'divider', label: '', divider: true },
  { id: 'item3', label: 'Item 3', onClick: jest.fn(), disabled: true },
  { id: 'item4', label: 'Item 4', onClick: jest.fn() }
];

describe('Dropdown Component', () => {
  const defaultProps = {
    trigger: <button data-testid="trigger">Trigger</button>,
    items: mockItems,
    'data-testid': 'test-dropdown'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('renders trigger element', () => {
      render(<Dropdown {...defaultProps} />);
      
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toBeInTheDocument();
    });

    it('opens dropdown when trigger is clicked', async () => {
      render(<Dropdown {...defaultProps} />);
      
      const trigger = screen.getByTestId('trigger');
      
      await act(async () => {
        fireEvent.click(trigger);
      });
      
      const menu = screen.getByRole('menu');
      expect(menu).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    it('closes dropdown when clicking outside', async () => {
      render(
        <div>
          <Dropdown {...defaultProps} />
          <div data-testid="outside">Outside</div>
        </div>
      );
      
      const trigger = screen.getByTestId('trigger');
      
      await act(async () => {
        fireEvent.click(trigger);
      });
      
      expect(screen.getByRole('menu')).toBeInTheDocument();
      
      const outside = screen.getByTestId('outside');
      
      await act(async () => {
        fireEvent.mouseDown(outside);
      });
      
      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });
  });

  describe('Item Interaction', () => {
    it('calls onClick when item is clicked', async () => {
      render(<Dropdown {...defaultProps} />);
      
      const trigger = screen.getByTestId('trigger');
      
      await act(async () => {
        fireEvent.click(trigger);
      });
      
      const item1 = screen.getByText('Item 1');
      
      await act(async () => {
        fireEvent.click(item1);
      });
      
      expect(mockItems[0].onClick).toHaveBeenCalled();
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('does not call onClick for disabled items', async () => {
      render(<Dropdown {...defaultProps} />);
      
      const trigger = screen.getByTestId('trigger');
      
      await act(async () => {
        fireEvent.click(trigger);
      });
      
      const disabledItem = screen.getByText('Item 3');
      
      await act(async () => {
        fireEvent.click(disabledItem);
      });
      
      expect(mockItems[3].onClick).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('does not open when disabled', async () => {
      render(<Dropdown {...defaultProps} disabled />);
      
      const trigger = screen.getByTestId('trigger');
      
      await act(async () => {
        fireEvent.click(trigger);
      });
      
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper role attributes', async () => {
      render(<Dropdown {...defaultProps} />);
      
      const trigger = screen.getByTestId('trigger');
      
      await act(async () => {
        fireEvent.click(trigger);
      });
      
      const menu = screen.getByRole('menu');
      expect(menu).toBeInTheDocument();
      
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems).toHaveLength(4); // Excluding divider
    });
  });
});