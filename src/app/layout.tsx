import type { Metadata } from 'next';
import { AppProviders } from '../components/AppProviders/index.ts';
import './App.css';
import '../styles/index.css';

export const metadata: Metadata = {
  title: 'Pokedex browser',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
