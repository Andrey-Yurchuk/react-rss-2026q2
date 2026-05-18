import { useEffect, type FormEvent } from 'react';
import { POKEMON_SEARCH_STORAGE_KEY } from '../../constants';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export type SearchProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onStorageHydrated: (normalizedFromStorage: string) => void;
};

export function Search({
  value,
  onChange,
  onSearch,
  onStorageHydrated,
}: SearchProps) {
  const { read } = useLocalStorage(POKEMON_SEARCH_STORAGE_KEY);

  useEffect(() => {
    const normalized = (read() ?? '').trim().toLowerCase();
    onStorageHydrated(normalized);
  }, [read, onStorageHydrated]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <div className="search">
      <label className="search__label" htmlFor="pokemon-search-input">
        Search Pokémon by exact name
      </label>
      <form className="search__row" onSubmit={handleSubmit}>
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
