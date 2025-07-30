import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NavigationProvider } from '../../contexts/NavigationContext';
import { useNavigationTransitions } from '../useNavigationTransitions';

// Test component that uses the hook
const TestComponent: React.FC = () => {
  const { 
    navigateWithTransition, 
    transitionState, 
    getTransitionClasses,
    isAnimationEnabled,
    transitionDuration 
  } = useNavigationTransitions({
    enablePreloading: true,
    enableStaggeredAnimations: true,
    customDuration: 500
  });

  return (
    <div>
      <div data-testid="transition-state">
        {JSON.stringify(transitionState)}
      </div>
      <div data-testid="animation-enabled">
        {isAnimationEnabled.toString()}
      </div>
      <div data-testid="transition-duration">
        {transitionDuration}
      </div>
      <div 
        data-testid="transition-classes"
        className={getTransitionClasses('base-class', 0, 3)}
      >
        Transition Element
      </div>
      <button
        data-testid="navigate-forward"
        onClick={() => navigateWithTransition('/test', 'forward')}
      >
        Navigate Forward
      </button>
      <button
        data-testid="navigate-backward"
        onClick={() => navigateWithTransition('/test', 'backward')}
      >
        Navigate Backward
      </button>
      <button
        data-testid="navigate-immediate"
        onClick={() => navigateWithTransition('/test', 'forward', { immediate: true })}
      >
        Navigate Immediate
      </button>
    </div>
  );
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <NavigationProvider>
        {component}
      </NavigationProvider>
    </BrowserRouter>
  );
};

describe('useNavigationTransitions', () => {
  beforeEach(() => {
    // Reset any timers
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Hook initialization', () => {
    it('initializes with correct default values', () => {
      renderWithProviders(<TestComponent />);
      
      const transitionState = JSON.parse(screen.getByTestId('transition-state').textContent || '{}');
      expect(transitionState.isTransitioning).toBe(false);
      expect(transitionState.transitionDirection).toBe('none');
      expect(transitionState.transitionProgress).toBe(0);
      expect(transitionState.pendingNavigation).toBeNull();
    });

    it('applies custom duration setting', () => {
      renderWithProviders(<TestComponent />);
      
      // The custom duration should be applied
      expect(screen.getByTestId('transition-duration')).toHaveTextContent('500');
    });

    it('respects animation enabled state', () => {
      renderWithProviders(<TestComponent />);
      
      // Animation should be enabled by default
      expect(screen.getByTestId('animation-enabled')).toHaveTextContent('true');
    });
  });

  describe('Transition classes', () => {
    it('generates correct transition classes', () => {
      renderWithProviders(<TestComponent />);
      
      const element = screen.getByTestId('transition-classes');
      expect(element).toHaveClass('base-class');
      
      // Should include transition classes
      const classList = element.className;
      expect(classList).toContain('transition-all');
      expect(classList).toContain('transform');
      expect(classList).toContain('will-change-transform');
    });

    it('includes stagger delay in classes', () => {
      renderWithProviders(<TestComponent />);
      
      const element = screen.getByTestId('transition-classes');
      const classList = element.className;
      
      // Should include some form of delay or stagger
      expect(classList).toMatch(/delay-\d+|duration-\d+/);
    });
  });

  describe('Navigation with transitions', () => {
    it('starts transition on navigation', async () => {
      renderWithProviders(<TestComponent />);
      
      const navigateButton = screen.getByTestId('navigate-forward');
      fireEvent.click(navigateButton);
      
      // Should start transitioning immediately
      await waitFor(() => {
        const transitionState = JSON.parse(screen.getByTestId('transition-state').textContent || '{}');
        expect(transitionState.isTransitioning).toBe(true);
        expect(transitionState.transitionDirection).toBe('forward');
      });
    });

    it('handles backward navigation', async () => {
      renderWithProviders(<TestComponent />);
      
      const navigateButton = screen.getByTestId('navigate-backward');
      fireEvent.click(navigateButton);
      
      await waitFor(() => {
        const transitionState = JSON.parse(screen.getByTestId('transition-state').textContent || '{}');
        expect(transitionState.isTransitioning).toBe(true);
        expect(transitionState.transitionDirection).toBe('backward');
      });
    });

    it('handles immediate navigation without transition', async () => {
      renderWithProviders(<TestComponent />);
      
      const navigateButton = screen.getByTestId('navigate-immediate');
      fireEvent.click(navigateButton);
      
      // Should not start transitioning for immediate navigation
      const transitionState = JSON.parse(screen.getByTestId('transition-state').textContent || '{}');
      expect(transitionState.isTransitioning).toBe(false);
    });

    it('completes transition after duration', async () => {
      renderWithProviders(<TestComponent />);
      
      const navigateButton = screen.getByTestId('navigate-forward');
      fireEvent.click(navigateButton);
      
      // Should be transitioning initially
      await waitFor(() => {
        const transitionState = JSON.parse(screen.getByTestId('transition-state').textContent || '{}');
        expect(transitionState.isTransitioning).toBe(true);
      });
      
      // Fast-forward time to complete transition
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        const transitionState = JSON.parse(screen.getByTestId('transition-state').textContent || '{}');
        expect(transitionState.isTransitioning).toBe(false);
        expect(transitionState.transitionDirection).toBe('none');
      });
    });
  });

  describe('Transition state management', () => {
    it('tracks transition progress', async () => {
      renderWithProviders(<TestComponent />);
      
      const navigateButton = screen.getByTestId('navigate-forward');
      fireEvent.click(navigateButton);
      
      // Progress should start at 0 and increase
      await waitFor(() => {
        const transitionState = JSON.parse(screen.getByTestId('transition-state').textContent || '{}');
        expect(transitionState.transitionProgress).toBeGreaterThanOrEqual(0);
      });
      
      // Advance time partially
      jest.advanceTimersByTime(250);
      
      await waitFor(() => {
        const transitionState = JSON.parse(screen.getByTestId('transition-state').textContent || '{}');
        expect(transitionState.transitionProgress).toBeGreaterThan(0);
        expect(transitionState.transitionProgress).toBeLessThan(100);
      });
    });

    it('sets pending navigation during transition', async () => {
      renderWithProviders(<TestComponent />);
      
      const navigateButton = screen.getByTestId('navigate-forward');
      fireEvent.click(navigateButton);
      
      await waitFor(() => {
        const transitionState = JSON.parse(screen.getByTestId('transition-state').textContent || '{}');
        expect(transitionState.pendingNavigation).toBe('/test');
      });
    });
  });

  describe('Error handling', () => {
    it('handles multiple rapid navigation calls gracefully', async () => {
      renderWithProviders(<TestComponent />);
      
      const navigateButton = screen.getByTestId('navigate-forward');
      
      // Click multiple times rapidly
      fireEvent.click(navigateButton);
      fireEvent.click(navigateButton);
      fireEvent.click(navigateButton);
      
      // Should still handle gracefully
      await waitFor(() => {
        const transitionState = JSON.parse(screen.getByTestId('transition-state').textContent || '{}');
        expect(transitionState.isTransitioning).toBe(true);
      });
    });
  });
});