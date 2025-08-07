// ARIA labels for accessibility
export const ariaLabels = {
  status: {
    verified: 'Certificate is verified and authentic',
    unverified: 'Certificate is not verified or invalid',
    pending: 'Certificate verification is pending',
  },
  actions: {
    downloadCertificate: 'Download certificate as image',
    shareCertificate: 'Share certificate with others',
    copyCertificateLink: 'Copy certificate verification link',
    verifyCertificate: 'Verify certificate authenticity',
  },
  media: {
    qrCode: 'QR code for certificate verification',
    certificateImage: 'Certificate image',
    logo: 'VerifyCert logo',
  },
  navigation: {
    breadcrumb: 'Breadcrumb navigation',
    mainMenu: 'Main navigation menu',
    userMenu: 'User account menu',
    main: 'Main navigation',
    mobileMenu: 'Mobile navigation menu',
  },
};

// ARIA descriptions for complex interactions
export const ariaDescriptions = {
  certificates: {
    qrCode: 'Scan this QR code with your mobile device to verify the certificate authenticity',
    download: 'Download a high-quality image of this certificate for printing or sharing',
    share: 'Share this certificate via social media, email, or messaging apps',
    verification: 'This certificate has been verified on the blockchain and is authentic',
  },
  forms: {
    fileUpload: 'Upload a certificate file in JSON, PDF, or image format for verification',
    search: 'Enter a certificate ID number to search for and verify the certificate',
    dragDrop: 'Drag and drop files here or click to browse',
  },
};

// Generate unique IDs for ARIA relationships
let idCounter = 0;
export const generateAriaId = (prefix: string): string => {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
};

// Create field relationships for form accessibility
export const createFieldRelationships = (fieldId: string) => {
  const labelId = generateAriaId(`${fieldId}-label`);
  const errorId = generateAriaId(`${fieldId}-error`);
  const helpId = generateAriaId(`${fieldId}-help`);
  
  return {
    fieldId,
    labelId,
    errorId,
    helpId,
    getFieldProps: (hasError: boolean = false, hasHelp: boolean = false) => ({
      id: fieldId,
      'aria-labelledby': labelId,
      'aria-describedby': [
        hasError ? errorId : null,
        hasHelp ? helpId : null,
      ].filter(Boolean).join(' ') || undefined,
      'aria-invalid': hasError ? 'true' : undefined,
    }),
    getLabelProps: () => ({
      id: labelId,
      htmlFor: fieldId,
    }),
    getErrorProps: () => ({
      id: errorId,
      role: 'alert',
      'aria-live': 'polite' as const,
    }),
    getHelpProps: () => ({
      id: helpId,
    }),
  };
};