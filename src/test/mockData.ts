import type { Product } from '../types/product';

export const mockProduct: Product = {
  id: 1,
  title: 'Test Product',
  description: 'This is a test product description',
  category: 'electronics',
  price: 99.99,
  rating: 4.5,
  stock: 10,
  brand: 'TestBrand',
  availabilityStatus: 'In Stock',
  returnPolicy: '30 days return policy',
  thumbnail: 'https://example.com/thumb.jpg',
  images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
};

export const mockProductWithoutBrand: Product = {
  ...mockProduct,
  brand: undefined,
};
