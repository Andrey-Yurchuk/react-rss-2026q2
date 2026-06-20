import { useTranslations } from 'next-intl';
import type { PokemonCardModel } from '../../services/pokemonApi';
import { Card } from '../Card/index.ts';

type CardListProps = {
  items: PokemonCardModel[];
  page: number;
  query: string;
  detailsId: number | null;
};

export function CardList({ items, page, query, detailsId }: CardListProps) {
  const t = useTranslations('CardList');

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
