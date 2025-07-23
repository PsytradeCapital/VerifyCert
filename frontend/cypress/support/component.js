// Import commands.js using ES2015 syntax:
import './commands';

// Import global styles
import '../../src/index.css';

// Component testing setup
import { mount } from 'cypress/react18';

// Augment the Cypress namespace to include type definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add('mount', mount);

// Component testing helpers
Cypress.Commands.add('mountWithProviders', (component, options = {}) => {
  const { providers = [], ...mountOptions } = options;
  
  let wrappedComponent = component;
  
  // Wrap with providers if needed
  providers.forEach((Provider) => {
    wrappedComponent = <Provider>{wrappedComponent}</Provider>;
  });
  
  return cy.mount(wrappedComponent, mountOptions);
});

// Mock providers for component testing
export const mockEthereumProvider = {
  isMetaMask: true,
  request: cy.stub(),
  on: cy.stub(),
  removeListener: cy.stub(),
  selectedAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  chainId: '0x539'
};

export const mockToastProvider = {
  success: cy.stub(),
  error: cy.stub(),
  loading: cy.stub()
};