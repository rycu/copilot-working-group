import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { ProductImage } from './index';
import { mockProduct } from '../../test/mockData';
import type { Product } from '../../types/product';
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

describe('ProductImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render product image with first image from images array', () => {
    vi.spyOn(useProductHook, 'useProduct').mockReturnValue({
      data: mockProduct,
      isLoading: false,
      isError: false,
      error: null,
    } as UseQueryResult<Product, Error>);

    renderWithQueryClient(<ProductImage />);

    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image1.jpg');
    expect(image).toHaveAttribute('alt', 'Test Product');
  });

  it('should fallback to thumbnail when images array is empty', () => {
    const productWithNoImages = {
      ...mockProduct,
      images: [],
    };

    vi.spyOn(useProductHook, 'useProduct').mockReturnValue({
      data: productWithNoImages,
      isLoading: false,
      isError: false,
      error: null,
    } as Partial<UseQueryResult<Product, Error>> as UseQueryResult<Product, Error>);

    renderWithQueryClient(<ProductImage />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'https://example.com/thumb.jpg');
  });

  it('should handle loading state', () => {
    vi.spyOn(useProductHook, 'useProduct').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as UseQueryResult<Product, Error>);

    const { container } = renderWithQueryClient(<ProductImage />);
    
    // Component should render without errors
    expect(container.querySelector('div[class*="imageSection"]')).toBeInTheDocument();
  });

  it('should handle missing product data gracefully', () => {
    vi.spyOn(useProductHook, 'useProduct').mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    } as UseQueryResult<Product, Error>);

    const { container } = renderWithQueryClient(<ProductImage />);
    
    // Component should render without errors
    expect(container.querySelector('div[class*="imageSection"]')).toBeInTheDocument();
  });
});
