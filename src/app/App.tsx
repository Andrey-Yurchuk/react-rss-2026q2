'use client';

import { useLocale } from 'next-intl';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '../routes/AppRoutes';

function buildRouterBasename(locale: string): string {
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');

  if (basePath) {
    return `${basePath}/${locale}`;
  }

  return `/${locale}`;
}

export default function App() {
  const locale = useLocale();
  const basename = buildRouterBasename(locale);

  return (
    <BrowserRouter basename={basename}>
      <AppRoutes />
    </BrowserRouter>
  );
}
