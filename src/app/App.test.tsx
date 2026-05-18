import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../routes/AppRoutes';
import { createConsoleErrorSpy } from '../test-utils/mocks';
import { render, renderWithRouter, screen } from '../test-utils/render';
import App from './App';

vi.mock('../services/pokemonApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/pokemonApi')>();
  return {
    ...actual,
    loadPokemonResults: vi.fn().mockResolvedValue({ items: [], totalCount: 0 }),
  };
});

describe('App', () => {
  it('shows Error Boundary fallback after trigger button click', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = createConsoleErrorSpy();

    render(<App />);
    await user.click(
      screen.getByRole('button', { name: /trigger error \(error boundary\)/i })
    );

    expect(
      screen.getByRole('heading', { name: /something went wrong/i })
    ).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('navigates to About page from the main app', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(screen.getByRole('link', { name: /about/i }));

    expect(
      screen.getByRole('heading', { name: /pokedex browser/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /andrey yurchuk/i })).toHaveAttribute(
      'href',
      'https://github.com/Andrey-Yurchuk'
    );
    expect(
      screen.getByRole('link', { name: /rs school reactjs course/i })
    ).toHaveAttribute('href', 'https://rs.school/courses/reactjs');
  });

  it('shows 404 page for unknown local routes', () => {
    renderWithRouter(<AppRoutes />, { route: '/unknown-route' });

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
