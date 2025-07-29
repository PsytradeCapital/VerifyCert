import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { useNavigationTransitions } from '../useNavigationTransitions';

// Test component that uses the navigation transitions hook
const TestComponent: React.FC = () => {
  const location = useLocation();
  const {
    transition,
    triggerTransition,
    getTransitionClasses,
    getPageTransitionVariants,
    getPageTransition,
    navigationHistory
  } = useNavigationTransitions({
    transitionDuration: 100, // Short duration for testing
    enableTransitions: true
  });

  return (
    <div>
      <div data-testid="current-path">{location.pathname}</div>
      <div data-testid="is-transitioning">{transition.isTransitioning.toString()}</div>
      <div data-testid="transition-direction">{transition.transitionDirection}</div>
      <div data-testid="previous-path">{transition.previousPath || 'none'}</div>
      <div data-testid="history-length">{navigationHistory.length}</div>
      <div data-testid="transition-classes">{getTransitionClasses('base-class')}</div>
      
      <button onClick={() => triggerTransition('forward')}>Trigger Forward</button>
      <button onClick={() => triggerTransition('backward')}>Trigger Backward</button>
      
      <div data-testid="page-variants">
        {JSON.stringify(getPageTransitionVariants())}
      </div>
      <div data-testid="page-transition">
        {JSON.stringify(getPageTransition())}
      </div>
    </div>
  );
};

const renderWithRouter = (component: React.ReactElement, initialPath = '/') => {
  window.history.pushState({}, 'Test page', initialPath);
  
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('useNavigationTransitions', () => {
  beforeEach(() => {
    window.history.pushState({}, 'Test page', '/');
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should provide initial transition state', () => {
    renderWithRouter(<TestComponent />);

    expect(screen.getByTestId('current-path')).toHaveTextContent('/');
    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false');
    expect(screen.getByTestId('transition-direction')).toHaveTextContent('none');
    expect(screen.getByTestId('previous-path')).toHaveTextContent('none');
    expect(screen.getByTestId('history-length')).toHaveTextContent('1');
  });

  it('should trigger manual transitions', () => {
    renderWithRouter(<TestComponent />);

    const forwardButton = screen.getByText('Trigger Forward');
    
    act(() => {
      forwardButton.click();
    });

    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('true');
    expect(screen.getByTestId('transition-direction')).toHaveTextContent('forward');

    // Fast-forward time to end transition
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false');
    expect(screen.getByTestId('transition-direction')).toHaveTextContent('none');
  });

  it('should trigger backward transitions', () => {
    renderWithRouter(<TestComponent />);

    const backwardButton = screen.getByText('Trigger Backward');
    
    act(() => {
      backwardButton.click();
    });

    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('true');
    expect(screen.getByTestId('transition-direction')).toHaveTextContent('backward');

    // Fast-forward time to end transition
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false');
    expect(screen.getByTestId('transition-direction')).toHaveTextContent('none');
  });

  it('should generate transition classes', () => {
    renderWithRouter(<TestComponent />);

    const classes = screen.getByTestId('transition-classes').textContent;
    expect(classes).toContain('base-class');
    expect(classes).toContain('opacity-100');
  });

  it('should generate page transition variants', () => {
    renderWithRouter(<TestComponent />);

    const variants = JSON.parse(screen.getByTestId('page-variants').textContent || '{}');
    
    expect(variants).toHaveProperty('initial');
    expect(variants).toHaveProperty('in');
    expect(variants).toHaveProperty('out');
    expect(variants.initial).toHaveProperty('opacity', 0);
    expect(variants.in).toHaveProperty('opacity', 1);
    expect(variants.out).toHaveProperty('opacity', 0);
  });

  it('should generate page transition config', () => {
    renderWithRouter(<TestComponent />);

    const transition = JSON.parse(screen.getByTestId('page-transition').textContent || '{}');
    
    expect(transition).toHaveProperty('type', 'tween');
    expect(transition).toHaveProperty('ease', 'anticipate');
    expect(transition).toHaveProperty('duration', 0.1); // 100ms / 1000
  });

  it('should handle disabled transitions', () => {
    const TestDisabledComponent: React.FC = () => {
      const { transition, triggerTransition } = useNavigationTransitions({
        enableTransitions: false
      });

      return (
        <div>
          <div data-testid="is-transitioning">{transition.isTransitioning.toString()}</div>
          <button onClick={() => triggerTransition('forward')}>Trigger</button>
        </div>
      );
    };

    renderWithRouter(<TestDisabledComponent />);

    const triggerButton = screen.getByText('Trigger');
    
    act(() => {
      triggerButton.click();
    });

    // Should not transition when disabled
    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false');
  });

  it('should update transition classes during transition', () => {
    renderWithRouter(<TestComponent />);

    const forwardButton = screen.getByText('Trigger Forward');
    
    act(() => {
      forwardButton.click();
    });

    const classes = screen.getByTestId('transition-classes').textContent;
    expect(classes).toContain('transition-all');
    expect(classes).toContain('duration-300');
    expect(classes).toContain('ease-in-out');
  });
});