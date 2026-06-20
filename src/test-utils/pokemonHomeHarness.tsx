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
import { getPokemonListErrorMessage } from '../queries/pokemonQueries.ts';
import { loadPokemonResults } from '../services/pokemonApi.ts';
import {
  buildHomeSearchHref,
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

  return (
    <>
      <PokemonHomeView
        page={params.page}
        query={params.query}
        detailsId={params.detailsId}
        items={state.items}
        totalCount={state.totalCount}
        errorMessage={state.errorMessage}
      />
      <TestNavigationProbe />
    </>
  );
}
