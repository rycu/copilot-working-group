# Testing Documentation

This project uses **Vitest** and **React Testing Library** for unit and integration testing.

## Test Structure

### Test Files Created

1. **Component Tests**
   - `src/components/ProductDetail/ProductDetail.test.tsx` - Unit tests for ProductDetail layout
   - `src/components/ProductDetail/ProductDetail.integration.test.tsx` - Integration tests with real hooks
   - `src/components/ProductInfo/ProductInfo.test.tsx` - Unit tests for ProductInfo component
   - `src/components/ProductMeta/ProductMeta.test.tsx` - Unit tests for ProductMeta component
   - `src/components/ProductImage/ProductImage.test.tsx` - Unit tests for ProductImage component
   - `src/components/ProductActions/ProductActions.test.tsx` - Unit tests for ProductActions component

2. **Hook Tests**
   - `src/hooks/useProduct.test.tsx` - Tests for the useProduct React Query hook

3. **Test Utilities**
   - `src/test/setup.ts` - Global test setup with jest-dom matchers
   - `src/test/mockData.ts` - Reusable mock data for tests

## Running Tests

```bash
# Run tests once
npm test -- --run

# Run tests in watch mode (during development)
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Coverage Summary

Total: **36 tests passing**

- **ProductDetail Component**: 13 tests
  - 4 unit tests (layout and structure)
  - 9 integration tests (full component behavior)
  
- **Child Components**: 17 tests
  - ProductInfo: 4 tests
  - ProductMeta: 4 tests
  - ProductImage: 4 tests
  - ProductActions: 5 tests
  
- **Hooks**: 6 tests
  - useProduct: 6 tests

## Test Scenarios Covered

### ProductDetail Component
- ✅ Renders all child components correctly
- ✅ Handles layout structure (container, product, infoSection)
- ✅ Loading state management
- ✅ Success state with product data
- ✅ Error state handling
- ✅ Edge cases (missing brand, empty images array)
- ✅ User interactions (Add to Cart button)
- ✅ Integration with useProduct hook
- ✅ Integration with useCartContext

### useProduct Hook
- ✅ Fetches product data successfully
- ✅ Handles loading state
- ✅ Handles error state
- ✅ Validates product ID (enabled/disabled query)
- ✅ Converts productId from string to number
- ✅ Uses correct React Query cache key

### Child Components
- ✅ Render with product data
- ✅ Handle loading state
- ✅ Handle missing data gracefully
- ✅ Format data correctly (price, rating)
- ✅ Conditional rendering (brand fallback to "N/A")
- ✅ Image fallback to thumbnail
- ✅ Cart interactions

## Mocking Strategy

### Mocked Dependencies
- **TanStack Router**: `useParams` is mocked to provide product IDs
- **Product Service**: API calls are mocked to return test data
- **Cart Context**: `useCartContext` is mocked to verify interactions
- **Child Components**: Mocked in unit tests, real in integration tests

### Mock Data
All tests use consistent mock data from `src/test/mockData.ts`:
- `mockProduct` - Complete product with all fields
- `mockProductWithoutBrand` - Product without optional brand field

## Key Testing Principles Used

1. **Separation of Concerns**: Unit tests focus on individual component behavior, integration tests verify component interactions
2. **Mock Strategy**: Strategic mocking to isolate components while integration tests verify real behavior
3. **User-Centric**: Tests interact with components as users would (clicking buttons, viewing text)
4. **Edge Cases**: Tests cover missing data, loading states, and error conditions
5. **Type Safety**: All tests are written in TypeScript with proper typing

## Configuration

- **Test Environment**: jsdom (simulates browser DOM)
- **Setup File**: `src/test/setup.ts` (configures jest-dom matchers)
- **Config File**: `vitest.config.ts`
- **Global Test Utilities**: Available via vitest globals

## Future Enhancements

Consider adding:
- Visual regression testing
- End-to-end tests with Playwright
- Performance testing
- Accessibility testing (axe-core)
- Test coverage thresholds
