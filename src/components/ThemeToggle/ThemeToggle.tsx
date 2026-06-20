'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from '../../context/themeContextValue.ts';
import type { Theme } from '../../context/themeContextValue.ts';

const OPTIONS: ReadonlyArray<{ value: Theme; labelKey: 'light' | 'dark' }> = [
  { value: 'light', labelKey: 'light' },
  { value: 'dark', labelKey: 'dark' },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations('Theme');

  return (
    <div className="theme-toggle" role="group" aria-label={t('label')}>
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
            {t(option.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
