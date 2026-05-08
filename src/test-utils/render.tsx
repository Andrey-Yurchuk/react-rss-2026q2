import {
  render,
  screen,
  within,
  waitFor,
  waitForElementToBeRemoved,
  fireEvent,
} from '@testing-library/react';
import type { ReactElement } from 'react';

export function renderUi(ui: ReactElement) {
  return render(ui);
}

export {
  screen,
  within,
  waitFor,
  waitForElementToBeRemoved,
  fireEvent,
};
export { renderUi as render };
