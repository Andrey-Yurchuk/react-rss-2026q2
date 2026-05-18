import {
  render,
  screen,
  within,
  waitFor,
  waitForElementToBeRemoved,
  fireEvent,
} from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

export function renderUi(ui: ReactElement) {
  return render(ui);
}

export function renderWithRouter(
  ui: ReactElement,
  { route = '/?page=1' }: { route?: string } = {}
) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
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
