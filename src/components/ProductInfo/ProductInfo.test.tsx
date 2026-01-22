import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductInfo } from './index';
import { mockProduct } from '../../test/mockData';
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

describe('ProductInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render product title, price, and description when data is available', () => {
    vi.spyOn(useProductHook, 'useProduct').mockReturnValue({
      data: mockProduct,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithQueryClient(<ProductInfo />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('This is a test product description')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    vi.spyOn(useProductHook, 'useProduct').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    renderWithQueryClient(<ProductInfo />);

    // Component should render without crashing when data is undefined
    expect(screen.queryByText('Test Product')).not.toBeInTheDocument();
  });

  it('should handle missing product data gracefully', () => {
    vi.spyOn(useProductHook, 'useProduct').mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    const { container } = renderWithQueryClient(<ProductInfo />);
    
    // Component should render without errors
    expect(container.querySelector('div[class*="info"]')).toBeInTheDocument();
  });

  it('should format price to 2 decimal places', () => {
    const productWithOddPrice = {
      ...mockProduct,
      price: 99.9,
    };

    vi.spyOn(useProductHook, 'useProduct').mockReturnValue({
      data: productWithOddPrice,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithQueryClient(<ProductInfo />);

    expect(screen.getByText('$99.90')).toBeInTheDocument();
  });
});
