# Screen Reader Testing Guide

This guide provides comprehensive instructions for testing the VerifyCert application with screen readers and assistive technologies to ensure full accessibility compliance.

## Overview

Screen reader testing is essential to ensure that users with visual impairments can effectively navigate and use the VerifyCert application. This guide covers both automated testing tools and manual testing procedures.

## Supported Screen Readers

### Primary Testing Targets
- **NVDA (Windows)** - Free, widely used
- **JAWS (Windows)** - Commercial, industry standard
- **VoiceOver (macOS/iOS)** - Built-in Apple screen reader
- **TalkBack (Android)** - Built-in Android screen reader

### Secondary Testing Targets
- **Orca (Linux)** - Open source screen reader
- **Dragon NaturallySpeaking** - Voice control software
- **Windows Narrator** - Built-in Windows screen reader

## Testing Environment Setup

### Prerequisites
1. Install target screen readers on testing devices
2. Familiarize yourself with screen reader keyboard shortcuts
3. Set up testing browsers (Chrome, Firefox, Safari, Edge)
4. Ensure testing devices have updated operating systems

### Screen Reader Configuration
- Set speech rate to normal speed for testing
- Enable all verbosity options during initial testing
- Configure punctuation reading to "most" or "all"
- Enable sound cues and audio feedback

## Automated Testing

### Running Automated Tests

```bash
# Run screen reader component tests
npm test -- screen-reader-component-tests.test.ts

# Run with coverage
npm test -- --coverage screen-reader-component-tests.test.ts

# Run in watch mode for development
npm test -- --watch screen-reader-component-tests.test.ts
```

### Interpreting Automated Results

The automated tests will generate a comprehensive report including:
- **Pass/Fail Status** for each component
- **Issue Severity** (High, Medium, Low)
- **WCAG Criterion** references
- **Specific Recommendations** for fixes

## Manual Testing Procedures

### 1. Basic Navigation Testing

#### Test Steps:
1. **Start screen reader** before opening the application
2. **Navigate to application** using browser
3. **Test tab navigation** through all interactive elements
4. **Verify reading order** matches visual layout
5. **Check landmark navigation** (headings, regions, lists)

#### Success Criteria:
- [ ] All interactive elements are reachable via keyboard
- [ ] Tab order is logical and follows visual flow
- [ ] Screen reader announces element types correctly
- [ ] Landmark navigation works properly
- [ ] No elements are skipped or duplicated

### 2. Component-Specific Testing

#### Button Component Testing

**Test Scenarios:**
```
1. Basic button announcement
   - Navigate to button with Tab
   - Verify: "Button name, button" is announced
   
2. Button states
   - Test disabled buttons: "Button name, button, unavailable"
   - Test pressed buttons: "Button name, button, pressed"
   - Test expanded buttons: "Button name, button, expanded"
   
3. Loading state
   - Activate loading button
   - Verify: Loading status is announced
   - Verify: Button becomes unavailable during loading
```

**Checklist:**
- [ ] Button purpose is clearly announced
- [ ] Button states (disabled, pressed, expanded) are announced
- [ ] Loading states provide appropriate feedback
- [ ] Keyboard activation works (Enter and Space keys)
- [ ] Focus indicators are visible and announced

#### Form Component Testing

**Test Scenarios:**
```
1. Input field navigation
   - Navigate to input field
   - Verify: "Label, edit text" or similar is announced
   
2. Required field indication
   - Navigate to required field
   - Verify: Required status is announced
   
3. Error state handling
   - Trigger validation error
   - Verify: Error message is announced immediately
   - Verify: Field is marked as invalid
   
4. Help text association
   - Navigate to field with help text
   - Verify: Help text is read after label
```

**Checklist:**
- [ ] All form fields have accessible labels
- [ ] Required fields are clearly identified
- [ ] Error messages are announced immediately
- [ ] Help text is properly associated
- [ ] Field types are correctly identified
- [ ] Validation feedback is accessible

