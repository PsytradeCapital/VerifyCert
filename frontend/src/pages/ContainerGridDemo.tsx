import React from 'react';
import { Container, Grid, GridItem, Card } from '../components/ui';

const ContainerGridDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      {/* Container Demos */}
      <Container size="xl" padding="lg">
        <div className="space-y-12">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-8">
              Container & Grid Components Demo
            </h1>
            
            {/* Container Size Variants */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-neutral-800 mb-6">
                Container Size Variants
              </h2>
              
              <div className="space-y-4">
                {(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((size) => (
                  <Container key={size} size={size} padding="md" className="bg-white border border-neutral-200 rounded-lg">
                    <div className="py-4 text-center">
                      <span className="text-sm font-medium text-neutral-600">
                        Container size="{size}"
                      </span>
                    </div>
                  </Container>
                ))}
              </div>
            </section>

            {/* Container Padding Variants */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-neutral-800 mb-6">
                Container Padding Variants
              </h2>
              
              <div className="space-y-4">
                {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((padding) => (
                  <Container key={padding} size="md" padding={padding} className="bg-white border border-neutral-200 rounded-lg">
                    <div className="bg-primary-50 border border-primary-200 rounded text-center py-2">
                      <span className="text-sm font-medium text-primary-700">
                        Container padding="{padding}"
                      </span>
                    </div>
                  </Container>
                ))}
              </div>
            </section>

            {/* Separate Padding Controls */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-neutral-800 mb-6">
                Separate Padding Controls
              </h2>
              
              <Container size="md" paddingX="xl" paddingY="sm" className="bg-white border border-neutral-200 rounded-lg">
                <div className="bg-accent-50 border border-accent-200 rounded text-center py-4">
                  <span className="text-sm font-medium text-accent-700">
                    Container paddingX="xl" paddingY="sm"
                  </span>
                </div>
              </Container>
            </section>
          </div>

          {/* Grid Demos */}
          <div>
            <h2 className="text-2xl font-semibold text-neutral-800 mb-6">
              Grid Layout Examples
            </h2>

            {/* Basic Grid */}
            <section className="mb-8">
              <h3 className="text-lg font-medium text-neutral-700 mb-4">
                Basic Responsive Grid
              </h3>
              
              <Grid cols={1} colsMd={2} colsLg={3} gap="md">
                {Array.from({ length: 6 }, (_, i) => (
                  <Card key={i} className="p-4 text-center">
                    <span className="text-sm font-medium text-neutral-600">
                      Grid Item {i + 1}
                    </span>
                  </Card>
                ))}
              </Grid>
            </section>

            {/* Grid with Different Gaps */}
            <section className="mb-8">
              <h3 className="text-lg font-medium text-neutral-700 mb-4">
                Grid Gap Variants
              </h3>
              
              <div className="space-y-6">
                {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((gap) => (
                  <div key={gap}>
                    <h4 className="text-sm font-medium text-neutral-600 mb-2">
                      Gap: {gap}
                    </h4>
                    <Grid cols={4} gap={gap}>
                      {Array.from({ length: 4 }, (_, i) => (
                        <Card key={i} className="p-3 text-center">
                          <span className="text-xs text-neutral-500">Item {i + 1}</span>
                        </Card>
                      ))}
                    </Grid>
                  </div>
                ))}
              </div>
            </section>

            {/* Grid with Separate X/Y Gaps */}
            <section className="mb-8">
              <h3 className="text-lg font-medium text-neutral-700 mb-4">
                Separate X/Y Gaps
              </h3>
              
              <Grid cols={3} gapX="xl" gapY="sm">
                {Array.from({ length: 6 }, (_, i) => (
                  <Card key={i} className="p-4 text-center">
                    <span className="text-sm font-medium text-neutral-600">
                      Item {i + 1}
                    </span>
                  </Card>
                ))}
              </Grid>
            </section>

            {/* Grid with GridItem Components */}
            <section className="mb-8">
              <h3 className="text-lg font-medium text-neutral-700 mb-4">
                Grid with GridItem Components
              </h3>
              
              <Grid cols={4} gap="md">
                <GridItem colSpan={2}>
                  <Card className="p-4 text-center bg-primary-50 border-primary-200">
                    <span className="text-sm font-medium text-primary-700">
                      Spans 2 columns
                    </span>
                  </Card>
                </GridItem>
                
                <GridItem>
                  <Card className="p-4 text-center">
                    <span className="text-sm text-neutral-600">Item 1</span>
                  </Card>
                </GridItem>
                
                <GridItem>
                  <Card className="p-4 text-center">
                    <span className="text-sm text-neutral-600">Item 2</span>
                  </Card>
                </GridItem>
                
                <GridItem colSpan="full">
                  <Card className="p-4 text-center bg-accent-50 border-accent-200">
                    <span className="text-sm font-medium text-accent-700">
                      Spans full width
                    </span>
                  </Card>
                </GridItem>
                
                <GridItem colSpan={1} colSpanMd={2} colSpanLg={3}>
                  <Card className="p-4 text-center bg-success-50 border-success-200">
                    <span className="text-sm font-medium text-success-700">
                      Responsive: 1 col → 2 cols (md) → 3 cols (lg)
                    </span>
                  </Card>
                </GridItem>
                
                <GridItem>
                  <Card className="p-4 text-center">
                    <span className="text-sm text-neutral-600">Item 3</span>
                  </Card>
                </GridItem>
              </Grid>
            </section>

            {/* Complex Grid Layout */}
            <section className="mb-8">
              <h3 className="text-lg font-medium text-neutral-700 mb-4">
                Complex Grid Layout
              </h3>
              
              <Grid cols={6} rows={4} gap="md" className="h-96">
                <GridItem colSpan={2} rowSpan={2} className="bg-primary-100 rounded-lg p-4 flex items-center justify-center">
                  <span className="text-primary-700 font-medium">Header</span>
                </GridItem>
                
                <GridItem colSpan={4} className="bg-neutral-100 rounded-lg p-4 flex items-center justify-center">
                  <span className="text-neutral-700">Navigation</span>
                </GridItem>
                
                <GridItem colSpan={3} className="bg-accent-100 rounded-lg p-4 flex items-center justify-center">
                  <span className="text-accent-700">Content</span>
                </GridItem>
                
                <GridItem className="bg-success-100 rounded-lg p-4 flex items-center justify-center">
                  <span className="text-success-700 text-sm">Sidebar</span>
                </GridItem>
                
                <GridItem colSpan={2} className="bg-warning-100 rounded-lg p-4 flex items-center justify-center">
                  <span className="text-warning-700">Aside</span>
                </GridItem>
                
                <GridItem colSpan={3} className="bg-error-100 rounded-lg p-4 flex items-center justify-center">
                  <span className="text-error-700">Main Content</span>
                </GridItem>
                
                <GridItem colSpan={6} className="bg-neutral-200 rounded-lg p-4 flex items-center justify-center">
                  <span className="text-neutral-700">Footer</span>
                </GridItem>
              </Grid>
            </section>

            {/* Grid Alignment Examples */}
            <section className="mb-8">
              <h3 className="text-lg font-medium text-neutral-700 mb-4">
                Grid Alignment Examples
              </h3>
              
              <Grid cols={3} gap="md" placeItems="center" className="h-32 bg-neutral-100 rounded-lg">
                <Card className="p-2 text-center">
                  <span className="text-xs text-neutral-600">Centered</span>
                </Card>
                <Card className="p-2 text-center">
                  <span className="text-xs text-neutral-600">Items</span>
                </Card>
                <Card className="p-2 text-center">
                  <span className="text-xs text-neutral-600">Grid</span>
                </Card>
              </Grid>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ContainerGridDemo;