/**
 * ARIA utilities for consistent accessibility labeling and descriptions
 */

/**
 * Generate unique IDs for ARIA relationships
 */
export const generateAriaId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Common ARIA labels for UI components
 */
export const ariaLabels = {
  // Navigation
  navigation: {
    main: 'Main navigation',
    breadcrumb: 'Breadcrumb navigation',
    pagination: 'Pagination navigation',
    sidebar: 'Sidebar navigation',
    bottomNav: 'Bottom navigation',
    userMenu: 'User account menu',
    mobileMenu: 'Mobile navigation menu',
  },
  
  // Buttons
  buttons: {
    close: 'Close',
    menu: 'Open menu',
    search: 'Search',
    submit: 'Submit form',
    cancel: 'Cancel',
    save: 'Save changes',
    delete: 'Delete item',
    edit: 'Edit item',
    download: 'Download file',
    share: 'Share item',
    copy: 'Copy to clipboard',
    refresh: 'Refresh content',
    expand: 'Expand section',
    collapse: 'Collapse section',
    previous: 'Previous page',
    next: 'Next page',
    first: 'First page',
    last: 'Last page',
  },
  
  // Forms
  forms: {
    required: 'Required field',
    optional: 'Optional field',
    search: 'Search input',
    email: 'Email address',
    password: 'Password',
    confirmPassword: 'Confirm password',
    firstName: 'First name',
    lastName: 'Last name',
    phoneNumber: 'Phone number',
    address: 'Address',
    city: 'City',
    state: 'State or province',
    zipCode: 'ZIP or postal code',
    country: 'Country',
    dateOfBirth: 'Date of birth',
    fileUpload: 'File upload area',
    dragDrop: 'Drag and drop files here or click to browse',
  },
  
  // Status and feedback
  status: {
    loading: 'Loading content',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
    verified: 'Verified',
    unverified: 'Not verified',
    valid: 'Valid',
    invalid: 'Invalid',
    connected: 'Connected',
    disconnected: 'Disconnected',
  },
  
  // Content
  content: {
    certificate: 'Certificate details',
    certificateCard: 'Certificate information card',
    verificationResult: 'Verification result',
    dashboard: 'Dashboard overview',
    profile: 'User profile',
    settings: 'Application settings',
    help: 'Help and support',
    about: 'About this application',
  },
  
  // Actions
  actions: {
    verifyCertificate: 'Verify certificate',
    issueCertificate: 'Issue new certificate',
    viewCertificate: 'View certificate details',
    downloadCertificate: 'Download certificate',
    shareCertificate: 'Share certificate',
    copyCertificateLink: 'Copy certificate verification link',
    connectWallet: 'Connect cryptocurrency wallet',
    disconnectWallet: 'Disconnect wallet',
    switchNetwork: 'Switch blockchain network',
  },
  
  // Modals and dialogs
  modals: {
    dialog: 'Dialog',
    alert: 'Alert dialog',
    confirmation: 'Confirmation dialog',
    settings: 'Settings dialog',
    help: 'Help dialog',
    about: 'About dialog',
  },
  
  // Lists and tables
  lists: {
    certificates: 'List of certificates',
    users: 'List of users',
    transactions: 'List of transactions',
    notifications: 'List of notifications',
    searchResults: 'Search results',
  },
  
  // Media
  media: {
    qrCode: 'QR code for certificate verification',
    logo: 'VerifyCert application logo',
    avatar: 'User profile picture',
    certificateImage: 'Certificate image',
    icon: 'Icon',
  },
};

/**
 * Common ARIA descriptions for UI components
 */
