import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { createElement, type MouseEvent, type ReactNode } from 'react';
import { applyNavigationHref, getNavigationSnapshot } from './hooks/navigationStore.ts';
import { triggerRefreshHandler } from './hooks/refreshHandlerStore.ts';
import { useSelectedItemsStore } from './store/selectedItemsStore';

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
    replace: (href: string) => applyNavigationHref(href),
    push: (href: string) => applyNavigationHref(href),
    refresh: () => triggerRefreshHandler(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => getNavigationSnapshot().pathname,
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
});
