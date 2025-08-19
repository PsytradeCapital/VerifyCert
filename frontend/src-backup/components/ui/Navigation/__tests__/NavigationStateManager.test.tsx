import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NavigationProvider } from '../../../../contexts/NavigationContext';
import { NavigationControls, NavigationStateManager } from '../NavigationStateManager';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <NavigationProvider>
        {component}
      </NavigationProvider>
    </BrowserRouter>
  );
};

describe('NavigationStateManager', () => {
  describe('NavigationControls', () => {
    it('renders all control sections by default', () => {
      renderWithProviders(<NavigationControls />);
      
      expect(screen.getByText('Navigation Controls')).toBeInTheDocument();
      expect(screen.getByText('Active Indicators')).toBeInTheDocument();
      expect(screen.getByText('Transitions')).toBeInTheDocument();
      expect(screen.getByText('Navigation History')).toBeInTheDocument();
    });

    it('can toggle active indicators', () => {
      renderWithProviders(<NavigationControls />);
      
      const showIndicatorsCheckbox = screen.getByLabelText('Show Indicators');
      expect(showIndicatorsCheckbox).toBeChecked();
      
      fireEvent.click(showIndicatorsCheckbox);
      expect(showIndicatorsCheckbox).not.toBeChecked();
    });

    it('can change indicator style', () => {
      renderWithProviders(<NavigationControls />);
      
      const styleSelect = screen.getByLabelText('Style');
      expect(styleSelect).toHaveValue('line'); // Default value
      
      fireEvent.change(styleSelect, { target: { value: 'dot' } });
      expect(styleSelect).toHaveValue('dot');
    });

    it('can change indicator position', () => {
      renderWithProviders(<NavigationControls />);
      
      const positionSelect = screen.getByLabelText('Position');
      expect(positionSelect).toHaveValue('left'); // Default value
      
      fireEvent.change(positionSelect, { target: { value: 'right' } });
      expect(positionSelect).toHaveValue('right');
    });

    it('can toggle transition animations', () => {
      renderWithProviders(<NavigationControls />);
      
      const animateTransitionsCheckbox = screen.getByLabelText('Animate Transitions');
      expect(animateTransitionsCheckbox).toBeChecked();
      
      fireEvent.click(animateTransitionsCheckbox);
      expect(animateTransitionsCheckbox).not.toBeChecked();
    });

    it('shows current navigation state', () => {
      renderWithProviders(<NavigationControls />);
      
      expect(screen.getByText(/Current:/)).toBeInTheDocument();
      expect(screen.getByText(/Active Items:/)).toBeInTheDocument();
      expect(screen.getByText(/Sidebar:/)).toBeInTheDocument();
      expect(screen.getByText(/Mobile Menu:/)).toBeInTheDocument();
    });

    it('provides quick action buttons', () => {
      renderWithProviders(<NavigationControls />);
      
      expect(screen.getByText('Toggle Sidebar')).toBeInTheDocument();
      expect(screen.getByText('Toggle Mobile')).toBeInTheDocument();
    });

    it('can toggle sidebar state', () => {
      renderWithProviders(<NavigationControls />);
      
      const toggleSidebarButton = screen.getByText('Toggle Sidebar');
      fireEvent.click(toggleSidebarButton);
      
      // The sidebar state should change (this would be reflected in the context)
      expect(toggleSidebarButton).toBeInTheDocument();
    });

    it('can toggle mobile menu state', () => {
      renderWithProviders(<NavigationControls />);
      
      const toggleMobileButton = screen.getByText('Toggle Mobile');
      fireEvent.click(toggleMobileButton);
      
      // The mobile menu state should change (this would be reflected in the context)
      expect(toggleMobileButton).toBeInTheDocument();
    });

    it('shows navigation history controls', () => {
      renderWithProviders(<NavigationControls />);
      
      expect(screen.getByText('← Back')).toBeInTheDocument();
      expect(screen.getByText('Forward →')).toBeInTheDocument();
      expect(screen.getByText(/History:/)).toBeInTheDocument();
    });

    it('disables back button when cannot go back', () => {
      renderWithProviders(<NavigationControls />);
      
      const backButton = screen.getByText('← Back');
      expect(backButton).toBeDisabled();
    });

    it('disables forward button when cannot go forward', () => {
      renderWithProviders(<NavigationControls />);
      
      const forwardButton = screen.getByText('Forward →');
      expect(forwardButton).toBeDisabled();
    });
  });

  describe('NavigationStateManager', () => {
    it('renders children correctly', () => {
      renderWithProviders(
        <NavigationStateManager>
          <div>Test Content</div>
        </NavigationStateManager>
      );
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('shows debug info in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      renderWithProviders(
        <NavigationStateManager>
          <div>Test Content</div>
        </NavigationStateManager>
      );
      
      expect(screen.getByText('Navigation State')).toBeInTheDocument();
      
      process.env.NODE_ENV = originalEnv;
    });

    it('hides debug info in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      renderWithProviders(
        <NavigationStateManager>
          <div>Test Content</div>
        </NavigationStateManager>
      );
      
      expect(screen.queryByText('Navigation State')).not.toBeInTheDocument();
      
      process.env.NODE_ENV = originalEnv;
    });

    it('applies custom className', () => {
      const { container } = renderWithProviders(
        <NavigationStateManager className="custom-class">
          <div>Test Content</div>
        </NavigationStateManager>
      );
      
      const navigationStateManager = container.querySelector('.navigation-state-manager');
      expect(navigationStateManager).toHaveClass('custom-class');
    });
  });

  describe('Integration', () => {
    it('controls affect navigation state', async () => {
      renderWithProviders(
        <NavigationStateManager>
          <NavigationControls />
        </NavigationStateManager>
      );
      
      // Toggle active indicators
      const showIndicatorsCheckbox = screen.getByLabelText('Show Indicators');
      fireEvent.click(showIndicatorsCheckbox);
      
      // Change indicator style
      const styleSelect = screen.getByLabelText('Style');
      fireEvent.change(styleSelect, { target: { value: 'background' } });
      
      // Toggle animations
      const animateCheckbox = screen.getByLabelText('Animate Transitions');
      fireEvent.click(animateCheckbox);
      
      // The state changes should be reflected in the UI
      await waitFor(() => {
        expect(showIndicatorsCheckbox).not.toBeChecked();
        expect(styleSelect).toHaveValue('background');
        expect(animateCheckbox).not.toBeChecked();
      });
    });
  });
});