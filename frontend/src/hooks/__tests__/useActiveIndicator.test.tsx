import { renderHook } from '@testing-library/react';
import { useActiveIndicator } from '../useActiveIndicator';
import { NavigationProvider } from '../../contexts/NavigationContext';
import { BrowserRouter } from 'react-router-dom';

// Mock the navigation context
const mockNavigationState = {
  currentPath: '/test',
  currentRoute: '/test',
  activeItems: new Set(['test-item']),
  navigationItems: [],
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  navigationHistory: ['/test'],
  canGoBack: false,
  canGoForward: false,
  activeIndicators: {
    showActiveIndicator: true,
    indicatorPosition: 'left' as const,
    indicatorStyle: 'line' as const,
    animateTransitions: true
  },
  isTransitioning: false,
  transitionDirection: 'none' as const
};

const mockNavigationActions = {
  navigateTo: jest.fn(),
  goBack: jest.fn(),
  goForward: jest.fn(),
  toggleSidebar: jest.fn(),
  setSidebarCollapsed: jest.fn(),
  toggleMobileMenu: jest.fn(),
  setMobileMenuOpen: jest.fn(),
  setActiveItem: jest.fn(),
  updateNavigationItems: jest.fn(),
  updateItemBadge: jest.fn(),
  setActiveIndicatorStyle: jest.fn(),
  setActiveIndicatorPosition: jest.fn(),
  toggleActiveIndicator: jest.fn(),
  setAnimateTransitions: jest.fn(),
  startTransition: jest.fn(),
  endTransition: jest.fn()
};

// Mock the useNavigation hook
jest.mock('../../contexts/NavigationContext', () => ({
  ...jest.requireActual('../../contexts/NavigationContext'),
  useNavigation: () => ({
    state: mockNavigationState,
    actions: mockNavigationActions
  })
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <NavigationProvider>
      {children}
    </NavigationProvider>
  </BrowserRouter>
);

describe('useActiveIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return correct styles for active item with line indicator', () => {
    const { result } = renderHook(
      () => useActiveIndicator('test-item', true),
      { wrapper }
    );

    expect(result.current.containerClasses).toContain('relative');
    expect(result.current.containerClasses).toContain('transition-all');
    expect(result.current.indicatorClasses).toContain('absolute left-0');
    expect(result.current.indicatorClasses).toContain('bg-primary-500');
    expect(result.current.itemClasses).toContain('pl-4');
  });

  it('should return correct styles for inactive item', () => {
    const { result } = renderHook(
      () => useActiveIndicator('test-item', false),
      { wrapper }
    );

    expect(result.current.indicatorClasses).toBe('');
    expect(result.current.itemClasses).toBe('');
  });

  it('should handle different indicator positions', () => {
    // Test right position
    mockNavigationState.activeIndicators.indicatorPosition = 'right';
    
    const { result } = renderHook(
      () => useActiveIndicator('test-item', true),
      { wrapper }
    );

    expect(result.current.indicatorClasses).toContain('absolute right-0');
    expect(result.current.itemClasses).toContain('pr-4');
  });

  it('should handle different indicator styles', () => {
    // Test dot style
    mockNavigationState.activeIndicators.indicatorStyle = 'dot';
    
    const { result } = renderHook(
      () => useActiveIndicator('test-item', true),
      { wrapper }
    );

    expect(result.current.indicatorClasses).toContain('w-2 h-2');
    expect(result.current.indicatorClasses).toContain('rounded-full');
  });

  it('should handle background style', () => {
    mockNavigationState.activeIndicators.indicatorStyle = 'background';
    
    const { result } = renderHook(
      () => useActiveIndicator('test-item', true),
      { wrapper }
    );

    expect(result.current.indicatorClasses).toContain('absolute inset-0');
    expect(result.current.indicatorClasses).toContain('bg-primary-100');
    expect(result.current.itemClasses).toContain('relative z-10');
  });

  it('should handle border style', () => {
    mockNavigationState.activeIndicators.indicatorStyle = 'border';
    
    const { result } = renderHook(
      () => useActiveIndicator('test-item', true),
      { wrapper }
    );

    expect(result.current.indicatorClasses).toContain('border-2 border-primary-500');
  });

  it('should handle transition states', () => {
    mockNavigationState.isTransitioning = true;
    mockNavigationState.transitionDirection = 'forward';
    
    const { result } = renderHook(
      () => useActiveIndicator('test-item', true),
      { wrapper }
    );

    expect(result.current.containerClasses).toContain('translate-x-1');
  });

  it('should respect showActiveIndicator setting', () => {
    mockNavigationState.activeIndicators.showActiveIndicator = false;
    
    const { result } = renderHook(
      () => useActiveIndicator('test-item', true),
      { wrapper }
    );

    expect(result.current.indicatorClasses).toBe('');
    expect(result.current.itemClasses).toBe('');
  });

  it('should handle disabled animations', () => {
    mockNavigationState.activeIndicators.animateTransitions = false;
    
    const { result } = renderHook(
      () => useActiveIndicator('test-item', true),
      { wrapper }
    );

    expect(result.current.transitionClasses).toBe('');
  });
});