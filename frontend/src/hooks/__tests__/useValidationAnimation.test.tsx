import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { ;
  useValidationAnimation, ;
  useValidationMessageAnimation, ;
  useValidationIconAnimation ;
} from '../useValidationAnimation';

// Mock the validation animation utilities
jest.mock('../../utils/validationAnimations', () => ({
  triggerValidationAnimation: jest.fn(() => Promise.resolve()),
  getValidationAnimationClasses: jest.fn(() => 'mock-animation-class'),
  validationSequences: {
    errorSequence: [
      { element: 'field', animation: 'errorShake', delay: 0 },
      { element: 'message', animation: 'errorSlideIn', delay: 100 },
      { element: 'icon', animation: 'errorPulse', delay: 150
    ],
    successSequence: [
      { element: 'field', animation: 'successBounce', delay: 0 },
      { element: 'icon', animation: 'successBounce', delay: 50 },
      { element: 'message', animation: 'successFadeIn', delay: 100
    ],
    warningSequence: [
      { element: 'field', animation: 'warningWiggle', delay: 0 },
      { element: 'message', animation: 'warningFadeIn', delay: 100 },
      { element: 'icon', animation: 'warningWiggle', delay: 150
    ]
}));

describe('useValidationAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => 
      useValidationAnimation('default')
    );

    expect(result.current.fieldRef).toBeDefined();
    expect(result.current.messageRef).toBeDefined();
    expect(result.current.iconRef).toBeDefined();
    expect(result.current.isAnimating).toBe(false);
    expect(typeof result.current.triggerFieldAnimation).toBe('function');
    expect(typeof result.current.triggerMessageAnimation).toBe('function');
    expect(typeof result.current.triggerIconAnimation).toBe('function');
    expect(typeof result.current.triggerSequence).toBe('function');
    expect(typeof result.current.getAnimationClasses).toBe('function');
  });

  it('provides animation control functions', async () => {
    const { result } = renderHook(() => 
      useValidationAnimation('error')
    );

    // Mock DOM element
    const mockElement = document.createElement('div');
    (result.current.fieldRef as any).current = mockElement;

    await act(async () => {
      await result.current.triggerFieldAnimation('errorShake');
    });

    expect(result.current.isAnimating).toBe(false); // Should be false after animation completes
  });

  it('triggers sequence animations for validation states', async () => {
    const { result } = renderHook(() => 
      useValidationAnimation('error', { enableSequence: true })
    );

    // Mock DOM elements
    const mockFieldElement = document.createElement('div');
    const mockMessageElement = document.createElement('div');
    const mockIconElement = document.createElement('div');
    
    (result.current.fieldRef as any).current = mockFieldElement;
    (result.current.messageRef as any).current = mockMessageElement;
    (result.current.iconRef as any).current = mockIconElement;

    await act(async () => {
      await result.current.triggerSequence('error');
    });

    expect(result.current.isAnimating).toBe(false);
  });

  it('respects animation configuration options', () => {
    const animationConfig = {
      duration: 500,
      enableSequence: false
    };

    const { result } = renderHook(() => 
      useValidationAnimation('success', {
        animateOnChange: false,
        animationConfig,
        enableSequence: false,
        debounceMs: 200
      })
    );

    expect(result.current.fieldRef).toBeDefined();
    expect(result.current.isAnimating).toBe(false);
  });

  it('auto-triggers animations on validation state change', async () => {
    const { result, rerender } = renderHook(
      ({ validationState }) => useValidationAnimation(validationState),
      { initialProps: { validationState: 'default' as const
    );

    // Mock DOM elements
    const mockFieldElement = document.createElement('div');
    const mockMessageElement = document.createElement('div');
    const mockIconElement = document.createElement('div');
    
    (result.current.fieldRef as any).current = mockFieldElement;
    (result.current.messageRef as any).current = mockMessageElement;
    (result.current.iconRef as any).current = mockIconElement;

    // Change validation state
    await act(async () => {
      rerender({ validationState: 'error' as const });
    });

    // Wait for debounce and animation
    await new Promise(resolve => setTimeout(resolve, 150));
  });
});

describe('useValidationMessageAnimation', () => {
  it('manages message visibility correctly', () => {
    const { result, rerender } = renderHook(
      ({ message, validationState }) => useValidationMessageAnimation(message, validationState),
      { 
        initialProps: { 
          message: undefined as string | undefined, 
          validationState: 'default' as const
    );

    expect(result.current.displayMessage).toBeUndefined();
    expect(result.current.isVisible).toBe(false);

    // Add message
    act(() => {
      rerender({ message: 'Test message', validationState: 'error' as const });
    });

    expect(result.current.displayMessage).toBe('Test message');
    expect(result.current.isVisible).toBe(true);
    expect(result.current.animationClass).toBe('animate-slide-up');
  });

  it('handles message removal with exit animation', () => {
    const { result, rerender } = renderHook(
      ({ message, validationState }) => useValidationMessageAnimation(message, validationState),
      { 
        initialProps: { 
          message: 'Initial message', 
          validationState: 'error' as const
    );

    expect(result.current.isVisible).toBe(true);

    // Remove message
    act(() => {
      rerender({ message: undefined, validationState: 'default' as const });
    });

    expect(result.current.isVisible).toBe(false);
    expect(result.current.animationClass).toBe('animate-fade-out');
  });
});

describe('useValidationIconAnimation', () => {
  it('manages icon state transitions', () => {
    const { result, rerender } = renderHook(
      ({ validationState, showIcon }) => useValidationIconAnimation(validationState, showIcon),
      { 
        initialProps: { 
          validationState: 'default' as const, 
          showIcon: true
    );

    expect(result.current.currentState).toBe('default');
    expect(result.current.shouldShowIcon).toBe(false); // default state doesn't show icon

    // Change to success state
    act(() => {
      rerender({ validationState: 'success' as const, showIcon: true });
    });

    expect(result.current.shouldShowIcon).toBe(true);
    expect(result.current.animationClass).toBe('animate-icon-pop-in');
  });

  it('handles icon visibility based on showIcon prop', () => {
    const { result, rerender } = renderHook(
      ({ validationState, showIcon }) => useValidationIconAnimation(validationState, showIcon),
      { 
        initialProps: { 
          validationState: 'success' as const, 
          showIcon: false
    );

    expect(result.current.shouldShowIcon).toBe(false);

    // Enable icon
    act(() => {
      rerender({ validationState: 'success' as const, showIcon: true });
    });

    expect(result.current.shouldShowIcon).toBe(true);
  });

  it('manages state change animations', async () => {
    const { result, rerender } = renderHook(
      ({ validationState }) => useValidationIconAnimation(validationState, true),
      { initialProps: { validationState: 'success' as const
    );

    expect(result.current.isChanging).toBe(false);

    // Change state
    act(() => {
      rerender({ validationState: 'error' as const });
    });

    expect(result.current.isChanging).toBe(true);
    expect(result.current.animationClass).toBe('animate-scale-out');

    // Wait for state change delay
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    expect(result.current.isChanging).toBe(false);
    expect(result.current.currentState).toBe('error');
  });
});
}
}