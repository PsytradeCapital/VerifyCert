import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  MobileOnly,
  TabletOnly,
  DesktopOnly,
  TouchOnly,
  HoverOnly,
  ResponsiveShow,;;
  SafeArea,;;
  TouchTarget,;;
  MobilePadding,;;
  ResponsiveGrid,;;
  ResponsiveText;;
} from '../ResponsiveUtility';

// Mock window.innerWidth for responsive tests
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
};

describe('ResponsiveUtility Components', () => {
  describe('MobileOnly', () => {
    it('renders children with mobile-only class', () => {
      render(
        <MobileOnly>
          <div data-testid="mobile-content">Mobile Content</div>
        </MobileOnly>
      );
      
      const container = screen.getByTestId('mobile-content').parentElement;
      expect(container).toHaveClass('mobile-only');
    });

    it('applies additional className', () => {
      render(
        <MobileOnly className="custom-class">
          <div data-testid="mobile-content">Mobile Content</div>
        </MobileOnly>
      );
      
      const container = screen.getByTestId('mobile-content').parentElement;
      expect(container).toHaveClass('mobile-only', 'custom-class');
    });
  });

  describe('TabletOnly', () => {
    it('renders children with tablet-only class', () => {
      render(
        <TabletOnly>
          <div data-testid="tablet-content">Tablet Content</div>
        </TabletOnly>
      );
      
      const container = screen.getByTestId('tablet-content').parentElement;
      expect(container).toHaveClass('tablet-only');
    });
  });

  describe('DesktopOnly', () => {
    it('renders children with desktop-only class', () => {
      render(
        <DesktopOnly>
          <div data-testid="desktop-content">Desktop Content</div>
        </DesktopOnly>
      );
      
      const container = screen.getByTestId('desktop-content').parentElement;
      expect(container).toHaveClass('desktop-only');
    });
  });

  describe('TouchOnly', () => {
    it('renders children with touch-only class', () => {
      render(
        <TouchOnly>
          <div data-testid="touch-content">Touch Content</div>
        </TouchOnly>
      );
      
      const container = screen.getByTestId('touch-content').parentElement;
      expect(container).toHaveClass('touch-only');
    });
  });

  describe('HoverOnly', () => {
    it('renders children with hover-only class', () => {
      render(
        <HoverOnly>
          <div data-testid="hover-content">Hover Content</div>
        </HoverOnly>
      );
      
      const container = screen.getByTestId('hover-content').parentElement;
      expect(container).toHaveClass('hover-only');
    });
  });

  describe('ResponsiveShow', () => {
    it('renders different content for different screen sizes', () => {
      render(
        <ResponsiveShow
          mobile={<div data-testid="mobile">Mobile</div>
          tablet={<div data-testid="tablet">Tablet</div>
          desktop={<div data-testid="desktop">Desktop</div>
        />
      );
      
      expect(screen.getByTestId('mobile')).toBeInTheDocument();
      expect(screen.getByTestId('tablet')).toBeInTheDocument();
      expect(screen.getByTestId('desktop')).toBeInTheDocument();
    });

    it('renders only provided content', () => {
      render(
        <ResponsiveShow
          mobile={<div data-testid="mobile">Mobile</div>
          desktop={<div data-testid="desktop">Desktop</div>
        />
      );
      
      expect(screen.getByTestId('mobile')).toBeInTheDocument();
      expect(screen.getByTestId('desktop')).toBeInTheDocument();
      expect(screen.queryByTestId('tablet')).not.toBeInTheDocument();
    });
  });

  describe('SafeArea', () => {
    it('applies safe-area class by default', () => {
      render(
        <SafeArea>
          <div data-testid="safe-content">Safe Content</div>
        </SafeArea>
      );
      
      const container = screen.getByTestId('safe-content').parentElement;
      expect(container).toHaveClass('safe-area');
    });

    it('applies specific safe area classes', () => {
      const { rerender } = render(
        <SafeArea sides="x">
          <div data-testid="safe-content">Safe Content</div>
        </SafeArea>
      );
      
      let container = screen.getByTestId('safe-content').parentElement;
      expect(container).toHaveClass('safe-area-x');

      rerender(
        <SafeArea sides="top">
          <div data-testid="safe-content">Safe Content</div>
        </SafeArea>
      );
      
      container = screen.getByTestId('safe-content').parentElement;
      expect(container).toHaveClass('safe-top');
    });
  });

  describe('TouchTarget', () => {
    it('renders as button by default with touch-target class', () => {
      render(
        <TouchTarget>
          Touch Me
        </TouchTarget>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('touch-target');
      expect(button).toHaveTextContent('Touch Me');
    });

    it('applies different sizes', () => {
      const { rerender } = render(
        <TouchTarget size="sm">
          Small Touch
        </TouchTarget>
      );
      
      let button = screen.getByRole('button');
      expect(button).toHaveClass('touch-target-sm');

      rerender(
        <TouchTarget size="lg">
          Large Touch
        </TouchTarget>
      );
      
      button = screen.getByRole('button');
      expect(button).toHaveClass('touch-target-lg');
    });

    it('renders as different elements', () => {
      const { rerender } = render(
        <TouchTarget as="div">
          Div Touch
        </TouchTarget>
      );
      
      expect(screen.getByText('Div Touch')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();

      rerender(
        <TouchTarget as="a" href="/test">
          Link Touch
        </TouchTarget>
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/test');
      expect(link).toHaveTextContent('Link Touch');
    });
  });

  describe('MobilePadding', () => {
    it('applies mobile-padding class by default', () => {
      render(
        <MobilePadding>
          <div data-testid="padded-content">Padded Content</div>
        </MobilePadding>
      );
      
      const container = screen.getByTestId('padded-content').parentElement;
      expect(container).toHaveClass('mobile-padding');
    });

    it('applies directional padding classes', () => {
      const { rerender } = render(
        <MobilePadding direction="x">
          <div data-testid="padded-content">Padded Content</div>
        </MobilePadding>
      );
      
      let container = screen.getByTestId('padded-content').parentElement;
      expect(container).toHaveClass('mobile-padding-x');

      rerender(
        <MobilePadding direction="y">
          <div data-testid="padded-content">Padded Content</div>
        </MobilePadding>
      );
      
      container = screen.getByTestId('padded-content').parentElement;
      expect(container).toHaveClass('mobile-padding-y');
    });
  });

  describe('ResponsiveGrid', () => {
    it('applies responsive grid classes', () => {
      render(
        <ResponsiveGrid mobileCols={1} desktopCols={3}>
          <div data-testid="grid-content">Grid Content</div>
        </ResponsiveGrid>
      );
      
      const container = screen.getByTestId('grid-content').parentElement;
      expect(container).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-3');
    });

    it('includes tablet columns when provided', () => {
      render(
        <ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={4}>
          <div data-testid="grid-content">Grid Content</div>
        </ResponsiveGrid>
      );
      
      const container = screen.getByTestId('grid-content').parentElement;
      expect(container).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4');
    });

    it('applies gap classes', () => {
      render(
        <ResponsiveGrid mobileCols={1} desktopCols={3} gap="lg">
          <div data-testid="grid-content">Grid Content</div>
        </ResponsiveGrid>
      );
      
      const container = screen.getByTestId('grid-content').parentElement;
      expect(container).toHaveClass('gap-4', 'xs:gap-5', 'sm:gap-6', 'lg:gap-8');
    });
  });

  describe('ResponsiveText', () => {
    it('applies responsive text size classes', () => {
      render(
        <ResponsiveText mobileSize="sm" desktopSize="lg">
          Responsive Text
        </ResponsiveText>
      );
      
      const text = screen.getByText('Responsive Text');
      expect(text).toHaveClass('text-sm', 'lg:text-lg');
    });

    it('includes tablet size when provided', () => {
      render(
        <ResponsiveText mobileSize="sm" tabletSize="base" desktopSize="xl">
          Responsive Text
        </ResponsiveText>
      );
      
      const text = screen.getByText('Responsive Text');
      expect(text).toHaveClass('text-sm', 'md:text-base', 'lg:text-xl');
    });

    it('applies additional className', () => {
      render(
        <ResponsiveText mobileSize="sm" desktopSize="lg" className="font-bold">
          Responsive Text
        </ResponsiveText>
      );
      
      const text = screen.getByText('Responsive Text');
      expect(text).toHaveClass('text-sm', 'lg:text-lg', 'font-bold');
    });
  });
});
}
}}}}