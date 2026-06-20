import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { AppProviders } from '../components/AppProviders/index.ts';
import './App.css';
import '../styles/index.css';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const messages = (await import(`../../messages/${locale}.json`)).default as {
    Metadata: { title: string };
  };

  return {
    title: messages.Metadata.title,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
