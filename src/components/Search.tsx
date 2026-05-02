import { Component, type FormEvent } from 'react';
import { POKEMON_SEARCH_STORAGE_KEY } from '../constants';

export type SearchProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onStorageHydrated: (normalizedFromStorage: string) => void;
};

export class Search extends Component<SearchProps> {
  componentDidMount() {
    const raw = localStorage.getItem(POKEMON_SEARCH_STORAGE_KEY);
    const normalized = (raw ?? '').trim().toLowerCase();
    this.props.onStorageHydrated(normalized);
  }

  handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    this.props.onSearch();
  };

  render() {
    const { value, onChange } = this.props;
    return (
      <div className="search">
        <label className="search__label" htmlFor="pokemon-search-input">
          Search Pokémon by exact name
        </label>
        <form className="search__row" onSubmit={this.handleSubmit}>
          <input
            id="pokemon-search-input"
            className="search__input"
            type="search"
            autoComplete="off"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. pikachu (leave empty for first page)"
          />
          <button className="search__button" type="submit">
            Search
          </button>
        </form>
      </div>
    );
  }
}
