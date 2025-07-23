// Import commands.js using ES2015 syntax:
import './commands';
import 'cypress-metamask';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on uncaught exceptions
  // This is useful for blockchain-related errors that don't affect the test
  if (err.message.includes('MetaMask') || 
      err.message.includes('ethereum') || 
      err.message.includes('Web3')) {
    return false;
  }
  return true;
});

// Custom commands for blockchain testing
Cypress.Commands.add('connectWallet', (account = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266') => {
  cy.window().then((win) => {
    // Mock MetaMask connection
    win.ethereum = {
      isMetaMask: true,
      request: cy.stub().resolves([account]),
      on: cy.stub(),
      removeListener: cy.stub(),
      selectedAddress: account,
      chainId: '0x539', // Localhost chain ID
      networkVersion: '1337'
    };
  });
});

Cypress.Commands.add('disconnectWallet', () => {
  cy.window().then((win) => {
    if (win.ethereum) {
      win.ethereum.selectedAddress = null;
    }
  });
});

Cypress.Commands.add('switchNetwork', (chainId = '0x13881') => {
  cy.window().then((win) => {
    if (win.ethereum) {
      win.ethereum.chainId = chainId;
      win.ethereum.networkVersion = parseInt(chainId, 16).toString();
    }
  });
});

Cypress.Commands.add('mockBlockchainTransaction', (txHash = '0x1234567890abcdef') => {
  cy.window().then((win) => {
    if (win.ethereum) {
      win.ethereum.request = cy.stub().resolves(txHash);
    }
  });
});

// Helper commands for certificate testing
Cypress.Commands.add('fillCertificateForm', (certificateData) => {
  cy.get('[data-testid="recipient-name"]').type(certificateData.recipientName);
  cy.get('[data-testid="course-name"]').type(certificateData.courseName);
  cy.get('[data-testid="institution-name"]').type(certificateData.institutionName);
  cy.get('[data-testid="recipient-address"]').type(certificateData.recipient);
});

Cypress.Commands.add('waitForToast', (message, type = 'success') => {
  cy.get(`[data-testid="toast-${type}"]`).should('contain', message);
});

Cypress.Commands.add('waitForLoading', () => {
  cy.get('[data-testid="loading-spinner"]').should('not.exist');
});

// API testing helpers
Cypress.Commands.add('apiRequest', (method, url, body = null) => {
  const options = {
    method,
    url: `${Cypress.env('BACKEND_URL')}${url}`,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = body;
  }
  
  return cy.request(options);
});

// Visual regression testing helpers
Cypress.Commands.add('compareSnapshot', (name) => {
  cy.screenshot(name);
  // In a real implementation, you would integrate with a visual regression tool
  // like Percy, Applitools, or cypress-image-diff
});

// Accessibility testing
Cypress.Commands.add('checkA11y', () => {
  // Basic accessibility checks
  cy.get('img').should('have.attr', 'alt');
  cy.get('button').should('not.have.attr', 'disabled').or('have.attr', 'aria-disabled');
  cy.get('input').should('have.attr', 'aria-label').or('have.attr', 'placeholder');
});

// Performance testing helpers
Cypress.Commands.add('measurePerformance', (actionName) => {
  cy.window().then((win) => {
    win.performance.mark(`${actionName}-start`);
  });
});

Cypress.Commands.add('endPerformanceMeasure', (actionName, maxDuration = 5000) => {
  cy.window().then((win) => {
    win.performance.mark(`${actionName}-end`);
    win.performance.measure(actionName, `${actionName}-start`, `${actionName}-end`);
    
    const measure = win.performance.getEntriesByName(actionName)[0];
    expect(measure.duration).to.be.lessThan(maxDuration);
    
    cy.task('log', `Performance: ${actionName} took ${measure.duration}ms`);
  });
});