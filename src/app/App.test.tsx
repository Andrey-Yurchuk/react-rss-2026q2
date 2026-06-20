import userEvent from '@testing-library/user-event';
import { useSyncExternalStore } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '../components/AppProviders/index.ts';
import { AppShell } from '../components/AppShell/index.ts';
import { PokemonHomeTestHarness } from '../test-utils/pokemonHomeHarness.tsx';
import { TestNavigationProbe } from '../components/TestNavigationProbe/index.ts';
import { getNavigationSnapshot, subscribeNavigation } from '../hooks/navigationStore.ts';
import { Link } from '../i18n/navigation.ts';
import { IntlTestProvider } from '../test-utils/intl.tsx';
import { createConsoleErrorSpy } from '../test-utils/mocks';
import { render, screen, within } from '../test-utils/render';
import { resetMockNavigation } from '../test-utils/navigationStore.ts';

vi.mock('../services/pokemonApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/pokemonApi')>();
  return {
    ...actual,
    loadPokemonResults: vi.fn().mockResolvedValue({ items: [], totalCount: 0 }),
  };
});

function TestHomeAboutSwitch() {
  const { pathname } = useSyncExternalStore(
    subscribeNavigation,
    getNavigationSnapshot,
    getNavigationSnapshot
  );

  return pathname === '/about' ? <MockAboutPage /> : <PokemonHomeTestHarness />;
}

function MockAboutPage() {
  return (
    <main className="static-page static-page--about">
      <h1>Pokedex browser</h1>
      <a href="https://github.com/Andrey-Yurchuk">Andrey Yurchuk</a>
      <a href="https://rs.school/courses/reactjs">RS School ReactJS course</a>
      <Link href="/?page=1">Back to Pokemon search</Link>
    </main>
  );
}

function MockNotFoundPage() {
  return (
    <main className="static-page static-page--not-found">
      <p className="static-page__eyebrow">404 error</p>
      <h1>Page not found</h1>
      <p className="static-page__lead">
        The page you are looking for does not exist or has been moved
      </p>
      <Link className="static-page__home-link" href="/?page=1">
        Back to Pokemon search
      </Link>
    </main>
  );
}

function renderShell(children: React.ReactNode) {
  return render(
    <IntlTestProvider>
      <AppProviders>
        <AppShell>{children}</AppShell>
      </AppProviders>
    </IntlTestProvider>
  );
}

function renderHome(href = '/?page=1') {
  resetMockNavigation(href);
  return renderShell(
    <>
      <TestHomeAboutSwitch />
      <TestNavigationProbe />
    </>
  );
}

describe('App shell', () => {
  beforeEach(() => {
    resetMockNavigation('/?page=1');
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders the theme toggle at the top of the app shell', () => {
    renderHome();

    const group = screen.getByRole('group', { name: /theme/i });
    expect(group).toBeInTheDocument();
    expect(within(group).getByRole('button', { name: /light/i })).toBeInTheDocument();
    expect(within(group).getByRole('button', { name: /dark/i })).toBeInTheDocument();
  });

  it('renders the language switcher in the app shell', () => {
    renderHome();

    const group = screen.getByRole('group', { name: /language/i });
    expect(within(group).getByRole('button', { name: 'EN' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(within(group).getByRole('button', { name: 'RU' })).toBeInTheDocument();
  });

  it('switches the document theme when the user toggles dark mode', async () => {
    const user = userEvent.setup();
    renderHome();

    await user.click(screen.getByRole('button', { name: /dark/i }));

    expect(screen.getByRole('button', { name: /dark/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it('keeps the theme toggle visible after navigating to /about', async () => {
    const user = userEvent.setup();
    renderHome();

    await user.click(screen.getByRole('link', { name: /about/i }));

    expect(screen.getByRole('group', { name: /theme/i })).toBeInTheDocument();
  });

  it('persists the selected theme across navigation to /about', async () => {
    const user = userEvent.setup();
    renderHome();

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

  it('exposes the theme toggle on the 404 page', () => {
    renderShell(<MockNotFoundPage />);

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

    renderHome();
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

    renderHome();
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

  it('shows 404 page content', () => {
    renderShell(<MockNotFoundPage />);

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
