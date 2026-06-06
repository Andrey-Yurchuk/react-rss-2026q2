import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { useSelectedItemsStore } from './store/selectedItemsStore';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.documentElement.removeAttribute('data-theme');
});

beforeEach(() => {
  localStorage.clear();
  useSelectedItemsStore.setState({ selectedItems: [] });
});
