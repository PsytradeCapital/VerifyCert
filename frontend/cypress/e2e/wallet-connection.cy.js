describe('Wallet Connection E2E Tests', () => {
  beforeEach(() => {
    cy.startPerformanceMonitoring();
  });

  it('should connect MetaMask wallet successfully', () => {
    cy.measurePerformance('wallet-connection-start');
    
    cy.visit('/');
    cy.markPerformance('page-loaded');
    
    // Test accessibility
    cy.testAccessibility();
    
    // Setup MetaMask mock
    cy.setupMetaMask();
    
    // Connect wallet button should be visible
    cy.get('[data-testid="connect-wallet-btn"]').should('be.visible').and('contain', 'Connect Wallet');
    
    // Click connect wallet
    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.markPerformance('connect-clicked');
    
    // Should show connecting state
    cy.get('[data-testid="wallet-connecting"]').should('be.visible');
    
    // Wait for connection to complete
    cy.waitForLoading();
    cy.markPerformance('wallet-connected');
    
    // Should show connected state
    cy.get('[data-testid="wallet-connected"]').should('be.visible');
    cy.get('[data-testid="wallet-address"]').should('contain', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    cy.get('[data-testid="disconnect-wallet-btn"]').should('be.visible');
    
    // Network should be displayed
    cy.get('[data-testid="network-indicator"]').should('contain', 'Localhost');
    
    // Measure performance
    cy.measurePerformance('connection-time', 'wallet-connection-start', 'wallet-connected');
    cy.endPerformanceMeasure('connection-time', 3000);
    
    // Visual regression test
    cy.compareSnapshot('wallet-connected-state');
  });

  it('should handle MetaMask not installed', () => {
    cy.visit('/');
    
    // Remove MetaMask from window
    cy.window().then((win) => {
      delete win.ethereum;
    });
    
    // Click connect wallet
    cy.get('[data-testid="connect-wallet-btn"]').click();
    
    // Should show MetaMask installation prompt
    cy.get('[data-testid="metamask-not-installed"]').should('be.visible');
    cy.get('[data-testid="install-metamask-btn"]').should('be.visible');
    cy.get('[data-testid="metamask-download-link"]').should('have.attr', 'href').and('include', 'metamask.io');
    
    // Visual regression test
    cy.compareSnapshot('metamask-not-installed');
  });

  it('should handle wallet connection rejection', () => {
    cy.visit('/');
    
    // Setup MetaMask to reject connection
    cy.window().then((win) => {
      win.ethereum = {
        isMetaMask: true,
        request: cy.stub().rejects(new Error('User rejected the request')),
        on: cy.stub(),
        removeListener: cy.stub()
      };
    });
    
    // Click connect wallet
    cy.get('[data-testid="connect-wallet-btn"]').click();
    
    // Should show error message
    cy.waitForToast('Connection rejected by user', 'error');
    cy.get('[data-testid="connect-wallet-btn"]').should('be.visible'); // Should remain in disconnected state
  });

  it('should handle network switching', () => {
    cy.visit('/dashboard');
    cy.setupMetaMask();
    
    // Connect wallet
    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.waitForLoading();
    
    // Should show network warning for localhost
    cy.get('[data-testid="network-warning"]').should('be.visible');
    cy.get('[data-testid="switch-network-btn"]').should('be.visible');
    
    // Mock network switch to Polygon Mumbai
    cy.window().then((win) => {
      win.ethereum.request = cy.stub().callsFake((params) => {
        if (params.method === 'wallet_switchEthereumChain') {
          win.ethereum.chainId = '0x13881'; // Polygon Mumbai
          win.ethereum.networkVersion = '80001';
          return Promise.resolve();
        }
        return Promise.resolve();
      });
    });
    
    // Click switch network
    cy.get('[data-testid="switch-network-btn"]').click();
    
    // Should show success message
    cy.waitForToast('Switched to Polygon Mumbai');
    cy.get('[data-testid="network-indicator"]').should('contain', 'Polygon Mumbai');
    cy.get('[data-testid="network-warning"]').should('not.exist');
  });

  it('should handle network switch failure', () => {
    cy.visit('/dashboard');
    cy.setupMetaMask();
    
    // Connect wallet
    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.waitForLoading();
    
    // Mock network switch failure
    cy.window().then((win) => {
      win.ethereum.request = cy.stub().callsFake((params) => {
        if (params.method === 'wallet_switchEthereumChain') {
          return Promise.reject(new Error('User rejected network switch'));
        }
        return Promise.resolve();
      });
    });
    
    // Click switch network
    cy.get('[data-testid="switch-network-btn"]').click();
    
    // Should show error message
    cy.waitForToast('Failed to switch network', 'error');
    cy.get('[data-testid="network-warning"]').should('still.be.visible');
  });

  it('should disconnect wallet properly', () => {
    cy.visit('/');
    cy.setupMetaMask();
    
    // Connect wallet first
    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.waitForLoading();
    
    // Should be connected
    cy.get('[data-testid="wallet-connected"]').should('be.visible');
    
    // Click disconnect
    cy.get('[data-testid="disconnect-wallet-btn"]').click();
    
    // Should show disconnected state
    cy.get('[data-testid="connect-wallet-btn"]').should('be.visible');
    cy.get('[data-testid="wallet-connected"]').should('not.exist');
    cy.get('[data-testid="wallet-address"]').should('not.exist');
    
    // Should clear any cached data
    cy.window().then((win) => {
      expect(win.localStorage.getItem('walletConnected')).to.be.null;
    });
  });

  it('should handle account changes', () => {
    cy.visit('/dashboard');
    cy.setupMetaMask();
    
    // Connect wallet
    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.waitForLoading();
    
    // Should show first account
    cy.get('[data-testid="wallet-address"]').should('contain', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    
    // Simulate account change in MetaMask
    cy.window().then((win) => {
      const newAccount = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
      win.ethereum.selectedAddress = newAccount;
      
      // Trigger accountsChanged event
      if (win.ethereum.on.getCalls().length > 0) {
        const accountsChangedCallback = win.ethereum.on.getCalls()
          .find(call => call.args[0] === 'accountsChanged')?.args[1];
        
        if (accountsChangedCallback) {
          accountsChangedCallback([newAccount]);
        }
      }
    });
    
    // Should update to new account
    cy.get('[data-testid="wallet-address"]').should('contain', '0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
    cy.waitForToast('Account changed');
  });

  it('should handle chain changes', () => {
    cy.visit('/dashboard');
    cy.setupMetaMask();
    
    // Connect wallet
    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.waitForLoading();
    
    // Should show localhost network
    cy.get('[data-testid="network-indicator"]').should('contain', 'Localhost');
    
    // Simulate chain change
    cy.window().then((win) => {
      win.ethereum.chainId = '0x1'; // Ethereum Mainnet
      win.ethereum.networkVersion = '1';
      
      // Trigger chainChanged event
      if (win.ethereum.on.getCalls().length > 0) {
        const chainChangedCallback = win.ethereum.on.getCalls()
          .find(call => call.args[0] === 'chainChanged')?.args[1];
        
        if (chainChangedCallback) {
          chainChangedCallback('0x1');
        }
      }
    });
    
    // Should update network display and show warning
    cy.get('[data-testid="network-indicator"]').should('contain', 'Ethereum Mainnet');
    cy.get('[data-testid="network-warning"]').should('be.visible');
    cy.waitForToast('Network changed to Ethereum Mainnet');
  });

  it('should persist wallet connection across page reloads', () => {
    cy.visit('/');
    cy.setupMetaMask();
    
    // Connect wallet
    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.waitForLoading();
    
    // Should be connected
    cy.get('[data-testid="wallet-connected"]').should('be.visible');
    
    // Reload page
    cy.reload();
    cy.setupMetaMask(); // Re-setup after reload
    
    // Should automatically reconnect
    cy.get('[data-testid="wallet-connected"]').should('be.visible');
    cy.get('[data-testid="wallet-address"]').should('contain', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
  });

  it('should handle multiple wallet providers', () => {
    cy.visit('/');
    
    // Setup multiple wallet providers
    cy.window().then((win) => {
      // MetaMask
      win.ethereum = {
        isMetaMask: true,
        request: cy.stub().resolves(['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266']),
        on: cy.stub(),
        removeListener: cy.stub(),
        selectedAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        chainId: '0x539'
      };
      
      // WalletConnect (mock)
      win.walletConnect = {
        isWalletConnect: true,
        request: cy.stub().resolves(['0x70997970C51812dc3A010C7d01b50e0d17dc79C8'])
      };
    });
    
    // Should show wallet selection modal
    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.get('[data-testid="wallet-selection-modal"]').should('be.visible');
    
    // Should show available wallet options
    cy.get('[data-testid="metamask-option"]').should('be.visible');
    cy.get('[data-testid="walletconnect-option"]').should('be.visible');
    
    // Select MetaMask
    cy.get('[data-testid="metamask-option"]').click();
    cy.waitForLoading();
    
    // Should connect with MetaMask
    cy.get('[data-testid="wallet-connected"]').should('be.visible');
    cy.get('[data-testid="wallet-address"]').should('contain', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
  });

  it('should be mobile responsive', () => {
    cy.testMobileResponsiveness();
    
    cy.viewport(375, 667); // iPhone SE
    cy.visit('/');
    
    // Connect wallet button should be touch-friendly
    cy.get('[data-testid="connect-wallet-btn"]')
      .should('have.css', 'min-height')
      .and('match', /^([4-9]\d|\d{3,})px$/);
    
    cy.setupMetaMask();
    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.waitForLoading();
    
    // Wallet info should be readable on mobile
    cy.get('[data-testid="wallet-address"]').should('be.visible');
    cy.get('[data-testid="network-indicator"]').should('be.visible');
    
    // Mobile wallet menu should work
    cy.get('[data-testid="wallet-menu-toggle"]').click();
    cy.get('[data-testid="wallet-menu"]').should('be.visible');
    cy.get('[data-testid="disconnect-wallet-btn"]').should('be.visible');
  });

  it('should handle wallet connection timeouts', () => {
    cy.visit('/');
    
    // Setup MetaMask with delayed response
    cy.window().then((win) => {
      win.ethereum = {
        isMetaMask: true,
        request: cy.stub().callsFake(() => {
          return new Promise((resolve) => {
            setTimeout(() => resolve(['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266']), 10000);
          });
        }),
        on: cy.stub(),
        removeListener: cy.stub()
      };
    });
    
    // Click connect wallet
    cy.get('[data-testid="connect-wallet-btn"]').click();
    
    // Should show connecting state
    cy.get('[data-testid="wallet-connecting"]').should('be.visible');
    
    // Should timeout after reasonable time
    cy.get('[data-testid="connection-timeout"]', { timeout: 15000 }).should('be.visible');
    cy.get('[data-testid="retry-connection-btn"]').should('be.visible');
    
    // Test retry functionality
    cy.window().then((win) => {
      win.ethereum.request = cy.stub().resolves(['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266']);
    });
    
    cy.get('[data-testid="retry-connection-btn"]').click();
    cy.waitForLoading();
    
    // Should connect successfully
    cy.get('[data-testid="wallet-connected"]').should('be.visible');
  });
});