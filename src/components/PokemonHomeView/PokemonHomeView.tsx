'use client';

import { useTranslations } from 'next-intl';
import {
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { Link } from '../../i18n/navigation.ts';
import {
  type PokemonCardModel,
  totalPagesForCount,
} from '../../services/pokemonApi';
import { useSelectedItemsStore } from '../../store/selectedItemsStore';
import { downloadBlobAsFile } from '../../utils/downloadFile';
import { CardList } from '../CardList/index.ts';
import { CrashOnRender } from '../CrashOnRender/index.ts';
import { PaginationNav } from '../PaginationNav/index.ts';
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
  searchAction?: (formData: FormData) => void | Promise<void>;
  onSearchSubmitClient?: (normalizedQuery: string) => void;
  detailsPanel?: ReactNode;
};

export function PokemonHomeView({
  page,
  query,
  detailsId,
  items,
  totalCount,
  errorMessage,
  searchAction,
  onSearchSubmitClient,
  detailsPanel,
}: PokemonHomeViewProps) {
  const t = useTranslations('PokemonApp');
  const tFlyout = useTranslations('SelectedFlyout');
  const [simulateCrash, setSimulateCrash] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const hasDetails = detailsId !== null;
  const selectedItems = useSelectedItemsStore((state) => state.selectedItems);
  const clearSelectedItems = useSelectedItemsStore(
    (state) => state.clearSelectedItems
  );
  const selectedCount = selectedItems.length;
  const hasSelection = selectedCount > 0;

  const totalPages = totalPagesForCount(totalCount);
  const showPagination = errorMessage === null && items.length > 0;

  const handleDownloadSelected = useCallback(async () => {
    if (selectedItems.length === 0) {
      return;
    }

    setIsDownloading(true);
    setDownloadError(null);

    try {
      const response = await fetch('/api/selected-pokemon.csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: selectedItems }),
      });

      if (!response.ok) {
        const responsePayload = (await response.json()) as { error?: string };
        throw new Error(responsePayload.error ?? tFlyout('downloadError'));
      }

      const disposition = response.headers.get('Content-Disposition');
      const filenameMatch = disposition?.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1] ?? `${selectedItems.length}_items.csv`;
      const blob = await response.blob();
      downloadBlobAsFile(blob, filename);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : tFlyout('downloadError');
      setDownloadError(message);
    } finally {
      setIsDownloading(false);
    }
  }, [selectedItems, tFlyout]);

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
        >
          <section
            className="pokemon-app__search-section"
            aria-label={t('searchSectionLabel')}
          >
            <SearchForm
              defaultQuery={query}
              action={searchAction}
              onSubmitClient={onSearchSubmitClient}
            />
          </section>

          <section
            className="pokemon-app__results-section"
            aria-label={t('resultsSectionLabel')}
          >
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

        {hasDetails ? detailsPanel : null}
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
        isDownloading={isDownloading}
        downloadError={downloadError}
      />

      {simulateCrash ? <CrashOnRender /> : null}
    </div>
  );
}
