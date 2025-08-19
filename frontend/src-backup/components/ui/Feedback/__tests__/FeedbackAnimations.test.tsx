import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FeedbackProvider, useFeedback } from '../FeedbackManager';
import { FeedbackAnimation } from '../FeedbackAnimations';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Test component that uses the feedback system
const TestComponent: React.FC = () => {
  const feedback = useFeedback();

  return (
    <div>
      <button
        onClick={() => feedback.showSuccess('Test success message')}
        data-testid="success-button"
      >
        Show Success
      </button>
      <button
        onClick={() => feedback.showError('Test error message')}
        data-testid="error-button"
      >
        Show Error
      </button>
      <button
        onClick={() => feedback.showInfo('Test loading message')}
        data-testid="loading-button"
      >
        Show Loading
      </button>
      <button
        onClick={() => feedback.dismissAll()}
        data-testid="dismiss-all-button"
      >
        Dismiss All
      </button>
    </div>
  );
};

describe('FeedbackAnimations', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <FeedbackProvider>
        {component}
      </FeedbackProvider>
    );
  };

  test('renders FeedbackAnimation component', () => {
    const onClose = jest.fn();
    render(
      <FeedbackAnimation
        type="success"
        message="Test message"
        isVisible={true}
        onClose={onClose}
      />
    );

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  test('shows success feedback when button is clicked', async () => {
    renderWithProvider(<TestComponent />);

    const successButton = screen.getByTestId('success-button');
    fireEvent.click(successButton);

    await waitFor(() => {
      expect(screen.getByText('Test success message')).toBeInTheDocument();
    });
  });

  test('shows error feedback when button is clicked', async () => {
    renderWithProvider(<TestComponent />);

    const errorButton = screen.getByTestId('error-button');
    fireEvent.click(errorButton);

    await waitFor(() => {
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });
  });

  test('shows loading feedback when button is clicked', async () => {
    renderWithProvider(<TestComponent />);

    const loadingButton = screen.getByTestId('loading-button');
    fireEvent.click(loadingButton);

    await waitFor(() => {
      expect(screen.getByText('Test loading message')).toBeInTheDocument();
    });
  });

  test('dismisses all feedback when dismiss all is clicked', async () => {
    renderWithProvider(<TestComponent />);

    // Show some feedback first
    const successButton = screen.getByTestId('success-button');
    fireEvent.click(successButton);

    await waitFor(() => {
      expect(screen.getByText('Test success message')).toBeInTheDocument();
    });

    // Dismiss all
    const dismissAllButton = screen.getByTestId('dismiss-all-button');
    fireEvent.click(dismissAllButton);

    await waitFor(() => {
      expect(screen.queryByText('Test success message')).not.toBeInTheDocument();
    });
  });

  test('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(
      <FeedbackAnimation
        type="info"
        message="Test message"
        isVisible={true}
        onClose={onClose}
        showCloseButton={true}
      />
    );

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  test('does not show close button when showCloseButton is false', () => {
    render(
      <FeedbackAnimation
        type="info"
        message="Test message"
        isVisible={true}
        showCloseButton={false}
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('shows action button when action is provided', () => {
    const actionClick = jest.fn();
    render(
      <FeedbackAnimation
        type="info"
        message="Test message"
        isVisible={true}
        action={{
          label: 'Test Action',
          onClick: actionClick,
        }}
      />
    );

    const actionButton = screen.getByText('Test Action');
    expect(actionButton).toBeInTheDocument();

    fireEvent.click(actionButton);
    expect(actionClick).toHaveBeenCalled();
  });
});