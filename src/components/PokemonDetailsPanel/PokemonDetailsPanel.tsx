import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  getPokemonDetailsErrorMessage,
  usePokemonDetailsQuery,
} from '../../queries/pokemonQueries.ts';
import { parsePageParam } from '../../utils/urlParams';

export function PokemonDetailsPanel() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = parsePageParam(searchParams.get('page'));
  const parsedId = Number(searchParams.get('details'));
  const detailsId =
    Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;

  const detailsQuery = usePokemonDetailsQuery(detailsId);

  const invalidId = detailsId === null;
  const loading = !invalidId && detailsQuery.isLoading;
  const error = invalidId
    ? 'Pokemon details were not found.'
    : detailsQuery.isError
      ? getPokemonDetailsErrorMessage(detailsQuery.error)
      : null;
  const details = detailsQuery.data;

  const handleClose = () => {
    navigate({ pathname: '/', search: `?page=${page}` });
  };

  return (
    <aside className="details-panel" aria-label="Pokemon details">
      <div className="details-panel__header">
        <h2 className="details-panel__title">Pokemon details</h2>
        <button
          type="button"
          className="details-panel__close"
          onClick={handleClose}
        >
          Close
        </button>
      </div>

      {loading ? (
        <div className="loading" aria-live="polite" aria-busy="true">
          <div className="loading__spinner" />
          <span className="loading__label">Loading details…</span>
        </div>
      ) : null}

      {!loading && error ? (
        <p className="details-panel__error" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && details ? (
        <div className="details-panel__content">
          <p className="details-panel__id">Pokedex #{details.id}</p>
          <h3 className="details-panel__name">{details.name}</h3>
          <p className="details-panel__description">{details.description}</p>
        </div>
      ) : null}
    </aside>
  );
}
