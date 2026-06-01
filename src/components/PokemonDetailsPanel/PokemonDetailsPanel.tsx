import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  getPokemonDetailsErrorMessage,
  pokemonQueryKeys,
  usePokemonDetailsQuery,
} from '../../queries/pokemonQueries.ts';
import { parsePageParam } from '../../utils/urlParams';

export function PokemonDetailsPanel() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = parsePageParam(searchParams.get('page'));
  const parsedId = Number(searchParams.get('details'));
  const detailsId =
    Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;

  const detailsQuery = usePokemonDetailsQuery(detailsId);

  const invalidId = detailsId === null;
  const loading = !invalidId && detailsQuery.isLoading;
  const refreshing =
    !invalidId && detailsQuery.isFetching && !loading;
  const error = invalidId
    ? 'Pokemon details were not found.'
    : detailsQuery.isError
      ? getPokemonDetailsErrorMessage(detailsQuery.error)
      : null;
  const details = detailsQuery.data;

  const handleClose = () => {
    navigate({ pathname: '/', search: `?page=${page}` });
  };

  const handleRefreshDetails = useCallback(async () => {
    if (detailsId === null) {
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: pokemonQueryKeys.details(detailsId),
      refetchType: 'none',
    });
    await detailsQuery.refetch();
  }, [queryClient, detailsId, detailsQuery]);

  return (
    <aside className="details-panel" aria-label="Pokemon details">
      <div className="details-panel__header">
        <h2 className="details-panel__title">Pokemon details</h2>
        <div className="details-panel__actions">
          {detailsId !== null ? (
            <button
              type="button"
              className="details-panel__refresh"
              aria-label="Refresh details"
              onClick={() => {
                handleRefreshDetails().catch(() => undefined);
              }}
              disabled={detailsQuery.isFetching}
            >
              Refresh details
            </button>
          ) : null}
          <button
            type="button"
            className="details-panel__close"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading" aria-live="polite" aria-busy="true">
          <div className="loading__spinner" />
          <span className="loading__label">Loading details…</span>
        </div>
      ) : null}

      {refreshing ? (
        <p className="details-panel__refreshing" aria-live="polite">
          Refreshing details…
        </p>
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
