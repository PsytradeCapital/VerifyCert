import React from 'react';
import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook for managing focus within a container (focus trap)
 */
export const useFocusTrap = (isActive: boolean = true) => {
  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  // Focusable element selector
  const focusableSelector = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
    'audio[controls]',
    'video[controls]',
    'details > summary:first-of-type',
  ].join(', ');

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    const elements = Array.from(
      containerRef.current.querySelectorAll(focusableSelector)
    ) as HTMLElement[];
    
    return elements.filter(element => {
      // Check if element is visible and not hidden
      const style = window.getComputedStyle(element);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        element.offsetWidth > 0 &&
        element.offsetHeight > 0
      );
    });
  }, [focusableSelector]);

  const updateFocusableElements = useCallback(() => {
    const focusableElements = getFocusableElements();
    firstFocusableRef.current = focusableElements[0] || null;
    lastFocusableRef.current = focusableElements[focusableElements.length - 1] || null;
  }, [getFocusableElements]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive || event.key !== 'Tab') return;

    updateFocusableElements();

    if (!firstFocusableRef.current || !lastFocusableRef.current) {
      // If no focusable elements, prevent tabbing
      event.preventDefault();
      return;

    if (event.shiftKey) {
      // Shift + Tab (backward)
      if (document.activeElement === firstFocusableRef.current) {
        event.preventDefault();
        lastFocusableRef.current.focus();
    } else {
      // Tab (forward)
      if (document.activeElement === lastFocusableRef.current) {
        event.preventDefault();
        firstFocusableRef.current.focus();
  }, [isActive, updateFocusableElements]);

  const focusFirst = useCallback(() => {
    updateFocusableElements();
    if (firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    } else if (containerRef.current) {
      // If no focusable elements, focus the container itself
      containerRef.current.focus();
  }, [updateFocusableElements]);

  const focusLast = useCallback(() => {
    updateFocusableElements();
    if (lastFocusableRef.current) {
      lastFocusableRef.current.focus();
  }, [updateFocusableElements]);

  // Store and restore focus
  useEffect(() => {
    if (isActive) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the first focusable element after a brief delay
      const timeoutId = setTimeout(() => {
        focusFirst();
      }, 0);

      return () => clearTimeout(timeoutId);
    } else {
      // Restore focus to the previously focused element
      if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
  }, [isActive, focusFirst]);

  // Add/remove event listener
  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, handleKeyDown]);

  return {
    containerRef,
    focusFirst,
    focusLast,
    getFocusableElements,
  };
};

/**
 * Hook for managing focus restoration
 */
export const useFocusRestore = () => {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
  }, []);

  return { saveFocus, restoreFocus };
};

/**
 * Hook for managing roving tabindex in navigation menus
 */
export const useRovingTabIndex = (items: HTMLElement[], activeIndex: number = 0) => {
  const updateTabIndex = useCallback(() => {
    items.forEach((item, index) => {
      if (item) {
        item.tabIndex = index === activeIndex ? 0 : -1;
    });
  }, [items, activeIndex]);

  useEffect(() => {
    updateTabIndex();
  }, [updateTabIndex]);

  const handleKeyDown = useCallback((event: KeyboardEvent, currentIndex: number) => {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        newIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return currentIndex;

    if (items[newIndex]) {
      items[newIndex].focus();

    return newIndex;
  }, [items]);

  return { handleKeyDown, updateTabIndex };
};

/**
 * Hook for managing focus within dropdown menus
 */
export const useDropdownFocus = (isOpen: boolean) => {
  const triggerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLElement>(null);

  const focusFirstMenuItem = useCallback(() => {
    if (!menuRef.current) return;
    
    const firstItem = menuRef.current.querySelector(
      '[role="menuitem"]:not([disabled]), button:not([disabled]), a[href]'
    ) as HTMLElement;
    
    if (firstItem) {
      firstItem.focus();
  }, []);

  const focusLastMenuItem = useCallback(() => {
    if (!menuRef.current) return;
    
    const items = menuRef.current.querySelectorAll(
      '[role="menuitem"]:not([disabled]), button:not([disabled]), a[href]'
    );
    const lastItem = items[items.length - 1] as HTMLElement;
    
    if (lastItem) {
      lastItem.focus();
  }, []);

  const handleMenuKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen || !menuRef.current) return;

    const items = Array.from(
      menuRef.current.querySelectorAll(
        '[role="menuitem"]:not([disabled]), button:not([disabled]), a[href]'
      )
    ) as HTMLElement[];

    const currentIndex = items.indexOf(document.activeElement as HTMLElement);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        items[nextIndex]?.focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        items[prevIndex]?.focus();
        break;
      case 'Home':
        event.preventDefault();
        items[0]?.focus();
        break;
      case 'End':
        event.preventDefault();
        items[items.length - 1]?.focus();
        break;
      case 'Escape':
        event.preventDefault();
        triggerRef.current?.focus();
        break;
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Focus first menu item when dropdown opens
      const timeoutId = setTimeout(focusFirstMenuItem, 0);
      return () => clearTimeout(timeoutId);
    } else {
      // Return focus to trigger when dropdown closes
      if (triggerRef.current && document.contains(triggerRef.current)) {
        triggerRef.current.focus();
  }, [isOpen, focusFirstMenuItem]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleMenuKeyDown);
      return () => document.removeEventListener('keydown', handleMenuKeyDown);
  }, [isOpen, handleMenuKeyDown]);

  return {
    triggerRef,
    menuRef,
    focusFirstMenuItem,
    focusLastMenuItem,
  };
};

/**
 * Hook for managing skip links
 */
export const useSkipLinks = () => {
  const skipToContent = useCallback((targetId: string) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const createSkipLink = useCallback((targetId: string, label: string) => {
    return {
      href: `#${targetId}`,
      onClick: (event: React.MouseEvent) => {
        event.preventDefault();
        skipToContent(targetId);
      },
      className: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg',
      children: label,
    };
  }, [skipToContent]);

  return { skipToContent, createSkipLink };
};
}}}}}}}}}}}}}}}}}}}}