import React from 'react';
import {
  Container,
  Grid,
  Card,
  Button,
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
} from '../components/ui';
import { Smartphone, Tablet, Monitor, Hand, Mouse } from 'lucide-react';

const MobileBreakpointDemo: React.FC = () => {
  return (
    <Container size="xl" padding="lg">
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            Mobile Breakpoint Handling Demo
          </h1>
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
            Demonstrating enhanced mobile-first responsive design with improved breakpoint handling,
            touch targets, and safe area support.
          </p>
        </div>

        {/* Responsive Visibility */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Responsive Visibility</h2>
          <Grid cols={1} colsMd={2} colsLg={4} gap="md">
            <Card className="p-6 text-center">
              <MobileOnly>
                <div className="text-primary-600 mb-4">
                  <Smartphone className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Mobile Only</h3>
                <p className="text-sm text-neutral-600">
                  This content only appears on mobile devices (&lt; 768px)
                </p>
              </MobileOnly>
            </Card>

            <Card className="p-6 text-center">
              <TabletOnly>
                <div className="text-primary-600 mb-4">
                  <Tablet className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Tablet Only</h3>
                <p className="text-sm text-neutral-600">
                  This content only appears on tablets (768px - 1023px)
                </p>
              </TabletOnly>
            </Card>

            <Card className="p-6 text-center">
              <DesktopOnly>
                <div className="text-primary-600 mb-4">
                  <Monitor className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Desktop Only</h3>
                <p className="text-sm text-neutral-600">
                  This content only appears on desktop (≥ 1024px)
                </p>
              </DesktopOnly>
            </Card>

            <Card className="p-6 text-center">
              <ResponsiveShow
                mobile={
                  <div>
                    <Smartphone className="h-12 w-12 mx-auto text-primary-600 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Mobile View</h3>
                    <p className="text-sm text-neutral-600">Optimized for mobile</p>
                  </div>
                tablet={
                  <div>
                    <Tablet className="h-12 w-12 mx-auto text-primary-600 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Tablet View</h3>
                    <p className="text-sm text-neutral-600">Optimized for tablet</p>
                  </div>
                desktop={
                  <div>
                    <Monitor className="h-12 w-12 mx-auto text-primary-600 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Desktop View</h3>
                    <p className="text-sm text-neutral-600">Optimized for desktop</p>
                  </div>
              />
            </Card>
          </Grid>
        </section>

        {/* Touch vs Hover */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Touch vs Hover Detection</h2>
          <Grid cols={1} colsMd={2} gap="md">
            <Card className="p-6">
              <TouchOnly>
                <div className="text-center">
                  <Hand className="h-12 w-12 mx-auto text-accent-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Touch Device</h3>
                  <p className="text-sm text-neutral-600 mb-4">
                    This content appears on touch-enabled devices
                  </p>
                  <TouchTarget size="lg" className="bg-accent-500 text-white rounded-lg">
                    Large Touch Target
                  </TouchTarget>
                </div>
              </TouchOnly>
            </Card>

            <Card className="p-6">
              <HoverOnly>
                <div className="text-center">
                  <Mouse className="h-12 w-12 mx-auto text-accent-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Hover Device</h3>
                  <p className="text-sm text-neutral-600 mb-4">
                    This content appears on devices that support hover
                  </p>
                  <Button className="hover:scale-105 transition-transform">
                    Hover Effect
                  </Button>
                </div>
              </HoverOnly>
            </Card>
          </Grid>
        </section>

        {/* Touch Targets */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Touch Target Sizes</h2>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 items-center">
                <TouchTarget size="sm" className="bg-primary-500 text-white rounded-lg">
                  Small (40px)
                </TouchTarget>
                <TouchTarget size="default" className="bg-primary-500 text-white rounded-lg">
                  Medium (44px)
                </TouchTarget>
                <TouchTarget size="lg" className="bg-primary-500 text-white rounded-lg">
                  Large (48px)
                </TouchTarget>
                <TouchTarget size="xl" className="bg-primary-500 text-white rounded-lg">
                  XL (56px)
                </TouchTarget>
              </div>
              <p className="text-sm text-neutral-600">
                All touch targets meet accessibility guidelines with minimum 44px touch area
              </p>
            </div>
          </Card>
        </section>

        {/* Safe Area */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Safe Area Support</h2>
          <Card className="p-6">
            <SafeArea sides="all" className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg">
              <MobilePadding>
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Safe Area Content</h3>
                  <p className="text-sm text-neutral-600">
                    This content respects device safe areas (notches, home indicators, etc.)
                    and uses mobile-optimized padding that scales responsively.
                  </p>
                </div>
              </MobilePadding>
            </SafeArea>
          </Card>
        </section>

        {/* Responsive Grid */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Responsive Grid System</h2>
          <ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={4} gap="md">
            {Array.from({ length: 8 }, (_, i) => (
              <Card key={i} className="p-4 text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">{i + 1}</span>
                </div>
                <ResponsiveText mobileSize="sm" tabletSize="base" desktopSize="lg">
                  Grid Item {i + 1}
                </ResponsiveText>
              </Card>
            ))}
          </ResponsiveGrid>
        </section>

        {/* Responsive Typography */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Responsive Typography</h2>
          <Card className="p-6 space-y-4">
            <ResponsiveText mobileSize="2xl" tabletSize="3xl" desktopSize="4xl" className="font-bold text-neutral-900">
              Responsive Heading
            </ResponsiveText>
            <ResponsiveText mobileSize="sm" tabletSize="base" desktopSize="lg" className="text-neutral-600">
              This text scales appropriately across different screen sizes. On mobile it's smaller for better readability,
              on tablet it's medium-sized, and on desktop it's larger for comfortable viewing distance.
            </ResponsiveText>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <ResponsiveText mobileSize="xs" desktopSize="sm" className="text-neutral-500 uppercase tracking-wide font-semibold">
                  Mobile: xs
                </ResponsiveText>
                <ResponsiveText mobileSize="xs" desktopSize="sm" className="text-neutral-500 uppercase tracking-wide font-semibold desktop-only">
                  Desktop: sm
                </ResponsiveText>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <ResponsiveText mobileSize="sm" desktopSize="base" className="text-neutral-500 uppercase tracking-wide font-semibold">
                  Mobile: sm
                </ResponsiveText>
                <ResponsiveText mobileSize="sm" desktopSize="base" className="text-neutral-500 uppercase tracking-wide font-semibold desktop-only">
                  Desktop: base
                </ResponsiveText>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <ResponsiveText mobileSize="base" desktopSize="lg" className="text-neutral-500 uppercase tracking-wide font-semibold">
                  Mobile: base
                </ResponsiveText>
                <ResponsiveText mobileSize="base" desktopSize="lg" className="text-neutral-500 uppercase tracking-wide font-semibold desktop-only">
                  Desktop: lg
                </ResponsiveText>
              </div>
            </div>
          </Card>
        </section>

        {/* Breakpoint Information */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Enhanced Breakpoint System</h2>
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-2 font-semibold">Breakpoint</th>
                    <th className="text-left py-2 font-semibold">Size</th>
                    <th className="text-left py-2 font-semibold">Description</th>
                    <th className="text-left py-2 font-semibold">Use Case</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  <tr>
                    <td className="py-2 font-mono text-xs">xs</td>
                    <td className="py-2">475px+</td>
                    <td className="py-2">Large phones</td>
                    <td className="py-2">Fine-tune mobile layouts</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-xs">sm</td>
                    <td className="py-2">640px+</td>
                    <td className="py-2">Small tablets</td>
                    <td className="py-2">Tablet portrait mode</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-xs">md</td>
                    <td className="py-2">768px+</td>
                    <td className="py-2">Tablets</td>
                    <td className="py-2">Tablet landscape mode</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-xs">lg</td>
                    <td className="py-2">1024px+</td>
                    <td className="py-2">Small laptops</td>
                    <td className="py-2">Desktop layouts</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-xs">xl</td>
                    <td className="py-2">1280px+</td>
                    <td className="py-2">Desktops</td>
                    <td className="py-2">Large desktop layouts</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-xs">2xl</td>
                    <td className="py-2">1536px+</td>
                    <td className="py-2">Large desktops</td>
                    <td className="py-2">Wide screen layouts</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-xs">3xl</td>
                    <td className="py-2">1920px+</td>
                    <td className="py-2">Ultra-wide screens</td>
                    <td className="py-2">Ultra-wide layouts</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* Current Viewport Info */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Current Viewport</h2>
          <Card className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                <span className="mobile-only">📱 Mobile</span>
                <span className="tablet-only">📱 Tablet</span>
                <span className="desktop-only">🖥️ Desktop</span>
              </div>
              <p className="text-neutral-600">
                Resize your browser window to see the responsive behavior in action
              </p>
              <div className="mt-4 text-sm text-neutral-500">
                <div className="mobile-only">Width: &lt; 768px</div>
                <div className="tablet-only">Width: 768px - 1023px</div>
                <div className="desktop-only">Width: ≥ 1024px</div>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </Container>
  );
};

export default MobileBreakpointDemo;
}
}}