export const ariaDescriptions = {
  // Navigation
  navigation: {
    breadcrumb: 'Shows your current location in the application',
    sidebar: 'Contains main navigation links and user account options',
    bottomNav: 'Quick access to main application features',
    userMenu: 'Access account settings, profile, and sign out options',
  },
  
  // Forms
  forms: {
    required: 'This field is required and must be filled out',
    optional: 'This field is optional and can be left blank',
    passwordRequirements: 'Password must be at least 8 characters long and contain uppercase, lowercase, and numeric characters',
    fileUpload: 'Supported formats: PDF, JSON, PNG, JPG. Maximum file size: 10MB',
    dragDrop: 'You can drag files directly onto this area or click to open file browser',
    search: 'Enter keywords to search through available content',
  },
  
  // Certificates
  certificates: {
    card: 'Contains certificate details including recipient, course, institution, and verification status',
    verification: 'Shows whether this certificate has been verified on the blockchain',
    qrCode: 'Scan this QR code with a mobile device to verify the certificate',
    download: 'Downloads a PDF copy of this certificate for offline viewing',
    share: 'Share this certificate via social media, email, or copy the verification link',
    metadata: 'Technical details about this certificate including blockchain transaction information',
  },
  
  // Wallet
  wallet: {
    connect: 'Connect your cryptocurrency wallet to issue or manage certificates',
    disconnect: 'Disconnect your currently connected wallet',
    network: 'Switch to the required blockchain network for certificate operations',
    address: 'Your wallet address used for blockchain transactions',
    balance: 'Current balance of cryptocurrency in your connected wallet',
  },
  
  // Status indicators
  status: {
    loading: 'Content is currently being loaded, please wait',
    success: 'Operation completed successfully',
    error: 'An error occurred, please try again or contact support',
    warning: 'Please review the information before proceeding',
    verified: 'This certificate has been verified on the blockchain and is authentic',
    unverified: 'This certificate could not be verified or may be invalid',
  },
  
  // Interactive elements
  interactive: {
    button: 'Click to perform this action',
    link: 'Click to navigate to this page or section',
    toggle: 'Click to toggle this setting on or off',
    dropdown: 'Click to open dropdown menu with additional options',
    tab: 'Click to switch to this tab and view related content',
    accordion: 'Click to expand or collapse this section',
  },
  
  // Data display
  data: {
    table: 'Data table with sortable columns and filtering options',
    chart: 'Visual representation of data with interactive elements',
    list: 'List of items with options to sort, filter, or search',
    card: 'Summary card containing key information and action buttons',
  },
};

/**
 * Generate ARIA attributes for common UI patterns
 */
export const generateAriaAttributes = {
  /**
   * Generate attributes for a button
   */
  button: (options: {
    label?: string;
    description?: string;
    pressed?: boolean;
    expanded?: boolean;
    controls?: string;
    describedBy?: string;
  }) => ({
    'aria-label': options.label,
    'aria-describedby': options.describedBy,
    'aria-pressed': options.pressed,
    'aria-expanded': options.expanded,
    'aria-controls': options.controls,
  }),

  /**
   * Generate attributes for a form input
   */
  input: (options: {
    label?: string;
    description?: string;
    required?: boolean;
    invalid?: boolean;
    describedBy?: string;
    labelledBy?: string;
  }) => ({
    'aria-label': options.label,
    'aria-describedby': options.describedBy,
    'aria-labelledby': options.labelledBy,
    'aria-required': options.required,
    'aria-invalid': options.invalid,
  }),

  /**
   * Generate attributes for a modal or dialog
   */
  modal: (options: {
    title?: string;
    description?: string;
    labelledBy?: string;
    describedBy?: string;
  }) => ({
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': options.labelledBy,
    'aria-describedby': options.describedBy,
    'aria-label': options.title,
  }),

  /**
   * Generate attributes for a navigation menu
   */
  navigation: (options: {
    label?: string;
    current?: boolean;
    expanded?: boolean;
    controls?: string;
  }) => ({
    role: 'navigation',
    'aria-label': options.label,
    'aria-current': options.current ? 'page' : undefined,
    'aria-expanded': options.expanded,
    'aria-controls': options.controls,
  }),

  /**
   * Generate attributes for a list
   */
  list: (options: {
    label?: string;
    description?: string;
    itemCount?: number;
  }) => ({
    role: 'list',
    'aria-label': options.label,
    'aria-describedby': options.description,
    'aria-setsize': options.itemCount,
  }),

  /**
   * Generate attributes for a tab panel
   */
  tab: (options: {
    selected?: boolean;
    controls?: string;
    labelledBy?: string;
  }) => ({
    role: 'tab',
    'aria-selected': options.selected,
    'aria-controls': options.controls,
    'aria-labelledby': options.labelledBy,
    tabIndex: options.selected ? 0 : -1,
  }),

  /**
   * Generate attributes for a status or alert
   */
  status: (options: {
    type?: 'status' | 'alert' | 'log';
    live?: 'polite' | 'assertive' | 'off';
    atomic?: boolean;
  }) => ({
    role: options.type || 'status',
    'aria-live': options.live || 'polite',
    'aria-atomic': options.atomic,
  }),
};

