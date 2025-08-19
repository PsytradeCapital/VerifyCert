/**
 * Screen Reader Testing Utilities
 * 
 * This module provides automated testing tools for screen reader compatibility
 * and assistive technology support across all UI components.
 */

import { JSDOM } from 'jsdom';

// Mock screen reader announcements for testing
interface ScreenReaderAnnouncement {
  text: string;
  priority: 'polite' | 'assertive';
  timestamp: number;
  element?: HTMLElement;

class MockScreenReader {
  private announcements: ScreenReaderAnnouncement[] = [];
  private isActive: boolean = true;
  private verbosityLevel: 'low' | 'medium' | 'high' = 'medium';

  constructor() {
    this.setupAriaLiveRegionMonitoring();

  /**
   * Monitor ARIA live regions for announcements
   */
  private setupAriaLiveRegionMonitoring(): void {
    // Set up mutation observer to watch for live region changes
    if (typeof window !== 'undefined' && window.MutationObserver) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            const target = mutation.target as HTMLElement;
            const ariaLive = target.getAttribute('aria-live') || 
                           target.closest('[aria-live]')?.getAttribute('aria-live');
            
            if (ariaLive && target.textContent?.trim()) {
              this.announce(target.textContent.trim(), ariaLive as 'polite' | 'assertive', target);
        });
      });

      // Observe all live regions
      const liveRegions = document.querySelectorAll('[aria-live]');
      liveRegions.forEach(region => {
        observer.observe(region, {
          childList: true,
          subtree: true,
          characterData: true
        });
      });

