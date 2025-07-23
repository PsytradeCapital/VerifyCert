describe('Certificate Issuance E2E Tests', () => {
  beforeEach(() => {
    // Setup MetaMask mock
    cy.setupMetaMask();
    
    // Start performance monitoring
    cy.startPerformanceMonitoring();
  });

  it('should complete full certificate issuance workflow', () => {
    cy.measurePerformance('page-load-start');
    
    // Navigate to issuer dashboard
    cy.visit('/dashboard');
    cy.markPerformance('page-loaded');
    
    // Test page accessibility
    cy.testAccessibility();
    
    // Connect wallet
    cy.get('[data-testid="connect-wallet-btn"]').should('be.visible').click();
    cy.waitForLoading();
    cy.get('[data-testid="wallet-address"]').should('contain', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    
    cy.markPerformance('wallet-connected');
    
    // Fill certificate form
    const certificateData = {
      recipientName: 'John Doe',
      courseName: 'Advanced React Development',
      institutionName: 'Tech University',
      recipient: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
    };
    
    cy.fillCertificateForm(certificateData);
    
    // Verify form validation
    cy.get('[data-testid="mint-certificate-btn"]').should('not.be.disabled');
    
    // Mock successful blockchain transaction
    cy.mockBlockchainTransaction('0xabcdef1234567890abcdef1234567890abcdef12');
    
    cy.markPerformance('form-filled');
    
    // Submit certificate
    cy.get('[data-testid="mint-certificate-btn"]').click();
    
    // Wait for minting process
    cy.get('[data-testid="loading-spinner"]').should('be.visible');
    cy.waitForLoading();
    
    cy.markPerformance('certificate-minted');
    
    // Verify success feedback
    cy.waitForToast('Certificate minted successfully');
    
    // Verify certificate appears in dashboard
    cy.get('[data-testid="certificate-card"]').should('have.length.at.least', 1);
    cy.get('[data-testid="certificate-card"]').first().within(() => {
      cy.get('[data-testid="recipient-name"]').should('contain', certificateData.recipientName);
      cy.get('[data-testid="course-name"]').should('contain', certificateData.courseName);
      cy.get('[data-testid="institution-name"]').should('contain', certificateData.institutionName);
      cy.get('[data-testid="qr-code"]').should('be.visible');
    });
    
    // Test certificate sharing
    cy.get('[data-testid="share-certificate-btn"]').first().click();
    cy.get('[data-testid="share-modal"]').should('be.visible');
    cy.get('[data-testid="verification-link"]').should('contain', '/verify/');
    cy.get('[data-testid="close-modal-btn"]').click();
    
    // Measure performance
    cy.measurePerformance('total-issuance-time', 'page-load-start', 'certificate-minted');
    cy.endPerformanceMeasure('total-issuance-time', 10000); // Should complete within 10 seconds
    
    // Take screenshot for visual regression
    cy.compareSnapshot('certificate-issuance-success');
  });

  it('should handle form validation errors', () => {
    cy.visit('/dashboard');
    cy.setupMetaMask();
    cy.connectWallet();
    
    // Try to submit empty form
    cy.get('[data-testid="mint-certificate-btn"]').should('be.disabled');
    
    // Fill partial form
    cy.get('[data-testid="recipient-name"]').type('John Doe');
    cy.get('[data-testid="mint-certificate-btn"]').should('be.disabled');
    
    // Fill invalid email
    cy.get('[data-testid="recipient-address"]').type('invalid-address');
    cy.get('[data-testid="address-error"]').should('contain', 'Invalid Ethereum address');
    
    // Fix address
    cy.get('[data-testid="recipient-address"]').clear().type('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
    cy.get('[data-testid="address-error"]').should('not.exist');
    
    // Complete form
    cy.get('[data-testid="course-name"]').type('Test Course');
    cy.get('[data-testid="institution-name"]').type('Test Institution');
    
    cy.get('[data-testid="mint-certificate-btn"]').should('not.be.disabled');
  });

  it('should handle blockchain transaction errors', () => {
    cy.visit('/dashboard');
    cy.setupMetaMask();
    cy.connectWallet();
    
    // Fill valid form
    cy.fillCertificateForm({
      recipientName: 'Error Test User',
      courseName: 'Error Course',
      institutionName: 'Error Institution',
      recipient: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
    });
    
    // Mock transaction failure
    cy.window().then((win) => {
      win.ethereum.request = cy.stub().rejects(new Error('Transaction failed'));
    });
    
    // Submit form
    cy.get('[data-testid="mint-certificate-btn"]').click();
    
    // Verify error handling
    cy.waitForToast('Transaction failed', 'error');
    cy.get('[data-testid="mint-certificate-btn"]').should('not.be.disabled');
  });

  it('should handle network connectivity issues', () => {
    // Simulate network error
    cy.simulateNetworkError();
    
    cy.visit('/dashboard');
    cy.setupMetaMask();
    cy.connectWallet();
    
    cy.fillCertificateForm({
      recipientName: 'Network Test User',
      courseName: 'Network Course',
      institutionName: 'Network Institution',
      recipient: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
    });
    
    cy.get('[data-testid="mint-certificate-btn"]').click();
    
    cy.wait('@networkError');
    cy.waitForToast('Network connection failed', 'error');
  });

  it('should work on mobile devices', () => {
    cy.testMobileResponsiveness();
    
    // Test mobile-specific interactions
    cy.viewport(375, 667); // iPhone SE
    cy.visit('/dashboard');
    
    // Mobile menu should be visible
    cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible').click();
    cy.get('[data-testid="mobile-menu"]').should('be.visible');
    
    // Connect wallet on mobile
    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.setupMetaMask();
    
    // Form should be usable on mobile
    cy.get('[data-testid="certificate-form"]').should('be.visible');
    cy.fillCertificateForm({
      recipientName: 'Mobile User',
      courseName: 'Mobile Course',
      institutionName: 'Mobile Institution',
      recipient: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
    });
    
    // Button should be touch-friendly
    cy.get('[data-testid="mint-certificate-btn"]')
      .should('have.css', 'min-height')
      .and('match', /^([4-9]\d|\d{3,})px$/);
  });

  it('should handle concurrent certificate minting', () => {
    cy.visit('/dashboard');
    cy.setupMetaMask();
    cy.connectWallet();
    
    // Fill and submit first certificate
    cy.fillCertificateForm({
      recipientName: 'Concurrent User 1',
      courseName: 'Concurrent Course 1',
      institutionName: 'Concurrent Institution',
      recipient: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
    });
    
    cy.mockBlockchainTransaction('0xabc123');
    cy.get('[data-testid="mint-certificate-btn"]').click();
    
    // Immediately try to mint another (should be prevented)
    cy.get('[data-testid="mint-certificate-btn"]').should('be.disabled');
    
    // Wait for first to complete
    cy.waitForLoading();
    cy.waitForToast('Certificate minted successfully');
    
    // Now should be able to mint another
    cy.get('[data-testid="mint-certificate-btn"]').should('not.be.disabled');
  });

  it('should persist form data on page refresh', () => {
    cy.visit('/dashboard');
    cy.setupMetaMask();
    cy.connectWallet();
    
    // Fill form partially
    cy.get('[data-testid="recipient-name"]').type('Persistent User');
    cy.get('[data-testid="course-name"]').type('Persistent Course');
    
    // Refresh page
    cy.reload();
    cy.setupMetaMask();
    cy.connectWallet();
    
    // Form data should be restored (if implemented)
    // This test assumes localStorage persistence is implemented
    cy.get('[data-testid="recipient-name"]').should('have.value', 'Persistent User');
    cy.get('[data-testid="course-name"]').should('have.value', 'Persistent Course');
  });
});