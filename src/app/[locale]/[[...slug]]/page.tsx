import { routing } from '../../../i18n/routing.ts';
import { ClientOnly } from './client';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({
    locale,
    slug: [''],
  }));
}

export default function Page() {
  return <ClientOnly />;
}
