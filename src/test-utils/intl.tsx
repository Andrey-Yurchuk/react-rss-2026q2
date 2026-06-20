import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement, ReactNode } from 'react';
import enMessages from '../../messages/en.json';
import ruMessages from '../../messages/ru.json';
import { routing } from '../i18n/routing.ts';

const messagesByLocale = {
  en: enMessages,
  ru: ruMessages,
} as const;

type IntlTestProviderProps = {
  children: ReactNode;
  locale?: (typeof routing.locales)[number];
};

export function IntlTestProvider({
  children,
  locale = 'en',
}: IntlTestProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messagesByLocale[locale]}>
      {children}
    </NextIntlClientProvider>
  );
}

export function renderWithIntl(ui: ReactElement, locale: IntlTestProviderProps['locale'] = 'en') {
  return (
    <IntlTestProvider locale={locale}>{ui}</IntlTestProvider>
  );
}
