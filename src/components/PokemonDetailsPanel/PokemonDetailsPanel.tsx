import { getTranslations } from 'next-intl/server';
import { Link } from '../../i18n/navigation.ts';
import { getPokemonDetailsErrorMessage } from '../../queries/pokemonQueries.ts';
import { loadPokemonById, type PokemonCardModel } from '../../services/pokemonApi.ts';
import { buildHomeSearchHref } from '../../utils/homeSearchParams.ts';
import { PokemonDetailsRefreshButton } from './PokemonDetailsRefreshButton.tsx';

export type PokemonDetailsPanelProps = {
  detailsId: number;
  page: number;
  query: string;
};

export type PokemonDetailsPanelData =
  | { details: PokemonCardModel; error: null }
  | { details: null; error: string };

export async function loadPokemonDetailsPanelData(
  detailsId: number
): Promise<PokemonDetailsPanelData> {
  try {
    const details = await loadPokemonById(detailsId);
    return { details, error: null };
  } catch (error) {
    return { details: null, error: getPokemonDetailsErrorMessage(error) };
  }
}

export async function PokemonDetailsPanel({
  detailsId,
  page,
  query,
}: PokemonDetailsPanelProps) {
  const t = await getTranslations('DetailsPanel');
  const { details, error } = await loadPokemonDetailsPanelData(detailsId);
  const closeHref = buildHomeSearchHref({ query, page });

  return (
    <aside className="details-panel" aria-label={t('label')}>
      <div className="details-panel__header">
        <h2 className="details-panel__title">{t('title')}</h2>
        <div className="details-panel__actions">
          <Link className="details-panel__close" href={closeHref}>
            {t('close')}
          </Link>
          <PokemonDetailsRefreshButton />
        </div>
      </div>

      {error ? (
        <p className="details-panel__error" role="alert">
          {error}
        </p>
      ) : null}

      {!error && details ? (
        <div className="details-panel__content">
          <p className="details-panel__id">{t('pokedexId', { id: details.id })}</p>
          <h3 className="details-panel__name">{details.name}</h3>
          <p className="details-panel__description">{details.description}</p>
        </div>
      ) : null}
    </aside>
  );
}
