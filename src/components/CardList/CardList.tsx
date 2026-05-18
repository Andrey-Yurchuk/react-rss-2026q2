import type { PokemonCardModel } from '../../services/pokemonApi';
import { Card } from '../Card/index.ts';

type CardListProps = {
  items: PokemonCardModel[];
  selectedId?: number;
  onCardSelect?: (id: number) => void;
};

export function CardList({ items, selectedId, onCardSelect }: CardListProps) {
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
          onSelect={onCardSelect}
        />
      ))}
    </div>
  );
}
