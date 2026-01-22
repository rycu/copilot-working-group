import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductDetail } from './index';
import { mockProduct, mockProductWithoutBrand } from '../../test/mockData';

// Mock child components
vi.mock('../ProductNavigation', () => ({
  ProductNavigation: () => <div data-testid="product-navigation">Navigation</div>,
}));

vi.mock('../ProductImage', () => ({
  ProductImage: () => <div data-testid="product-image">Image</div>,
}));

vi.mock('../ProductInfo', () => ({
  ProductInfo: () => <div data-testid="product-info">Info</div>,
}));

vi.mock('../ProductMeta', () => ({
  ProductMeta: () => <div data-testid="product-meta">Meta</div>,
}));

vi.mock('../ProductActions', () => ({
  ProductActions: () => <div data-testid="product-actions">Actions</div>,
}));

// Helper function to render component with QueryClient
const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('ProductDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all child components', () => {
    renderWithQueryClient(<ProductDetail />);

    expect(screen.getByTestId('product-navigation')).toBeInTheDocument();
    expect(screen.getByTestId('product-image')).toBeInTheDocument();
    expect(screen.getByTestId('product-info')).toBeInTheDocument();
    expect(screen.getByTestId('product-meta')).toBeInTheDocument();
    expect(screen.getByTestId('product-actions')).toBeInTheDocument();
  });

  it('should render with correct layout structure', () => {
    const { container } = renderWithQueryClient(<ProductDetail />);

    // Check that container and product divs exist
    const containerDiv = container.querySelector('div[class*="container"]');
    const productDiv = container.querySelector('div[class*="product"]');
    const infoSection = container.querySelector('div[class*="infoSection"]');

    expect(containerDiv).toBeInTheDocument();
    expect(productDiv).toBeInTheDocument();
    expect(infoSection).toBeInTheDocument();
  });

  it('should render ProductImage outside of infoSection', () => {
    const { container } = renderWithQueryClient(<ProductDetail />);

    const productDiv = container.querySelector('div[class*="product"]');
    const infoSection = container.querySelector('div[class*="infoSection"]');
    const imageElement = screen.getByTestId('product-image');

    expect(productDiv).toContainElement(imageElement);
    expect(infoSection).not.toContainElement(imageElement);
  });

  it('should render ProductInfo, ProductMeta, and ProductActions inside infoSection', () => {
    const { container } = renderWithQueryClient(<ProductDetail />);

    const infoSection = container.querySelector('div[class*="infoSection"]');
    const infoElement = screen.getByTestId('product-info');
    const metaElement = screen.getByTestId('product-meta');
    const actionsElement = screen.getByTestId('product-actions');

    expect(infoSection).toContainElement(infoElement);
    expect(infoSection).toContainElement(metaElement);
    expect(infoSection).toContainElement(actionsElement);
  });
});
