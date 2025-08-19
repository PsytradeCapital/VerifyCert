import React from 'react';
import { render, screen } from '@testing-library/react';
import Grid, { GridItem } from '../Grid';

describe('Grid', () => {
  it('renders children correctly', () => {
    render(
      <Grid>
        <div>Grid item 1</div>
        <div>Grid item 2</div>
      </Grid>
    );
    
    expect(screen.getByText('Grid item 1')).toBeInTheDocument();
    expect(screen.getByText('Grid item 2')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    const { container } = render(
      <Grid>
        <div>Grid item</div>
      </Grid>
    );
    
    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('grid', 'grid-cols-1', 'gap-4');
  });

  it('applies column classes correctly', () => {
    const { container } = render(
      <Grid cols={3}>
        <div>Grid item</div>
      </Grid>
    );
    
    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('grid-cols-3');
  });

  it('applies responsive column classes', () => {
    const { container } = render(
      <Grid cols={1} colsMd={2} colsLg={3}>
        <div>Grid item</div>
      </Grid>
    );
    
    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
  });

  it('applies gap classes correctly', () => {
    const { container } = render(
      <Grid gap="lg">
        <div>Grid item</div>
      </Grid>
    );
    
    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('gap-6');
  });

  it('applies separate gapX and gapY classes', () => {
    const { container } = render(
      <Grid gapX="md" gapY="lg">
        <div>Grid item</div>
      </Grid>
    );
    
    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('gap-x-4', 'gap-y-6');
  });

  it('applies row classes when specified', () => {
    const { container } = render(
      <Grid rows={3}>
        <div>Grid item</div>
      </Grid>
    );
    
    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('grid-rows-3');
  });

  it('applies auto sizing classes', () => {
    const { container } = render(
      <Grid autoRows="min" autoCols="max">
        <div>Grid item</div>
      </Grid>
    );
    
    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('auto-rows-min', 'auto-cols-max');
  });

  it('applies placement classes', () => {
    const { container } = render(
      <Grid placeItems="center" placeContent="between">
        <div>Grid item</div>
      </Grid>
    );
    
    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('place-items-center', 'place-content-between');
  });

  it('applies custom className', () => {
    const { container } = render(
      <Grid className="custom-grid">
        <div>Grid item</div>
      </Grid>
    );
    
    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('custom-grid');
  });

  it('renders as different HTML element when as prop is provided', () => {
    render(
      <Grid as="section" data-testid="grid">
        <div>Grid item</div>
      </Grid>
    );
    
    const gridElement = screen.getByTestId('grid');
    expect(gridElement.tagName).toBe('SECTION');
  });

  it('handles all column variants', () => {
    const columns = [1, 2, 3, 4, 5, 6, 8, 12] as const;
    
    columns.forEach((cols) => {
      const { container } = render(
        <Grid cols={cols}>
          <div>Grid item</div>
        </Grid>
      );
      
      const gridElement = container.firstChild as HTMLElement;
      expect(gridElement).toHaveClass(`grid-cols-${cols}`);
    });
  });

  it('handles all gap variants', () => {
    const gaps = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
    const expectedClasses = ['gap-0', 'gap-1', 'gap-2', 'gap-4', 'gap-6', 'gap-8', 'gap-12'];
    
    gaps.forEach((gap, index) => {
      const { container } = render(
        <Grid gap={gap}>
          <div>Grid item</div>
        </Grid>
      );
      
      const gridElement = container.firstChild as HTMLElement;
      expect(gridElement).toHaveClass(expectedClasses[index]);
    });
  });
});

describe('GridItem', () => {
  it('renders children correctly', () => {
    render(
      <GridItem>
        <div>Grid item content</div>
      </GridItem>
    );
    
    expect(screen.getByText('Grid item content')).toBeInTheDocument();
  });

  it('applies column span classes', () => {
    const { container } = render(
      <GridItem colSpan={3}>
        <div>Grid item</div>
      </GridItem>
    );
    
    const itemElement = container.firstChild as HTMLElement;
    expect(itemElement).toHaveClass('col-span-3');
  });

  it('applies responsive column span classes', () => {
    const { container } = render(
      <GridItem colSpan={1} colSpanMd={2} colSpanLg={3}>
        <div>Grid item</div>
      </GridItem>
    );
    
    const itemElement = container.firstChild as HTMLElement;
    expect(itemElement).toHaveClass('col-span-1', 'md:col-span-2', 'lg:col-span-3');
  });

  it('applies row span classes', () => {
    const { container } = render(
      <GridItem rowSpan={2}>
        <div>Grid item</div>
      </GridItem>
    );
    
    const itemElement = container.firstChild as HTMLElement;
    expect(itemElement).toHaveClass('row-span-2');
  });

  it('applies full span classes', () => {
    const { container } = render(
      <GridItem colSpan="full" rowSpan="full">
        <div>Grid item</div>
      </GridItem>
    );
    
    const itemElement = container.firstChild as HTMLElement;
    expect(itemElement).toHaveClass('col-span-full', 'row-span-full');
  });

  it('applies position classes', () => {
    const { container } = render(
      <GridItem colStart={2} colEnd={4} rowStart={1} rowEnd={3}>
        <div>Grid item</div>
      </GridItem>
    );
    
    const itemElement = container.firstChild as HTMLElement;
    expect(itemElement).toHaveClass('col-start-2', 'col-end-4', 'row-start-1', 'row-end-3');
  });

  it('applies alignment classes', () => {
    const { container } = render(
      <GridItem justifySelf="center" alignSelf="stretch">
        <div>Grid item</div>
      </GridItem>
    );
    
    const itemElement = container.firstChild as HTMLElement;
    expect(itemElement).toHaveClass('justify-self-center', 'self-stretch');
  });

  it('applies custom className', () => {
    const { container } = render(
      <GridItem className="custom-item">
        <div>Grid item</div>
      </GridItem>
    );
    
    const itemElement = container.firstChild as HTMLElement;
    expect(itemElement).toHaveClass('custom-item');
  });

  it('renders as different HTML element when as prop is provided', () => {
    render(
      <GridItem as="article" data-testid="grid-item">
        <div>Grid item</div>
      </GridItem>
    );
    
    const itemElement = screen.getByTestId('grid-item');
    expect(itemElement.tagName).toBe('ARTICLE');
  });
});