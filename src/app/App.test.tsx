import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '../components/AppProviders/index.ts';
import { AppShell } from '../components/AppShell/index.ts';
import { AppRoutes } from '../routes/AppRoutes';
import { createConsoleErrorSpy } from '../test-utils/mocks';
import { render, renderWithRouter, screen, within } from '../test-utils/render';
import App from './App';

vi.mock('../services/pokemonApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/pokemonApi')>();
  return {
    ...actual,
    loadPokemonResults: vi.fn().mockResolvedValue({ items: [], totalCount: 0 }),
  };
});

function renderApp() {
  return render(
    <AppProviders>
      <AppShell>
        <App />
      </AppShell>
    </AppProviders>
  );
}

describe('App', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders the theme toggle at the top of the app shell', () => {
    renderApp();

    const group = screen.getByRole('group', { name: /theme/i });
    expect(group).toBeInTheDocument();
    expect(within(group).getByRole('button', { name: /light/i })).toBeInTheDocument();
    expect(within(group).getByRole('button', { name: /dark/i })).toBeInTheDocument();
  });

  it('switches the document theme when the user toggles dark mode', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: /dark/i }));

    expect(screen.getByRole('button', { name: /dark/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it('keeps the theme toggle visible after navigating to /about', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('link', { name: /about/i }));

    expect(screen.getByRole('group', { name: /theme/i })).toBeInTheDocument();
  });

  it('persists the selected theme across SPA navigation to /about', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: /dark/i }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');

    await user.click(screen.getByRole('link', { name: /about/i }));

    expect(
      screen.getByRole('heading', { name: /pokedex browser/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dark/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it('exposes the theme toggle on the 404 page for unknown routes', () => {
    window.history.replaceState({}, '', '/totally-unknown-route');

    renderApp();

    expect(
      screen.getByRole('heading', { name: /page not found/i })
    ).toBeInTheDocument();
    const group = screen.getByRole('group', { name: /theme/i });
    expect(group).toBeInTheDocument();
    expect(within(group).getByRole('button', { name: /light/i })).toBeInTheDocument();
    expect(within(group).getByRole('button', { name: /dark/i })).toBeInTheDocument();
  });

  it('shows Error Boundary fallback after trigger button click', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = createConsoleErrorSpy();

    renderApp();
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

    renderApp();
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
