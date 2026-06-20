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
import { MemoryRouter } from 'react-router-dom';
import { createTestQueryClient } from './queryClient.ts';
import { IntlTestProvider } from './intl.tsx';

export type RenderWithRouterOptions = {
  route?: string;
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

export function renderWithRouter(
  ui: ReactElement,
  {
    route = '/?page=1',
    queryClient = createTestQueryClient(),
  }: RenderWithRouterOptions = {}
) {
  return render(
    <IntlTestProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </QueryClientProvider>
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
