import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { useSelectedItemsStore } from './store/selectedItemsStore';

vi.mock('./i18n/navigation.ts', () => ({
  Link: vi.fn(),
  useRouter: vi.fn(() => ({
    replace: vi.fn(),
    push: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  redirect: vi.fn(),
  getPathname: vi.fn(() => '/'),
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
