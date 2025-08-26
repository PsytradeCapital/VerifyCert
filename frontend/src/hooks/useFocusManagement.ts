import { useEffect, useCallback, useRef } from 'react';

interface FocusManagementOptions {
  trapFocus?: boolean;
  restoreFocus?: boolean;
  autoFocus?: boolean;
}

export const useFocusManagement = (
  containerRef: React.RefObject<HTMLElement>,
  isActive: boolean = true,
  options: FocusManagementOptions = {}
) => {
  const { trapFocus = true, restoreFocus = true, autoFocus = true } = options;
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Get focusable elements within container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(
      containerRef.current.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];
  }, [containerRef]);

  // Focus first element
  const focusFirst = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, [getFocusableElements]);

  // Focus last element
  const focusLast = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }, [getFocusableElements]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!trapFocus || !containerRef.current) return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement;

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab
        if (activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    } else if (event.key === 'Escape') {
      // Allow escape to break focus trap
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [trapFocus, restoreFocus, containerRef, getFocusableElements]);

  // Set up focus management
  useEffect(() => {
    if (!isActive) return;

    // Store previous active element
    if (restoreFocus) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }

    // Auto focus first element
    if (autoFocus) {
      const timer = setTimeout(() => {
        focusFirst();
      }, 100); // Small delay to ensure DOM is ready

      return () => clearTimeout(timer);
    }
  }, [isActive, autoFocus, restoreFocus, focusFirst]);

  // Set up keyboard event listeners
  useEffect(() => {
    if (!isActive || !trapFocus) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, trapFocus, handleKeyDown]);

  // Restore focus when component unmounts or becomes inactive
  useEffect(() => {
    return () => {
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [restoreFocus]);

  return {
    focusFirst,
    focusLast,
    getFocusableElements
  };
};

export default useFocusManagement;