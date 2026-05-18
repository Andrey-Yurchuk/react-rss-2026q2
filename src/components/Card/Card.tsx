import type { KeyboardEvent, MouseEvent } from 'react';
import type { PokemonCardModel } from '../../services/pokemonApi';

type CardProps = {
  item: PokemonCardModel;
  selected?: boolean;
  onSelect?: (id: number) => void;
};

export function Card({ item, selected = false, onSelect }: CardProps) {
  const selectItem = () => {
    onSelect?.(item.id);
  };

  const handleArticleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    selectItem();
  };

  const handleArticleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    selectItem();
  };
  return (
    <article
      className={selected ? 'card card--selected' : 'card'}
      aria-current={selected ? 'true' : undefined}
      onClick={onSelect ? handleArticleClick : undefined}
      onKeyDown={onSelect ? handleArticleKeyDown : undefined}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={onSelect ? `View details for ${item.name}` : undefined}
    >
      <h3 className="card__name">{item.name}</h3>
      <p className="card__description">{item.description}</p>
      {onSelect ? (
        <span className="card__button" aria-hidden="true">
          View details
        </span>
      ) : null}
    </article>
  );
}
