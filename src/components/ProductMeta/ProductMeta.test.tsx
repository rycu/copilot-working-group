import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductMeta } from './index';
import { mockProduct, mockProductWithoutBrand } from '../../test/mockData';
import * as useProductHook from '../../hooks/useProduct';

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

describe('ProductMeta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render brand, category, stock, and rating when data is available', () => {
    vi.spyOn(useProductHook, 'useProduct').mockReturnValue({
      data: mockProduct,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithQueryClient(<ProductMeta />);

    expect(screen.getByText('Brand')).toBeInTheDocument();
    expect(screen.getByText('TestBrand')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('electronics')).toBeInTheDocument();
    expect(screen.getByText('Stock')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
    expect(screen.getByText('⭐ 4.5')).toBeInTheDocument();
  });

  it('should display "N/A" when brand is not available', () => {
    vi.spyOn(useProductHook, 'useProduct').mockReturnValue({
      data: mockProductWithoutBrand,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithQueryClient(<ProductMeta />);

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    vi.spyOn(useProductHook, 'useProduct').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    renderWithQueryClient(<ProductMeta />);

    // Component should render without crashing when data is undefined
    expect(screen.queryByText('TestBrand')).not.toBeInTheDocument();
  });

  it('should format rating to 1 decimal place', () => {
    const productWithPreciseRating = {
      ...mockProduct,
      rating: 4.567,
    };

    vi.spyOn(useProductHook, 'useProduct').mockReturnValue({
      data: productWithPreciseRating,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithQueryClient(<ProductMeta />);

    expect(screen.getByText('⭐ 4.6')).toBeInTheDocument();
  });
});
