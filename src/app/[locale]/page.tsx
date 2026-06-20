import { setRequestLocale } from 'next-intl/server';
import { Suspense, use } from 'react';
import { PokemonApp } from '../../components/PokemonApp/index.ts';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default function HomePage({ params }: HomePageProps) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <Suspense fallback={null}>
      <PokemonApp />
    </Suspense>
  );
}
