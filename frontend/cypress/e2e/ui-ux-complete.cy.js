describe('Complete UI/UX Enhancement E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.viewport(1280, 720);
  });

  describe('Navigation Components', () => {
    it('should navigate using bottom navigation on mobile', () => {
      cy.viewport(375, 667); // Mobile viewport
      
      // Bottom navigation should be visible
      cy.get('[role="tablist"]').should('be.visible');
      
      // Test navigation items
      cy.contains('Home').should('be.visible');
      cy.contains('Verify').should('be.visible');
      cy.contains('Certificates').should('be.visible');
      cy.contains('Profile').should('be.visible');
      
      // Navigate to verify page
      cy.contains('Verify').click();
      cy.url().should('include', '/verify');
      
      // Navigate to certificates page
      cy.contains('Certificates').click();
      cy.url().should('include', '/certificates');
    });

    it('should handle keyboard navigation in bottom nav', () => {
      cy.viewport(375, 667);
      
      // Focus first navigation item
      cy.contains('Home').focus();
      
      // Use arrow keys to navigate
      cy.focused().type('{rightarrow}');
      cy.focused().should('contain', 'Verify');
      
      cy.focused().type('{rightarrow}');
      cy.focused().should('contain', 'Certificates');
      
      // Test wrap-around navigation
      cy.focused().type('{rightarrow}');
      cy.focused().should('contain', 'Profile');
      
      cy.focused().type('{rightarrow}');
      cy.focused().should('contain', 'Home');
    });
  });

  describe('Floating Action Button', () => {
    it('should display and interact with FAB', () => {
      // FAB should be visible
      cy.get('[aria-label*="action"]').should('be.visible');
      
      // Click to expand actions
      cy.get('[aria-label*="action"]').click();
      
      // Actions should be visible
      cy.get('[aria-expanded="true"]').should('exist');
      
      // Click outside to collapse
      cy.get('body').click(0, 0);
      cy.get('[aria-expanded="false"]').should('exist');
    });

    it('should handle FAB with extended variant', () => {
      // Test extended FAB with label
      cy.get('[aria-label*="action"]').should('be.visible');
      
      // Should show label text if extended variant is used
      cy.get('button').contains('Create').should('be.visible');
    });
  });

  describe('Button Component Variants', () => {
    beforeEach(() => {
      cy.visit('/components-demo'); // Assuming a demo page exists
    });

    it('should display all button variants correctly', () => {
      // Test different button variants
      cy.get('[data-testid="button-primary"]').should('have.class', 'bg-blue-600');
      cy.get('[data-testid="button-secondary"]').should('have.class', 'bg-gray-100');
      cy.get('[data-testid="button-danger"]').should('have.class', 'bg-red-600');
      cy.get('[data-testid="button-success"]').should('have.class', 'bg-green-600');
    });

    it('should handle loading states', () => {
      cy.get('[data-testid="button-loading"]').click();
      
      // Should show loading spinner
      cy.get('[data-testid="loader-icon"]').should('be.visible');
      
      // Button should be disabled during loading
      cy.get('[data-testid="button-loading"]').should('be.disabled');
    });

    it('should handle different sizes', () => {
      cy.get('[data-testid="button-small"]').should('have.class', 'px-3');
      cy.get('[data-testid="button-medium"]').should('have.class', 'px-4');
      cy.get('[data-testid="button-large"]').should('have.class', 'px-6');
    });
  });

  describe('Card Component', () => {
    it('should display different card variants', () => {
      cy.visit('/cards-demo');
      
      // Test card variants
      cy.get('[data-testid="card-default"]').should('be.visible');
      cy.get('[data-testid="card-elevated"]').should('have.class', 'shadow-lg');
      cy.get('[data-testid="card-outlined"]').should('have.class', 'border');
    });

    it('should handle clickable cards', () => {
      cy.get('[data-testid="card-clickable"]').click();
      
      // Should trigger click handler
      cy.get('[data-testid="click-result"]').should('contain', 'Card clicked');
    });
  });

  describe('Hero Section', () => {
    it('should display hero content correctly', () => {
      cy.visit('/');
      
      // Hero title and subtitle should be visible
      cy.get('h1').should('contain', 'VerifyCert');
      cy.get('p').should('contain', 'Secure certificate verification');
      
      // CTA buttons should be present
      cy.contains('Get Started').should('be.visible');
      cy.contains('Learn More').should('be.visible');
    });

    it('should handle QR scanner integration', () => {
      // QR scanner button should be visible
      cy.get('[data-testid="qr-scanner"]').should('be.visible');
      
      // Click to open scanner
      cy.get('[data-testid="qr-scanner"]').click();
      
      // Scanner modal should open
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('Scan QR Code').should('be.visible');
    });
  });

  describe('Verification Results', () => {
    beforeEach(() => {
      cy.visit('/verify');
    });

    it('should display successful verification', () => {
      // Mock successful verification
      cy.intercept('POST', '/api/verify', {
        statusCode: 200,
        body: {
          status: 'success',
          certificate: {
            id: '123',
            recipientName: 'John Doe',
            courseName: 'React Development',
            institution: 'Tech Academy',
            issueDate: '2024-01-15',
            isValid: true
          }
        }
      }).as('verifySuccess');

      // Trigger verification
      cy.get('[data-testid="verify-input"]').type('test-certificate-id');
      cy.get('[data-testid="verify-button"]').click();

      cy.wait('@verifySuccess');

      // Should show success state
      cy.contains('Certificate Verified').should('be.visible');
      cy.contains('John Doe').should('be.visible');
      cy.contains('React Development').should('be.visible');
      cy.get('[data-testid="check-icon"]').should('be.visible');
    });

    it('should display verification error', () => {
      // Mock failed verification
      cy.intercept('POST', '/api/verify', {
        statusCode: 404,
        body: {
          status: 'error',
          message: 'Certificate not found'
        }
      }).as('verifyError');

      cy.get('[data-testid="verify-input"]').type('invalid-certificate-id');
      cy.get('[data-testid="verify-button"]').click();

      cy.wait('@verifyError');

      // Should show error state
      cy.contains('Verification Failed').should('be.visible');
      cy.contains('Certificate not found').should('be.visible');
      cy.get('[data-testid="x-icon"]').should('be.visible');
    });

    it('should handle share and download actions', () => {
      // Setup successful verification first
      cy.intercept('POST', '/api/verify', {
        statusCode: 200,
        body: {
          status: 'success',
          certificate: {
            id: '123',
            recipientName: 'John Doe',
            courseName: 'React Development',
            institution: 'Tech Academy',
            issueDate: '2024-01-15',
            isValid: true
          }
        }
      }).as('verifySuccess');

      cy.get('[data-testid="verify-input"]').type('test-certificate-id');
      cy.get('[data-testid="verify-button"]').click();
      cy.wait('@verifySuccess');

      // Test share functionality
      cy.get('[data-testid="share-button"]').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('Share Certificate').should('be.visible');

      // Test download functionality
      cy.get('[data-testid="download-button"]').click();
      // Should trigger download (can't easily test file download in Cypress)
    });
  });

  describe('Certificate Card', () => {
    beforeEach(() => {
      cy.visit('/certificates');
    });

    it('should display certificate information', () => {
      // Mock certificates data
      cy.intercept('GET', '/api/certificates', {
        statusCode: 200,
        body: [
          {
            id: '123',
            recipientName: 'John Doe',
            courseName: 'React Development',
            institution: 'Tech Academy',
            issueDate: '2024-01-15',
            isValid: true
          }
        ]
      }).as('getCertificates');

      cy.wait('@getCertificates');

      // Certificate information should be displayed
      cy.contains('John Doe').should('be.visible');
      cy.contains('React Development').should('be.visible');
      cy.contains('Tech Academy').should('be.visible');
      cy.get('[data-testid="check-icon"]').should('be.visible');
    });

    it('should handle certificate actions', () => {
      cy.intercept('GET', '/api/certificates', {
        statusCode: 200,
        body: [
          {
            id: '123',
            recipientName: 'John Doe',
            courseName: 'React Development',
            institution: 'Tech Academy',
            issueDate: '2024-01-15',
            isValid: true
          }
        ]
      }).as('getCertificates');

      cy.wait('@getCertificates');

      // Test share action
      cy.get('[data-testid="share-icon"]').first().click();
      cy.get('[role="dialog"]').should('be.visible');

      // Close share dialog
      cy.get('[data-testid="close-icon"]').click();

      // Test download action
      cy.get('[data-testid="download-icon"]').first().click();
      // Download should be triggered
    });
  });

  describe('Analytics Dashboard', () => {
    beforeEach(() => {
      cy.visit('/analytics');
    });

    it('should display analytics data', () => {
      // Mock analytics data
      cy.intercept('GET', '/api/analytics', {
        statusCode: 200,
        body: {
          totalCertificates: 150,
          validCertificates: 145,
          invalidCertificates: 5,
          recentActivity: [
            { date: '2024-01-15', count: 10 },
            { date: '2024-01-14', count: 8 }
          ]
        }
      }).as('getAnalytics');

      cy.wait('@getAnalytics');

      // Analytics data should be displayed
      cy.contains('150').should('be.visible');
      cy.contains('145').should('be.visible');
      cy.contains('5').should('be.visible');
      
      // Charts should be rendered
      cy.get('[data-testid="chart-icon"]').should('be.visible');
    });
  });

  describe('Settings Panel', () => {
    beforeEach(() => {
      cy.visit('/settings');
    });

    it('should display and update settings', () => {
      // Settings sections should be visible
      cy.contains('Profile Settings').should('be.visible');
      cy.contains('Notification Preferences').should('be.visible');
      cy.contains('Theme').should('be.visible');

      // Test toggle switches
      cy.get('[role="switch"]').first().click();
      cy.get('[role="switch"]').first().should('have.attr', 'aria-checked', 'true');

      // Test save functionality
      cy.contains('Save Settings').click();
      cy.contains('Settings saved successfully').should('be.visible');
    });
  });

  describe('Feedback Animations', () => {
    it('should display success feedback', () => {
      cy.visit('/');
      
      // Trigger success action
      cy.get('[data-testid="success-trigger"]').click();
      
      // Success toast should appear
      cy.get('[role="status"]').should('be.visible');
      cy.contains('Success!').should('be.visible');
      cy.get('[data-testid="check-icon"]').should('be.visible');
      
      // Toast should auto-dismiss
      cy.get('[role="status"]', { timeout: 5000 }).should('not.exist');
    });

    it('should display error feedback', () => {
      // Trigger error action
      cy.get('[data-testid="error-trigger"]').click();
      
      // Error toast should appear
      cy.get('[role="status"]').should('be.visible');
      cy.contains('Error occurred!').should('be.visible');
      cy.get('[data-testid="x-icon"]').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to mobile viewport', () => {
      cy.viewport(375, 667);
      
      // Bottom navigation should be visible on mobile
      cy.get('[role="tablist"]').should('be.visible');
      
      // FAB should be positioned correctly
      cy.get('[aria-label*="action"]').should('have.class', 'bottom-6');
      
      // Cards should stack vertically
      cy.get('[data-testid="certificate-card"]').should('have.css', 'width');
    });

    it('should adapt to tablet viewport', () => {
      cy.viewport(768, 1024);
      
      // Layout should adapt for tablet
      cy.get('[data-testid="main-content"]').should('be.visible');
      
      // Navigation should be appropriate for tablet
      cy.get('[role="tablist"]').should('be.visible');
    });

    it('should adapt to desktop viewport', () => {
      cy.viewport(1280, 720);
      
      // Desktop layout should be used
      cy.get('[data-testid="desktop-layout"]').should('be.visible');
      
      // Side navigation might be visible on desktop
      cy.get('[data-testid="side-nav"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation', () => {
      // Tab through interactive elements
      cy.get('body').tab();
      cy.focused().should('be.visible');
      
      // Continue tabbing through all focusable elements
      for (let i = 0; i < 10; i++) {
        cy.focused().tab();
        cy.focused().should('be.visible');
      }
    });

    it('should provide proper ARIA labels', () => {
      // Check for ARIA labels on interactive elements
      cy.get('[role="button"]').should('have.attr', 'aria-label');
      cy.get('[role="tablist"]').should('exist');
      cy.get('[role="tab"]').should('have.attr', 'aria-selected');
    });

    it('should support screen readers', () => {
      // Check for screen reader announcements
      cy.get('[role="status"]').should('have.attr', 'aria-live');
      cy.get('[aria-describedby]').should('exist');
      
      // Check for proper heading structure
      cy.get('h1').should('exist');
      cy.get('h2').should('exist');
    });
  });

  describe('Performance', () => {
    it('should load quickly', () => {
      cy.visit('/', {
        onBeforeLoad: (win) => {
          win.performance.mark('start');
        },
        onLoad: (win) => {
          win.performance.mark('end');
          win.performance.measure('pageLoad', 'start', 'end');
          const measure = win.performance.getEntriesByName('pageLoad')[0];
          expect(measure.duration).to.be.lessThan(3000); // 3 seconds
        }
      });
    });

    it('should handle large datasets efficiently', () => {
      // Mock large dataset
      const largeCertificateList = Array.from({ length: 100 }, (_, i) => ({
        id: `cert-${i}`,
        recipientName: `User ${i}`,
        courseName: `Course ${i}`,
        institution: 'Test Institution',
        issueDate: '2024-01-15',
        isValid: true
      }));

      cy.intercept('GET', '/api/certificates', {
        statusCode: 200,
        body: largeCertificateList
      }).as('getLargeCertificateList');

      cy.visit('/certificates');
      cy.wait('@getLargeCertificateList');

      // Page should still be responsive
      cy.get('[data-testid="certificate-card"]').should('have.length.at.least', 10);
      
      // Scrolling should be smooth
      cy.scrollTo('bottom');
      cy.scrollTo('top');
    });
  });

  describe('Print Functionality', () => {
    it('should provide print-friendly certificate display', () => {
      cy.visit('/certificates/123');
      
      // Print button should be available
      cy.get('[data-testid="print-button"]').should('be.visible');
      
      // Click print button
      cy.get('[data-testid="print-button"]').click();
      
      // Print dialog should open (browser-dependent)
      // We can't easily test the actual print dialog, but we can verify
      // that print styles are applied
      cy.get('[data-testid="certificate-content"]').should('have.class', 'print-friendly');
    });
  });
});