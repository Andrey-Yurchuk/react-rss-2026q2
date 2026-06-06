import { QueryClient } from '@tanstack/react-query';
import { QUERY_CACHE_TTL_MS } from '../config/query.ts';

export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_CACHE_TTL_MS,
        gcTime: QUERY_CACHE_TTL_MS,
      },
    },
  });
}
