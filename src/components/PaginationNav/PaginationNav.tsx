'use client';

import { useTranslations } from 'next-intl';
import { Link } from '../../i18n/navigation.ts';
import { buildHomeSearchHref } from '../../utils/homeSearchParams.ts';

type PaginationNavProps = {
  page: number;
  totalPages: number;
  query: string;
  detailsId: number | null;
};

export function PaginationNav({
  page,
  totalPages,
  query,
  detailsId,
}: PaginationNavProps) {
  const t = useTranslations('Pagination');
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;
  const prevHref = buildHomeSearchHref({
    query,
    page: page - 1,
    detailsId,
  });
  const nextHref = buildHomeSearchHref({
    query,
    page: page + 1,
    detailsId,
  });

  return (
    <nav className="pagination" aria-label={t('label')}>
      {canGoPrev ? (
        <Link className="pagination__button" href={prevHref}>
          {t('previous')}
        </Link>
      ) : (
        <span className="pagination__button pagination__button--disabled">
          {t('previous')}
        </span>
      )}
      <span className="pagination__status">
        {t('status', { page, totalPages })}
      </span>
      {canGoNext ? (
        <Link className="pagination__button" href={nextHref}>
          {t('next')}
        </Link>
      ) : (
        <span className="pagination__button pagination__button--disabled">
          {t('next')}
        </span>
      )}
    </nav>
  );
}
