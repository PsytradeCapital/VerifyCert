import React from 'react';
/**
 * Accessibility utilities for keyboard navigation and ARIA support
 */

/**
 * Get all focusable elements within a container
 */
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableSelectors = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"]):not([disabled])',
    '[contenteditable="true"]'
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
};

/**
 * Create a focus trap for modals and dropdowns
 */
export class FocusTrap {
  private container: HTMLElement;
  private focusableElements: HTMLElement[];
  private firstFocusableElement: HTMLElement | null;
  private lastFocusableElement: HTMLElement | null;
  private previouslyFocusedElement: HTMLElement | null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.focusableElements = getFocusableElements(container);
    this.firstFocusableElement = this.focusableElements[0] || null;
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1] || null;
    this.previouslyFocusedElement = document.activeElement as HTMLElement;

  /**
   * Activate the focus trap
   */
  activate(): void {
    // Focus the first focusable element
    if (this.firstFocusableElement) {
      this.firstFocusableElement.focus();
    } else {
      // If no focusable elements, focus the container itself
      this.container.focus();

    // Add event listener for tab key
    document.addEventListener('keydown', this.handleKeyDown);

  /**
   * Deactivate the focus trap and restore previous focus
   */
  deactivate(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    
    // Restore focus to previously focused element
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();

  /**
   * Handle keydown events for focus trapping
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;

    // If no focusable elements, prevent tabbing
    if (this.focusableElements.length === 0) {
      event.preventDefault();
      return;

    if (event.shiftKey) {
      // Shift + Tab (backwards)
      if (document.activeElement === this.firstFocusableElement) {
        event.preventDefault();
        this.lastFocusableElement?.focus();
    } else {
      // Tab (forwards)
      if (document.activeElement === this.lastFocusableElement) {
        event.preventDefault();
        this.firstFocusableElement?.focus();
  };

  /**
   * Update focusable elements (useful when content changes)
   */
  updateFocusableElements(): void {
    this.focusableElements = getFocusableElements(this.container);
    this.firstFocusableElement = this.focusableElements[0] || null;
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1] || null;

/**
 * Keyboard navigation handler for lists and menus
 */
export class KeyboardNavigationHandler {
  private items: HTMLElement[];
  private currentIndex: number;
  private orientation: 'horizontal' | 'vertical';
  private wrap: boolean;

  constructor(
    items: HTMLElement[], 
    options: {
      orientation?: 'horizontal' | 'vertical';
      wrap?: boolean;
      initialIndex?: number;
    } = {}
  ) {
    this.items = items;
    this.currentIndex = options.initialIndex ?? -1;
    this.orientation = options.orientation ?? 'vertical';
    this.wrap = options.wrap ?? true;

  /**
   * Handle keyboard navigation
   */
  handleKeyDown(event: KeyboardEvent): boolean {
    const { key } = event;
    let handled = false;

    switch (key) {
      case 'ArrowDown':
        if (this.orientation === 'vertical') {
          this.moveNext();
          handled = true;
        break;
      
      case 'ArrowUp':
        if (this.orientation === 'vertical') {
          this.movePrevious();
          handled = true;
        break;
      
      case 'ArrowRight':
        if (this.orientation === 'horizontal') {
          this.moveNext();
          handled = true;
        break;
      
      case 'ArrowLeft':
        if (this.orientation === 'horizontal') {
          this.movePrevious();
          handled = true;
        break;
      
      case 'Home':
        this.moveToFirst();
        handled = true;
        break;
      
      case 'End':
        this.moveToLast();
        handled = true;
        break;

    if (handled) {
      event.preventDefault();
      this.focusCurrentItem();

    return handled;

  /**
   * Move to next item
   */
  private moveNext(): void {
    if (this.items.length === 0) return;

    if (this.currentIndex < this.items.length - 1) {
      this.currentIndex++;
    } else if (this.wrap) {
      this.currentIndex = 0;

  /**
   * Move to previous item
   */
  private movePrevious(): void {
    if (this.items.length === 0) return;

    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else if (this.wrap) {
      this.currentIndex = this.items.length - 1;

  /**
   * Move to first item
   */
  private moveToFirst(): void {
    if (this.items.length > 0) {
      this.currentIndex = 0;

  /**
   * Move to last item
   */
  private moveToLast(): void {
    if (this.items.length > 0) {
      this.currentIndex = this.items.length - 1;

  /**
   * Focus the current item
   */
  private focusCurrentItem(): void {
    if (this.currentIndex >= 0 && this.currentIndex < this.items.length) {
      this.items[this.currentIndex].focus();

  /**
   * Set current index
   */
  setCurrentIndex(index: number): void {
    if (index >= 0 && index < this.items.length) {
      this.currentIndex = index;

  /**
   * Get current index
   */
  getCurrentIndex(): number {
    return this.currentIndex;

  /**
   * Update items array
   */
  updateItems(items: HTMLElement[]): void {
    this.items = items;
    if (this.currentIndex >= items.length) {
      this.currentIndex = items.length - 1;

/**
 * Type-ahead search functionality for lists
 */
export class TypeAheadSearch {
  private items: { element: HTMLElement; text: string }[];
  private searchString: string = '';
  private searchTimeout: NodeJS.Timeout | null = null;
  private timeoutDuration: number;

  constructor(items: { element: HTMLElement; text: string }[], timeoutDuration = 1000) {
    this.items = items;
    this.timeoutDuration = timeoutDuration;

  /**
   * Handle character input for type-ahead search
   */
  handleCharacter(char: string, currentIndex: number = -1): number {
    // Clear existing timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);

    // Add character to search string
    this.searchString += char.toLowerCase();

    // Find matching item
    const matchIndex = this.findMatch(currentIndex);

    // Set timeout to clear search string
    this.searchTimeout = setTimeout(() => {
      this.searchString = '';
    }, this.timeoutDuration);

    return matchIndex;

  /**
   * Find matching item based on search string
   */
  private findMatch(currentIndex: number): number {
    const startIndex = currentIndex >= 0 ? currentIndex + 1 : 0;

    // Search from current position forward
    for (let i = 0; i < this.items.length; i++) {
      const index = (startIndex + i) % this.items.length;
      const item = this.items[index];
      
      if (item.text.toLowerCase().startsWith(this.searchString)) {
        return index;

    return -1; // No match found

  /**
   * Update items array
   */
  updateItems(items: { element: HTMLElement; text: string }[]): void {
    this.items = items;

  /**
   * Clear search string
   */
  clearSearch(): void {
    this.searchString = '';
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;

/**
 * ARIA live region announcer
 */
export class LiveRegionAnnouncer {
  private liveRegion: HTMLElement;

  constructor() {
    this.liveRegion = this.createLiveRegion();

  /**
   * Create a live region element
   */
  private createLiveRegion(): HTMLElement {
    const existing = document.getElementById('live-region-announcer');
    if (existing) {
      return existing;

    const liveRegion = document.createElement('div');
    liveRegion.id = 'live-region-announcer';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    
    document.body.appendChild(liveRegion);
    return liveRegion;

  /**
   * Announce a message to screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;

    // Clear the message after a short delay to allow for re-announcements
    setTimeout(() => {
      this.liveRegion.textContent = '';
    }, 1000);

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check if user is using keyboard navigation
 */
export const isUsingKeyboard = (): boolean => {
  // This would be set by a global keyboard detection system
  return document.body.classList.contains('using-keyboard');
};

/**
 * Add keyboard navigation detection
 */
export const initKeyboardDetection = (): void => {
  let isUsingKeyboard = false;

  // Detect keyboard usage
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      isUsingKeyboard = true;
      document.body.classList.add('using-keyboard');
  });

  // Detect mouse usage
  document.addEventListener('mousedown', () => {
    isUsingKeyboard = false;
    document.body.classList.remove('using-keyboard');
  });

  // Detect touch usage
  document.addEventListener('touchstart', () => {
    isUsingKeyboard = false;
    document.body.classList.remove('using-keyboard');
  });
};

/**
 * Create a roving tabindex manager for complex widgets
 */
export class RovingTabindexManager {
  private items: HTMLElement[];
  private currentIndex: number;

  constructor(items: HTMLElement[], initialIndex = 0) {
    this.items = items;
    this.currentIndex = initialIndex;
    this.updateTabindices();

  /**
   * Move focus to specific index
   */
  moveTo(index: number): void {
    if (index >= 0 && index < this.items.length) {
      this.currentIndex = index;
      this.updateTabindices();
      this.items[index].focus();

  /**
   * Update tabindex attributes
   */
  private updateTabindices(): void {
    this.items.forEach((item, index) => {
      item.tabIndex = index === this.currentIndex ? 0 : -1;
    });

  /**
   * Update items array
   */
  updateItems(items: HTMLElement[], newCurrentIndex?: number): void {
    this.items = items;
    if (newCurrentIndex !== undefined) {
      this.currentIndex = newCurrentIndex;
    } else if (this.currentIndex >= items.length) {
      this.currentIndex = Math.max(0, items.length - 1);
    this.updateTabindices();

  /**
   * Get current index
   */
  getCurrentIndex(): number {
    return this.currentIndex;

// Global live region announcer instance
export const liveAnnouncer = new LiveRegionAnnouncer();
}
}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}