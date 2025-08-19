import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Breadcrumbs, { AutoBreadcrumbs } from '../Breadcrumbs';

// Mock the useBreadcrumbs hook
jest.mock('../../../../hooks/useBreadcrumbs', () => ({
  useBreadcrumbs: () => [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Current Page', active: true
  ]
}));

const renderWithRouter = (component: React.ReactElement, initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {component}
    </MemoryRouter>
  );
};

describe('Breadcrumbs', () => {
  const mockItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Current Product', active: true
  ];

  it('renders breadcrumb items correctly', () => {
    renderWithRouter(<Breadcrumbs items={mockItems} />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Current Product')).toBeInTheDocument();
  });

  it('renders links for non-active items', () => {
    renderWithRouter(<Breadcrumbs items={mockItems} />);
    
    const homeLink = screen.getByRole('link', { name: /home/i });
    const productsLink = screen.getByRole('link', { name: /products/i });
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(productsLink).toHaveAttribute('href', '/products');
  });

  it('marks active item with aria-current', () => {
    renderWithRouter(<Breadcrumbs items={mockItems} />);
    
    const activeItem = screen.getByText('Current Product');
    expect(activeItem).toHaveAttribute('aria-current', 'page');
  });

  it('renders separators between items', () => {
    const { container } = renderWithRouter(<Breadcrumbs items={mockItems} />);
    
    // Should have 2 separators for 3 items - look for separator spans
    const separators = container.querySelectorAll('span.mx-2.text-gray-400.select-none');
    expect(separators).toHaveLength(2);
  });

  it('uses custom separator when provided', () => {
    const customSeparator = <span data-testid="custom-separator">→</span>;
    renderWithRouter(
      <Breadcrumbs items={mockItems} separator={customSeparator} />
    );
    
    const separators = screen.getAllByTestId('custom-separator');
    expect(separators).toHaveLength(2);
  });

  it('shows home icon for first item when showHomeIcon is true', () => {
    renderWithRouter(<Breadcrumbs items={mockItems} showHomeIcon={true} />);
    
    // Home icon should be present
    const homeIcon = screen.getByRole('link', { name: /home/i }).querySelector('svg');
    expect(homeIcon).toBeInTheDocument();
  });

  it('hides home icon when showHomeIcon is false', () => {
    renderWithRouter(<Breadcrumbs items={mockItems} showHomeIcon={false} />);
    
    // Home icon should not be present
    const homeLink = screen.getByRole('link', { name: /home/i });
    const homeIcon = homeLink.querySelector('svg');
    expect(homeIcon).not.toBeInTheDocument();
  });

  it('truncates items when maxItems is specified', () => {
    const manyItems = [
      { label: 'Home', href: '/' },
      { label: 'Level 1', href: '/level1' },
      { label: 'Level 2', href: '/level2' },
      { label: 'Level 3', href: '/level3' },
      { label: 'Current', active: true
    ];

    renderWithRouter(<Breadcrumbs items={manyItems} maxItems={3} />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.queryByText('Level 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Level 2')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = renderWithRouter(
      <Breadcrumbs items={mockItems} className="custom-class" />
    );
    
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('custom-class');
  });

  it('returns null when no items are provided', () => {
    const { container } = renderWithRouter(<Breadcrumbs items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('handles ellipsis item correctly', () => {
    const itemsWithEllipsis = [
      { label: 'Home', href: '/' },
      { label: '...', active: false },
      { label: 'Current', active: true
    ];

    renderWithRouter(<Breadcrumbs items={itemsWithEllipsis} />);
    
    const ellipsis = screen.getByText('...');
    expect(ellipsis).toBeInTheDocument();
    expect(ellipsis).toHaveClass('text-gray-400');
  });

  it('has proper accessibility attributes', () => {
    renderWithRouter(<Breadcrumbs items={mockItems} />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
    
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
  });
});

describe('AutoBreadcrumbs', () => {
  it('automatically generates breadcrumbs using the hook', () => {
    renderWithRouter(<AutoBreadcrumbs />);
    
    // Should use the mocked breadcrumbs from useBreadcrumbs hook
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Current Page')).toBeInTheDocument();
  });

  it('passes through props to Breadcrumbs component', () => {
    renderWithRouter(<AutoBreadcrumbs showHomeIcon={false} className="auto-breadcrumbs" />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('auto-breadcrumbs');
  });
});