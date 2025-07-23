// Custom commands for VerifyCert E2E testing

// Certificate issuance workflow commands
Cypress.Commands.add('issueCertificate', (certificateData) => {
  // Navigate to issuer dashboard
  cy.visit('/dashboard');
  
  // Connect wallet
  cy.connectWallet();
  cy.get('[data-testid="connect-wallet-btn"]').click();
  cy.waitForLoading();
  
  // Fill certificate form
  cy.fillCertificateForm(certificateData);
  
  // Mock blockchain transaction
  cy.mockBlockchainTransaction();
  
  // Submit form
  cy.get('[data-testid="mint-certificate-btn"]').click();
  
  // Wait for success
  cy.waitForToast('Certificate minted successfully');
  
  // Return certificate data
  cy.get('[data-testid="certificate-card"]').first().then(($card) => {
    const tokenId = $card.attr('data-token-id');
    return cy.wrap({ tokenId, ...certificateData });
  });
});

Cypress.Commands.add('verifyCertificate', (tokenId) => {
  // Navigate to verification page
  cy.visit(`/verify/${tokenId}`);
  
  // Wait for certificate data to load
  cy.waitForLoading();
  
  // Check verification status
  cy.get('[data-testid="verification-status"]').should('contain', 'Valid');
  cy.get('[data-testid="certificate-details"]').should('be.visible');
});

// Wallet interaction commands
Cypress.Commands.add('setupMetaMask', () => {
  cy.window().then((win) => {
    // Mock MetaMask provider
    win.ethereum = {
      isMetaMask: true,
      request: cy.stub().callsFake((params) => {
        switch (params.method) {
          case 'eth_requestAccounts':
            return Promise.resolve(['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266']);
          case 'eth_accounts':
            return Promise.resolve(['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266']);
          case 'eth_chainId':
            return Promise.resolve('0x539');
          case 'eth_sendTransaction':
            return Promise.resolve('0x1234567890abcdef1234567890abcdef12345678');
          case 'eth_getTransactionReceipt':
            return Promise.resolve({
              status: '0x1',
              transactionHash: '0x1234567890abcdef1234567890abcdef12345678'
            });
          default:
            return Promise.resolve(null);
        }
      }),
      on: cy.stub(),
      removeListener: cy.stub(),
      selectedAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      chainId: '0x539',
      networkVersion: '1337'
    };
  });
});

// Data setup commands
Cypress.Commands.add('setupTestData', () => {
  // Create test certificates via API
  const testCertificates = [
    {
      recipient: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      recipientName: 'Alice Johnson',
      courseName: 'React Development',
      institutionName: 'Tech Academy',
      issueDate: Math.floor(Date.now() / 1000),
      metadataURI: 'https://ipfs.io/ipfs/QmTest1'
    },
    {
      recipient: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      recipientName: 'Bob Smith',
      courseName: 'Blockchain Fundamentals',
      institutionName: 'Crypto University',
      issueDate: Math.floor(Date.now() / 1000),
      metadataURI: 'https://ipfs.io/ipfs/QmTest2'
    }
  ];

  testCertificates.forEach((cert, index) => {
    cy.apiRequest('POST', '/api/v1/certificates/mint', {
      ...cert,
      issuerAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
    }).then((response) => {
      expect(response.status).to.eq(201);
      cy.wrap(response.body.data.tokenId).as(`testTokenId${index + 1}`);
    });
  });
});

// Error simulation commands
Cypress.Commands.add('simulateNetworkError', () => {
  cy.intercept('POST', '**/api/v1/certificates/mint', {
    statusCode: 500,
    body: {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Network connection failed'
      }
    }
  }).as('networkError');
});

Cypress.Commands.add('simulateValidationError', () => {
  cy.intercept('POST', '**/api/v1/certificates/mint', {
    statusCode: 400,
    body: {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid certificate data',
        details: ['Recipient name is required']
      }
    }
  }).as('validationError');
});

// Performance monitoring commands
Cypress.Commands.add('startPerformanceMonitoring', () => {
  cy.window().then((win) => {
    win.performanceMetrics = {
      navigationStart: win.performance.now(),
      marks: {},
      measures: {}
    };
  });
});

Cypress.Commands.add('markPerformance', (name) => {
  cy.window().then((win) => {
    if (win.performanceMetrics) {
      win.performanceMetrics.marks[name] = win.performance.now();
    }
  });
});

Cypress.Commands.add('measurePerformance', (name, startMark, endMark) => {
  cy.window().then((win) => {
    if (win.performanceMetrics && win.performanceMetrics.marks[startMark] && win.performanceMetrics.marks[endMark]) {
      const duration = win.performanceMetrics.marks[endMark] - win.performanceMetrics.marks[startMark];
      win.performanceMetrics.measures[name] = duration;
      cy.task('log', `Performance measure ${name}: ${duration}ms`);
    }
  });
});

// Accessibility testing commands
Cypress.Commands.add('testAccessibility', () => {
  // Check for basic accessibility requirements
  cy.get('h1, h2, h3, h4, h5, h6').should('exist'); // Heading structure
  cy.get('main').should('exist'); // Main content area
  cy.get('button, a').each(($el) => {
    // Check that interactive elements are keyboard accessible
    cy.wrap($el).should('not.have.attr', 'tabindex', '-1');
  });
  
  // Check form accessibility
  cy.get('input, textarea, select').each(($el) => {
    const $element = cy.wrap($el);
    $element.should('satisfy', ($input) => {
      return $input.attr('aria-label') || 
             $input.attr('placeholder') || 
             $input.prev('label').length > 0 ||
             $input.closest('label').length > 0;
    });
  });
});

// Mobile testing commands
Cypress.Commands.add('testMobileResponsiveness', () => {
  const viewports = [
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 414, height: 896, name: 'iPhone 11' },
    { width: 768, height: 1024, name: 'iPad' }
  ];

  viewports.forEach((viewport) => {
    cy.viewport(viewport.width, viewport.height);
    cy.task('log', `Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
    
    // Check that navigation is accessible
    cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible');
    
    // Check that content is readable
    cy.get('body').should('have.css', 'overflow-x', 'hidden');
    
    // Check that buttons are touch-friendly (minimum 44px)
    cy.get('button').each(($btn) => {
      cy.wrap($btn).should('have.css', 'min-height').and('match', /^([4-9]\d|\d{3,})px$/);
    });
  });
  
  // Reset to default viewport
  cy.viewport(1280, 720);
});