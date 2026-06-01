import { QueryClient } from '@tanstack/react-query';
import { QUERY_CACHE_TTL_MS } from '../config/query.ts';

const TEST_QUERY_CACHE_TTL_MS = Math.max(QUERY_CACHE_TTL_MS, 60 * 60 * 1000);

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: TEST_QUERY_CACHE_TTL_MS,
        gcTime: TEST_QUERY_CACHE_TTL_MS,
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
