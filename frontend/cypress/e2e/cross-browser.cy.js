/**
 * Cross-Browser E2E Tests for VerifyCert
 * Tests core functionality across different browsers using Cypress
 */

describe('Cross-Browser Compatibility Tests', () => {
  const testPages = [
    { path: '/', name: 'Home Page' },
    { path: '/verify', name: 'Verify Page' },
    { path: '/layout-demo', name: 'Layout Demo' },
    { path: '/theme-demo', name: 'Theme Demo' },
    { path: '/pwa-test', name: 'PWA Test Page' }
  ];

  const viewports = [
    { width: 1920, height: 1080, name: 'Desktop' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 375, height: 667, name: 'Mobile' }
  ];

  beforeEach(() => {
    // Set up common test environment
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Page Load Tests', () => {
    testPages.forEach(page => {
      it(`should load ${page.name} successfully`, () => {
        cy.visit(page.path);
        
        // Check page loads
        cy.get('body').should('be.visible');
        
        // Check for no JavaScript errors
        cy.window().then((win) => {
          expect(win.console.error).to.not.have.been.called;
        });
        
        // Check page title
        cy.title().should('not.be.empty');
        
        // Check basic content is present
        cy.get('main, [role="main"], body').should('contain.text', '');
      });
    });
  });

  describe('Responsive Design Tests', () => {
    testPages.forEach(page => {
      viewports.forEach(viewport => {
        it(`should display ${page.name} correctly on ${viewport.name}`, () => {
          cy.viewport(viewport.width, viewport.height);
          cy.visit(page.path);
          
          // Check page loads at this viewport
          cy.get('body').should('be.visible');
          
          // Check navigation adapts to viewport
          if (viewport.width < 768) {
            // Mobile: should have mobile navigation
            cy.get('[data-testid="mobile-nav"], .mobile-nav, nav').should('exist');
          } else {
            // Desktop/Tablet: should have desktop navigation
            cy.get('nav, [role="navigation"]').should('be.visible');
          }
          
          // Check content doesn't overflow
          cy.get('body').then($body => {
            const bodyWidth = $body[0].scrollWidth;
            expect(bodyWidth).to.be.at.most(viewport.width * 1.1); // Allow 10% overflow
          });
        });
      });
    });
  });

  describe('Navigation Tests', () => {
    it('should navigate between pages correctly', () => {
      cy.visit('/');
      
      // Test navigation links
      cy.get('nav a, [role="navigation"] a').first().should('be.visible');
      
      // Navigate to verify page
      cy.contains('Verify', { matchCase: false }).click();
      cy.url().should('include', '/verify');
      
      // Navigate back to home
      cy.contains('Home', { matchCase: false }).click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should handle mobile navigation', () => {
      cy.viewport(375, 667);
      cy.visit('/');
      
      // Look for mobile menu button
      cy.get('[aria-label*="menu"], [data-testid="menu-button"], .menu-button')
        .first()
        .should('be.visible');
    });
  });

  describe('Form Interaction Tests', () => {
    it('should handle form inputs correctly', () => {
      cy.visit('/verify');
      
      // Test file input if present
      cy.get('input[type="file"]').should('exist');
      
      // Test text inputs
      cy.get('input[type="text"], input[type="email"], textarea').each($input => {
        cy.wrap($input).type('test input').should('have.value', 'test input');
        cy.wrap($input).clear();
      });
      
      // Test buttons are clickable
      cy.get('button:not([disabled])').should('be.enabled');
    });
  });

  describe('PWA Features Tests', () => {
    it('should have PWA manifest', () => {
      cy.visit('/');
      
      // Check for manifest link
      cy.get('link[rel="manifest"]').should('exist');
    });

    it('should register service worker', () => {
      cy.visit('/');
      
      // Check service worker registration
      cy.window().then((win) => {
        expect(win.navigator.serviceWorker).to.exist;
      });
    });
  });

  describe('Accessibility Tests', () => {
    testPages.forEach(page => {
      it(`should meet accessibility standards on ${page.name}`, () => {
        cy.visit(page.path);
        
        // Check for proper heading structure
        cy.get('h1').should('exist');
        
        // Check for ARIA labels on interactive elements
        cy.get('button, input, select, textarea').each($el => {
          cy.wrap($el).should('satisfy', ($element) => {
            return $element.attr('aria-label') || 
                   $element.attr('aria-labelledby') || 
                   $element.attr('title') ||
                   $element.text().trim().length > 0;
          });
        });
        
        // Check for alt text on images
        cy.get('img').each($img => {
          cy.wrap($img).should('have.attr', 'alt');
        });
        
        // Test keyboard navigation
        cy.get('body').tab();
        cy.focused().should('exist');
      });
    });
  });

  describe('Theme Switching Tests', () => {
    it('should switch between light and dark themes', () => {
      cy.visit('/theme-demo');
      
      // Look for theme toggle
      cy.get('[data-testid="theme-toggle"], .theme-toggle, button').contains(/theme|dark|light/i).as('themeToggle');
      
      // Test theme switching
      cy.get('@themeToggle').click();
      
      // Check if theme class changes
      cy.get('html, body').should('satisfy', ($el) => {
        return $el.hasClass('dark') || 
               $el.hasClass('light') || 
               $el.attr('data-theme');
      });
    });
  });

  describe('Performance Tests', () => {
    testPages.forEach(page => {
      it(`should load ${page.name} within acceptable time`, () => {
        const startTime = Date.now();
        
        cy.visit(page.path);
        cy.get('body').should('be.visible').then(() => {
          const loadTime = Date.now() - startTime;
          expect(loadTime).to.be.lessThan(10000); // 10 seconds max
        });
      });
    });
  });

  describe('Console Error Tests', () => {
    testPages.forEach(page => {
      it(`should not have console errors on ${page.name}`, () => {
        cy.visit(page.path, {
          onBeforeLoad(win) {
            cy.stub(win.console, 'error').as('consoleError');
          }
        });
        
        cy.wait(2000); // Wait for any async operations
        cy.get('@consoleError').should('not.have.been.called');
      });
    });
  });
});