import type { Metadata } from 'next';
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
  return children;
}
