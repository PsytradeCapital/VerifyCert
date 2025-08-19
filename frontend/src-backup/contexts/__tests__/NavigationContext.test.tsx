import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NavigationProvider, useNavigation } from '../NavigationContext';

// Test component that uses the navigation context
const TestComponent: React.FC = () => {
  const { state, actions } = useNavigation();

  return (
    <div>
      <div data-testid="current-path">{state.currentPath}</div>
      <div data-testid="active-items">{Array.from(state.activeItems).join(',')}</div>
      <div data-testid="sidebar-collapsed">{state.sidebarCollapsed.toString()}</div>
      <div data-testid="mobile-menu-open">{state.mobileMenuOpen.toString()}</div>
      <div data-testid="is-transitioning">{state.isTransitioning.toString()}</div>
      <div data-testid="transition-direction">{state.transitionDirection}</div>
      <div data-testid="show-active-indicator">{state.activeIndicators.showActiveIndicator.toString()}</div>
      <div data-testid="indicator-style">{state.activeIndicators.indicatorStyle}</div>
      <div data-testid="indicator-position">{state.activeIndicators.indicatorPosition}</div>
      <div data-testid="animate-transitions">{state.activeIndicators.animateTransitions.toString()}</div>
      
      <button onClick={() => actions.navigateTo('/test')}>Navigate to Test</button>
      <button onClick={() => actions.toggleSidebar()}>Toggle Sidebar</button>
      <button onClick={() => actions.toggleMobileMenu()}>Toggle Mobile Menu</button>
      <button onClick={() => actions.updateItemBadge('home', '5')}>Update Badge</button>
      <button onClick={() => actions.setActiveIndicatorStyle('dot')}>Set Dot Style</button>
      <button onClick={() => actions.setActiveIndicatorPosition('right')}>Set Right Position</button>
      <button onClick={() => actions.toggleActiveIndicator(false)}>Hide Indicators</button>
      <button onClick={() => actions.setAnimateTransitions(false)}>Disable Animations</button>
      <button onClick={() => actions.startTransition('forward')}>Start Forward Transition</button>
      <button onClick={() => actions.endTransition()}>End Transition</button>
    </div>
  );
};

const renderWithRouter = (component: React.ReactElement, initialPath = '/') => {
  window.history.pushState({}, 'Test page', initialPath);
  
  return render(
    <BrowserRouter>
      <NavigationProvider>
        {component}
      </NavigationProvider>
    </BrowserRouter>
  );
};