#### Modal Dialog Testing

**Test Scenarios:**
```
1. Modal opening
   - Activate modal trigger
   - Verify: Focus moves to modal
   - Verify: Modal title is announced
   
2. Focus management
   - Test Tab navigation within modal
   - Verify: Focus is trapped within modal
   - Verify: Tab cycles through modal elements only
   
3. Modal closing
   - Press Escape key
   - Verify: Modal closes
   - Verify: Focus returns to trigger element
```

**Checklist:**
- [ ] Modal opening is announced
- [ ] Focus moves to modal when opened
- [ ] Focus is trapped within modal
- [ ] Modal title is properly announced
- [ ] Escape key closes modal
- [ ] Focus returns to trigger when closed
- [ ] Background content is not accessible

#### Navigation Testing

**Test Scenarios:**
```
1. Main navigation
   - Navigate to main navigation
   - Verify: "Navigation" landmark is announced
   - Test each navigation link
   
2. Current page indication
   - Navigate to current page link
   - Verify: "Current page" or similar is announced
   
3. Mobile menu
   - Activate mobile menu button
   - Verify: Menu state is announced
   - Test menu navigation
```

**Checklist:**
- [ ] Navigation landmarks are properly identified
- [ ] Current page is clearly indicated
- [ ] Mobile menu states are announced
- [ ] Skip links are available and functional
- [ ] Breadcrumb navigation is accessible

#### Select/Dropdown Testing

**Test Scenarios:**
```
1. Closed select
   - Navigate to select
   - Verify: "Combobox, collapsed" is announced
   - Verify: Current selection is announced
   
2. Opening select
   - Press Space or Enter
   - Verify: "Expanded" state is announced
   - Verify: Options are announced
   
3. Option navigation
   - Use arrow keys to navigate options
   - Verify: Each option is announced
   - Verify: Selection state is announced
   
4. Option selection
   - Press Enter on option
   - Verify: Selection is announced
   - Verify: Dropdown closes
```

**Checklist:**
- [ ] Select state (collapsed/expanded) is announced
- [ ] Current selection is clearly identified
- [ ] All options are accessible via keyboard
- [ ] Option selection is properly announced
- [ ] Search functionality (if present) is accessible

### 3. Page-Level Testing

#### Certificate Verification Page

**Test Focus Areas:**
- File upload accessibility
- QR code scanner alternatives
- Verification results presentation
- Certificate display formatting

**Test Scenarios:**
```
1. File upload
   - Navigate to upload area
   - Verify: Upload instructions are announced
   - Test drag-and-drop alternatives
   
2. Verification results
   - Submit certificate for verification
   - Verify: Results are announced via live region
   - Test result details navigation
```

#### Issuer Dashboard

**Test Focus Areas:**
- Data table accessibility
- Chart and graph alternatives
- Form wizard navigation
- Bulk actions accessibility

**Test Scenarios:**
```
1. Dashboard overview
   - Navigate through dashboard cards
   - Verify: Key metrics are announced
   - Test chart data alternatives
   
2. Certificate list
   - Navigate through certificate table
   - Verify: Column headers are announced
   - Test sorting and filtering
```

### 4. Advanced Feature Testing

#### Live Regions and Dynamic Content

**Test Scenarios:**
```
1. Status updates
   - Trigger status change
   - Verify: Update is announced automatically
   - Test different priority levels
   
2. Form validation
   - Submit invalid form
   - Verify: Errors are announced immediately
   - Test error correction feedback
   
3. Loading states
   - Trigger data loading
   - Verify: Loading status is announced
   - Test completion announcements
```

#### Progressive Web App Features

**Test Scenarios:**
```
1. Installation prompt
   - Trigger PWA install prompt
   - Verify: Installation option is accessible
   - Test installation process
   
2. Offline functionality
   - Disconnect from internet
   - Verify: Offline status is announced
   - Test offline feature accessibility
   
3. Push notifications
   - Enable push notifications
   - Verify: Permission request is accessible
   - Test notification content accessibility
```

