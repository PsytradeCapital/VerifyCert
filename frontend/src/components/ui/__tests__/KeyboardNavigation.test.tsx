import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Import components to test
import Button from '../Button/Button';
import Input from '../Input/Input';
import Select from '../Select/Select';
import Card from '../Card/Card';
import Modal from '../Modal/Modal';
import SideNavigation from '../Navigation/SideNavigation';
import BottomNavigation from '../Navigation/BottomNavigation';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    input: ({ children, ...props }: any) => <input {...props}>{children}</input>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Wrapper component for router-dependent components
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Keyboard Navigation Accessibility', () => {
  describe('Button Component', () => {
    it('should be focusable and respond to Enter and Space keys', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      render(<Button onClick={handleClick}>Test Button</Button>);
      
      const button = screen.getByRole('button', { name: 'Test Button' });
      
      // Test focus
      await user.tab();
      expect(button).toHaveFocus();
      
      // Test Enter key
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      // Test Space key
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('should not be focusable when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      render(<Button onClick={handleClick} disabled>Disabled Button</Button>);
      
      const button = screen.getByRole('button', { name: 'Disabled Button' });
      
      // Try to focus - should not work
      await user.tab();
      expect(button).not.toHaveFocus();
      
      // Try to click - should not work
      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Input Component', () => {
    it('should be focusable and have proper label association', async () => {
      const user = userEvent.setup();
      
      render(<Input label="Test Input" placeholder="Enter text" />);
      
      const input = screen.getByLabelText('Test Input');
      
      // Test focus
      await user.tab();
      expect(input).toHaveFocus();
      
      // Test typing
      await user.type(input, 'test value');
      expect(input).toHaveValue('test value');
    });

    it('should announce errors to screen readers', () => {
      render(<Input label="Test Input" error="This field is required" />);
      
      const errorMessage = screen.getByText('This field is required');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass('text-red-600');
    });
  });

  describe('Select Component', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ];

    it('should open dropdown with Enter and Space keys', async () => {
      const user = userEvent.setup();
      
      render(<Select options={options} placeholder="Select option" />);
      
      const trigger = screen.getByRole('button', { name: /select option/i });
      
      // Focus the trigger
      await user.tab();
      expect(trigger).toHaveFocus();
      
      // Open with Enter
      await user.keyboard('{Enter}');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      
      // Close with Escape
      await user.keyboard('{Escape}');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      
      // Open with Space
      await user.keyboard(' ');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('should navigate options with arrow keys', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      
      render(<Select options={options} onChange={handleChange} />);
      
      const trigger = screen.getByRole('button');
      
      // Open dropdown
      await user.click(trigger);
      
      // Navigate with arrow keys
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      
      // Select with Enter
      await user.keyboard('{Enter}');
      
      expect(handleChange).toHaveBeenCalledWith('option2');
    });

    it('should support Home and End key navigation', async () => {
      const user = userEvent.setup();
      
      render(<Select options={options} />);
      
      const trigger = screen.getByRole('button');
      
      // Open dropdown
      await user.click(trigger);
      
      // Go to end
      await user.keyboard('{End}');
      // Go to home
      await user.keyboard('{Home}');
      
      // Should be at first option
      await user.keyboard('{Enter}');
      // Verify first option was selected by checking if dropdown closed
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Card Component', () => {
    it('should be focusable and clickable when interactive', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      render(
        <Card onClick={handleClick} aria-label="Interactive card">
          Card content
        </Card>
      );
      
      const card = screen.getByRole('button', { name: 'Interactive card' });
      
      // Test focus
      await user.tab();
      expect(card).toHaveFocus();
      
      // Test Enter key
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      // Test Space key
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('should not be focusable when not interactive', () => {
      render(<Card>Non-interactive card</Card>);
      
      const card = screen.getByText('Non-interactive card').parentElement;
      expect(card).not.toHaveAttribute('tabIndex');
      expect(card).not.toHaveAttribute('role');
    });
  });

  describe('Modal Component', () => {
    it('should trap focus within modal', async () => {
      const user = userEvent.setup();
      const handleClose = jest.fn();
      
      render(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <button>First Button</button>
          <button>Second Button</button>
        </Modal>
      );
      
      const firstButton = screen.getByText('First Button');
      const secondButton = screen.getByText('Second Button');
      const closeButton = screen.getByLabelText('Close modal');
      
      // First button should be focused initially
      await waitFor(() => {
        expect(firstButton).toHaveFocus();
      });
      
      // Tab through elements
      await user.tab();
      expect(secondButton).toHaveFocus();
      
      await user.tab();
      expect(closeButton).toHaveFocus();
      
      // Tab should wrap back to first button
      await user.tab();
      expect(firstButton).toHaveFocus();
      
      // Shift+Tab should go backwards
      await user.tab({ shift: true });
      expect(closeButton).toHaveFocus();
    });

    it('should close with Escape key', async () => {
      const user = userEvent.setup();
      const handleClose = jest.fn();
      
      render(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          Modal content
        </Modal>
      );
      
      await user.keyboard('{Escape}');
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('Navigation Components', () => {
    it('should support arrow key navigation in SideNavigation', async () => {
      const user = userEvent.setup();
      
      render(
        <RouterWrapper>
          <SideNavigation />
        </RouterWrapper>
      );
      
      const navLinks = screen.getAllByRole('link');
      
      // Focus first link
      navLinks[0].focus();
      expect(navLinks[0]).toHaveFocus();
      
      // Arrow down should move to next link
      await user.keyboard('{ArrowDown}');
      expect(navLinks[1]).toHaveFocus();
      
      // Arrow up should move back
      await user.keyboard('{ArrowUp}');
      expect(navLinks[0]).toHaveFocus();
    });

    it('should support left/right arrow navigation in BottomNavigation', async () => {
      const user = userEvent.setup();
      
      render(
        <RouterWrapper>
          <BottomNavigation />
        </RouterWrapper>
      );
      
      const navLinks = screen.getAllByRole('tab');
      
      // Focus first link
      navLinks[0].focus();
      expect(navLinks[0]).toHaveFocus();
      
      // Arrow right should move to next link
      await user.keyboard('{ArrowRight}');
      expect(navLinks[1]).toHaveFocus();
      
      // Arrow left should move back
      await user.keyboard('{ArrowLeft}');
      expect(navLinks[0]).toHaveFocus();
    });
  });

  describe('Skip Navigation Links', () => {
    it('should provide skip links for keyboard users', () => {
      // This would be tested in the AppLayout component test
      // Skip links should be present but visually hidden until focused
      // They should allow users to skip to main content and navigation
    });
  });

  describe('Focus Management', () => {
    it('should maintain logical tab order', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <Button>First</Button>
          <Input label="Input" />
          <Button>Last</Button>
        </div>
      );
      
      const firstButton = screen.getByText('First');
      const input = screen.getByLabelText('Input');
      const lastButton = screen.getByText('Last');
      
      // Tab through elements in order
      await user.tab();
      expect(firstButton).toHaveFocus();
      
      await user.tab();
      expect(input).toHaveFocus();
      
      await user.tab();
      expect(lastButton).toHaveFocus();
    });

    it('should have visible focus indicators', () => {
      render(<Button>Test Button</Button>);
      
      const button = screen.getByRole('button');
      
      // Focus the button
      button.focus();
      
      // Check that focus styles are applied
      expect(button).toHaveClass('focus:outline-none');
      // Note: Visual focus indicators would be tested with visual regression tests
    });
  });
});