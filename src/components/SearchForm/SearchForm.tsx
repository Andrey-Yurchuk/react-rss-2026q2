'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, type FormEvent } from 'react';
import { POKEMON_SEARCH_STORAGE_KEY } from '../../constants';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { normalizeQueryParam } from '../../utils/homeSearchParams.ts';

export type SearchFormProps = {
  defaultQuery?: string;
  action?: (formData: FormData) => void | Promise<void>;
  onSubmitClient?: (normalizedQuery: string) => void;
};

export function SearchForm({
  defaultQuery = '',
  action,
  onSubmitClient,
}: SearchFormProps) {
  const t = useTranslations('Search');
  const inputRef = useRef<HTMLInputElement>(null);
  const { read, write } = useLocalStorage(POKEMON_SEARCH_STORAGE_KEY);
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
    const normalizedQuery = normalizeQueryParam(inputRef.current?.value ?? '');
    write(normalizedQuery);

    if (inputRef.current) {
      inputRef.current.value = normalizedQuery;
    }

    if (!onSubmitClient) {
      return;
    }

    event.preventDefault();
    onSubmitClient(normalizedQuery);
  };

  return (
    <div className="search">
      <label className="search__label" htmlFor="pokemon-search-input">
        {t('label')}
      </label>
      <form className="search__row" action={action} onSubmit={handleSubmit}>
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
