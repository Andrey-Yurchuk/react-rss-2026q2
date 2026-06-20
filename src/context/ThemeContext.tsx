import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { POKEMON_THEME_STORAGE_KEY } from '../constants';
import {
  ThemeContext,
  type Theme,
  type ThemeContextValue,
} from './themeContextValue.ts';

const PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)';

let themeState: Theme = 'light';
const themeListeners = new Set<() => void>();

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

function readStoredTheme(): Theme | null {
  if (
    typeof window === 'undefined' ||
    typeof window.localStorage === 'undefined'
  ) {
    return null;
  }
  try {
    const stored = window.localStorage.getItem(POKEMON_THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

function writeStoredTheme(theme: Theme): void {
  if (
    typeof window === 'undefined' ||
    typeof window.localStorage === 'undefined'
  ) {
    return;
  }
  try {
    window.localStorage.setItem(POKEMON_THEME_STORAGE_KEY, theme);
  } catch {
    //
  }
}

function detectInitialTheme(): Theme {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return 'light';
  }
  return window.matchMedia(PREFERS_DARK_QUERY).matches ? 'dark' : 'light';
}

function resolveThemeFromBrowser(): Theme {
  return readStoredTheme() ?? detectInitialTheme();
}

function subscribeToTheme(listener: () => void) {
  themeListeners.add(listener);
  return () => {
    themeListeners.delete(listener);
  };
}

function getThemeSnapshot(): Theme {
  return themeState;
}

function publishTheme(next: Theme) {
  if (themeState === next) {
    return;
  }
  themeState = next;
  themeListeners.forEach((listener) => listener());
}

export function resetThemeStoreForTests(theme: Theme = 'light') {
  themeState = theme;
  themeListeners.forEach((listener) => listener());
}

type ThemeProviderProps = {
  children: ReactNode;
  initialTheme?: Theme;
};

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const serverFallback = initialTheme ?? 'light';

  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => serverFallback
  );

  useLayoutEffect(() => {
    publishTheme(
      initialTheme === undefined ? resolveThemeFromBrowser() : initialTheme
    );
  }, [initialTheme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    writeStoredTheme(theme);
    return () => {
      document.documentElement.removeAttribute('data-theme');
    };
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    publishTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    publishTheme(getThemeSnapshot() === 'light' ? 'dark' : 'light');
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
