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
  if (items.length === 0) {
    return <p className="card-list__empty">No results to show.</p>;
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
