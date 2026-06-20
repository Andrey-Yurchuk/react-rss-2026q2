'use client';

import { useSearchParams as useNextSearchParams } from 'next/navigation';
import { useCallback, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from '../i18n/navigation.ts';
import {
  applyNavigationHref,
  getNavigationSnapshot,
  subscribeNavigation,
} from './navigationStore.ts';

const isTestEnv = process.env.VITEST === 'true';

const EMPTY_SEARCH_PARAMS = new URLSearchParams();

type SetSearchParamsArg =
  | URLSearchParams
  | ((current: URLSearchParams) => URLSearchParams);

type SetSearchParamsOptions = {
  replace?: boolean;
};

export function useAppSearchParams() {
  const router = useRouter();
  const pathnameFromIntl = usePathname();
  const nextSearchParams = useNextSearchParams();
  const testSnapshot = useSyncExternalStore(
    subscribeNavigation,
    getNavigationSnapshot,
    getNavigationSnapshot
  );

  const pathname = isTestEnv ? testSnapshot.pathname : pathnameFromIntl;
  const rawSearchParams = isTestEnv ? testSnapshot.searchParams : nextSearchParams;
  const searchParams = rawSearchParams ?? EMPTY_SEARCH_PARAMS;

  const setSearchParams = useCallback(
    (updater: SetSearchParamsArg, options?: SetSearchParamsOptions) => {
      const next =
        typeof updater === 'function'
          ? updater(new URLSearchParams(searchParams.toString()))
          : updater;
      const query = next.toString();
      const href = query ? `${pathname}?${query}` : pathname;

      if (isTestEnv) {
        applyNavigationHref(href);
        return;
      }

      if (options?.replace ?? true) {
        router.replace(href);
        return;
      }

      router.push(href);
    },
    [pathname, router, searchParams]
  );

  const navigateToSearch = useCallback(
    (queryString: string, options?: SetSearchParamsOptions) => {
      const href = queryString ? `${pathname}?${queryString}` : pathname;

      if (isTestEnv) {
        applyNavigationHref(href);
        return;
      }

      if (options?.replace ?? true) {
        router.replace(href);
        return;
      }

      router.push(href);
    },
    [pathname, router]
  );

  return {
    pathname,
    searchParams,
    setSearchParams,
    navigateToSearch,
    router,
  };
}
