describe('Issuer Dashboard E2E Tests', () => {
  beforeEach(() => {
    cy.setupMetaMask();
    cy.startPerformanceMonitoring();
  });

  it('should display issuer dashboard with certificate management', () => {
    cy.measurePerformance('dashboard-load-start');
    
    cy.visit('/dashboard');
    cy.markPerformance('page-loaded');
    
    // Test accessibility
    cy.testAccessibility();
    
    // Connect wallet
    cy.connectWallet();
    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.waitForLoading();
    
    cy.markPerformance('wallet-connected');
    
    // Dashboard should show issuer information
    cy.get('[data-testid="issuer-info"]').should('be.visible');
    cy.get('[data-testid="wallet-address"]').should('contain', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    
    // Certificate form should be visible
    cy.get('[data-testid="certificate-form"]').should('be.visible');
    
    // Issued certificates section should be visible
    cy.get('[data-testid="issued-certificates"]').should('be.visible');
    cy.get('[data-testid="certificates-list"]').should('exist');
    
    // Statistics should be displayed
    cy.get('[data-testid="certificate-stats"]').should('be.visible');
    cy.get('[data-testid="total-certificates"]').should('exist');
    cy.get('[data-testid="recent-certificates"]').should('exist');
    
    cy.markPerformance('dashboard-ready');
    
    // Measure performance
    cy.measurePerformance('dashboard-load-time', 'dashboard-load-start', 'dashboard-ready');
    cy.endPerformanceMeasure('dashboard-load-time', 5000);
    
    // Visual regression test
    cy.compareSnapshot('issuer-dashboard-loaded');
  });

  it('should filter and search issued certificates', () => {
    cy.visit('/dashboard');
    cy.connectWallet();
    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.waitForLoading();
    
    // Setup test certificates first
    cy.setupTestData();
    
    // Wait for certificates to load
    cy.get('[data-testid="certificates-list"]').should('contain', 'Alice Johnson');
    
    // Test search functionality
    cy.get('[data-testid="search-certificates"]').type('Alice');
    cy.get('[data-testid="certificate-card"]').should('have.length', 1);
    cy.get('[data-testid="certificate-card"]').should('contain', 'Alice Johnson');
    
    // Clear search
    cy.get('[data-testid="search-certificates"]').clear();
    cy.get('[data-testid="certificate-card"]').should('have.length.at.least', 2);
    
    // Test course filter
    cy.get('[data-testid="course-filter"]').select('React Development');
    cy.get('[data-testid="certificate-card"]').should('have.length', 1);
    cy.get('[data-testid="certificate-card"]').should('contain', 'React Development');
    
    // Reset filters
    cy.get('[data-testid="reset-filters-btn"]').click();
    cy.get('[data-testid="certificate-card"]').should('have.length.at.least', 2);
    
    // Test date range filter
    cy.get('[data-testid="date-from"]').type('2024-01-01');
    cy.get('[data-testid="date-to"]').type('2024-12-31');
    cy.get('[data-testid="apply-date-filter-btn"]').click();
    
    // Should show certificates within date range
    cy.get('[data-testid="certificate-card"]').should('exist');
  });

  it('should handle certificate pagination', () => {
    cy.visit('/dashboard');
    cy.connectWallet();
    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.waitForLoading();
    
    // Mock API response with many certificates
    cy.intercept('GET', '**/api/v1/certificates/issuer/**', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          certificates: Array.from({ length: 25 }, (_, i) => ({
            tokenId: `token-${i}`,
            recipientName: `User ${i}`,
            courseName: `Course ${i}`,
            institutionName: 'Test Institution',
            issueDate: Math.floor(Date.now() / 1000) - (i * 86400),
            isValid: true
          })),
          totalCertificates: 25,
          pagination: {
            page: 1,
            limit: 10,
            total: 25,
            pages: 3
          }
        }
      }
    }).as('certificatesPage1');
    
    cy.wait('@certificatesPage1');
    
    // Should show first page of certificates
    cy.get('[data-testid="certificate-card"]').should('have.length', 10);
    cy.get('[data-testid="pagination-info"]').should('contain', 'Showing 1-10 of 25');
    
    // Test pagination controls
    cy.get('[data-testid="next-page-btn"]').should('be.visible').and('not.be.disabled');
    cy.get('[data-testid="prev-page-btn"]').should('be.disabled');
    
    // Mock second page
    cy.intercept('GET', '**/api/v1/certificates/issuer/**', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          certificates: Array.from({ length: 10 }, (_, i) => ({
            tokenId: `token-${i + 10}`,
            recipientName: `User ${i + 10}`,
            courseName: `Course ${i + 10}`,
            institutionName: 'Test Institution',
            issueDate: Math.floor(Date.now() / 1000) - ((i + 10) * 86400),
            isValid: true
          })),
          totalCertificates: 25,
          pagination: {
            page: 2,
            limit: 10,
            total: 25,
            pages: 3
          }
        }
      }
    }).as('certificatesPage2');
    
    // Navigate to second page
    cy.get('[data-testid="next-page-btn"]').click();
    cy.wait('@certificatesPage2');
    
    cy.get('[data-testid="certificate-card"]').should('have.length', 10);
    cy.get('[data-testid="pagination-info"]').should('contain', 'Showing 11-20 of 25');
    cy.get('[data-testid="prev-page-btn"]').should('not.be.disabled');
  });

  it('should handle certificate actions (view, share, revoke)', () => {
    cy.visit('/dashboard');
    cy.connectWallet();
    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.waitForLoading();
    
    cy.setupTestData();
    cy.get('@testTokenId1').then((tokenId) => {
      // Wait for certificate to appear
      cy.get('[data-testid="certificate-card"]').first().should('be.visible');
      
      // Test view certificate
      cy.get('[data-testid="view-certificate-btn"]').first().click();
      cy.url().should('include', `/certificate/${tokenId}`);
      cy.go('back');
      
      // Test share certificate
      cy.get('[data-testid="share-certificate-btn"]').first().click();
      cy.get('[data-testid="share-modal"]').should('be.visible');
      cy.get('[data-testid="verification-link"]').should('contain', `/verify/${tokenId}`);
      cy.get('[data-testid="copy-link-btn"]').click();
      cy.waitForToast('Link copied to clipboard');
      cy.get('[data-testid="close-modal-btn"]').click();
      
      // Test revoke certificate (with confirmation)
      cy.get('[data-testid="revoke-certificate-btn"]').first().click();
      cy.get('[data-testid="revoke-confirmation-modal"]').should('be.visible');
      cy.get('[data-testid="confirm-revoke-btn"]').click();
      
      // Mock revocation transaction
      cy.mockBlockchainTransaction('0xrevoke123');
      
      cy.waitForToast('Certificate revoked successfully');
      
      // Certificate should show as revoked
      cy.get('[data-testid="certificate-card"]').first().within(() => {
        cy.get('[data-testid="certificate-status"]').should('contain', 'Revoked');
        cy.get('[data-testid="revoke-certificate-btn"]').should('not.exist');
      });
    });
  });

  it('should display certificate statistics and analytics', () => {
    cy.visit('/dashboard');
    cy.connectWallet();
    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.waitForLoading();
    
    // Mock statistics API
    cy.intercept('GET', '**/api/v1/certificates/issuer/*/stats', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          totalCertificates: 150,
          activeCertificates: 145,
          revokedCertificates: 5,
          thisMonth: 25,
          thisWeek: 8,
          recentActivity: [
            {
              date: '2024-01-15',
              count: 5,
              type: 'issued'
            },
            {
              date: '2024-01-14',
              count: 3,
              type: 'issued'
            }
          ],
          topCourses: [
            { courseName: 'React Development', count: 45 },
            { courseName: 'Blockchain Fundamentals', count: 32 },
            { courseName: 'Node.js Backend', count: 28 }
          ]
        }
      }
    }).as('certificateStats');
    
    cy.wait('@certificateStats');
    
    // Verify statistics display
    cy.get('[data-testid="total-certificates"]').should('contain', '150');
    cy.get('[data-testid="active-certificates"]').should('contain', '145');
    cy.get('[data-testid="revoked-certificates"]').should('contain', '5');
    cy.get('[data-testid="this-month-count"]').should('contain', '25');
    cy.get('[data-testid="this-week-count"]').should('contain', '8');
    
    // Verify charts/graphs if implemented
    cy.get('[data-testid="activity-chart"]').should('be.visible');
    cy.get('[data-testid="top-courses-chart"]').should('be.visible');
    
    // Test time period selector
    cy.get('[data-testid="time-period-selector"]').select('last-30-days');
    // Should trigger new API call and update stats
  });

  it('should handle bulk certificate operations', () => {
    cy.visit('/dashboard');
    cy.connectWallet();
    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.waitForLoading();
    
    cy.setupTestData();
    
    // Enable bulk selection mode
    cy.get('[data-testid="bulk-actions-toggle"]').click();
    
    // Select multiple certificates
    cy.get('[data-testid="certificate-checkbox"]').first().check();
    cy.get('[data-testid="certificate-checkbox"]').eq(1).check();
    
    // Bulk actions should be available
    cy.get('[data-testid="bulk-actions-bar"]').should('be.visible');
    cy.get('[data-testid="selected-count"]').should('contain', '2 selected');
    
    // Test bulk export
    cy.get('[data-testid="bulk-export-btn"]').click();
    cy.get('[data-testid="export-format-modal"]').should('be.visible');
    cy.get('[data-testid="export-csv-btn"]').click();
    cy.waitForToast('Certificates exported successfully');
    
    // Test bulk share
    cy.get('[data-testid="bulk-share-btn"]').click();
    cy.get('[data-testid="bulk-share-modal"]').should('be.visible');
    cy.get('[data-testid="generate-share-links-btn"]').click();
    cy.waitForToast('Share links generated');
    
    // Clear selection
    cy.get('[data-testid="clear-selection-btn"]').click();
    cy.get('[data-testid="bulk-actions-bar"]').should('not.exist');
  });

  it('should work properly on mobile devices', () => {
    cy.testMobileResponsiveness();
    
    cy.viewport(375, 667); // iPhone SE
    cy.visit('/dashboard');
    
    // Mobile navigation should work
    cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible').click();
    cy.get('[data-testid="mobile-menu"]').should('be.visible');
    
    // Connect wallet on mobile
    cy.setupMetaMask();
    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.waitForLoading();
    
    // Certificate form should be usable on mobile
    cy.get('[data-testid="certificate-form"]').should('be.visible');
    
    // Certificate cards should stack properly on mobile
    cy.get('[data-testid="certificates-list"]').should('have.css', 'flex-direction', 'column');
    
    // Mobile-specific actions should be available
    cy.get('[data-testid="mobile-filter-btn"]').should('be.visible').click();
    cy.get('[data-testid="mobile-filter-drawer"]').should('be.visible');
    
    // Touch-friendly buttons
    cy.get('button').each(($btn) => {
      cy.wrap($btn).should('have.css', 'min-height').and('match', /^([4-9]\d|\d{3,})px$/);
    });
  });

  it('should handle real-time updates', () => {
    cy.visit('/dashboard');
    cy.connectWallet();
    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.waitForLoading();
    
    // Get initial certificate count
    cy.get('[data-testid="total-certificates"]').then(($count) => {
      const initialCount = parseInt($count.text());
      
      // Issue a new certificate
      cy.fillCertificateForm({
        recipientName: 'Real-time Test User',
        courseName: 'Real-time Course',
        institutionName: 'Real-time Institution',
        recipient: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
      });
      
      cy.mockBlockchainTransaction();
      cy.get('[data-testid="mint-certificate-btn"]').click();
      cy.waitForLoading();
      cy.waitForToast('Certificate minted successfully');
      
      // Statistics should update
      cy.get('[data-testid="total-certificates"]').should('contain', (initialCount + 1).toString());
      
      // New certificate should appear in list
      cy.get('[data-testid="certificate-card"]').first().within(() => {
        cy.get('[data-testid="recipient-name"]').should('contain', 'Real-time Test User');
      });
    });
  });

  it('should handle error states gracefully', () => {
    // Simulate API error
    cy.intercept('GET', '**/api/v1/certificates/issuer/**', {
      statusCode: 500,
      body: {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Internal server error'
        }
      }
    }).as('serverError');
    
    cy.visit('/dashboard');
    cy.connectWallet();
    cy.get('[data-testid="connect-wallet-btn"]').click();
    
    cy.wait('@serverError');
    
    // Should show error state
    cy.get('[data-testid="error-state"]').should('be.visible');
    cy.get('[data-testid="error-message"]').should('contain', 'Failed to load certificates');
    cy.get('[data-testid="retry-btn"]').should('be.visible');
    
    // Test retry functionality
    cy.intercept('GET', '**/api/v1/certificates/issuer/**', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          certificates: [],
          totalCertificates: 0,
          pagination: { page: 1, limit: 10, total: 0, pages: 0 }
        }
      }
    }).as('retrySuccess');
    
    cy.get('[data-testid="retry-btn"]').click();
    cy.wait('@retrySuccess');
    
    // Should show empty state
    cy.get('[data-testid="empty-state"]').should('be.visible');
    cy.get('[data-testid="empty-message"]').should('contain', 'No certificates issued yet');
  });
});