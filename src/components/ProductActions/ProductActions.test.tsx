import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductActions } from './index';
import { mockProduct } from '../../test/mockData';
import * as useProductHook from '../../hooks/useProduct';
import * as useCartContextHook from '../../contexts/useCartContext';

// Mock the Button component
vi.mock('../ui/Button', () => ({
  Button: ({ children, onClick, fullWidth }: any) => (
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

describe('ProductActions', () => {
  const mockAddToCart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useCartContextHook, 'useCartContext').mockReturnValue({
      addToCart: mockAddToCart,
      items: [],
      removeFromCart: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
      totalItems: 0,
      totalPrice: 0,
    });
  });

  it('should render "Add to Cart" button', () => {
    vi.spyOn(useProductHook, 'useProduct').mockReturnValue({
      data: mockProduct,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithQueryClient(<ProductActions />);

    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
  });

  it('should call addToCart when button is clicked with product data', async () => {
    const user = userEvent.setup();
    
    vi.spyOn(useProductHook, 'useProduct').mockReturnValue({
      data: mockProduct,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithQueryClient(<ProductActions />);

    const button = screen.getByText('Add to Cart');
    await user.click(button);

    expect(mockAddToCart).toHaveBeenCalledTimes(1);
    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('should not call addToCart when product data is undefined', async () => {
    const user = userEvent.setup();
    
    vi.spyOn(useProductHook, 'useProduct').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    renderWithQueryClient(<ProductActions />);

    const button = screen.getByText('Add to Cart');
    await user.click(button);

    expect(mockAddToCart).not.toHaveBeenCalled();
  });

  it('should render button with fullWidth prop', () => {
    vi.spyOn(useProductHook, 'useProduct').mockReturnValue({
      data: mockProduct,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithQueryClient(<ProductActions />);

    const button = screen.getByText('Add to Cart');
    expect(button).toHaveAttribute('data-fullwidth', 'true');
  });

  it('should handle loading state without errors', () => {
    vi.spyOn(useProductHook, 'useProduct').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    const { container } = renderWithQueryClient(<ProductActions />);
    
    expect(container.querySelector('div[class*="actions"]')).toBeInTheDocument();
    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
  });
});