  /**
   * Simulate screen reader announcement
   */
  announce(text: string, priority: 'polite' | 'assertive' = 'polite', element?: HTMLElement): void {
    if (!this.isActive || !text.trim()) return;

    const announcement: ScreenReaderAnnouncement = {
      text: text.trim(),
      priority,
      timestamp: Date.now(),
      element
    };

    this.announcements.push(announcement);

    // Simulate screen reader behavior
    if (priority === 'assertive') {
      // Assertive announcements interrupt current speech
      console.log(`[SCREEN READER - ASSERTIVE]: ${text}`);
    } else {
      // Polite announcements wait for current speech to finish
      console.log(`[SCREEN READER - POLITE]: ${text}`);

  /**
   * Get all announcements made during testing
   */
  getAnnouncements(): ScreenReaderAnnouncement[] {
    return [...this.announcements];

  /**
   * Clear announcement history
   */
  clearAnnouncements(): void {
    this.announcements = [];

  /**
   * Set verbosity level
   */
  setVerbosity(level: 'low' | 'medium' | 'high'): void {
    this.verbosityLevel = level;

  /**
   * Toggle screen reader active state
   */
  setActive(active: boolean): void {
    this.isActive = active;

  /**
   * Simulate reading element content
   */
  readElement(element: HTMLElement): string {
    const accessibleName = this.getAccessibleName(element);
    const role = this.getRole(element);
    const state = this.getState(element);
    const description = this.getDescription(element);

    let announcement = '';

    // Build announcement based on element type and verbosity
    if (accessibleName) {
      announcement += accessibleName;

    if (role && this.verbosityLevel !== 'low') {
      announcement += `, ${role}`;

    if (state && this.verbosityLevel === 'high') {
      announcement += `, ${state}`;

    if (description && this.verbosityLevel === 'high') {
      announcement += `. ${description}`;

    return announcement.trim();

  /**
   * Get accessible name for element
   */
  private getAccessibleName(element: HTMLElement): string {
    // Check aria-label first
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // Check aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelElements = labelledBy.split(' ')
        .map(id => document.getElementById(id))
        .filter(Boolean);
      
      if (labelElements.length > 0) {
        return labelElements.map(el => el!.textContent?.trim()).join(' ');

    // Check associated label
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
      const id = element.getAttribute('id');
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label?.textContent) return label.textContent.trim();

    // Check title attribute
    const title = element.getAttribute('title');
    if (title) return title;

    // Check alt attribute for images
    if (element.tagName === 'IMG') {
      const alt = element.getAttribute('alt');
      if (alt !== null) return alt;

    // Check placeholder for inputs
    if (element.tagName === 'INPUT') {
      const placeholder = element.getAttribute('placeholder');
      if (placeholder) return placeholder;

    // Fall back to text content
    return element.textContent?.trim() || '';

  /**
   * Get role for element
   */
  private getRole(element: HTMLElement): string {
    const explicitRole = element.getAttribute('role');
    if (explicitRole) return explicitRole;

    // Implicit roles based on tag name
    const tagName = element.tagName.toLowerCase();
    const implicitRoles: Record<string, string> = {
      'button': 'button',
      'a': 'link',
      'input': this.getInputRole(element as HTMLInputElement),
      'select': 'combobox',
      'textarea': 'textbox',
      'h1': 'heading',
      'h2': 'heading',
      'h3': 'heading',
      'h4': 'heading',
      'h5': 'heading',
      'h6': 'heading',
      'nav': 'navigation',
      'main': 'main',
      'aside': 'complementary',
      'section': 'region',
      'article': 'article',
      'header': 'banner',
      'footer': 'contentinfo',
      'ul': 'list',
      'ol': 'list',
      'li': 'listitem',
      'table': 'table',
      'tr': 'row',
      'td': 'cell',
      'th': 'columnheader'
    };

    return implicitRoles[tagName] || '';

  /**
   * Get input role based on type
   */
  private getInputRole(input: HTMLInputElement): string {
    const type = input.type.toLowerCase();
    const inputRoles: Record<string, string> = {
      'button': 'button',
      'submit': 'button',
      'reset': 'button',
      'checkbox': 'checkbox',
      'radio': 'radio',
      'range': 'slider',
      'text': 'textbox',
      'email': 'textbox',
      'password': 'textbox',
      'search': 'searchbox',
      'tel': 'textbox',
      'url': 'textbox',
      'number': 'spinbutton'
    };

    return inputRoles[type] || 'textbox';

  /**
   * Get state information for element
   */
  private getState(element: HTMLElement): string {
    const states: string[] = [];

    // Check various ARIA states
    if (element.getAttribute('aria-expanded') === 'true') {
      states.push('expanded');
    } else if (element.getAttribute('aria-expanded') === 'false') {
      states.push('collapsed');

    if (element.getAttribute('aria-selected') === 'true') {
      states.push('selected');

    if (element.getAttribute('aria-checked') === 'true') {
      states.push('checked');
    } else if (element.getAttribute('aria-checked') === 'false') {
      states.push('unchecked');

    if (element.getAttribute('aria-pressed') === 'true') {
      states.push('pressed');

    if (element.getAttribute('aria-disabled') === 'true' || 
        (element as HTMLInputElement).disabled) {
      states.push('disabled');

    if (element.getAttribute('aria-invalid') === 'true') {
      states.push('invalid');

    if (element.getAttribute('aria-required') === 'true') {
      states.push('required');

    return states.join(', ');

  /**
   * Get description for element
   */
  private getDescription(element: HTMLElement): string {
    const describedBy = element.getAttribute('aria-describedby');
    if (describedBy) {
      const descriptionElements = describedBy.split(' ')
        .map(id => document.getElementById(id))
        .filter(Boolean);
      
      if (descriptionElements.length > 0) {
        return descriptionElements.map(el => el!.textContent?.trim()).join(' ');

    return '';

/**
 * Screen Reader Testing Suite
 */
export class ScreenReaderTester {
  private mockScreenReader: MockScreenReader;
  private testResults: ScreenReaderTestResult[] = [];

  constructor() {
    this.mockScreenReader = new MockScreenReader();

  /**
   * Test component for screen reader compatibility
   */
  async testComponent(
    component: HTMLElement,
    testName: string,
    options: ScreenReaderTestOptions = {}
  ): Promise<ScreenReaderTestResult> {
    const startTime = Date.now();
    const issues: ScreenReaderIssue[] = [];
    const announcements: ScreenReaderAnnouncement[] = [];

    try {
      // Clear previous announcements
      this.mockScreenReader.clearAnnouncements();

      // Test basic accessibility
      issues.push(...this.testBasicAccessibility(component));

      // Test keyboard navigation
      issues.push(...this.testKeyboardNavigation(component));

      // Test ARIA attributes
      issues.push(...this.testAriaAttributes(component));

      // Test focus management
      issues.push(...this.testFocusManagement(component));

      // Test live regions
      issues.push(...this.testLiveRegions(component));

      // Test form accessibility
      if (this.isFormComponent(component)) {
        issues.push(...this.testFormAccessibility(component));

      // Test interactive elements
      issues.push(...this.testInteractiveElements(component));

      // Get all announcements made during testing
      announcements.push(...this.mockScreenReader.getAnnouncements());

      const result: ScreenReaderTestResult = {
        testName,
        component: component.tagName.toLowerCase(),
        passed: issues.length === 0,
        issues,
        announcements,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

      this.testResults.push(result);
      return result;

    } catch (error) {
      const result: ScreenReaderTestResult = {
        testName,
        component: component.tagName.toLowerCase(),
        passed: false,
        issues: [{
          type: 'error',
          severity: 'high',
          message: `Test execution failed: ${error}`,
          element: component,
          wcagCriterion: '4.1.1'
        }],
        announcements,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

      this.testResults.push(result);
      return result;

  /**
   * Test basic accessibility requirements
   */
  private testBasicAccessibility(element: HTMLElement): ScreenReaderIssue[] {
    const issues: ScreenReaderIssue[] = [];

    // Check for accessible name
    const accessibleName = this.mockScreenReader['getAccessibleName'](element);
    if (!accessibleName && this.requiresAccessibleName(element)) {
      issues.push({
        type: 'missing-accessible-name',
        severity: 'high',
        message: 'Interactive element missing accessible name',
        element,
        wcagCriterion: '4.1.2',
        suggestion: 'Add aria-label, aria-labelledby, or visible text content'
      });

    // Check for proper roles
    const role = element.getAttribute('role') || this.mockScreenReader['getRole'](element);
    if (this.isInteractive(element) && !role) {
      issues.push({
        type: 'missing-role',
        severity: 'medium',
        message: 'Interactive element missing explicit role',
        element,
        wcagCriterion: '4.1.2',
        suggestion: 'Add appropriate role attribute'
      });

    return issues;

  /**
   * Test keyboard navigation
   */
  private testKeyboardNavigation(element: HTMLElement): ScreenReaderIssue[] {
    const issues: ScreenReaderIssue[] = [];

    // Check if interactive elements are focusable
    if (this.isInteractive(element)) {
      const tabIndex = element.tabIndex;
      const isNaturallyFocusable = this.isNaturallyFocusable(element);
      
      if (!isNaturallyFocusable && tabIndex < 0) {
        issues.push({
          type: 'not-focusable',
          severity: 'high',
          message: 'Interactive element is not keyboard focusable',
          element,
          wcagCriterion: '2.1.1',
          suggestion: 'Add tabindex="0" or use naturally focusable element'
        });

      // Check for positive tabindex (anti-pattern)
      if (tabIndex > 0) {
        issues.push({
          type: 'positive-tabindex',
          severity: 'medium',
          message: 'Positive tabindex disrupts natural tab order',
          element,
          wcagCriterion: '2.4.3',
          suggestion: 'Use tabindex="0" or rely on natural tab order'
        });

    return issues;

  /**
   * Test ARIA attributes
   */
  private testAriaAttributes(element: HTMLElement): ScreenReaderIssue[] {
    const issues: ScreenReaderIssue[] = [];

    // Check for invalid ARIA references
    const ariaAttributes = ['aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns'];
    
    ariaAttributes.forEach(attr => {
      const value = element.getAttribute(attr);
      if (value) {
        const ids = value.split(' ');
        ids.forEach(id => {
          if (!document.getElementById(id)) {
            issues.push({
              type: 'invalid-aria-reference',
              severity: 'high',
              message: `${attr} references non-existent element: ${id}`,
              element,
              wcagCriterion: '4.1.1',
              suggestion: 'Ensure referenced element exists or remove invalid reference'
            });
        });
    });

    // Check for required ARIA attributes based on role
    const role = element.getAttribute('role');
    if (role) {
      const requiredAttributes = this.getRequiredAriaAttributes(role);
      requiredAttributes.forEach(attr => {
        if (!element.hasAttribute(attr)) {
          issues.push({
            type: 'missing-required-aria',
            severity: 'high',
            message: `Role "${role}" requires ${attr} attribute`,
            element,
            wcagCriterion: '4.1.2',
            suggestion: `Add ${attr} attribute with appropriate value`
          });
      });

    return issues;

  /**
   * Test focus management
   */
  private testFocusManagement(element: HTMLElement): ScreenReaderIssue[] {
    const issues: ScreenReaderIssue[] = [];

    // Check for focus indicators
    const computedStyle = window.getComputedStyle(element, ':focus');
    const hasVisibleFocus = (
      computedStyle.outline !== 'none' ||
      computedStyle.boxShadow !== 'none' ||
      computedStyle.border !== computedStyle.getPropertyValue('border') // Changed from initial state
    );

    if (this.isInteractive(element) && !hasVisibleFocus) {
      issues.push({
        type: 'no-focus-indicator',
        severity: 'medium',
        message: 'Interactive element lacks visible focus indicator',
        element,
        wcagCriterion: '2.4.7',
        suggestion: 'Add CSS focus styles (outline, box-shadow, or border)'
      });

    return issues;

  /**
   * Test live regions
   */
  private testLiveRegions(element: HTMLElement): ScreenReaderIssue[] {
    const issues: ScreenReaderIssue[] = [];

    const ariaLive = element.getAttribute('aria-live');
    if (ariaLive) {
      // Check for valid aria-live values
      if (!['polite', 'assertive', 'off'].includes(ariaLive)) {
        issues.push({
          type: 'invalid-aria-live',
          severity: 'medium',
          message: `Invalid aria-live value: ${ariaLive}`,
          element,
          wcagCriterion: '4.1.1',
          suggestion: 'Use "polite", "assertive", or "off"'
        });

      // Check if live region has accessible content
      if (!element.textContent?.trim()) {
        issues.push({
          type: 'empty-live-region',
          severity: 'low',
          message: 'Live region is empty',
          element,
          wcagCriterion: '4.1.3',
          suggestion: 'Ensure live region contains meaningful content when updated'
        });

    return issues;

  /**
   * Test form accessibility
   */
  private testFormAccessibility(element: HTMLElement): ScreenReaderIssue[] {
    const issues: ScreenReaderIssue[] = [];

    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
      const input = element as HTMLInputElement;
      
      // Check for associated label
      const hasLabel = (
        element.getAttribute('aria-label') ||
        element.getAttribute('aria-labelledby') ||
        (input.id && document.querySelector(`label[for="${input.id}"]`))
      );

      if (!hasLabel) {
        issues.push({
          type: 'missing-form-label',
          severity: 'high',
          message: 'Form control missing accessible label',
          element,
          wcagCriterion: '3.3.2',
          suggestion: 'Add aria-label, aria-labelledby, or associated label element'
        });

      // Check for error indication
      if (element.getAttribute('aria-invalid') === 'true') {
        const hasErrorDescription = element.getAttribute('aria-describedby');
        if (!hasErrorDescription) {
          issues.push({
            type: 'missing-error-description',
            severity: 'medium',
            message: 'Invalid form control missing error description',
            element,
            wcagCriterion: '3.3.1',
            suggestion: 'Add aria-describedby pointing to error message'
          });

      // Check for required field indication
      if (input.required || element.getAttribute('aria-required') === 'true') {
        // Should have some indication that field is required
        const hasRequiredIndication = (
          element.getAttribute('aria-label')?.includes('required') ||
          element.getAttribute('aria-describedby') ||
          (input.id && document.querySelector(`label[for="${input.id}"]`)?.textContent?.includes('*'))
        );

        if (!hasRequiredIndication) {
          issues.push({
            type: 'missing-required-indication',
            severity: 'medium',
            message: 'Required field lacks clear indication',
            element,
            wcagCriterion: '3.3.2',
            suggestion: 'Add visual and programmatic indication that field is required'
          });

    return issues;

  /**
   * Test interactive elements
   */
  private testInteractiveElements(element: HTMLElement): ScreenReaderIssue[] {
    const issues: ScreenReaderIssue[] = [];

    if (this.isInteractive(element)) {
      // Check for click handlers on non-interactive elements
      if (!this.isNaturallyInteractive(element) && this.hasClickHandler(element)) {
        issues.push({
          type: 'non-interactive-click-handler',
          severity: 'medium',
          message: 'Non-interactive element has click handler',
          element,
          wcagCriterion: '4.1.2',
          suggestion: 'Use button or add role="button" with keyboard support'
        });

      // Check for proper button implementation
      if (element.getAttribute('role') === 'button' || element.tagName === 'BUTTON') {
        const hasKeyboardSupport = this.hasKeyboardSupport(element);
        if (!hasKeyboardSupport) {
          issues.push({
            type: 'missing-keyboard-support',
            severity: 'high',
            message: 'Button lacks keyboard support',
            element,
            wcagCriterion: '2.1.1',
            suggestion: 'Add keyboard event handlers for Enter and Space keys'
          });

    return issues;

  /**
   * Helper methods
   */
  private requiresAccessibleName(element: HTMLElement): boolean {
    const interactiveRoles = ['button', 'link', 'textbox', 'combobox', 'checkbox', 'radio', 'slider'];
    const role = element.getAttribute('role') || this.mockScreenReader['getRole'](element);
    return interactiveRoles.includes(role) || this.isInteractive(element);

  private isInteractive(element: HTMLElement): boolean {
    const interactiveTags = ['button', 'a', 'input', 'select', 'textarea'];
    const interactiveRoles = ['button', 'link', 'textbox', 'combobox', 'checkbox', 'radio', 'slider'];
    
    return (
      interactiveTags.includes(element.tagName.toLowerCase()) ||
      interactiveRoles.includes(element.getAttribute('role') || '') ||
      element.hasAttribute('onclick') ||
      element.hasAttribute('tabindex')
    );

  private isNaturallyFocusable(element: HTMLElement): boolean {
    const focusableTags = ['button', 'a', 'input', 'select', 'textarea'];
    return focusableTags.includes(element.tagName.toLowerCase()) && 
           !(element as HTMLInputElement).disabled;

  private isNaturallyInteractive(element: HTMLElement): boolean {
    const interactiveTags = ['button', 'a', 'input', 'select', 'textarea'];
    return interactiveTags.includes(element.tagName.toLowerCase());

  private hasClickHandler(element: HTMLElement): boolean {
    return element.hasAttribute('onclick') || 
           element.addEventListener.length > 0; // This is a simplified check

  private hasKeyboardSupport(element: HTMLElement): boolean {
    // This is a simplified check - in real implementation, you'd check for actual event listeners
    return element.hasAttribute('onkeydown') || element.hasAttribute('onkeyup');

  private isFormComponent(element: HTMLElement): boolean {
    const formTags = ['input', 'select', 'textarea', 'button', 'form', 'fieldset', 'legend'];
    return formTags.includes(element.tagName.toLowerCase()) ||
           element.querySelector('input, select, textarea, button') !== null;

  private getRequiredAriaAttributes(role: string): string[] {
    const requirements: Record<string, string[]> = {
      'button': [],
      'checkbox': ['aria-checked'],
      'radio': ['aria-checked'],
      'slider': ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
      'progressbar': ['aria-valuenow'],
      'combobox': ['aria-expanded'],
      'listbox': [],
      'option': ['aria-selected'],
      'tab': ['aria-selected'],
      'tabpanel': [],
      'dialog': ['aria-labelledby'],
      'alertdialog': ['aria-labelledby'],
      'grid': [],
      'gridcell': [],
      'tree': [],
      'treeitem': ['aria-expanded']
    };

    return requirements[role] || [];

  /**
   * Generate comprehensive test report
   */
  generateReport(): ScreenReaderTestReport {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    const allIssues = this.testResults.flatMap(r => r.issues);
    const issuesBySeverity = {
      high: allIssues.filter(i => i.severity === 'high').length,
      medium: allIssues.filter(i => i.severity === 'medium').length,
      low: allIssues.filter(i => i.severity === 'low').length
    };

    const issuesByType = allIssues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        passRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
        totalIssues: allIssues.length,
        issuesBySeverity,
        issuesByType
      },
      testResults: this.testResults,
      recommendations: this.generateRecommendations(allIssues),
      timestamp: new Date().toISOString()
    };

  /**
   * Generate recommendations based on found issues
   */
  private generateRecommendations(issues: ScreenReaderIssue[]): string[] {
    const recommendations: string[] = [];
    const issueTypes = [...new Set(issues.map(i => i.type))];

    if (issueTypes.includes('missing-accessible-name')) {
      recommendations.push('Add accessible names to all interactive elements using aria-label, aria-labelledby, or visible text');

    if (issueTypes.includes('not-focusable')) {
      recommendations.push('Ensure all interactive elements are keyboard focusable');

    if (issueTypes.includes('no-focus-indicator')) {
      recommendations.push('Add visible focus indicators to all interactive elements');

    if (issueTypes.includes('invalid-aria-reference')) {
      recommendations.push('Fix all invalid ARIA references to ensure they point to existing elements');

    if (issueTypes.includes('missing-form-label')) {
      recommendations.push('Associate all form controls with descriptive labels');

    if (issueTypes.includes('missing-keyboard-support')) {
      recommendations.push('Implement keyboard support for all custom interactive elements');

    return recommendations;

  /**
   * Clear all test results
   */
  clearResults(): void {
    this.testResults = [];

// Type definitions
export interface ScreenReaderTestOptions {
  verbosity?: 'low' | 'medium' | 'high';
  includeWarnings?: boolean;
  customRules?: ScreenReaderTestRule[];

export interface ScreenReaderTestRule {
  name: string;
  test: (element: HTMLElement) => ScreenReaderIssue[];

export interface ScreenReaderIssue {
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  element: HTMLElement;
  wcagCriterion: string;
  suggestion?: string;

export interface ScreenReaderTestResult {
  testName: string;
  component: string;
  passed: boolean;
  issues: ScreenReaderIssue[];
  announcements: ScreenReaderAnnouncement[];
  duration: number;
  timestamp: string;

export interface ScreenReaderTestReport {
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    passRate: number;
    totalIssues: number;
    issuesBySeverity: {
      high: number;
      medium: number;
      low: number;
    };
    issuesByType: Record<string, number>;
  };
  testResults: ScreenReaderTestResult[];
  recommendations: string[];
  timestamp: string;

// Export the mock screen reader for direct use
export { MockScreenReader };