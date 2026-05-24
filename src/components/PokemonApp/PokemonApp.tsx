import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import { Link, Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { POKEMON_SEARCH_STORAGE_KEY } from '../../constants';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
  ApiRequestError,
  loadPokemonResults,
  totalPagesForCount,
  type PokemonCardModel,
} from '../../services/pokemonApi';
import { useSelectedItemsStore } from '../../store/selectedItemsStore';
import { parsePageParam } from '../../utils/urlParams';
import { CardList } from '../CardList/index.ts';
import { CrashOnRender } from '../CrashOnRender/index.ts';
import { Pagination } from '../Pagination/index.ts';
import { Search } from '../Search/index.ts';
import { SelectedItemsFlyout } from '../SelectedItemsFlyout/index.ts';
import '../../app/App.css';

export function PokemonApp() {
  const { write: writeSearchToStorage } = useLocalStorage(POKEMON_SEARCH_STORAGE_KEY);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestSerialRef = useRef(0);
  const shouldPersistRef = useRef(false);

  const page = parsePageParam(searchParams.get('page'));
  const selectedId = Number(searchParams.get('details'));
  const hasDetails = Number.isInteger(selectedId) && selectedId > 0;

  const [searchInput, setSearchInput] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState<string | null>(null);
  const [items, setItems] = useState<PokemonCardModel[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulateCrash, setSimulateCrash] = useState(false);

  const selectedItems = useSelectedItemsStore((state) => state.selectedItems);
  const toggleSelectedItem = useSelectedItemsStore(
    (state) => state.toggleSelectedItem
  );
  const clearSelectedItems = useSelectedItemsStore(
    (state) => state.clearSelectedItems
  );
  const selectedIds = useMemo(
    () => new Set(selectedItems.map((item) => item.id)),
    [selectedItems]
  );
  const selectedCount = selectedItems.length;
  const hasSelection = selectedCount > 0;

  useEffect(() => {
    if (searchParams.has('page')) {
      return;
    }
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', '1');
        return next;
      },
      { replace: true }
    );
  }, [searchParams, setSearchParams]);

  const loadResults = useCallback(
    async (
      normalizedQuery: string,
      pageNum: number,
      options: { persistToStorage?: boolean } = {}
    ) => {
      const requestId = ++requestSerialRef.current;
      setLoading(true);
      setError(null);

      try {
        const { items: loadedItems, totalCount: count } = await loadPokemonResults(
          normalizedQuery,
          pageNum
        );
        if (requestId !== requestSerialRef.current) {
          return;
        }
        setItems(loadedItems);
        setTotalCount(count);
        setLoading(false);
        setError(null);
        setLastSubmittedQuery(normalizedQuery);
        if (options.persistToStorage) {
          writeSearchToStorage(normalizedQuery);
        }
      } catch (err) {
        if (requestId !== requestSerialRef.current) {
          return;
        }
        const message =
          err instanceof ApiRequestError
            ? err.message
            : 'Unable to reach the Pokemon API. Check your connection.';
        setLoading(false);
        setError(message);
        setItems([]);
        setTotalCount(0);
        setLastSubmittedQuery((prev) =>
          options.persistToStorage ? normalizedQuery : prev
        );
        if (options.persistToStorage) {
          writeSearchToStorage(normalizedQuery);
        }
      }
    },
    [writeSearchToStorage]
  );

  useEffect(() => {
    if (submittedQuery === null) {
      return;
    }
    void loadResults(submittedQuery, page, {
      persistToStorage: shouldPersistRef.current,
    });
    shouldPersistRef.current = false;
  }, [submittedQuery, page, loadResults]);

  const handleStorageHydrated = useCallback((normalizedFromStorage: string) => {
    setSearchInput(normalizedFromStorage);
    setSubmittedQuery(normalizedFromStorage);
  }, []);

  const handleSearchInputChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      if (searchParams.get('page') === '1') {
        return;
      }
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('page', '1');
          return next;
        },
        { replace: true }
      );
    },
    [searchParams, setSearchParams]
  );

  const handleSearchClick = useCallback(() => {
    const normalized = searchInput.trim().toLowerCase();
    if (lastSubmittedQuery !== null && normalized === lastSubmittedQuery) {
      return;
    }
    shouldPersistRef.current = true;
    if (searchParams.get('page') !== '1') {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('page', '1');
          return next;
        },
        { replace: true }
      );
    }
    setSubmittedQuery(normalized);
  }, [searchInput, lastSubmittedQuery, searchParams, setSearchParams]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', String(newPage));
        if (hasDetails) {
          next.set('details', String(selectedId));
        }
        return next;
      });
    },
    [hasDetails, selectedId, setSearchParams]
  );

  const handleCardSelect = useCallback(
    (id: number) => {
      navigate({
        pathname: '/',
        search: `?page=${page}&details=${id}`,
      });
    },
    [navigate, page]
  );

  const handleCloseDetails = useCallback(() => {
    if (!hasDetails) {
      return;
    }
    navigate({ pathname: '/', search: `?page=${page}` });
  }, [hasDetails, navigate, page]);

  const handleListPanelClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      if (target.closest('a, button, input, select, textarea, [role="button"]')) {
        return;
      }
      handleCloseDetails();
    },
    [handleCloseDetails]
  );

  const handleSimulateError = useCallback(() => {
    setSimulateCrash(true);
  }, []);

  const handleDownloadSelected = useCallback(() => {}, []);

  const totalPages = totalPagesForCount(totalCount);
  const showPagination = !loading && !error && items.length > 0;

  const containerClassName = [
    'pokemon-app',
    hasDetails ? 'pokemon-app--with-details' : '',
    hasSelection ? 'pokemon-app--with-flyout' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClassName}>
      <header className="pokemon-app__header">
        <div>
          <h1 className="pokemon-app__title">Pokedex browser</h1>
          <p className="pokemon-app__subtitle">
            Data from{' '}
            <a
              className="pokemon-app__link"
              href="https://pokeapi.co/"
              target="_blank"
              rel="noreferrer"
            >
              PokéAPI
            </a>
          </p>
        </div>
        <nav className="pokemon-app__nav" aria-label="Application navigation">
          <Link className="pokemon-app__nav-link" to="/about">
            About
          </Link>
        </nav>
      </header>

      <div className="pokemon-app__main-layout">
        <main
          className="pokemon-app__list-panel"
          aria-label="Main Pokemon results panel"
          onClick={handleListPanelClick}
        >
          <section className="pokemon-app__search-section" aria-label="Search">
            <Search
              value={searchInput}
              onChange={handleSearchInputChange}
              onSearch={handleSearchClick}
              onStorageHydrated={handleStorageHydrated}
            />
          </section>

          <section
            className="pokemon-app__results-section"
            aria-label="Search results"
          >
            {loading && (
              <div className="loading" aria-live="polite" aria-busy="true">
                <div className="loading__spinner" />
                <span className="loading__label">Loading…</span>
              </div>
            )}

            {!loading && error && (
              <p className="results__error" role="alert">
                {error}
              </p>
            )}

            {!loading && !error && (
              <CardList
                items={items}
                selectedId={hasDetails ? selectedId : undefined}
                selectedIds={selectedIds}
                onCardSelect={handleCardSelect}
                onSelectionToggle={toggleSelectedItem}
              />
            )}

            {showPagination && (
              <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
            )}
          </section>
        </main>

        {hasDetails ? (
          <section className="pokemon-app__details-panel">
            <Outlet />
          </section>
        ) : null}
      </div>

      <div className="pokemon-app__footer">
        <button
          type="button"
          className="pokemon-app__error-button"
          onClick={handleSimulateError}
        >
          Trigger error (Error Boundary)
        </button>
      </div>

      <SelectedItemsFlyout
        selectedCount={selectedCount}
        onUnselectAll={clearSelectedItems}
        onDownload={handleDownloadSelected}
      />

      {simulateCrash ? <CrashOnRender /> : null}
    </div>
  );
}
