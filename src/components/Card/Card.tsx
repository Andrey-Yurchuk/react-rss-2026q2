import type { PokemonCardModel } from '../../services/pokemonApi';

type CardProps = {
  item: PokemonCardModel;
};

export function Card({ item }: CardProps) {
  return (
    <article className="card">
      <h3 className="card__name">{item.name}</h3>
      <p className="card__description">{item.description}</p>
    </article>
  );
}
