import { describe, expect, it } from 'vitest';
import { renderWithRouter, screen } from '../../test-utils/render';
import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage', () => {
  it('shows a not-found message and a link back to the main app', () => {
    renderWithRouter(<NotFoundPage />);

    expect(
      screen.getByRole('heading', { name: /page not found/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/the page you are looking for does not exist/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /back to pokemon search/i })
    ).toHaveAttribute('href', '/?page=1');
  });
});
