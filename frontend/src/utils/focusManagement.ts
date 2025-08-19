/**
 * Focus management utilities for navigation and modal components
 */

/**
 * Get all focusable elements within a container
 */
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableSelector = [
    'button:not([disabled])',
    '[href]:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
    'audio[controls]',
    'video[controls]',
    'details > summary:first-of-type',
    '[role="button"]:not([disabled])',
    '[role="menuitem"]:not([disabled])',
    '[role="tab"]:not([disabled])',
  ].join(', ');

  const elements = Array.from(container.querySelectorAll(focusableSelector)) as HTMLElement[];
  
  return elements.filter(element => {
    // Check if element is visible and not hidden
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      !element.hasAttribute('hidden') &&
      rect.width > 0 &&
      rect.height > 0 &&
      element.tabIndex !== -1
    );
  });
};

/**
 * Create a focus trap within a container
 */
export class FocusTrap {
  private container: HTMLElement;
  private previousFocus: HTMLElement | null = null;
  private firstFocusable: HTMLElement | null = null;
  private lastFocusable: HTMLElement | null = null;
  private isActive: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.handleKeyDown = this.handleKeyDown.bind(this);

  activate(): void {
    if (this.isActive) return;

    // Store the currently focused element
    this.previousFocus = document.activeElement as HTMLElement;
    
    // Update focusable elements
    this.updateFocusableElements();
    
    // Focus the first focusable element or the container itself
    this.focusFirst();
    
    // Add event listener
    document.addEventListener('keydown', this.handleKeyDown);
    this.isActive = true;

  deactivate(): void {
    if (!this.isActive) return;

    // Remove event listener
    document.removeEventListener('keydown', this.handleKeyDown);
    
    // Restore focus to the previously focused element
    if (this.previousFocus && document.contains(this.previousFocus)) {
      this.previousFocus.focus();
    
    this.isActive = false;
    this.previousFocus = null;

  private updateFocusableElements(): void {
    const focusableElements = getFocusableElements(this.container);
    this.firstFocusable = focusableElements[0] || null;
    this.lastFocusable = focusableElements[focusableElements.length - 1] || null;

  private focusFirst(): void {
    this.updateFocusableElements();
    if (this.firstFocusable) {
      this.firstFocusable.focus();
    } else {
      // If no focusable elements, make the container focusable and focus it
      this.container.tabIndex = -1;
      this.container.focus();

  private focusLast(): void {
    this.updateFocusableElements();
    if (this.lastFocusable) {
      this.lastFocusable.focus();

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;

    this.updateFocusableElements();

    if (!this.firstFocusable || !this.lastFocusable) {
      // If no focusable elements, prevent tabbing
      event.preventDefault();
      return;

    if (event.shiftKey) {
      // Shift + Tab (backward)
      if (document.activeElement === this.firstFocusable) {
        event.preventDefault();
        this.lastFocusable.focus();
    } else {
      // Tab (forward)
      if (document.activeElement === this.lastFocusable) {
        event.preventDefault();
        this.firstFocusable.focus();

/**
 * Navigation focus manager for handling keyboard navigation in menus
 */
export class NavigationFocusManager {
  private items: HTMLElement[] = [];
  private currentIndex: number = 0;
  private orientation: 'horizontal' | 'vertical' = 'vertical';
  private wrap: boolean = true;

  constructor(
    items: HTMLElement[],
    options: {
      orientation?: 'horizontal' | 'vertical';
      wrap?: boolean;
      initialIndex?: number;
    } = {}
  ) {
    this.items = items;
    this.orientation = options.orientation || 'vertical';
    this.wrap = options.wrap !== false;
    this.currentIndex = options.initialIndex || 0;
    
    this.setupRovingTabIndex();

  private setupRovingTabIndex(): void {
    this.items.forEach((item, index) => {
      item.tabIndex = index === this.currentIndex ? 0 : -1;
    });

  updateItems(items: HTMLElement[], newIndex?: number): void {
    this.items = items;
    if (newIndex !== undefined) {
      this.currentIndex = Math.max(0, Math.min(newIndex, items.length - 1));
    this.setupRovingTabIndex();

  handleKeyDown(event: KeyboardEvent): boolean {
    const { key } = event;
    let handled = false;
    let newIndex = this.currentIndex;

    if (this.orientation === 'vertical') {
      switch (key) {
        case 'ArrowDown':
          handled = true;
          newIndex = this.wrap 
            ? (this.currentIndex + 1) % this.items.length
            : Math.min(this.currentIndex + 1, this.items.length - 1);
          break;
        case 'ArrowUp':
          handled = true;
          newIndex = this.wrap
            ? this.currentIndex === 0 ? this.items.length - 1 : this.currentIndex - 1
            : Math.max(this.currentIndex - 1, 0);
          break;
    } else {
      switch (key) {
        case 'ArrowRight':
          handled = true;
          newIndex = this.wrap 
            ? (this.currentIndex + 1) % this.items.length
            : Math.min(this.currentIndex + 1, this.items.length - 1);
          break;
        case 'ArrowLeft':
          handled = true;
          newIndex = this.wrap
            ? this.currentIndex === 0 ? this.items.length - 1 : this.currentIndex - 1
            : Math.max(this.currentIndex - 1, 0);
          break;

    // Common navigation keys
    switch (key) {
      case 'Home':
        handled = true;
        newIndex = 0;
        break;
      case 'End':
        handled = true;
        newIndex = this.items.length - 1;
        break;

    if (handled && newIndex !== this.currentIndex) {
      event.preventDefault();
      this.focusItem(newIndex);

    return handled;

  focusItem(index: number): void {
    if (index < 0 || index >= this.items.length) return;

    // Update tabindex
    this.items[this.currentIndex].tabIndex = -1;
    this.items[index].tabIndex = 0;
    
    // Focus the new item
    this.items[index].focus();
    
    // Update current index
    this.currentIndex = index;

  getCurrentIndex(): number {
    return this.currentIndex;

  getCurrentItem(): HTMLElement | null {
    return this.items[this.currentIndex] || null;

/**
 * Modal focus manager with enhanced features
 */
export class ModalFocusManager extends FocusTrap {
  private onEscape?: () => void;
  private restoreFocusOnClose: boolean = true;

  constructor(
    container: HTMLElement,
    options: {
      onEscape?: () => void;
      restoreFocusOnClose?: boolean;
    } = {}
  ) {
    super(container);
    this.onEscape = options.onEscape;
    this.restoreFocusOnClose = options.restoreFocusOnClose !== false;
    this.handleModalKeyDown = this.handleModalKeyDown.bind(this);

  activate(): void {
    super.activate();
    
    // Add modal-specific event listener
    document.addEventListener('keydown', this.handleModalKeyDown);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';

  deactivate(): void {
    // Remove modal-specific event listener
    document.removeEventListener('keydown', this.handleModalKeyDown);
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    if (this.restoreFocusOnClose) {
      super.deactivate();

  private handleModalKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.onEscape) {
      event.preventDefault();
      this.onEscape();

/**
 * Dropdown focus manager
 */
export class DropdownFocusManager {
  private trigger: HTMLElement;
  private menu: HTMLElement;
  private items: HTMLElement[] = [];
  private currentIndex: number = -1;
  private isOpen: boolean = false;

  constructor(trigger: HTMLElement, menu: HTMLElement) {
    this.trigger = trigger;
    this.menu = menu;
    this.handleKeyDown = this.handleKeyDown.bind(this);

  open(): void {
    if (this.isOpen) return;

    this.isOpen = true;
    this.updateItems();
    
    // Focus first item
    setTimeout(() => {
      this.focusFirstItem();
    }, 0);
    
    // Add event listener
    document.addEventListener('keydown', this.handleKeyDown);

  close(): void {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.currentIndex = -1;
    
    // Remove event listener
    document.removeEventListener('keydown', this.handleKeyDown);
    
    // Return focus to trigger
    this.trigger.focus();

  private updateItems(): void {
    this.items = getFocusableElements(this.menu).filter(item => 
      item.getAttribute('role') === 'menuitem' || 
      item.tagName === 'BUTTON' ||
      item.tagName === 'A'
    );

  private focusFirstItem(): void {
    if (this.items.length > 0) {
      this.currentIndex = 0;
      this.items[0].focus();

  private focusLastItem(): void {
    if (this.items.length > 0) {
      this.currentIndex = this.items.length - 1;
      this.items[this.currentIndex].focus();

  private focusItem(index: number): void {
    if (index >= 0 && index < this.items.length) {
      this.currentIndex = index;
      this.items[index].focus();

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (this.currentIndex < this.items.length - 1) {
          this.focusItem(this.currentIndex + 1);
        } else {
          this.focusItem(0); // Wrap to first
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.currentIndex > 0) {
          this.focusItem(this.currentIndex - 1);
        } else {
          this.focusItem(this.items.length - 1); // Wrap to last
        break;
      case 'Home':
        event.preventDefault();
        this.focusItem(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusItem(this.items.length - 1);
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'Tab':
        // Allow tab to close dropdown and continue normal tab flow
        this.close();
        break;

/**
 * Utility functions for focus management
 */
export const focusUtils = {
  /**
   * Check if an element is focusable
   */
  isFocusable: (element: HTMLElement): boolean => {
    const focusableElements = getFocusableElements(element.parentElement || document.body);
    return focusableElements.includes(element);
  },

  /**
   * Find the next focusable element
   */
  getNextFocusable: (current: HTMLElement, container?: HTMLElement): HTMLElement | null => {
    const focusableElements = getFocusableElements(container || document.body);
    const currentIndex = focusableElements.indexOf(current);
    return focusableElements[currentIndex + 1] || null;
  },

  /**
   * Find the previous focusable element
   */
  getPreviousFocusable: (current: HTMLElement, container?: HTMLElement): HTMLElement | null => {
    const focusableElements = getFocusableElements(container || document.body);
    const currentIndex = focusableElements.indexOf(current);
    return focusableElements[currentIndex - 1] || null;
  },

  /**
   * Announce to screen readers
   */
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
    }, 1000);
  },

  /**
   * Create skip link
   */
  createSkipLink: (targetId: string, label: string): HTMLAnchorElement => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = label;
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg';
    
    skipLink.addEventListener('click', (event) => {
      event.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    
    return skipLink;
  },
};