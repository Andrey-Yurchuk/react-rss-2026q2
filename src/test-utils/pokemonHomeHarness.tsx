import { useEffect, useState, useSyncExternalStore } from 'react';
import { PokemonHomeView } from '../components/PokemonHomeView/index.ts';
import { TestNavigationProbe } from '../components/TestNavigationProbe/index.ts';
import {
  applyNavigationHref,
  getNavigationSnapshot,
  subscribeNavigation,
} from '../hooks/navigationStore.ts';
import {
  clearRefreshHandler,
  registerRefreshHandler,
} from '../hooks/refreshHandlerStore.ts';
import {
  getPokemonDetailsErrorMessage,
  getPokemonListErrorMessage,
} from '../queries/pokemonQueries.ts';
import { loadPokemonById, loadPokemonResults } from '../services/pokemonApi.ts';
import {
  buildHomeSearchHref,
  buildHomeSearchQueryString,
  hasPageSearchParam,
  parseHomeSearchParamsFromHref,
} from '../utils/homeSearchParams.ts';

type HarnessState = {
  items: Awaited<ReturnType<typeof loadPokemonResults>>['items'];
  totalCount: number;
  errorMessage: string | null;
};

const emptyState: HarnessState = {
  items: [],
  totalCount: 0,
  errorMessage: null,
};

type DetailsHarnessState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success'; id: number; name: string; description: string };

function getHarnessHref() {
  const { pathname, searchParams } = getNavigationSnapshot();
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function PokemonHomeTestHarness() {
  const href = useSyncExternalStore(
    subscribeNavigation,
    getHarnessHref,
    getHarnessHref
  );
  const [state, setState] = useState<HarnessState>(emptyState);
  const [detailsState, setDetailsState] = useState<DetailsHarnessState>({
    status: 'idle',
  });
  const [fetchVersion, setFetchVersion] = useState(0);
  const params = parseHomeSearchParamsFromHref(href);

  useEffect(() => {
    const currentHref = getHarnessHref();
    const rawParams = Object.fromEntries(
      new URL(currentHref, 'http://localhost').searchParams.entries()
    );

    if (!hasPageSearchParam(rawParams)) {
      applyNavigationHref(
        buildHomeSearchHref(parseHomeSearchParamsFromHref(currentHref))
      );
    }
  }, []);

  useEffect(() => {
    registerRefreshHandler(() => {
      setFetchVersion((value) => value + 1);
    });

    return () => {
      clearRefreshHandler();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadPokemonResults(params.query, params.page)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setState({
          items: result.items,
          totalCount: result.totalCount,
          errorMessage: null,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        setState({
          items: [],
          totalCount: 0,
          errorMessage: getPokemonListErrorMessage(error),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [params.page, params.query, fetchVersion]);

  useEffect(() => {
    if (params.detailsId === null) {
      return;
    }

    let cancelled = false;

    loadPokemonById(params.detailsId)
      .then((details) => {
        if (cancelled) {
          return;
        }
        setDetailsState({
          status: 'success',
          id: details.id,
          name: details.name,
          description: details.description,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        setDetailsState({
          status: 'error',
          message: getPokemonDetailsErrorMessage(error),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [params.detailsId, fetchVersion]);

  const detailsPanel =
    params.detailsId !== null ? (
      <section className="pokemon-app__details-panel">
        <aside className="details-panel" aria-label="Pokemon details">
          <div className="details-panel__header">
            <h2 className="details-panel__title">Pokemon details</h2>
            <div className="details-panel__actions">
              <button
                type="button"
                className="details-panel__close"
                onClick={() =>
                  applyNavigationHref(
                    `/?${buildHomeSearchQueryString({
                      query: params.query,
                      page: params.page,
                    })}`
                  )
                }
              >
                Close
              </button>
            </div>
          </div>
          {detailsState.status === 'error' ? (
            <p role="alert">{detailsState.message}</p>
          ) : null}
          {detailsState.status === 'success' ? (
            <div className="details-panel__content">
              <p className="details-panel__id">Pokedex #{detailsState.id}</p>
              <h3 className="details-panel__name">{detailsState.name}</h3>
              <p className="details-panel__description">{detailsState.description}</p>
            </div>
          ) : null}
        </aside>
      </section>
    ) : null;

  return (
    <>
      <PokemonHomeView
        page={params.page}
        query={params.query}
        detailsId={params.detailsId}
        items={state.items}
        totalCount={state.totalCount}
        errorMessage={state.errorMessage}
        onSearchSubmitClient={(normalizedQuery) => {
          applyNavigationHref(
            `/?${buildHomeSearchQueryString({ query: normalizedQuery, page: 1 })}`
          );
        }}
        detailsPanel={detailsPanel}
      />
      <TestNavigationProbe />
    </>
  );
}
