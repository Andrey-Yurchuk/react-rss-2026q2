'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, type FormEvent } from 'react';
import { POKEMON_SEARCH_STORAGE_KEY } from '../../constants';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { normalizeQueryParam } from '../../utils/homeSearchParams.ts';

export type SearchFormProps = {
  defaultQuery?: string;
  onSubmit?: (normalizedQuery: string) => void;
};

export function SearchForm({ defaultQuery = '', onSubmit }: SearchFormProps) {
  const t = useTranslations('Search');
  const inputRef = useRef<HTMLInputElement>(null);
  const { read } = useLocalStorage(POKEMON_SEARCH_STORAGE_KEY);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current || defaultQuery !== '') {
      return;
    }

    const storedQuery = normalizeQueryParam(read() ?? '');
    if (storedQuery !== '' && inputRef.current) {
      inputRef.current.value = storedQuery;
    }

    hydratedRef.current = true;
  }, [defaultQuery, read]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!onSubmit) {
      return;
    }

    event.preventDefault();
    const rawValue = inputRef.current?.value ?? '';
    onSubmit(normalizeQueryParam(rawValue));
  };

  return (
    <div className="search">
      <label className="search__label" htmlFor="pokemon-search-input">
        {t('label')}
      </label>
      <form className="search__row" method="get" onSubmit={handleSubmit}>
        <input
          id="pokemon-search-input"
          ref={inputRef}
          className="search__input"
          type="search"
          name="query"
          defaultValue={defaultQuery}
          autoComplete="off"
          placeholder={t('placeholder')}
        />
        <input type="hidden" name="page" value="1" />
        <button className="search__button" type="submit">
          {t('button')}
        </button>
      </form>
    </div>
  );
}
