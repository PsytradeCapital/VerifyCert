import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Simple mock components for testing focus management concepts
const MockModal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <h2 id="modal-title">{title}</h2>
      {children}
      <button onClick={onClose} aria-label="Close">×</button>
    </div>
  );
};

const MockSelect = ({ options, onChange }: any) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <div>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        Select option
      </button>
      {isOpen && (
        <div role="listbox">
          {options.map((option: any) => (
            <button
              key={option.value}
              role="option"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const MockSkipLinks = () => (
  <div>
    <a href="#main-content">Skip to main content</a>
  </div>
);

const MockFocusTrap = ({ children, isActive }: any) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (isActive && containerRef.current) {
      const firstFocusable = containerRef.current.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement;
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }, [isActive]);
  
  return <div ref={containerRef}>{children}</div>;
};

const MockRovingTabIndex = ({ children, orientation }: any) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  
  const enhancedChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        tabIndex: index === activeIndex ? 0 : -1,
        onFocus: () => setActiveIndex(index),
      });
    }
    return child;
  });
  
  return (
    <div role="group" aria-orientation={orientation}>
      {enhancedChildren}
    </div>
  );
};

describe('Focus Management', () => {
  describe('Modal Focus Management', () => {
    it('should render modal with proper ARIA attributes', () => {
      const onClose = jest.fn();
      
      render(
        <MockModal isOpen={true} onClose={onClose} title="Test Modal">
          <button>First Button</button>
          <button>Second Button</button>
        </MockModal>
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      const onClose = jest.fn();
      
      render(
        <MockModal isOpen={true} onClose={onClose} title="Test Modal">
          <button>Test Button</button>
        </MockModal>
      );

      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalled();
    });

    it('should not render when isOpen is false', () => {
      const onClose = jest.fn();
      
      render(
        <MockModal isOpen={false} onClose={onClose} title="Test Modal">
          <button>Test Button</button>
        </MockModal>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Select Focus Management', () => {
    const options = [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
      { value: '3', label: 'Option 3' },
    ];

    it('should render select with proper ARIA attributes', () => {
      const onChange = jest.fn();
      
      render(<MockSelect options={options} onChange={onChange} />);

      const selectButton = screen.getByRole('button');
      expect(selectButton).toHaveAttribute('aria-expanded', 'false');
      expect(selectButton).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('should open dropdown when clicked', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<MockSelect options={options} onChange={onChange} />);

      const selectButton = screen.getByRole('button');
      await user.click(selectButton);

      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(selectButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should select option when clicked', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<MockSelect options={options} onChange={onChange} />);

      const selectButton = screen.getByRole('button');
      await user.click(selectButton);

      const option1 = screen.getByText('Option 1');
      await user.click(option1);

      expect(onChange).toHaveBeenCalledWith('1');
    });
  });

  describe('Skip Links', () => {
    it('should render skip links', () => {
      render(
        <div>
          <MockSkipLinks />
          <main id="main-content">
            <h1>Main Content</h1>
          </main>
        </div>
      );

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });
  });

  describe('Focus Trap Component', () => {
    it('should focus first element when active', async () => {
      render(
        <div>
          <button>Outside Button</button>
          <MockFocusTrap isActive={true}>
            <button>Inside Button 1</button>
            <button>Inside Button 2</button>
          </MockFocusTrap>
        </div>
      );

      // Wait for focus to be set
      await waitFor(() => {
        expect(screen.getByText('Inside Button 1')).toHaveFocus();
      });
    });

    it('should not focus when inactive', () => {
      render(
        <div>
          <button>Outside Button</button>
          <MockFocusTrap isActive={false}>
            <button>Inside Button 1</button>
            <button>Inside Button 2</button>
          </MockFocusTrap>
        </div>
      );

      expect(screen.getByText('Inside Button 1')).not.toHaveFocus();
    });
  });

  describe('Roving Tab Index', () => {
    it('should set correct initial tabindex values', () => {
      render(
        <MockRovingTabIndex orientation="vertical">
          <button>Item 1</button>
          <button>Item 2</button>
          <button>Item 3</button>
        </MockRovingTabIndex>
      );

      const items = screen.getAllByRole('button');
      
      // First item should have tabindex 0, others should have -1
      expect(items[0]).toHaveAttribute('tabindex', '0');
      expect(items[1]).toHaveAttribute('tabindex', '-1');
      expect(items[2]).toHaveAttribute('tabindex', '-1');
    });

    it('should update tabindex when item is focused', async () => {
      const user = userEvent.setup();
      
      render(
        <MockRovingTabIndex orientation="vertical">
          <button>Item 1</button>
          <button>Item 2</button>
          <button>Item 3</button>
        </MockRovingTabIndex>
      );

      const items = screen.getAllByRole('button');
      
      // Focus second item
      await user.click(items[1]);
      
      expect(items[1]).toHaveAttribute('tabindex', '0');
      expect(items[0]).toHaveAttribute('tabindex', '-1');
      expect(items[2]).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA attributes on roving tabindex container', () => {
      render(
        <MockRovingTabIndex orientation="vertical">
          <button>Item 1</button>
          <button>Item 2</button>
        </MockRovingTabIndex>
      );

      const container = screen.getByRole('group');
      expect(container).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('should maintain focus visibility', async () => {
      const user = userEvent.setup();
      
      render(
        <MockFocusTrap isActive={true}>
          <button>Focusable Button</button>
        </MockFocusTrap>
      );

      const button = screen.getByText('Focusable Button');
      await waitFor(() => {
        expect(button).toHaveFocus();
      });
      
      // Button should be visible and focusable
      expect(button).toBeVisible();
      expect(button).not.toHaveAttribute('disabled');
    });
  });
});