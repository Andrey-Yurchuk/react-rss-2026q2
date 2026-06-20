import { Link } from '../../i18n/navigation.ts';
import type { PokemonCardModel } from '../../services/pokemonApi';

type CardContentProps = {
  item: PokemonCardModel;
  detailsHref: string;
  viewDetailsLabel: string;
  viewDetailsAriaLabel: string;
};

export function CardContent({
  item,
  detailsHref,
  viewDetailsLabel,
  viewDetailsAriaLabel,
}: CardContentProps) {
  return (
    <>
      <h3 className="card__name">{item.name}</h3>
      <p className="card__description">{item.description}</p>
      <Link
        href={detailsHref}
        className="card__button"
        aria-label={viewDetailsAriaLabel}
      >
        {viewDetailsLabel}
      </Link>
    </>
  );
}