/**
 * Helper to create accessible form field relationships
 */
export const createFieldRelationships = (fieldName: string) => {
  const labelId = generateAriaId(`${fieldName}-label`);
  const descriptionId = generateAriaId(`${fieldName}-description`);
  const errorId = generateAriaId(`${fieldName}-error`);
  const helpId = generateAriaId(`${fieldName}-help`);

  return {
    labelId,
    descriptionId,
    errorId,
    helpId,
    getInputProps: (hasError?: boolean, hasHelp?: boolean) => ({
      'aria-labelledby': labelId,
      'aria-describedby': [
        hasError ? errorId : null,
        hasHelp ? helpId : null,
        descriptionId,
      ].filter(Boolean).join(' ') || undefined,
      'aria-invalid': hasError,
    }),
  };
};

/**
 * Helper to create accessible modal relationships
 */
export const createModalRelationships = (modalName: string) => {
  const titleId = generateAriaId(`${modalName}-title`);
  const descriptionId = generateAriaId(`${modalName}-description`);

  return {
    titleId,
    descriptionId,
    getModalProps: () => ({
      role: 'dialog',
      'aria-modal': true,
      'aria-labelledby': titleId,
      'aria-describedby': descriptionId,
    }),
  };
};

/**
 * Helper to create accessible list relationships
 */
export const createListRelationships = (listName: string) => {
  const labelId = generateAriaId(`${listName}-label`);
  const descriptionId = generateAriaId(`${listName}-description`);

  return {
    labelId,
    descriptionId,
    getListProps: (itemCount?: number) => ({
      role: 'list',
      'aria-labelledby': labelId,
      'aria-describedby': descriptionId,
      'aria-setsize': itemCount,
    }),
    getItemProps: (index: number, itemCount?: number) => ({
      role: 'listitem',
      'aria-setsize': itemCount,
      'aria-posinset': index + 1,
    }),
  };
};

/**
 * Screen reader only text utility
 */
export const srOnly = (text: string) => (
  <span className="sr-only">{text}</span>
);

/**
 * Announce text to screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Check if an element has accessible name
 */
export const hasAccessibleName = (element: HTMLElement): boolean => {
  return !!(
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    element.getAttribute('title') ||
    (element.tagName === 'IMG' && element.getAttribute('alt')) ||
    (element.tagName === 'INPUT' && element.getAttribute('placeholder')) ||
    element.textContent?.trim()
  );
};

/**
 * Validate ARIA attributes for development
 */
export const validateAriaAttributes = (element: HTMLElement): string[] => {
  const warnings: string[] = [];
  
  // Check for common issues
  if (element.getAttribute('role') === 'button' && !hasAccessibleName(element)) {
    warnings.push('Button role element missing accessible name');
  }
  
  if (element.getAttribute('aria-describedby')) {
    const describedBy = element.getAttribute('aria-describedby')!;
    const referencedIds = describedBy.split(' ');
    referencedIds.forEach(id => {
      if (!document.getElementById(id)) {
        warnings.push(`aria-describedby references non-existent ID: ${id}`);
      }
    });
  }
  
  if (element.getAttribute('aria-labelledby')) {
    const labelledBy = element.getAttribute('aria-labelledby')!;
    const referencedIds = labelledBy.split(' ');
    referencedIds.forEach(id => {
      if (!document.getElementById(id)) {
        warnings.push(`aria-labelledby references non-existent ID: ${id}`);
      }
    });
  }
  
  return warnings;
};