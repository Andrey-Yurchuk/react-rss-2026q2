import {
  render,
  screen,
  within,
  waitFor,
  waitForElementToBeRemoved,
  fireEvent,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { createTestQueryClient } from './queryClient.ts';
import { IntlTestProvider } from './intl.tsx';
import { resetMockNavigation } from './navigationStore.ts';

export type RenderWithNavigationOptions = {
  href?: string;
  queryClient?: QueryClient;
};

export type RenderUiOptions = {
  queryClient?: QueryClient;
};

export { createTestQueryClient };

export function renderUi(
  ui: ReactElement,
  { queryClient = createTestQueryClient() }: RenderUiOptions = {}
) {
  return render(
    <IntlTestProvider>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </IntlTestProvider>
  );
}

export function renderWithNavigation(
  ui: ReactElement,
  {
    href = '/?page=1',
    queryClient = createTestQueryClient(),
  }: RenderWithNavigationOptions = {}
) {
  resetMockNavigation(href);

  return render(
    <IntlTestProvider>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </IntlTestProvider>
  );
}

export {
  screen,
  within,
  waitFor,
  waitForElementToBeRemoved,
  fireEvent,
};
export { renderUi as render };
