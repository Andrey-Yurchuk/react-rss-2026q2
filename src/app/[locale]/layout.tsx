import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppProviders } from '../../components/AppProviders/index.ts';
import { AppShell } from '../../components/AppShell/index.ts';
import { routing } from '../../i18n/routing.ts';

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

async function loadMessages(locale: string) {
  return (await import(`../../../messages/${locale}.json`)).default;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await loadMessages(locale);

  return (
    <html lang={locale}>
      <body>
        <AppProviders>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <AppShell>{children}</AppShell>
          </NextIntlClientProvider>
        </AppProviders>
      </body>
    </html>
  );
}
