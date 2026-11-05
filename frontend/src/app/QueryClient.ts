import { QueryClient } from '@tanstack/react-query';
import { GetProductsParams } from '../api/products.api';
import { GetOrdersParams } from '../api/orders.api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});

/**
 * Type-safe Query Keys Factory.
 * Centralizes cache keys and prevents duplicated fetching.
 */
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: GetProductsParams) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
};

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: GetOrdersParams) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: number) => [...orderKeys.details(), id] as const,
};

/**
 * Cache invalidation helpers
 */
export const invalidateOrdersAndProducts = async () => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: orderKeys.all }),
    queryClient.invalidateQueries({ queryKey: productKeys.all }),
  ]);
};

