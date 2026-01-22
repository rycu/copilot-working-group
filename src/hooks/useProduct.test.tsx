import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProduct } from './useProduct';
import { productService } from '../services';
import { mockProduct } from '../test/mockData';
import type { ReactNode } from 'react';

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  useParams: vi.fn(),
}));

// Mock product service
vi.mock('../services', () => ({
  productService: {
    getProduct: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('✅ should fetch product data successfully', async () => {
    const { useParams } = await import('@tanstack/react-router');
    vi.mocked(useParams).mockReturnValue({ productId: '1' });
    vi.mocked(productService.getProduct).mockResolvedValue(mockProduct);

    const { result } = renderHook(() => useProduct(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockProduct);
    expect(productService.getProduct).toHaveBeenCalledWith(1);
  });

  it('⏳ should handle loading state', async () => {
    const { useParams } = await import('@tanstack/react-router');
    vi.mocked(useParams).mockReturnValue({ productId: '1' });
    vi.mocked(productService.getProduct).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useProduct(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('❌ should handle error state', async () => {
    const { useParams } = await import('@tanstack/react-router');
    vi.mocked(useParams).mockReturnValue({ productId: '1' });
    const error = new Error('Failed to fetch product');
    vi.mocked(productService.getProduct).mockRejectedValue(error);

    const { result } = renderHook(() => useProduct(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeUndefined();
  });

  it('🚫 should not fetch when product ID is invalid', async () => {
    const { useParams } = await import('@tanstack/react-router');
    vi.mocked(useParams).mockReturnValue({ productId: undefined });

    const { result } = renderHook(() => useProduct(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(productService.getProduct).not.toHaveBeenCalled();
  });

  it('🔢 should convert productId string to number', async () => {
    const { useParams } = await import('@tanstack/react-router');
    vi.mocked(useParams).mockReturnValue({ productId: '123' });
    vi.mocked(productService.getProduct).mockResolvedValue(mockProduct);

    renderHook(() => useProduct(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(productService.getProduct).toHaveBeenCalledWith(123));
  });

  it('🔑 should use correct query key', async () => {
    const { useParams } = await import('@tanstack/react-router');
    vi.mocked(useParams).mockReturnValue({ productId: '1' });
    vi.mocked(productService.getProduct).mockResolvedValue(mockProduct);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useProduct(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Check that the query is cached with the correct key
    const cachedData = queryClient.getQueryData(['product', 1]);
    expect(cachedData).toEqual(mockProduct);
  });
});
