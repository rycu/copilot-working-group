import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ProductDetail } from './index';
import { mockProduct, mockProductWithoutBrand } from '../../test/mockData';
import type { Product } from '../../types/product';
import { productService } from '../../services';
import * as CartContext from '../../contexts/useCartContext';

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  useParams: vi.fn(() => ({ productId: '1' })),
  Link: ({ children, ...props }: { children: ReactNode; to?: string; params?: Record<string, unknown> }) => <a {...props}>{children}</a>,
}));

// Mock product service
vi.mock('../../services', () => ({
  productService: {
    getProduct: vi.fn(),
  },
}));

// Mock CartContext
vi.mock('../../contexts/useCartContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../contexts/useCartContext')>();
  return {
    ...actual,
    useCartContext: vi.fn(),
  };
});

// Mock Button component for simpler testing
vi.mock('../ui/Button', () => ({
  Button: ({ children, onClick, fullWidth }: { children: ReactNode; onClick: () => void; fullWidth?: boolean }) => (
    <button onClick={onClick} data-fullwidth={fullWidth}>
      {children}
    </button>
  ),
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

describe('ProductDetail Integration Tests', () => {
  const mockAddToCart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(CartContext.useCartContext).mockReturnValue({
      addToCart: mockAddToCart,
      items: [],
      removeFromCart: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
      totalItems: 0,
      totalPrice: 0,
    });
  });

  it('⏳ should render loading state while fetching product', async () => {
    vi.mocked(productService.getProduct).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithQueryClient(<ProductDetail />);

    // The component should render its structure even during loading
    expect(screen.queryByText('Test Product')).not.toBeInTheDocument();
  });

  it('✅ should render product details when data is successfully fetched', async () => {
    vi.mocked(productService.getProduct).mockResolvedValue(mockProduct);

    renderWithQueryClient(<ProductDetail />);

    // Wait for product data to load
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('This is a test product description')).toBeInTheDocument();
    expect(screen.getByText('TestBrand')).toBeInTheDocument();
    expect(screen.getByText('electronics')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('⭐ 4.5')).toBeInTheDocument();
    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
  });

  it('🏷️ should handle product without brand', async () => {
    vi.mocked(productService.getProduct).mockResolvedValue(mockProductWithoutBrand);

    renderWithQueryClient(<ProductDetail />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('🛒 should add product to cart when "Add to Cart" button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(productService.getProduct).mockResolvedValue(mockProduct);

    renderWithQueryClient(<ProductDetail />);

    // Wait for product data to load
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    const addToCartButton = screen.getByText('Add to Cart');
    await user.click(addToCartButton);

    expect(mockAddToCart).toHaveBeenCalledTimes(1);
    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('❌ should handle error state when product fetch fails', async () => {
    const error = new Error('Failed to fetch product');
    vi.mocked(productService.getProduct).mockRejectedValue(error);

    renderWithQueryClient(<ProductDetail />);

    // Wait for error state
    await waitFor(() => {
      // Component should render but without product data
      expect(screen.queryByText('Test Product')).not.toBeInTheDocument();
    });

    // The component structure should still be present
    const container = screen.getByText('Add to Cart').closest('div');
    expect(container).toBeInTheDocument();
  });

  it('📸 should display product image', async () => {
    vi.mocked(productService.getProduct).mockResolvedValue(mockProduct);

    renderWithQueryClient(<ProductDetail />);

    await waitFor(() => {
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', 'https://example.com/image1.jpg');
      expect(image).toHaveAttribute('alt', 'Test Product');
    });
  });

  it('🔄 should fallback to thumbnail when images array is empty', async () => {
    const productWithNoImages = {
      ...mockProduct,
      images: [],
    };
    vi.mocked(productService.getProduct).mockResolvedValue(productWithNoImages);

    renderWithQueryClient(<ProductDetail />);

    await waitFor(() => {
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', 'https://example.com/thumb.jpg');
    });
  });

  it('⛔ should not call addToCart before product data is loaded', async () => {
    const user = userEvent.setup();
    let productResolver: ((value: Product) => void) | undefined;
    const productPromise = new Promise<Product>((resolve) => {
      productResolver = resolve;
    });

    vi.mocked(productService.getProduct).mockReturnValue(productPromise);

    renderWithQueryClient(<ProductDetail />);

    // Try to click Add to Cart before data loads
    const addToCartButton = screen.getByText('Add to Cart');
    await user.click(addToCartButton);

    // Should not have been called yet
    expect(mockAddToCart).not.toHaveBeenCalled();

    // Now resolve the product
    if (productResolver) {
      productResolver(mockProduct);
    }

    // Wait for product to load
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Now clicking should work
    await user.click(addToCartButton);
    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('📋 should render all meta information correctly', async () => {
    vi.mocked(productService.getProduct).mockResolvedValue(mockProduct);

    renderWithQueryClient(<ProductDetail />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Check all meta labels
    expect(screen.getByText('Brand')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Stock')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();

    // Check all meta values
    expect(screen.getByText('TestBrand')).toBeInTheDocument();
    expect(screen.getByText('electronics')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('⭐ 4.5')).toBeInTheDocument();
  });
});
