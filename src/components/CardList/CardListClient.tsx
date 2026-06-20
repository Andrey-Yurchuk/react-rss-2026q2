'use client';

import { useTranslations } from 'next-intl';
import type { PokemonCardModel } from '../../services/pokemonApi';
import { PokemonCardClient } from '../Card/PokemonCardClient.tsx';

type CardListClientProps = {
  items: PokemonCardModel[];
  page: number;
  query: string;
  detailsId: number | null;
};

export function CardListClient({
  items,
  page,
  query,
  detailsId,
}: CardListClientProps) {
  const t = useTranslations('CardList');

  if (items.length === 0) {
    return <p className="card-list__empty">{t('empty')}</p>;
  }

  return (
    <div className="card-list">
      {items.map((item) => (
        <PokemonCardClient
          key={item.id}
          item={item}
          page={page}
          query={query}
          detailsId={detailsId}
        />
      ))}
    </div>
  );
}