## Testing Checklist

### Pre-Testing Setup
- [ ] Screen reader is running and configured
- [ ] Browser is set to default zoom level
- [ ] JavaScript is enabled
- [ ] Cookies and local storage are cleared
- [ ] Testing environment is quiet

### During Testing
- [ ] Test with screen reader only (no mouse)
- [ ] Test with keyboard navigation only
- [ ] Test with high contrast mode enabled
- [ ] Test with custom CSS disabled
- [ ] Test with images disabled

### Component Testing
- [ ] All buttons are accessible and functional
- [ ] All form fields have proper labels
- [ ] All links have descriptive text
- [ ] All images have appropriate alt text
- [ ] All modals handle focus correctly
- [ ] All dropdowns are keyboard accessible

### Page Testing
- [ ] Page title is descriptive and unique
- [ ] Heading structure is logical (h1, h2, h3...)
- [ ] Landmarks are properly identified
- [ ] Skip links are available and functional
- [ ] Content reading order is logical

### Dynamic Content Testing
- [ ] Live regions announce updates
- [ ] Loading states are communicated
- [ ] Error messages are announced
- [ ] Success confirmations are accessible
- [ ] Dynamic content changes are announced

## Common Issues and Solutions

### Issue: Button not announced properly
**Solution:** Add `aria-label` or ensure button has text content

### Issue: Form field missing label
**Solution:** Add `<label>` element or `aria-label` attribute

### Issue: Modal focus not trapped
**Solution:** Implement focus trap with proper event handling

### Issue: Dynamic content not announced
**Solution:** Use `aria-live` regions with appropriate politeness level

### Issue: Navigation not accessible
**Solution:** Add proper landmarks and skip links

### Issue: Table data not accessible
**Solution:** Add proper table headers and scope attributes

## Reporting Issues

### Issue Documentation Template
```
**Component:** [Component name]
**Screen Reader:** [NVDA/JAWS/VoiceOver/etc.]
**Browser:** [Chrome/Firefox/Safari/Edge]
**Issue:** [Brief description]
**Expected Behavior:** [What should happen]
**Actual Behavior:** [What actually happens]
**Steps to Reproduce:** [Detailed steps]
**WCAG Criterion:** [Relevant WCAG guideline]
**Severity:** [High/Medium/Low]
**Suggested Fix:** [Proposed solution]
```

### Priority Levels
- **High:** Blocks core functionality for screen reader users
- **Medium:** Impacts usability but workarounds exist
- **Low:** Minor usability improvement

## Testing Schedule

### Development Phase
- Run automated tests on every component change
- Perform manual testing on major feature additions
- Test with at least one screen reader weekly

### Pre-Release Phase
- Complete comprehensive manual testing
- Test with multiple screen readers
- Verify all high-priority issues are resolved

### Post-Release Phase
- Monitor user feedback for accessibility issues
- Perform regression testing on updates
- Update testing procedures based on findings

## Resources and References

### Screen Reader Shortcuts
- **NVDA:** [NVDA User Guide](https://www.nvaccess.org/documentation/)
- **JAWS:** [JAWS Keyboard Shortcuts](https://www.freedomscientific.com/training/jaws/)
- **VoiceOver:** [VoiceOver User Guide](https://support.apple.com/guide/voiceover/)

### WCAG Guidelines
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [Accessibility Testing Tools](https://www.w3.org/WAI/test-evaluate/tools/)

### Testing Tools
- [axe-core](https://github.com/dequelabs/axe-core) - Automated accessibility testing
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation tool
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Accessibility auditing

## Conclusion

Regular screen reader testing is essential for maintaining accessibility compliance and ensuring an inclusive user experience. This guide should be updated as new features are added and testing procedures are refined.

For questions or assistance with screen reader testing, consult the development team or accessibility specialists.