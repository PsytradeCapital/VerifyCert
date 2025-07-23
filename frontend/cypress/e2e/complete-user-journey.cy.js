describe('Complete User Journey E2E Tests', () => {
  let issuedCertificateId;

  beforeEach(() => {
    cy.setupMetaMask();
    cy.startPerformanceMonitoring();
  });

  it('should complete full end-to-end certificate lifecycle', () => {
    cy.measurePerformance('journey-start');
    
    // === PHASE 1: ISSUER ISSUES CERTIFICATE ===
    cy.log('Phase 1: Certificate Issuance');
    
    // Navigate to issuer dashboard
    cy.visit('/dashboard');
    cy.markPerformance('dashboard-loaded');
    
    // Connect wallet as issuer
    cy.connectWallet();
    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.waitForLoading();
    
    // Verify issuer is authorized
    cy.get('[data-testid="issuer-status"]').should('contain', 'Authorized Issuer');
    
    // Fill certificate form
    const certificateData = {
      recipientName: 'Jane Smith',
      courseName: 'Full Stack Web Development',
      institutionName: 'Digital Skills Academy',
      recipient: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
    };
    
    cy.fillCertificateForm(certificateData);
    
    // Mock blockchain transaction for minting
    cy.mockBlockchainTransaction('0xmint123456789abcdef');
    
    // Submit certificate
    cy.get('[data-testid="mint-certificate-btn"]').click();
    cy.waitForLoading();
    cy.waitForToast('Certificate minted successfully');
    
    cy.markPerformance('certificate-minted');
    
    // Get the issued certificate ID
    cy.get('[data-testid="certificate-card"]').first().then(($card) => {
      issuedCertificateId = $card.attr('data-token-id');
      cy.wrap(issuedCertificateId).as('certificateId');
    });
    
    // Verify certificate appears in issuer dashboard
    cy.get('[data-testid="certificate-card"]').first().within(() => {
      cy.get('[data-testid="recipient-name"]').should('contain', certificateData.recipientName);
      cy.get('[data-testid="course-name"]').should('contain', certificateData.courseName);
      cy.get('[data-testid="qr-code"]').should('be.visible');
      cy.get('[data-testid="verification-link"]').should('exist');
    });
    
    // === PHASE 2: CERTIFICATE SHARING ===
    cy.log('Phase 2: Certificate Sharing');
    
    // Share certificate
    cy.get('[data-testid="share-certificate-btn"]').first().click();
    cy.get('[data-testid="share-modal"]').should('be.visible');
    
    // Get verification URL
    cy.get('[data-testid="verification-link"]').then(($link) => {
      const verificationUrl = $link.text();
      cy.wrap(verificationUrl).as('verificationUrl');
      
      // Copy link
      cy.get('[data-testid="copy-link-btn"]').click();
      cy.waitForToast('Link copied to clipboard');
      cy.get('[data-testid="close-modal-btn"]').click();
    });
    
    // === PHASE 3: CERTIFICATE VIEWING (RECIPIENT) ===
    cy.log('Phase 3: Certificate Viewing by Recipient');
    
    cy.get('@certificateId').then((certId) => {
      // Navigate to certificate viewer page
      cy.visit(`/certificate/${certId}`);
      cy.waitForLoading();
      
      cy.markPerformance('certificate-viewed');
      
      // Verify certificate details are displayed correctly
      cy.get('[data-testid="certificate-display"]').should('be.visible');
      cy.get('[data-testid="recipient-name"]').should('contain', certificateData.recipientName);
      cy.get('[data-testid="course-name"]').should('contain', certificateData.courseName);
      cy.get('[data-testid="institution-name"]').should('contain', certificateData.institutionName);
      cy.get('[data-testid="issue-date"]').should('exist');
      cy.get('[data-testid="issuer-address"]').should('contain', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
      
      // QR code should be visible and functional
      cy.get('[data-testid="qr-code"]').should('be.visible');
      cy.get('[data-testid="qr-code-image"]').should('have.attr', 'src');
      
      // Download functionality
      cy.get('[data-testid="download-certificate-btn"]').should('be.visible');
      cy.get('[data-testid="download-pdf-btn"]').click();
      // Note: In real tests, you'd verify the download actually happens
      
      // Share functionality from certificate view
      cy.get('[data-testid="share-certificate-btn"]').click();
      cy.get('[data-testid="share-modal"]').should('be.visible');
      cy.get('[data-testid="close-modal-btn"]').click();
    });
    
    // === PHASE 4: PUBLIC VERIFICATION ===
    cy.log('Phase 4: Public Certificate Verification');
    
    cy.get('@certificateId').then((certId) => {
      // Navigate to public verification page (no wallet needed)
      cy.disconnectWallet();
      cy.visit(`/verify/${certId}`);
      cy.waitForLoading();
      
      cy.markPerformance('certificate-verified');
      
      // Verify certificate authenticity is confirmed
      cy.get('[data-testid="verification-status"]').should('contain', 'Valid Certificate');
      cy.get('[data-testid="verification-icon"]').should('have.class', 'text-green-500');
      cy.get('[data-testid="blockchain-verified"]').should('be.visible');
      
      // All certificate details should be visible
      cy.get('[data-testid="certificate-details"]').within(() => {
        cy.get('[data-testid="recipient-name"]').should('contain', certificateData.recipientName);
        cy.get('[data-testid="course-name"]').should('contain', certificateData.courseName);
        cy.get('[data-testid="institution-name"]').should('contain', certificateData.institutionName);
        cy.get('[data-testid="issuer-info"]').should('be.visible');
      });
      
      // Blockchain verification details
      cy.get('[data-testid="blockchain-details"]').within(() => {
        cy.get('[data-testid="token-id"]').should('contain', certId);
        cy.get('[data-testid="contract-address"]').should('exist');
        cy.get('[data-testid="network-name"]').should('contain', 'Polygon Mumbai');
      });
    });
    
    // === PHASE 5: QR CODE SCANNING SIMULATION ===
    cy.log('Phase 5: QR Code Scanning Workflow');
    
    cy.get('@certificateId').then((certId) => {
      // Simulate QR code scan by directly navigating to verification URL
      // In real implementation, this would come from QR code scanning
      cy.visit(`/verify/${certId}?source=qr`);
      cy.waitForLoading();
      
      // Should show QR scan indicator
      cy.get('[data-testid="qr-scanned-indicator"]').should('be.visible');
      
      // Same verification should work
      cy.get('[data-testid="verification-status"]').should('contain', 'Valid Certificate');
      
      // Mobile-optimized view for QR scanning
      cy.viewport(375, 667);
      cy.get('[data-testid="certificate-details"]').should('be.visible');
      cy.get('[data-testid="mobile-verification-actions"]').should('be.visible');
    });
    
    // === PHASE 6: ISSUER MANAGEMENT ===
    cy.log('Phase 6: Issuer Certificate Management');
    
    // Return to desktop view and reconnect wallet
    cy.viewport(1280, 720);
    cy.visit('/dashboard');
    cy.connectWallet();
    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.waitForLoading();
    
    cy.get('@certificateId').then((certId) => {
      // Find the issued certificate in dashboard
      cy.get(`[data-token-id="${certId}"]`).should('be.visible');
      
      // Test certificate management actions
      cy.get(`[data-token-id="${certId}"]`).within(() => {
        // View certificate
        cy.get('[data-testid="view-certificate-btn"]').click();
      });
      
      cy.url().should('include', `/certificate/${certId}`);
      cy.go('back');
      
      // Test analytics/statistics update
      cy.get('[data-testid="total-certificates"]').should('contain', '1');
      cy.get('[data-testid="this-month-count"]').should('contain', '1');
    });
    
    // === PHASE 7: ERROR HANDLING VERIFICATION ===
    cy.log('Phase 7: Error Handling Verification');
    
    // Test invalid certificate verification
    cy.visit('/verify/invalid-token-id');
    cy.waitForLoading();
    
    cy.get('[data-testid="verification-status"]').should('contain', 'Invalid Certificate');
    cy.get('[data-testid="verification-icon"]').should('have.class', 'text-red-500');
    cy.get('[data-testid="error-message"]').should('contain', 'Certificate not found');
    
    // === PHASE 8: PERFORMANCE AND ACCESSIBILITY VALIDATION ===
    cy.log('Phase 8: Performance and Accessibility Validation');
    
    cy.get('@certificateId').then((certId) => {
      // Test performance of complete workflow
      cy.measurePerformance('complete-journey', 'journey-start', 'certificate-verified');
      cy.endPerformanceMeasure('complete-journey', 30000); // Should complete within 30 seconds
      
      // Test accessibility across all pages
      cy.visit(`/verify/${certId}`);
      cy.testAccessibility();
      
      cy.visit(`/certificate/${certId}`);
      cy.testAccessibility();
      
      cy.visit('/dashboard');
      cy.connectWallet();
      cy.get('[data-testid="connect-wallet-btn"]').click();
      cy.waitForLoading();
      cy.testAccessibility();
    });
    
    // === PHASE 9: MOBILE RESPONSIVENESS VALIDATION ===
    cy.log('Phase 9: Mobile Responsiveness Validation');
    
    cy.testMobileResponsiveness();
    
    // Test key workflows on mobile
    cy.viewport(375, 667);
    
    cy.get('@certificateId').then((certId) => {
      // Mobile verification
      cy.visit(`/verify/${certId}`);
      cy.waitForLoading();
      cy.get('[data-testid="certificate-details"]').should('be.visible');
      
      // Mobile certificate viewing
      cy.visit(`/certificate/${certId}`);
      cy.waitForLoading();
      cy.get('[data-testid="certificate-display"]').should('be.visible');
      
      // Mobile dashboard (with wallet connection)
      cy.visit('/dashboard');
      cy.setupMetaMask();
      cy.get('[data-testid="mobile-menu-toggle"]').click();
      cy.get('[data-testid="connect-wallet-btn"]').click();
      cy.waitForLoading();
      cy.get('[data-testid="certificate-form"]').should('be.visible');
    });
    
    // === FINAL VALIDATION ===
    cy.log('Final Validation: Complete Journey Success');
    
    // Return to desktop
    cy.viewport(1280, 720);
    
    // Verify the certificate still exists and is valid
    cy.get('@certificateId').then((certId) => {
      cy.visit(`/verify/${certId}`);
      cy.waitForLoading();
      cy.get('[data-testid="verification-status"]').should('contain', 'Valid Certificate');
      
      // Take final screenshot for visual regression
      cy.compareSnapshot('complete-journey-final-verification');
    });
    
    // Log performance summary
    cy.window().then((win) => {
      if (win.performanceMetrics && win.performanceMetrics.measures) {
        cy.task('table', win.performanceMetrics.measures);
      }
    });
  });

  it('should handle complete journey with network interruptions', () => {
    // Test resilience to network issues during the complete workflow
    cy.visit('/dashboard');
    cy.connectWallet();
    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.waitForLoading();
    
    // Start certificate issuance
    cy.fillCertificateForm({
      recipientName: 'Network Test User',
      courseName: 'Network Resilience Course',
      institutionName: 'Resilience Academy',
      recipient: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
    });
    
    // Simulate network error during minting
    cy.simulateNetworkError();
    cy.get('[data-testid="mint-certificate-btn"]').click();
    cy.wait('@networkError');
    cy.waitForToast('Network connection failed', 'error');
    
    // Restore network and retry
    cy.mockBlockchainTransaction();
    cy.get('[data-testid="mint-certificate-btn"]').click();
    cy.waitForLoading();
    cy.waitForToast('Certificate minted successfully');
    
    // Continue with verification to ensure system recovered
    cy.get('[data-testid="certificate-card"]').first().then(($card) => {
      const tokenId = $card.attr('data-token-id');
      
      cy.visit(`/verify/${tokenId}`);
      cy.waitForLoading();
      cy.get('[data-testid="verification-status"]').should('contain', 'Valid Certificate');
    });
  });

  it('should handle concurrent user operations', () => {
    // Simulate multiple users performing operations simultaneously
    cy.visit('/dashboard');
    cy.connectWallet();
    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.waitForLoading();
    
    // Issue multiple certificates rapidly
    const certificates = [
      {
        recipientName: 'Concurrent User 1',
        courseName: 'Concurrent Course 1',
        institutionName: 'Concurrent Academy',
        recipient: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
      },
      {
        recipientName: 'Concurrent User 2',
        courseName: 'Concurrent Course 2',
        institutionName: 'Concurrent Academy',
        recipient: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
      }
    ];
    
    certificates.forEach((cert, index) => {
      cy.fillCertificateForm(cert);
      cy.mockBlockchainTransaction(`0xconcurrent${index}`);
      cy.get('[data-testid="mint-certificate-btn"]').click();
      cy.waitForLoading();
      cy.waitForToast('Certificate minted successfully');
      
      // Clear form for next certificate
      if (index < certificates.length - 1) {
        cy.get('[data-testid="clear-form-btn"]').click();
      }
    });
    
    // Verify both certificates exist
    cy.get('[data-testid="certificate-card"]').should('have.length', 2);
    
    // Test concurrent verification
    cy.get('[data-testid="certificate-card"]').each(($card, index) => {
      const tokenId = $card.attr('data-token-id');
      
      // Open verification in new context (simulating different users)
      cy.visit(`/verify/${tokenId}`);
      cy.waitForLoading();
      cy.get('[data-testid="verification-status"]').should('contain', 'Valid Certificate');
      cy.get('[data-testid="recipient-name"]').should('contain', `Concurrent User ${index + 1}`);
    });
  });

  it('should maintain data consistency throughout the journey', () => {
    // Test that certificate data remains consistent across all interfaces
    const certificateData = {
      recipientName: 'Consistency Test User',
      courseName: 'Data Consistency Course',
      institutionName: 'Consistency University',
      recipient: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
    };
    
    // Issue certificate
    cy.visit('/dashboard');
    cy.connectWallet();
    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.waitForLoading();
    
    cy.fillCertificateForm(certificateData);
    cy.mockBlockchainTransaction();
    cy.get('[data-testid="mint-certificate-btn"]').click();
    cy.waitForLoading();
    cy.waitForToast('Certificate minted successfully');
    
    cy.get('[data-testid="certificate-card"]').first().then(($card) => {
      const tokenId = $card.attr('data-token-id');
      
      // Verify data consistency across all views
      const viewsToTest = [
        { url: `/certificate/${tokenId}`, name: 'Certificate Viewer' },
        { url: `/verify/${tokenId}`, name: 'Public Verification' },
        { url: '/dashboard', name: 'Issuer Dashboard' }
      ];
      
      viewsToTest.forEach((view) => {
        cy.visit(view.url);
        if (view.name === 'Issuer Dashboard') {
          cy.connectWallet();
          cy.get('[data-testid="connect-wallet-btn"]').click();
          cy.waitForLoading();
        } else {
          cy.waitForLoading();
        }
        
        // Verify consistent data display
        cy.get('[data-testid="recipient-name"]').should('contain', certificateData.recipientName);
        cy.get('[data-testid="course-name"]').should('contain', certificateData.courseName);
        cy.get('[data-testid="institution-name"]').should('contain', certificateData.institutionName);
        
        cy.log(`✓ Data consistency verified in ${view.name}`);
      });
    });
  });
});