describe('NavigationContext', () => {
  beforeEach(() => {
    window.history.pushState({}, 'Test page', '/');
  });

  it('should provide initial navigation state', () => {
    renderWithRouter(<TestComponent />);

    expect(screen.getByTestId('current-path')).toHaveTextContent('/');
    expect(screen.getByTestId('sidebar-collapsed')).toHaveTextContent('false');
    expect(screen.getByTestId('mobile-menu-open')).toHaveTextContent('false');
    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false');
    expect(screen.getByTestId('transition-direction')).toHaveTextContent('none');
    expect(screen.getByTestId('show-active-indicator')).toHaveTextContent('true');
    expect(screen.getByTestId('indicator-style')).toHaveTextContent('line');
    expect(screen.getByTestId('indicator-position')).toHaveTextContent('left');
    expect(screen.getByTestId('animate-transitions')).toHaveTextContent('true');
  });

  it('should update active items based on current path', () => {
    renderWithRouter(<TestComponent />, '/');

    // Home should be active when on root path
    expect(screen.getByTestId('active-items')).toHaveTextContent('home');
  });

  it('should toggle sidebar state', () => {
    renderWithRouter(<TestComponent />);

    const toggleButton = screen.getByText('Toggle Sidebar');
    
    expect(screen.getByTestId('sidebar-collapsed')).toHaveTextContent('false');
    
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('sidebar-collapsed')).toHaveTextContent('true');
    
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('sidebar-collapsed')).toHaveTextContent('false');
  });

  it('should toggle mobile menu state', () => {
    renderWithRouter(<TestComponent />);

    const toggleButton = screen.getByText('Toggle Mobile Menu');
    
    expect(screen.getByTestId('mobile-menu-open')).toHaveTextContent('false');
    
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('mobile-menu-open')).toHaveTextContent('true');
    
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('mobile-menu-open')).toHaveTextContent('false');
  });

  it('should update item badges', () => {
    const TestBadgeComponent: React.FC = () => {
      const { state, actions } = useNavigation();
      const homeItem = state.navigationItems.find(item => item.id === 'home');

      return (
        <div>
          <div data-testid="home-badge">{homeItem?.badge || 'none'}</div>
          <button onClick={() => actions.updateItemBadge('home', '5')}>Update Badge</button>
        </div>
      );
    };

    renderWithRouter(<TestBadgeComponent />);

    expect(screen.getByTestId('home-badge')).toHaveTextContent('none');
    
    fireEvent.click(screen.getByText('Update Badge'));
    expect(screen.getByTestId('home-badge')).toHaveTextContent('5');
  });

  it('should filter navigation items based on wallet connection', () => {
    const TestWalletComponent: React.FC = () => {
      const { state } = useNavigation();
      const visibleItems = state.navigationItems.filter(item => item.public || true);

      return (
        <div>
          <div data-testid="visible-items-count">{visibleItems.length}</div>
        </div>
      );
    };

    // Test with wallet not connected
    render(
      <BrowserRouter>
        <NavigationProvider isWalletConnected={false}>
          <TestWalletComponent />
        </NavigationProvider>
      </BrowserRouter>
    );

    // Should show all items (public + private for testing)
    expect(screen.getByTestId('visible-items-count')).toHaveTextContent('3');
  });

  it('should handle navigation history', async () => {
    const TestHistoryComponent: React.FC = () => {
      const { state, actions } = useNavigation();

      return (
        <div>
          <div data-testid="can-go-back">{state.canGoBack.toString()}</div>
          <div data-testid="history-length">{state.navigationHistory.length}</div>
          <button onClick={() => actions.navigateTo('/verify')}>Go to Verify</button>
          <button onClick={() => actions.goBack()}>Go Back</button>
        </div>
      );
    };

    renderWithRouter(<TestHistoryComponent />);

    expect(screen.getByTestId('can-go-back')).toHaveTextContent('false');
    expect(screen.getByTestId('history-length')).toHaveTextContent('1');

    // Navigate to a new page
    fireEvent.click(screen.getByText('Go to Verify'));

    await waitFor(() => {
      expect(screen.getByTestId('can-go-back')).toHaveTextContent('true');
      expect(screen.getByTestId('history-length')).toHaveTextContent('2');
    });
  });

  it('should manage active indicator settings', () => {
    renderWithRouter(<TestComponent />);

    // Test indicator style change
    expect(screen.getByTestId('indicator-style')).toHaveTextContent('line');
    fireEvent.click(screen.getByText('Set Dot Style'));
    expect(screen.getByTestId('indicator-style')).toHaveTextContent('dot');

    // Test indicator position change
    expect(screen.getByTestId('indicator-position')).toHaveTextContent('left');
    fireEvent.click(screen.getByText('Set Right Position'));
    expect(screen.getByTestId('indicator-position')).toHaveTextContent('right');

    // Test hiding indicators
    expect(screen.getByTestId('show-active-indicator')).toHaveTextContent('true');
    fireEvent.click(screen.getByText('Hide Indicators'));
    expect(screen.getByTestId('show-active-indicator')).toHaveTextContent('false');

    // Test disabling animations
    expect(screen.getByTestId('animate-transitions')).toHaveTextContent('true');
    fireEvent.click(screen.getByText('Disable Animations'));
    expect(screen.getByTestId('animate-transitions')).toHaveTextContent('false');
  });

  it('should manage transition states', () => {
    renderWithRouter(<TestComponent />);

    // Initial state
    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false');
    expect(screen.getByTestId('transition-direction')).toHaveTextContent('none');

    // Start transition
    fireEvent.click(screen.getByText('Start Forward Transition'));
    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('true');
    expect(screen.getByTestId('transition-direction')).toHaveTextContent('forward');

    // End transition
    fireEvent.click(screen.getByText('End Transition'));
    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false');
    expect(screen.getByTestId('transition-direction')).toHaveTextContent('none');
  });

  it('should handle navigation with transitions', async () => {
    const TestTransitionComponent: React.FC = () => {
      const { state, actions } = useNavigation();

      return (
        <div>
          <div data-testid="current-path">{state.currentPath}</div>
          <div data-testid="is-transitioning">{state.isTransitioning.toString()}</div>
          <div data-testid="animate-transitions">{state.activeIndicators.animateTransitions.toString()}</div>
          <button onClick={() => actions.navigateTo('/verify')}>Navigate with Transition</button>
        </div>
      );
    };

    renderWithRouter(<TestTransitionComponent />);

    expect(screen.getByTestId('animate-transitions')).toHaveTextContent('true');
    
    // Navigate and check for transition
    fireEvent.click(screen.getByText('Navigate with Transition'));

    // The transition should start briefly then end
    await waitFor(() => {
      expect(screen.getByTestId('current-path')).toHaveTextContent('/verify');
    }, { timeout: 1000 });
  });

  it('should update all active indicator settings', () => {
    const TestIndicatorComponent: React.FC = () => {
      const { state, actions } = useNavigation();

      return (
        <div>
          <div data-testid="indicator-style">{state.activeIndicators.indicatorStyle}</div>
          <div data-testid="indicator-position">{state.activeIndicators.indicatorPosition}</div>
          <div data-testid="show-active-indicator">{state.activeIndicators.showActiveIndicator.toString()}</div>
          <div data-testid="animate-transitions">{state.activeIndicators.animateTransitions.toString()}</div>
          
          <button onClick={() => actions.setActiveIndicatorStyle('background')}>Set Background</button>
          <button onClick={() => actions.setActiveIndicatorStyle('border')}>Set Border</button>
          <button onClick={() => actions.setActiveIndicatorPosition('top')}>Set Top</button>
          <button onClick={() => actions.setActiveIndicatorPosition('bottom')}>Set Bottom</button>
          <button onClick={() => actions.toggleActiveIndicator(false)}>Toggle Off</button>
          <button onClick={() => actions.toggleActiveIndicator(true)}>Toggle On</button>
          <button onClick={() => actions.setAnimateTransitions(false)}>Animations Off</button>
          <button onClick={() => actions.setAnimateTransitions(true)}>Animations On</button>
        </div>
      );
    };

    renderWithRouter(<TestIndicatorComponent />);

    // Test all indicator styles
    fireEvent.click(screen.getByText('Set Background'));
    expect(screen.getByTestId('indicator-style')).toHaveTextContent('background');

    fireEvent.click(screen.getByText('Set Border'));
    expect(screen.getByTestId('indicator-style')).toHaveTextContent('border');

    // Test all positions
    fireEvent.click(screen.getByText('Set Top'));
    expect(screen.getByTestId('indicator-position')).toHaveTextContent('top');

    fireEvent.click(screen.getByText('Set Bottom'));
    expect(screen.getByTestId('indicator-position')).toHaveTextContent('bottom');

    // Test toggle functionality
    fireEvent.click(screen.getByText('Toggle Off'));
    expect(screen.getByTestId('show-active-indicator')).toHaveTextContent('false');

    fireEvent.click(screen.getByText('Toggle On'));
    expect(screen.getByTestId('show-active-indicator')).toHaveTextContent('true');

    // Test animation toggle
    fireEvent.click(screen.getByText('Animations Off'));
    expect(screen.getByTestId('animate-transitions')).toHaveTextContent('false');

    fireEvent.click(screen.getByText('Animations On'));
    expect(screen.getByTestId('animate-transitions')).toHaveTextContent('true');
  });

  it('should throw error when used outside provider', () => {
    const TestErrorComponent: React.FC = () => {
      useNavigation();
      return <div>Should not render</div>;
    };

    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestErrorComponent />);
    }).toThrow('useNavigation must be used within a NavigationProvider');

    consoleSpy.mockRestore();
  });
});