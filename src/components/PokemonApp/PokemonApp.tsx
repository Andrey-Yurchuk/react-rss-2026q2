import { Component } from 'react';
import { POKEMON_SEARCH_STORAGE_KEY } from '../../constants';
import {
  ApiRequestError,
  loadPokemonResults,
  type PokemonCardModel,
} from '../../services/pokemonApi';
import { CardList } from '../CardList/index.ts';
import { CrashOnRender } from '../CrashOnRender/index.ts';
import { Search } from '../Search/index.ts';
import '../../app/App.css';

type PokemonAppState = {
  searchInput: string;
  lastSubmittedQuery: string | null;
  items: PokemonCardModel[];
  loading: boolean;
  error: string | null;
  simulateCrash: boolean;
};

export class PokemonApp extends Component<object, PokemonAppState> {
  private requestSerial = 0;

  state: PokemonAppState = {
    searchInput: '',
    lastSubmittedQuery: null,
    items: [],
    loading: false,
    error: null,
    simulateCrash: false,
  };

  private async loadResults(
    normalizedQuery: string,
    options: { persistToStorage?: boolean } = {}
  ) {
    const requestId = ++this.requestSerial;
    this.setState({ loading: true, error: null });

    try {
      const items = await loadPokemonResults(normalizedQuery);
      if (requestId !== this.requestSerial) {
        return;
      }
      this.setState({
        items,
        loading: false,
        error: null,
        lastSubmittedQuery: normalizedQuery,
      });
      if (options.persistToStorage) {
        localStorage.setItem(POKEMON_SEARCH_STORAGE_KEY, normalizedQuery);
      }
    } catch (err) {
      if (requestId !== this.requestSerial) {
        return;
      }
      const message =
        err instanceof ApiRequestError
          ? err.message
          : 'Unable to reach the Pokemon API. Check your connection.';
      this.setState((prev) => ({
        loading: false,
        error: message,
        items: [],
        lastSubmittedQuery: options.persistToStorage
          ? normalizedQuery
          : prev.lastSubmittedQuery,
      }));
      if (options.persistToStorage) {
        localStorage.setItem(POKEMON_SEARCH_STORAGE_KEY, normalizedQuery);
      }
    }
  }

  handleStorageHydrated = (normalizedFromStorage: string) => {
    this.setState({ searchInput: normalizedFromStorage }, () => {
      void this.loadResults(normalizedFromStorage);
    });
  };

  handleSearchInputChange = (value: string) => {
    this.setState({ searchInput: value });
  };

  handleSearchClick = () => {
    const normalized = this.state.searchInput.trim().toLowerCase();
    if (
      this.state.lastSubmittedQuery !== null &&
      normalized === this.state.lastSubmittedQuery
    ) {
      return;
    }
    void this.loadResults(normalized, { persistToStorage: true });
  };

  handleSimulateError = () => {
    this.setState({ simulateCrash: true });
  };

  render() {
    const { searchInput, loading, error, items, simulateCrash } = this.state;

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
            onChange={this.handleSearchInputChange}
            onSearch={this.handleSearchClick}
            onStorageHydrated={this.handleStorageHydrated}
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
        </section>

        <div className="pokemon-app__footer">
          <button
            type="button"
            className="pokemon-app__error-button"
            onClick={this.handleSimulateError}
          >
            Trigger error (Error Boundary)
          </button>
        </div>

        {simulateCrash ? <CrashOnRender /> : null}
      </div>
    );
  }
}
