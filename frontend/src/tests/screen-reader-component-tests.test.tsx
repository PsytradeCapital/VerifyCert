/**
 * Screen Reader Component Tests
 * 
 * Comprehensive test suite for screen reader compatibility across all UI components
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ScreenReaderTester, MockScreenReader } from './screen-reader-testing';
import { Button } from '../components/ui/Button/Button';
import { Modal } from '../components/ui/Modal/Modal';
import Select from '../components/ui/Select/Select';
import Input from '../components/ui/Input/Input';
import Card from '../components/ui/Card/Card';
import Navigation from '../components/Navigation';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Mock dependencies
jest.mock('framer-motion', () => ({
  motion: {
    button: 'button',
    div: 'div',
    span: 'span'
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../utils/interactionAnimations', () => ({
  buttonInteractions: {
    primary: {},
    secondary: {},
    tertiary: {},
    danger: {}
  },
  selectInteractions: {
    trigger: {},
    option: {}
  }
}));

describe('Screen Reader Component Tests', () => {
  let screenReaderTester: ScreenReaderTester;
  let mockScreenReader: MockScreenReader;

  beforeEach(() => {
    screenReaderTester = new ScreenReaderTester();
    mockScreenReader = new MockScreenReader();
    
    // Clear any existing announcements
    mockScreenReader.clearAnnouncements();
    
    // Setup DOM for testing
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Button Component', () => {
    test('should be accessible to screen readers', async () => {
      const { container } = render(
        <Button aria-label="Test button">Click me</Button>
      );
      
      const buttonElement = container.querySelector('button')!;
      const result = await screenReaderTester.testComponent(buttonElement, 'Button - Basic');
      
      expect(result.passed).toBe(true);
      expect(result.issues).toHaveLength(0);
      
      // Test screen reader announcement
      const announcement = mockScreenReader.readElement(buttonElement);
      expect(announcement).toContain('Test button');
      expect(announcement).toContain('button');
    });

    test('should handle loading state accessibility', async () => {
      const { container } = render(
        <Button loading aria-label="Loading button">Submit</Button>
      );
      
      const buttonElement = container.querySelector('button')!;
      const result = await screenReaderTester.testComponent(buttonElement, 'Button - Loading');
      
      expect(result.passed).toBe(true);
      
      // Check for loading announcement
      const loadingText = container.querySelector('.sr-only');
      expect(loadingText).toHaveTextContent('Loading...');
    });

    test('should handle disabled state accessibility', async () => {
      const { container } = render(
        <Button disabled aria-label="Disabled button">Disabled</Button>
      );
      
      const buttonElement = container.querySelector('button')!;
      const result = await screenReaderTester.testComponent(buttonElement, 'Button - Disabled');
      
      expect(result.passed).toBe(true);
      expect(buttonElement).toBeDisabled();
      
      const announcement = mockScreenReader.readElement(buttonElement);
      expect(announcement).toContain('disabled');
    });

    test('should handle ARIA states correctly', async () => {
      const { container } = render(
        <Button 
          aria-label="Toggle button" 
          aria-pressed={true}
          aria-expanded={false}
        >
          Toggle
        </Button>
      );
      
      const buttonElement = container.querySelector('button')!;
      const result = await screenReaderTester.testComponent(buttonElement, 'Button - ARIA States');
      
      expect(result.passed).toBe(true);
      expect(buttonElement).toHaveAttribute('aria-pressed', 'true');
      expect(buttonElement).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Modal Component', () => {
    test('should be accessible to screen readers', async () => {
      const onClose = jest.fn();
      const { container } = render(
        <Modal isOpen={true} onClose={onClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );
      
      const modalElement = container.querySelector('[role="dialog"]')!;
      const result = await screenReaderTester.testComponent(modalElement, 'Modal - Basic');
      
      expect(result.passed).toBe(true);
      expect(modalElement).toHaveAttribute('role', 'dialog');
      expect(modalElement).toHaveAttribute('aria-modal', 'true');
      expect(modalElement).toHaveAttribute('aria-labelledby');
    });

    test('should handle focus management', async () => {
      const onClose = jest.fn();
      const { container } = render(
        <Modal isOpen={true} onClose={onClose} title="Focus Test Modal">
          <button>First button</button>
          <button>Second button</button>
        </Modal>
      );
      
      const modalElement = container.querySelector('[role="dialog"]')!;
      const result = await screenReaderTester.testComponent(modalElement, 'Modal - Focus Management');
      
      expect(result.passed).toBe(true);
      
      // Check that modal contains focusable elements
      const focusableElements = modalElement.querySelectorAll('button');
      expect(focusableElements.length).toBeGreaterThan(0);
    });

    test('should handle escape key accessibility', async () => {
      const onClose = jest.fn();
      const { container } = render(
        <Modal isOpen={true} onClose={onClose} title="Escape Test Modal">
          <p>Press escape to close</p>
        </Modal>
      );
      
      const modalElement = container.querySelector('[role="dialog"]')!;
      
      // Simulate escape key press
      fireEvent.keyDown(modalElement, { key: 'Escape' });
      
      expect(onClose).toHaveBeenCalled();
    });

    test('should provide proper screen reader descriptions', async () => {
      const onClose = jest.fn();
      const { container } = render(
        <Modal isOpen={true} onClose={onClose} title="Description Test Modal">
          <p>Modal with description</p>
        </Modal>
      );
      
      const modalElement = container.querySelector('[role="dialog"]')!;
      const describedBy = modalElement.getAttribute('aria-describedby');
      
      expect(describedBy).toBeTruthy();
      
      const descriptionElement = document.getElementById(describedBy!);
      expect(descriptionElement).toBeInTheDocument();
      expect(descriptionElement).toHaveClass('sr-only');
    });
  });

  describe('Select Component', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' }
    ];

    test('should be accessible to screen readers', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <Select 
          options={options} 
          onChange={onChange}
          label="Test Select"
          placeholder="Choose an option"
        />
      );
      
      const selectButton = container.querySelector('button')!;
      const result = await screenReaderTester.testComponent(selectButton, 'Select - Basic');
      
      expect(result.passed).toBe(true);
      expect(selectButton).toHaveAttribute('aria-expanded', 'false');
      expect(selectButton).toHaveAttribute('aria-haspopup', 'listbox');
    });

    test('should handle keyboard navigation', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <Select 
          options={options} 
          onChange={onChange}
          label="Keyboard Test Select"
        />
      );
      
      const selectButton = container.querySelector('button')!;
      
      // Test arrow down to open
      fireEvent.keyDown(selectButton, { key: 'ArrowDown' });
      
      await waitFor(() => {
        expect(selectButton).toHaveAttribute('aria-expanded', 'true');
      });
      
      // Test escape to close
      fireEvent.keyDown(selectButton, { key: 'Escape' });
      
      await waitFor(() => {
        expect(selectButton).toHaveAttribute('aria-expanded', 'false');
      });
    });

    test('should handle option selection with keyboard', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <Select 
          options={options} 
          onChange={onChange}
          label="Option Selection Test"
        />
      );
      
      const selectButton = container.querySelector('button')!;
      
      // Open dropdown
      fireEvent.keyDown(selectButton, { key: 'ArrowDown' });
      
      await waitFor(() => {
        expect(selectButton).toHaveAttribute('aria-expanded', 'true');
      });
      
      // Select first option with Enter
      fireEvent.keyDown(selectButton, { key: 'Enter' });
      
      expect(onChange).toHaveBeenCalledWith('option1');
    });

    test('should provide proper ARIA attributes for options', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <Select 
          options={options} 
          onChange={onChange}
          label="ARIA Options Test"
        />
      );
      
      const selectButton = container.querySelector('button')!;
      
      // Open dropdown
      fireEvent.click(selectButton);
      
      await waitFor(() => {
        const listbox = container.querySelector('[role="listbox"]');
        expect(listbox).toBeInTheDocument();
        
        const optionElements = container.querySelectorAll('[role="option"]');
        expect(optionElements).toHaveLength(options.length);
        
        optionElements.forEach((option, index) => {
          expect(option).toHaveAttribute('aria-selected');
          expect(option).toHaveAttribute('tabIndex', '-1');
        });
      });
    });

    test('should handle searchable select accessibility', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <Select 
          options={options} 
          onChange={onChange}
          label="Searchable Select"
          searchable={true}
        />
      );
      
      const selectButton = container.querySelector('button')!;
      
      // Open dropdown
      fireEvent.click(selectButton);
      
      await waitFor(() => {
        const searchInput = container.querySelector('input[type="text"]');
        expect(searchInput).toBeInTheDocument();
        expect(searchInput).toHaveAttribute('aria-label');
        expect(searchInput).toHaveAttribute('aria-describedby');
      });
    });
  });

  describe('Input Component', () => {
    test('should be accessible to screen readers', async () => {
      const { container } = render(
        <Input 
          label="Test Input"
          placeholder="Enter text"
          helperText="This is helper text"
        />
      );
      
      const inputElement = container.querySelector('input')!;
      const result = await screenReaderTester.testComponent(inputElement, 'Input - Basic');
      
      expect(result.passed).toBe(true);
      expect(inputElement).toHaveAttribute('aria-labelledby');
      expect(inputElement).toHaveAttribute('aria-describedby');
    });

    test('should handle error state accessibility', async () => {
      const { container } = render(
        <Input 
          label="Error Input"
          error="This field is required"
          value=""
        />
      );
      
      const inputElement = container.querySelector('input')!;
      const result = await screenReaderTester.testComponent(inputElement, 'Input - Error State');
      
      expect(result.passed).toBe(true);
      expect(inputElement).toHaveAttribute('aria-invalid', 'true');
      expect(inputElement).toHaveAttribute('aria-describedby');
      
      // Check for error message
      const errorElement = container.querySelector('[role="alert"]');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent('This field is required');
    });

    test('should handle required field accessibility', async () => {
      const { container } = render(
        <Input 
          label="Required Input"
          required={true}
        />
      );
      
      const inputElement = container.querySelector('input')!;
      const result = await screenReaderTester.testComponent(inputElement, 'Input - Required');
      
      expect(result.passed).toBe(true);
      expect(inputElement).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Card Component', () => {
    test('should be accessible when interactive', async () => {
      const onClick = jest.fn();
      const { container } = render(
        <Card 
          onClick={onClick}
          aria-label="Interactive card"
          role="button"
          tabIndex={0}
        >
          <h3>Card Title</h3>
          <p>Card content</p>
        </Card>
      );
      
      const cardElement = container.querySelector('[role="button"]')!;
      const result = await screenReaderTester.testComponent(cardElement, 'Card - Interactive');
      
      expect(result.passed).toBe(true);
      expect(cardElement).toHaveAttribute('role', 'button');
      expect(cardElement).toHaveAttribute('tabIndex', '0');
      expect(cardElement).toHaveAttribute('aria-label', 'Interactive card');
    });

    test('should handle keyboard interaction', async () => {
      const onClick = jest.fn();
      const { container } = render(
        <Card 
          onClick={onClick}
          aria-label="Keyboard card"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick();
            }
          }}
        >
          <h3>Keyboard Card</h3>
        </Card>
      );
      
      const cardElement = container.querySelector('[role="button"]')!;
      
      // Test Enter key
      fireEvent.keyDown(cardElement, { key: 'Enter' });
      expect(onClick).toHaveBeenCalled();
      
      // Test Space key
      onClick.mockClear();
      fireEvent.keyDown(cardElement, { key: ' ' });
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('Navigation Component', () => {
    test('should be accessible to screen readers', async () => {
      const { container } = render(
        <BrowserRouter>
          <Navigation 
            walletAddress="0x123"
            isWalletConnected={true}
            onWalletConnect={jest.fn()}
            onWalletDisconnect={jest.fn()}
          />
        </BrowserRouter>
      );
      
      const navElement = container.querySelector('nav')!;
      const result = await screenReaderTester.testComponent(navElement, 'Navigation - Basic');
      
      expect(result.passed).toBe(true);
      expect(navElement).toHaveAttribute('role', 'navigation');
      expect(navElement).toHaveAttribute('aria-label');
    });

    test('should handle mobile menu accessibility', async () => {
      const { container } = render(
        <BrowserRouter>
          <Navigation 
            walletAddress="0x123"
            isWalletConnected={true}
            onWalletConnect={jest.fn()}
            onWalletDisconnect={jest.fn()}
          />
        </BrowserRouter>
      );
      
      const mobileMenuButton = container.querySelector('button[aria-expanded]')!;
      expect(mobileMenuButton).toBeInTheDocument();
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
      expect(mobileMenuButton).toHaveAttribute('aria-controls');
      expect(mobileMenuButton).toHaveAttribute('aria-label');
      
      // Test opening mobile menu
      fireEvent.click(mobileMenuButton);
      
      await waitFor(() => {
        expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true');
      });
    });

    test('should provide proper navigation landmarks', async () => {
      const { container } = render(
        <BrowserRouter>
          <Navigation 
            walletAddress="0x123"
            isWalletConnected={true}
            onWalletConnect={jest.fn()}
            onWalletDisconnect={jest.fn()}
          />
        </BrowserRouter>
      );
      
      // Check for navigation landmark
      const navElement = container.querySelector('nav[role="navigation"]');
      expect(navElement).toBeInTheDocument();
      
      // Check for menu structure
      const menuElements = container.querySelectorAll('[role="menubar"], [role="menu"]');
      expect(menuElements.length).toBeGreaterThan(0);
    });
  });

  describe('Live Region Testing', () => {
    test('should handle live region announcements', async () => {
      // Create a component with live region
      const TestComponent = () => {
        const [message, setMessage] = React.useState('');
        
        return (
          <div>
            <button onClick={() => setMessage('Success! Data has been saved.')}>
              Save Data
            </button>
            <div aria-live="polite" aria-atomic="true">
              {message}
            </div>
          </div>
        );
      };
      
      const { container } = render(<TestComponent />);
      
      const button = container.querySelector('button')!;
      const liveRegion = container.querySelector('[aria-live]')!;
      
      // Test live region setup
      const result = await screenReaderTester.testComponent(liveRegion, 'Live Region - Setup');
      expect(result.passed).toBe(true);
      
      // Clear announcements
      mockScreenReader.clearAnnouncements();
      
      // Trigger announcement
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent('Success! Data has been saved.');
      });
      
      // Check that announcement was made
      const announcements = mockScreenReader.getAnnouncements();
      expect(announcements.length).toBeGreaterThan(0);
      expect(announcements[0].text).toContain('Success');
      expect(announcements[0].priority).toBe('polite');
    });
  });

  describe('Form Accessibility', () => {
    test('should handle form validation accessibility', async () => {
      const TestForm = () => {
        const [email, setEmail] = React.useState('');
        const [error, setError] = React.useState('');
        
        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          if (!email.includes('@')) {
            setError('Please enter a valid email address');
          } else {
            setError('');
          }
        };
        
        return (
          <form onSubmit={handleSubmit}>
            <Input
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              required
            />
            <Button type="submit">Submit</Button>
          </form>
        );
      };
      
      const { container } = render(<TestForm />);
      
      const form = container.querySelector('form')!;
      const input = container.querySelector('input')!;
      const submitButton = container.querySelector('button[type="submit"]')!;
      
      // Test form accessibility
      const result = await screenReaderTester.testComponent(form, 'Form - Validation');
      expect(result.passed).toBe(true);
      
      // Test validation error
      fireEvent.change(input, { target: { value: 'invalid-email' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true');
        const errorElement = container.querySelector('[role="alert"]');
        expect(errorElement).toBeInTheDocument();
      });
    });
  });

  describe('Comprehensive Component Testing', () => {
    test('should generate comprehensive accessibility report', async () => {
      // Test multiple components
      const components = [
        { name: 'Button', element: render(<Button>Test</Button>).container.querySelector('button')! },
        { name: 'Input', element: render(<Input label="Test" />).container.querySelector('input')! },
        { name: 'Select', element: render(<Select options={[]} />).container.querySelector('button')! }
      ];
      
      // Test each component
      for (const { name, element } of components) {
        await screenReaderTester.testComponent(element, `${name} - Comprehensive`);
      }
      
      // Generate report
      const report = screenReaderTester.generateReport();
      
      expect(report.summary.totalTests).toBe(components.length);
      expect(report.testResults).toHaveLength(components.length);
      expect(report.recommendations).toBeDefined();
      expect(report.timestamp).toBeDefined();
      
      // Log report for manual review
      console.log('Screen Reader Accessibility Report:', JSON.stringify(report, null, 2));
    });
  });
});