import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { createElement, type MouseEvent, type ReactNode } from 'react';
import { applyNavigationHref, getNavigationSnapshot } from './hooks/navigationStore.ts';
import { triggerRefreshHandler } from './hooks/refreshHandlerStore.ts';
import { useSelectedItemsStore } from './store/selectedItemsStore';
import { resetThemeStoreForTests } from './context/ThemeContext.tsx';

vi.mock('./i18n/navigation.ts', () => ({
  Link: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: ReactNode;
    className?: string;
  }) =>
    createElement(
      'a',
      {
        href,
        className,
        onClick: (event: MouseEvent<HTMLAnchorElement>) => {
          event.preventDefault();
          applyNavigationHref(href);
        },
      },
      children
    ),
  useRouter: () => ({
    replace: (href: string, options?: { locale?: string }) => {
      if (options?.locale) {
        const normalizedPath = href.startsWith('/') ? href : `/${href}`;
        const localePath =
          normalizedPath === '/'
            ? `/${options.locale}`
            : `/${options.locale}${normalizedPath}`;
        const query = getNavigationSnapshot().searchParams.toString();
        applyNavigationHref(query ? `${localePath}?${query}` : localePath);
        return;
      }

      applyNavigationHref(href);
    },
    push: (href: string) => applyNavigationHref(href),
    refresh: () => triggerRefreshHandler(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => {
    const { pathname } = getNavigationSnapshot();

    if (pathname === '/ru' || pathname.startsWith('/ru/')) {
      return pathname.slice(3) || '/';
    }

    if (pathname === '/en' || pathname.startsWith('/en/')) {
      return pathname.slice(3) || '/';
    }

    return pathname;
  },
  redirect: vi.fn(),
  getPathname: () => getNavigationSnapshot().pathname,
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.documentElement.removeAttribute('data-theme');
});

beforeEach(() => {
  localStorage.clear();
  useSelectedItemsStore.setState({ selectedItems: [] });
  resetThemeStoreForTests();
});
