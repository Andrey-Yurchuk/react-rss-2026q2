import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { POKEMON_SEARCH_STORAGE_KEY } from '../../constants';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
  ApiRequestError,
  loadPokemonResults,
  totalPagesForCount,
  type PokemonCardModel,
} from '../../services/pokemonApi';
import { parsePageParam } from '../../utils/urlParams';
import { CardList } from '../CardList/index.ts';
import { CrashOnRender } from '../CrashOnRender/index.ts';
import { Pagination } from '../Pagination/index.ts';
import { Search } from '../Search/index.ts';
import '../../app/App.css';

export function PokemonApp() {
  const { write: writeSearchToStorage } = useLocalStorage(POKEMON_SEARCH_STORAGE_KEY);
  const [searchParams, setSearchParams] = useSearchParams();
  const requestSerialRef = useRef(0);
  const shouldPersistRef = useRef(false);

  const page = parsePageParam(searchParams.get('page'));

  const [searchInput, setSearchInput] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState<string | null>(null);
  const [items, setItems] = useState<PokemonCardModel[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulateCrash, setSimulateCrash] = useState(false);

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
        return next;
      });
    },
    [setSearchParams]
  );

  const handleSimulateError = useCallback(() => {
    setSimulateCrash(true);
  }, []);

  const totalPages = totalPagesForCount(totalCount);
  const showPagination = !loading && !error && items.length > 0;

  return (
    <div className="pokemon-app">
      <header className="pokemon-app__header">
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
      </header>

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

        {!loading && !error && <CardList items={items} />}

        {showPagination && (
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        )}
      </section>

      <div className="pokemon-app__footer">
        <button
          type="button"
          className="pokemon-app__error-button"
          onClick={handleSimulateError}
        >
          Trigger error (Error Boundary)
        </button>
      </div>

      {simulateCrash ? <CrashOnRender /> : null}
    </div>
  );
}
