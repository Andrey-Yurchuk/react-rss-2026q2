import type { PokemonCardModel } from '../services/pokemonApi';
import { Card } from './Card';

type CardListProps = {
  items: PokemonCardModel[];
};

export function CardList({ items }: CardListProps) {
  if (items.length === 0) {
    return <p className="card-list__empty">No results to show.</p>;
  }
  return (
    <div className="card-list">
      {items.map((item) => (
        <Card key={item.name} item={item} />
      ))}
    </div>
  );
}
