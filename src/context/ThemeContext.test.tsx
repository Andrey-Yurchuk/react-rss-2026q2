import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POKEMON_THEME_STORAGE_KEY } from '../constants';
import { render, screen } from '../test-utils/render';
import { createConsoleErrorSpy } from '../test-utils/mocks';
import { ThemeProvider } from './ThemeContext.tsx';
import { useTheme } from './themeContextValue.ts';
import type { Theme } from './themeContextValue.ts';

function TestConsumer() {
  const { theme, setTheme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button type="button" onClick={() => setTheme('dark')}>
        Set dark
      </button>
      <button type="button" onClick={() => setTheme('light')}>
        Set light
      </button>
      <button type="button" onClick={() => toggleTheme()}>
        Toggle
      </button>
    </div>
  );
}

function mockPrefersColorScheme(matches: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches,
      media: '(prefers-color-scheme: dark)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    })
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.removeAttribute('data-theme');
  });

  it('throws a helpful error when useTheme is used outside ThemeProvider', () => {
    const errorSpy = createConsoleErrorSpy();

    expect(() => render(<TestConsumer />)).toThrow(
      'useTheme must be used within a ThemeProvider'
    );

    errorSpy.mockRestore();
  });

  it('falls back to light when prefers-color-scheme is not dark', () => {
    mockPrefersColorScheme(false);

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });

  it('uses dark when prefers-color-scheme matches dark', () => {
    mockPrefersColorScheme(true);

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it('initialTheme prop overrides media-query detection', () => {
    mockPrefersColorScheme(true);

    render(
      <ThemeProvider initialTheme="light">
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });

  it('setTheme updates the theme and the data-theme attribute', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider initialTheme="light">
        <TestConsumer />
      </ThemeProvider>
    );

    expect(document.documentElement).toHaveAttribute('data-theme', 'light');

    await user.click(screen.getByRole('button', { name: 'Set dark' }));

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it('toggleTheme flips between light and dark', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider initialTheme="light">
        <TestConsumer />
      </ThemeProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');

    await user.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });

  it('removes data-theme attribute when ThemeProvider unmounts', () => {
    const { unmount } = render(
      <ThemeProvider initialTheme={'dark' satisfies Theme}>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');

    unmount();

    expect(document.documentElement).not.toHaveAttribute('data-theme');
  });

  it('restores the saved theme from localStorage on mount', () => {
    mockPrefersColorScheme(false);
    localStorage.setItem(POKEMON_THEME_STORAGE_KEY, 'dark');

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it('prefers the saved theme over prefers-color-scheme', () => {
    mockPrefersColorScheme(true);
    localStorage.setItem(POKEMON_THEME_STORAGE_KEY, 'light');

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });

  it('initialTheme prop overrides a saved theme value', () => {
    localStorage.setItem(POKEMON_THEME_STORAGE_KEY, 'dark');

    render(
      <ThemeProvider initialTheme="light">
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
  });

  it('persists the chosen theme to localStorage when the user changes it', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider initialTheme="light">
        <TestConsumer />
      </ThemeProvider>
    );

    expect(localStorage.getItem(POKEMON_THEME_STORAGE_KEY)).toBe('light');

    await user.click(screen.getByRole('button', { name: 'Set dark' }));

    expect(localStorage.getItem(POKEMON_THEME_STORAGE_KEY)).toBe('dark');
  });

  it('ignores invalid stored theme values and falls back to media detection', () => {
    mockPrefersColorScheme(false);
    localStorage.setItem(POKEMON_THEME_STORAGE_KEY, 'banana');

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });

  it('does not crash when localStorage.getItem throws on init', () => {
    mockPrefersColorScheme(false);
    const getItemSpy = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('storage disabled');
      });

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');

    getItemSpy.mockRestore();
  });

  it('does not crash when localStorage.setItem throws on theme change', async () => {
    const user = userEvent.setup();
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('quota exceeded');
      });

    render(
      <ThemeProvider initialTheme="light">
        <TestConsumer />
      </ThemeProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Set dark' }));

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');

    setItemSpy.mockRestore();
  });
});
