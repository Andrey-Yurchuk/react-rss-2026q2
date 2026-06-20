'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '../../i18n/navigation.ts';
import { routing } from '../../i18n/routing.ts';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('Language');

  return (
    <div className="language-switcher" role="group" aria-label={t('label')}>
      {routing.locales.map((nextLocale) => {
        const isActive = locale === nextLocale;

        return (
          <button
            key={nextLocale}
            type="button"
            className="language-switcher__button"
            aria-pressed={isActive}
            onClick={() => {
              router.replace(pathname, { locale: nextLocale });
            }}
          >
            {t(nextLocale)}
          </button>
        );
      })}
    </div>
  );
}
