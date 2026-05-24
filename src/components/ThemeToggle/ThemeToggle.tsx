import { useTheme } from '../../context/themeContextValue.ts';
import type { Theme } from '../../context/themeContextValue.ts';

const OPTIONS: ReadonlyArray<{ value: Theme; label: string }> = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-toggle" role="group" aria-label="Theme">
      {OPTIONS.map((option) => {
        const isActive = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            className="theme-toggle__button"
            aria-pressed={isActive}
            onClick={() => setTheme(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
