import { getTranslations } from 'next-intl/server';
import type { PokemonCardModel } from '../../services/pokemonApi';
import { Card } from '../Card/index.ts';

type CardListProps = {
  items: PokemonCardModel[];
  page: number;
  query: string;
  detailsId: number | null;
};

export async function CardList({ items, page, query, detailsId }: CardListProps) {
  const t = await getTranslations('CardList');

  if (items.length === 0) {
    return <p className="card-list__empty">{t('empty')}</p>;
  }

  return (
    <div className="card-list">
      {items.map((item) => (
        <Card
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
