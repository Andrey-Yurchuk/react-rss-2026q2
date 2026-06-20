import { useTranslations } from 'next-intl';
import type { PokemonCardModel } from '../../services/pokemonApi';
import { Card } from '../Card/index.ts';

type CardListProps = {
  items: PokemonCardModel[];
  selectedId?: number;
  selectedIds?: ReadonlySet<number>;
  onCardSelect?: (id: number) => void;
  onSelectionToggle?: (item: PokemonCardModel) => void;
};

export function CardList({
  items,
  selectedId,
  selectedIds,
  onCardSelect,
  onSelectionToggle,
}: CardListProps) {
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
          selected={item.id === selectedId}
          selectionChecked={selectedIds?.has(item.id) ?? false}
          onSelect={onCardSelect}
          onSelectionToggle={onSelectionToggle}
        />
      ))}
    </div>
  );
}
