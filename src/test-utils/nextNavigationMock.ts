import { applyNavigationHref, getNavigationSnapshot } from '../hooks/navigationStore.ts';
import { vi } from 'vitest';

export const useRouter = vi.fn(() => ({
  push: (href: string) => applyNavigationHref(href),
  replace: (href: string) => applyNavigationHref(href),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
}));

export const usePathname = vi.fn(() => getNavigationSnapshot().pathname);

export const useSearchParams = vi.fn(() => getNavigationSnapshot().searchParams);

export const redirect = vi.fn();

export const notFound = vi.fn();
