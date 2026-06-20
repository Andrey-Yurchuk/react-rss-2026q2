'use client';

import { useTranslations } from 'next-intl';
import {
  useCallback,
  useMemo,
  useState,
  type MouseEvent,
} from 'react';
import { Link, useRouter } from '../../i18n/navigation.ts';
import { POKEMON_SEARCH_STORAGE_KEY } from '../../constants';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAppSearchParams } from '../../hooks/useAppSearchParams.ts';
import {
  type PokemonCardModel,
  totalPagesForCount,
} from '../../services/pokemonApi';
import { useSelectedItemsStore } from '../../store/selectedItemsStore';
import {
  buildSelectedItemsFilename,
  serializeSelectedItemsToCsv,
} from '../../utils/csv';
import { downloadBlobAsFile } from '../../utils/downloadFile';
import {
  buildHomeSearchHref,
  buildHomeSearchQueryString,
} from '../../utils/homeSearchParams.ts';
import { CardList } from '../CardList/index.ts';
import { CrashOnRender } from '../CrashOnRender/index.ts';
import { PaginationNav } from '../PaginationNav/index.ts';
import { PokemonDetailsPanel } from '../PokemonDetailsPanel/index.ts';
import { SearchForm } from '../SearchForm/index.ts';
import { SelectedItemsFlyout } from '../SelectedItemsFlyout/index.ts';
import '../../app/App.css';

export type PokemonHomeViewProps = {
  page: number;
  query: string;
  detailsId: number | null;
  items: PokemonCardModel[];
  totalCount: number;
  errorMessage: string | null;
};

export function PokemonHomeView({
  page,
  query,
  detailsId,
  items,
  totalCount,
  errorMessage,
}: PokemonHomeViewProps) {
  const t = useTranslations('PokemonApp');
  const router = useRouter();
  const { navigateToSearch } = useAppSearchParams();
  const { write: writeSearchToStorage } = useLocalStorage(
    POKEMON_SEARCH_STORAGE_KEY
  );
  const [simulateCrash, setSimulateCrash] = useState(false);

  const hasDetails = detailsId !== null;
  const selectedItems = useSelectedItemsStore((state) => state.selectedItems);
  const clearSelectedItems = useSelectedItemsStore(
    (state) => state.clearSelectedItems
  );
  const selectedCount = selectedItems.length;
  const hasSelection = selectedCount > 0;

  const totalPages = totalPagesForCount(totalCount);
  const showPagination = errorMessage === null && items.length > 0;

  const handleSearchSubmit = useCallback(
    (normalizedQuery: string) => {
      if (normalizedQuery === query && page === 1) {
        return;
      }

      writeSearchToStorage(normalizedQuery);
      router.push(
        buildHomeSearchHref({
          query: normalizedQuery,
          page: 1,
        })
      );
    },
    [page, query, router, writeSearchToStorage]
  );

  const handleCloseDetails = useCallback(() => {
    if (!hasDetails) {
      return;
    }

    navigateToSearch(
      buildHomeSearchQueryString({
        query,
        page,
      })
    );
  }, [hasDetails, navigateToSearch, page, query]);

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

  const handleRefreshResults = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleDownloadSelected = useCallback(() => {
    if (selectedItems.length === 0) {
      return;
    }
    const csv = serializeSelectedItemsToCsv(selectedItems);
    const filename = buildSelectedItemsFilename(selectedItems.length);
    downloadBlobAsFile(csv, filename, 'text/csv;charset=utf-8');
  }, [selectedItems]);

  const containerClassName = useMemo(
    () =>
      [
        'pokemon-app',
        hasDetails ? 'pokemon-app--with-details' : '',
        hasSelection ? 'pokemon-app--with-flyout' : '',
      ]
        .filter(Boolean)
        .join(' '),
    [hasDetails, hasSelection]
  );

  return (
    <div className={containerClassName}>
      <header className="pokemon-app__header">
        <div>
          <h1 className="pokemon-app__title">{t('title')}</h1>
          <p className="pokemon-app__subtitle">
            {t('dataFrom')}{' '}
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
        <nav className="pokemon-app__nav" aria-label={t('navLabel')}>
          <Link className="pokemon-app__nav-link" href="/about">
            {t('about')}
          </Link>
        </nav>
      </header>

      <div className="pokemon-app__main-layout">
        <main
          className="pokemon-app__list-panel"
          aria-label={t('mainPanelLabel')}
          onClick={handleListPanelClick}
        >
          <section
            className="pokemon-app__search-section"
            aria-label={t('searchSectionLabel')}
          >
            <SearchForm defaultQuery={query} onSubmit={handleSearchSubmit} />
          </section>

          <section
            className="pokemon-app__results-section"
            aria-label={t('resultsSectionLabel')}
          >
            <div className="pokemon-app__results-toolbar">
              <button
                type="button"
                className="pokemon-app__refresh-button"
                aria-label={t('refreshResultsAria')}
                onClick={handleRefreshResults}
              >
                {t('refreshResults')}
              </button>
            </div>

            {errorMessage ? (
              <p className="results__error" role="alert">
                {errorMessage}
              </p>
            ) : (
              <>
                <CardList
                  items={items}
                  page={page}
                  query={query}
                  detailsId={detailsId}
                />

                {showPagination ? (
                  <PaginationNav
                    page={page}
                    totalPages={totalPages}
                    query={query}
                    detailsId={detailsId}
                  />
                ) : null}
              </>
            )}
          </section>
        </main>

        {hasDetails ? (
          <section className="pokemon-app__details-panel">
            <PokemonDetailsPanel
              detailsId={detailsId}
              page={page}
              query={query}
            />
          </section>
        ) : null}
      </div>

      <div className="pokemon-app__footer">
        <button
          type="button"
          className="pokemon-app__error-button"
          onClick={() => setSimulateCrash(true)}
        >
          {t('triggerError')}
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
