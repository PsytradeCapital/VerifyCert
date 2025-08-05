/**
 * Mobile Responsiveness E2E Tests for VerifyCert
 * Tests the application across various mobile device viewports
 */

describe('Mobile Responsiveness Tests', () => {
  // Mobile device configurations
  const mobileDevices = {
    ios: {
      'iPhone SE': { width: 375, height: 667 },
      'iPhone 12': { width: 390, height: 844 },
      'iPhone 12 Pro Max': { width: 428, height: 926 },
      'iPhone 14': { width: 390, height: 844 },
      'iPhone 14 Pro Max': { width: 430, height: 932 },
      'iPad': { width: 768, height: 1024 },
      'iPad Pro': { width: 1024, height: 1366 }
    },
    android: {
      'Galaxy S8': { width: 360, height: 740 },
      'Galaxy S21': { width: 384, height: 854 },
      'Galaxy S21 Ultra': { width: 412, height: 915 },
      'Pixel 5': { width: 393, height: 851 },
      'Pixel 6 Pro': { width: 412, height: 892 },
      'OnePlus 9': { width: 412, height: 919 },
      'Galaxy Tab S7': { width: 753, height: 1037 }
    }
  };

  const testPages = [
    { path: '/', name: 'Home Page' },
    { path: '/verify', name: 'Certificate Verification' },
    { path: '/dashboard', name: 'Issuer Dashboard' }
  ];

  beforeEach(() => {
    // Set up common test environment
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  // Test each platform (iOS and Android)
  Object.entries(mobileDevices).forEach(([platform, devices]) => {
    describe(`${platform.toUpperCase()} Device Testing`, () => {
      
      // Test each device
      Object.entries(devices).forEach(([deviceName, deviceConfig]) => {
        describe(`${deviceName} (${deviceConfig.width}x${deviceConfig.height})`, () => {
          
          beforeEach(() => {
            // Set viewport to device dimensions
            cy.viewport(deviceConfig.width, deviceConfig.height);
          });

          // Test each page on this device
          testPages.forEach(page => {
            describe(`${page.name}`, () => {
              
              beforeEach(() => {
                cy.visit(page.path);
                cy.wait(1000); // Allow page to fully load
              });

              it('should render without horizontal scrolling', () => {
                // Check that page content fits within viewport width
                cy.get('body').should('be.visible');
                
                // Verify no horizontal scrollbar
                cy.window().then((win) => {
                  expect(win.document.body.scrollWidth).to.be.at.most(deviceConfig.width + 1);
                });
              });

              it('should have readable text size', () => {
                // Check that text is not too small
                cy.get('body').should('have.css', 'font-size').then((fontSize) => {
                  const size = parseFloat(fontSize);
                  expect(size).to.be.at.least(14); // Minimum readable size
                });

                // Check headings are appropriately sized
                cy.get('h1, h2, h3').each(($heading) => {
                  cy.wrap($heading).should('have.css', 'font-size').then((fontSize) => {
                    const size = parseFloat(fontSize);
                    expect(size).to.be.at.least(16);
                  });
                });
              });

              it('should have adequate touch targets', () => {
                // Check button sizes
                cy.get('button, a[role="button"], input[type="submit"]').each(($element) => {
                  cy.wrap($element).then(($el) => {
                    const rect = $el[0].getBoundingClientRect();
                    // Touch targets should be at least 44px (iOS) or 48px (Android)
                    const minSize = platform === 'ios' ? 44 : 48;
                    expect(Math.min(rect.width, rect.height)).to.be.at.least(minSize - 10); // Allow some tolerance
                  });
                });
              });

              it('should display navigation appropriately', () => {
                const isTablet = deviceConfig.width >= 768;
                
                if (isTablet) {
                  // Tablets should show sidebar navigation
                  cy.get('[data-testid="sidebar-nav"], .sidebar, nav.desktop-nav').should('be.visible');
                } else {
                  // Phones should show mobile navigation
                  cy.get('[data-testid="mobile-nav"], [data-testid="bottom-nav"], .mobile-nav, .bottom-nav').should('exist');
                }
              });

              it('should handle form inputs properly', () => {
                // Check if page has forms
                cy.get('form').then(($forms) => {
                  if ($forms.length > 0) {
                    // Test form inputs
                    cy.get('input, textarea, select').each(($input) => {
                      cy.wrap($input).should('be.visible');
                      
                      // Check input sizing
                      cy.wrap($input).then(($el) => {
                        const rect = $el[0].getBoundingClientRect();
                        expect(rect.height).to.be.at.least(40); // Minimum touch-friendly height
                      });
                    });

                    // Check form labels are visible
                    cy.get('label').should('be.visible');
                  }
                });
              });

              it('should maintain proper spacing and layout', () => {
                // Check that content has proper margins/padding
                cy.get('main, .main-content, [role="main"]').should('have.css', 'padding').then((padding) => {
                  // Should have some padding on mobile
                  expect(padding).to.not.equal('0px');
                });

                // Check that elements don't overlap
                cy.get('header, nav, main, footer').each(($element) => {
                  cy.wrap($element).should('be.visible');
                });
              });

              it('should load images responsively', () => {
                cy.get('img').each(($img) => {
                  // Images should not exceed viewport width
                  cy.wrap($img).then(($el) => {
                    const rect = $el[0].getBoundingClientRect();
                    expect(rect.width).to.be.at.most(deviceConfig.width);
                  });

                  // Images should have alt text for accessibility
                  cy.wrap($img).should('have.attr', 'alt');
                });
              });

              // Test orientation changes (portrait to landscape)
              it('should handle orientation changes', () => {
                // Test landscape orientation
                const landscapeWidth = Math.max(deviceConfig.width, deviceConfig.height);
                const landscapeHeight = Math.min(deviceConfig.width, deviceConfig.height);
                
                cy.viewport(landscapeWidth, landscapeHeight);
                cy.wait(500); // Allow layout to adjust
                
                // Check that content still fits
                cy.window().then((win) => {
                  expect(win.document.body.scrollWidth).to.be.at.most(landscapeWidth + 1);
                });

                // Navigation should adapt to landscape
                cy.get('nav, [role="navigation"]').should('be.visible');
                
                // Switch back to portrait
                cy.viewport(deviceConfig.width, deviceConfig.height);
                cy.wait(500);
                
                // Verify layout is still correct
                cy.get('body').should('be.visible');
              });

              // Performance test
              it('should load within acceptable time', () => {
                const startTime = Date.now();
                
                cy.visit(page.path).then(() => {
                  const loadTime = Date.now() - startTime;
                  // Mobile pages should load within 5 seconds
                  expect(loadTime).to.be.lessThan(5000);
                });
              });

              // PWA features test (if applicable)
              if (page.path === '/') {
                it('should support PWA features', () => {
                  // Check for service worker
                  cy.window().then((win) => {
                    expect(win.navigator.serviceWorker).to.exist;
                  });

                  // Check for web app manifest
                  cy.get('link[rel="manifest"]').should('exist');
                  
                  // Check for PWA meta tags
                  cy.get('meta[name="theme-color"]').should('exist');
                  cy.get('meta[name="viewport"]').should('exist');
                });
              }

              // Accessibility test
              it('should be accessible on mobile', () => {
                // Check for proper heading hierarchy
                cy.get('h1').should('have.length.at.most', 1);
                
                // Check for skip links
                cy.get('a[href^="#"]').first().should('contain.text', 'Skip');
                
                // Check for proper focus management
                cy.get('button, a, input, select, textarea').first().focus();
                cy.focused().should('exist');
                
                // Check color contrast (basic test)
                cy.get('body').should('have.css', 'color');
                cy.get('body').should('have.css', 'background-color');
              });

            });
          });

          // Device-specific tests
          if (deviceName.includes('iPhone')) {
            it('should handle iOS Safari specific features', () => {
              cy.visit('/');
              
              // Check for iOS safe area handling
              cy.get('body').should('have.css', 'padding-top').then((paddingTop) => {
                // Should account for notch/safe area on newer iPhones
                if (deviceName.includes('14') || deviceName.includes('12')) {
                  expect(parseFloat(paddingTop)).to.be.at.least(0);
                }
              });
              
              // Check viewport meta tag for iOS
              cy.get('meta[name="viewport"]').should('have.attr', 'content').and('include', 'width=device-width');
            });
          }

          if (deviceName.includes('Galaxy') || deviceName.includes('Pixel') || deviceName.includes('OnePlus')) {
            it('should handle Android Chrome specific features', () => {
              cy.visit('/');
              
              // Check for Android theme color
              cy.get('meta[name="theme-color"]').should('exist');
              
              // Check for proper touch handling
              cy.get('button').first().then(($button) => {
                if ($button.length > 0) {
                  cy.wrap($button).trigger('touchstart');
                  cy.wrap($button).trigger('touchend');
                }
              });
            });
          }

        });
      });
    });
  });

  // Cross-device comparison tests
  describe('Cross-Device Consistency', () => {
    const testDevice1 = { name: 'iPhone 12', width: 390, height: 844 };
    const testDevice2 = { name: 'Galaxy S21', width: 384, height: 854 };

    it('should maintain consistent layout across similar-sized devices', () => {
      // Test iPhone 12
      cy.viewport(testDevice1.width, testDevice1.height);
      cy.visit('/');
      
      cy.get('h1').then(($h1) => {
        const iPhone12H1 = $h1[0].getBoundingClientRect();
        
        // Test Galaxy S21
        cy.viewport(testDevice2.width, testDevice2.height);
        cy.visit('/');
        
        cy.get('h1').then(($h1Galaxy) => {
          const galaxyS21H1 = $h1Galaxy[0].getBoundingClientRect();
          
          // Heights should be similar (within 10px)
          expect(Math.abs(iPhone12H1.height - galaxyS21H1.height)).to.be.lessThan(10);
        });
      });
    });

    it('should scale content appropriately across different screen sizes', () => {
      const smallDevice = { width: 360, height: 640 };
      const largeDevice = { width: 428, height: 926 };

      // Test small device
      cy.viewport(smallDevice.width, smallDevice.height);
      cy.visit('/');
      
      cy.get('body').should('be.visible');
      cy.window().then((win) => {
        expect(win.document.body.scrollWidth).to.be.at.most(smallDevice.width + 1);
      });

      // Test large device
      cy.viewport(largeDevice.width, largeDevice.height);
      cy.visit('/');
      
      cy.get('body').should('be.visible');
      cy.window().then((win) => {
        expect(win.document.body.scrollWidth).to.be.at.most(largeDevice.width + 1);
      });
    });
  });

  // Performance across devices
  describe('Mobile Performance', () => {
    const performanceDevices = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'Galaxy S21 Ultra', width: 412, height: 915 },
      { name: 'iPad', width: 768, height: 1024 }
    ];

    performanceDevices.forEach(device => {
      it(`should perform well on ${device.name}`, () => {
        cy.viewport(device.width, device.height);
        
        const startTime = Date.now();
        cy.visit('/').then(() => {
          const loadTime = Date.now() - startTime;
          
          // Log performance for analysis
          cy.log(`${device.name} load time: ${loadTime}ms`);
          
          // Performance should be acceptable
          expect(loadTime).to.be.lessThan(5000);
        });

        // Check for smooth scrolling
        cy.scrollTo('bottom', { duration: 1000 });
        cy.scrollTo('top', { duration: 1000 });
        
        // Page should remain responsive
        cy.get('body').should('be.visible');
      });
    });
  });
});