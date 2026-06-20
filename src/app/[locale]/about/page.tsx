import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';
import { AboutPage } from '../../../pages/AboutPage/index.ts';

type AboutRoutePageProps = {
  params: Promise<{ locale: string }>;
};

export default function AboutRoutePage({ params }: AboutRoutePageProps) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <AboutPage />;
}
