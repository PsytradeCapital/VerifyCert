describe('Certificate Verification E2E Tests', () => {
  let testTokenId;

  before(() => {
    // Setup test data
    cy.setupTestData();
    cy.get('@testTokenId1').then((tokenId) => {
      testTokenId = tokenId;
    });
  });

  beforeEach(() => {
    cy.startPerformanceMonitoring();
  });

  it('should verify valid certificate through public verification page', () => {
    cy.measurePerformance('verification-start');
    
    // Navigate to verification page
    cy.visit(`/verify/${testTokenId}`);
    cy.markPerformance('page-loaded');
    
    // Test accessibility
    cy.testAccessibility();
    
    // Wait for certificate data to load
    cy.waitForLoading();
    cy.markPerformance('data-loaded');
    
    // Verify certificate details are displayed
    cy.get('[data-testid="verification-status"]').should('contain', 'Valid Certificate');
    cy.get('[data-testid="verification-icon"]').should('have.class', 'text-green-500');
    
    // Check certificate information
    cy.get('[data-testid="certificate-details"]').within(() => {
      cy.get('[data-testid="recipient-name"]').should('contain', 'Alice Johnson');
      cy.get('[data-testid="course-name"]').should('contain', 'React Development');
      cy.get('[data-testid="institution-name"]').should('contain', 'Tech Academy');
      cy.get('[data-testid="issue-date"]').should('exist');
      cy.get('[data-testid="issuer-address"]').should('contain', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    });
    
    // Verify blockchain verification indicator
    cy.get('[data-testid="blockchain-verified"]').should('be.visible');
    cy.get('[data-testid="blockchain-network"]').should('contain', 'Polygon Mumbai');
    
    // Test sharing functionality
    cy.get('[data-testid="share-certificate-btn"]').click();
    cy.get('[data-testid="share-modal"]').should('be.visible');
    cy.get('[data-testid="copy-link-btn"]').click();
    cy.waitForToast('Link copied to clipboard');
    cy.get('[data-testid="close-modal-btn"]').click();
    
    // Measure performance
    cy.measurePerformance('verification-complete', 'verification-start', 'data-loaded');
    cy.endPerformanceMeasure('verification-complete', 3000); // Should load within 3 seconds
    
    // Visual regression test
    cy.compareSnapshot('valid-certificate-verification');
  });

  it('should handle invalid certificate verification', () => {
    const invalidTokenId = '999999';
    
    cy.visit(`/verify/${invalidTokenId}`);
    cy.waitForLoading();
    
    // Should show invalid certificate message
    cy.get('[data-testid="verification-status"]').should('contain', 'Invalid Certificate');
    cy.get('[data-testid="verification-icon"]').should('have.class', 'text-red-500');
    cy.get('[data-testid="error-message"]').should('contain', 'Certificate not found');
    
    // Should not show certificate details
    cy.get('[data-testid="certificate-details"]').should('not.exist');
    
    // Visual regression test
    cy.compareSnapshot('invalid-certificate-verification');
  });

  it('should handle QR code scanning workflow', () => {
    // First get the QR code from certificate viewer
    cy.visit(`/certificate/${testTokenId}`);
    cy.waitForLoading();
    
    // QR code should be visible
    cy.get('[data-testid="qr-code"]').should('be.visible');
    cy.get('[data-testid="qr-code-image"]').should('have.attr', 'src');
    
    // Get verification URL from QR code data
    cy.get('[data-testid="verification-url"]').then(($url) => {
      const verificationUrl = $url.text();
      const urlParts = verificationUrl.split('/');
      const tokenIdFromQR = urlParts[urlParts.length - 1];
      
      // Navigate to verification page via QR code URL
      cy.visit(`/verify/${tokenIdFromQR}`);
      cy.waitForLoading();
      
      // Should show valid certificate
      cy.get('[data-testid="verification-status"]').should('contain', 'Valid Certificate');
    });
  });

  it('should work without wallet connection', () => {
    // Don't connect wallet - verification should work without it
    cy.visit(`/verify/${testTokenId}`);
    cy.waitForLoading();
    
    // Should still show certificate details
    cy.get('[data-testid="verification-status"]').should('contain', 'Valid Certificate');
    cy.get('[data-testid="certificate-details"]').should('be.visible');
    
    // Wallet connection prompt should not be shown
    cy.get('[data-testid="connect-wallet-btn"]').should('not.exist');
  });

  it('should handle network connectivity issues during verification', () => {
    // Simulate network error for verification API
    cy.intercept('GET', `**/api/v1/certificates/${testTokenId}`, {
      statusCode: 500,
      body: {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to fetch certificate data'
        }
      }
    }).as('networkError');
    
    cy.visit(`/verify/${testTokenId}`);
    
    cy.wait('@networkError');
    
    // Should show error state
    cy.get('[data-testid="error-state"]').should('be.visible');
    cy.get('[data-testid="error-message"]').should('contain', 'Failed to fetch certificate data');
    cy.get('[data-testid="retry-btn"]').should('be.visible');
    
    // Test retry functionality
    cy.intercept('GET', `**/api/v1/certificates/${testTokenId}`, {
      statusCode: 200,
      body: {
        success: true,
        data: {
          tokenId: testTokenId,
          recipientName: 'Alice Johnson',
          courseName: 'React Development',
          institutionName: 'Tech Academy',
          issuer: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          recipient: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          isValid: true,
          issueDate: Math.floor(Date.now() / 1000)
        }
      }
    }).as('retrySuccess');
    
    cy.get('[data-testid="retry-btn"]').click();
    cy.wait('@retrySuccess');
    
    // Should now show certificate
    cy.get('[data-testid="verification-status"]').should('contain', 'Valid Certificate');
  });

  it('should be mobile responsive', () => {
    cy.testMobileResponsiveness();
    
    // Test on mobile viewport
    cy.viewport(375, 667);
    cy.visit(`/verify/${testTokenId}`);
    cy.waitForLoading();
    
    // Certificate details should be readable on mobile
    cy.get('[data-testid="certificate-details"]').should('be.visible');
    cy.get('[data-testid="certificate-card"]').should('have.css', 'max-width');
    
    // QR code should be appropriately sized
    cy.get('[data-testid="qr-code-image"]').should('have.css', 'max-width');
    
    // Share button should be touch-friendly
    cy.get('[data-testid="share-certificate-btn"]')
      .should('have.css', 'min-height')
      .and('match', /^([4-9]\d|\d{3,})px$/);
  });

  it('should handle revoked certificates', () => {
    // This test assumes we have a revoked certificate in test data
    const revokedTokenId = 'revoked-cert-123';
    
    cy.intercept('GET', `**/api/v1/certificates/${revokedTokenId}`, {
      statusCode: 200,
      body: {
        success: true,
        data: {
          tokenId: revokedTokenId,
          recipientName: 'Revoked User',
          courseName: 'Revoked Course',
          institutionName: 'Test Institution',
          issuer: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          recipient: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          isValid: false,
          issueDate: Math.floor(Date.now() / 1000),
          revokedAt: Math.floor(Date.now() / 1000)
        }
      }
    }).as('revokedCert');
    
    cy.visit(`/verify/${revokedTokenId}`);
    cy.wait('@revokedCert');
    
    // Should show revoked status
    cy.get('[data-testid="verification-status"]').should('contain', 'Certificate Revoked');
    cy.get('[data-testid="verification-icon"]').should('have.class', 'text-red-500');
    cy.get('[data-testid="revocation-notice"]').should('be.visible');
    cy.get('[data-testid="revocation-date"]').should('exist');
  });

  it('should load quickly with performance optimization', () => {
    cy.measurePerformance('fast-load-start');
    
    cy.visit(`/verify/${testTokenId}`);
    
    // Page should start rendering immediately
    cy.get('[data-testid="verification-page"]').should('be.visible');
    cy.markPerformance('page-visible');
    
    // Loading state should be shown while fetching data
    cy.get('[data-testid="loading-spinner"]').should('be.visible');
    cy.markPerformance('loading-shown');
    
    // Data should load quickly
    cy.waitForLoading();
    cy.markPerformance('data-loaded');
    
    // Measure critical performance metrics
    cy.measurePerformance('time-to-visible', 'fast-load-start', 'page-visible');
    cy.measurePerformance('time-to-interactive', 'fast-load-start', 'data-loaded');
    
    // Performance assertions
    cy.endPerformanceMeasure('time-to-visible', 1000); // Should be visible within 1 second
    cy.endPerformanceMeasure('time-to-interactive', 3000); // Should be interactive within 3 seconds
  });

  it('should handle multiple certificate verifications in sequence', () => {
    cy.get('@testTokenId1').then((tokenId1) => {
      cy.get('@testTokenId2').then((tokenId2) => {
        // Verify first certificate
        cy.visit(`/verify/${tokenId1}`);
        cy.waitForLoading();
        cy.get('[data-testid="verification-status"]').should('contain', 'Valid Certificate');
        cy.get('[data-testid="recipient-name"]').should('contain', 'Alice Johnson');
        
        // Navigate to second certificate
        cy.visit(`/verify/${tokenId2}`);
        cy.waitForLoading();
        cy.get('[data-testid="verification-status"]').should('contain', 'Valid Certificate');
        cy.get('[data-testid="recipient-name"]').should('contain', 'Bob Smith');
        
        // Navigate back to first certificate (test caching)
        cy.visit(`/verify/${tokenId1}`);
        cy.waitForLoading();
        cy.get('[data-testid="verification-status"]').should('contain', 'Valid Certificate');
        cy.get('[data-testid="recipient-name"]').should('contain', 'Alice Johnson');
      });
    });
  });

  it('should provide proper SEO and meta tags', () => {
    cy.visit(`/verify/${testTokenId}`);
    cy.waitForLoading();
    
    // Check meta tags are updated with certificate info
    cy.get('head title').should('contain', 'Certificate Verification');
    cy.get('head meta[name="description"]').should('have.attr', 'content').and('contain', 'Verify');
    cy.get('head meta[property="og:title"]').should('have.attr', 'content');
    cy.get('head meta[property="og:description"]').should('have.attr', 'content');
    cy.get('head meta[property="og:type"]').should('have.attr', 'content', 'website');
  });
});