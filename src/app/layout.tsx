import type { Metadata } from 'next';
import { AppProviders } from '../components/AppProviders/index.ts';
import { AppShell } from '../components/AppShell/index.ts';
import './App.css';
import '../styles/index.css';

export const metadata: Metadata = {
  title: 'react-rss-2026q2',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
