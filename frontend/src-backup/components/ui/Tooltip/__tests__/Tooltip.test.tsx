import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tooltip from '../Tooltip';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  AnimatePresence: ({ children }: any) => children
}));

describe('Tooltip Component', () => {
  const defaultProps = {
    content: 'Tooltip content',
    children: <button>Hover me</button>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders trigger element', () => {
    render(<Tooltip {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
  });

  it('shows tooltip on hover by default', async () => {
    render(<Tooltip {...defaultProps} />);
    
    const trigger = screen.getByRole('button');
    await userEvent.hover(trigger);
    
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByText('Tooltip content')).toBeInTheDocument();
    });
  });

  it('hides tooltip on mouse leave', async () => {
    render(<Tooltip {...defaultProps} />);
    
    const trigger = screen.getByRole('button');
    await userEvent.hover(trigger);
    
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
    
    await userEvent.unhover(trigger);
    
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('shows tooltip on click when trigger is click', async () => {
    render(<Tooltip {...defaultProps} trigger="click" />);
    
    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  it('toggles tooltip on multiple clicks when trigger is click', async () => {
    render(<Tooltip {...defaultProps} trigger="click" />);
    
    const trigger = screen.getByRole('button');
    
    // First click - show
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
    
    // Second click - hide
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('shows tooltip on focus when trigger is focus', async () => {
    render(<Tooltip {...defaultProps} trigger="focus" />);
    
    const trigger = screen.getByRole('button');
    await userEvent.tab(); // Focus the button
    
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  it('hides tooltip on blur when trigger is focus', async () => {
    render(<Tooltip {...defaultProps} trigger="focus" />);
    
    const trigger = screen.getByRole('button');
    await userEvent.tab(); // Focus the button
    
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
    
    await userEvent.tab(); // Blur the button
    
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('does not show tooltip when disabled', async () => {
    render(<Tooltip {...defaultProps} disabled />);
    
    const trigger = screen.getByRole('button');
    await userEvent.hover(trigger);
    
    // Wait a bit to ensure tooltip doesn't appear
    await new Promise(resolve => setTimeout(resolve, 300));
    
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('respects delay prop', async () => {
    render(<Tooltip {...defaultProps} delay={500} />);
    
    const trigger = screen.getByRole('button');
    await userEvent.hover(trigger);
    
    // Should not appear immediately
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    
    // Should appear after delay
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    }, { timeout: 600 });
  });

  it('applies custom className to trigger', () => {
    render(<Tooltip {...defaultProps} className="custom-trigger" />);
    const trigger = screen.getByRole('button').parentElement;
    expect(trigger).toHaveClass('custom-trigger');
  });

  it('applies custom tooltipClassName', async () => {
    render(<Tooltip {...defaultProps} tooltipClassName="custom-tooltip" />);
    
    const trigger = screen.getByRole('button');
    await userEvent.hover(trigger);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('custom-tooltip');
    });
  });

  it('renders without arrow when arrow is false', async () => {
    const user = userEvent.setup();
    render(<Tooltip {...defaultProps} arrow={false} />);
    
    const trigger = screen.getByRole('button');
    await user.hover(trigger);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip.querySelector('.absolute.w-2.h-2')).not.toBeInTheDocument();
    });
  });

  it('renders complex content', async () => {
    const complexContent = (
      <div>
        <strong>Title</strong>
        <p>Description</p>
      </div>
    );
    
    render(<Tooltip content={complexContent} children={<button>Hover</button> />);
    
    const trigger = screen.getByRole('button');
    await userEvent.hover(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });
  });

  it('handles different positions', async () => {
    const positions: Array<'top' | 'bottom' | 'left' | 'right'> = ['top', 'bottom', 'left', 'right'];
    
    for (const position of positions) {
      const { unmount } = render(
        <Tooltip {...defaultProps} position={position} />
      );
      
      const trigger = screen.getByRole('button');
      await userEvent.hover(trigger);
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
      
      unmount();
  });
});