import type { Metadata } from 'next';

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
      <body>{children}</body>
    </html>
  );
}
