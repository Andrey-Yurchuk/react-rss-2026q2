import { useTranslations } from 'next-intl';

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const t = useTranslations('Pagination');
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <nav className="pagination" aria-label={t('label')}>
      <button
        type="button"
        className="pagination__button"
        disabled={!canGoPrev}
        onClick={() => onPageChange(page - 1)}
      >
        {t('previous')}
      </button>
      <span className="pagination__status">
        {t('status', { page, totalPages })}
      </span>
      <button
        type="button"
        className="pagination__button"
        disabled={!canGoNext}
        onClick={() => onPageChange(page + 1)}
      >
        {t('next')}
      </button>
    </nav>
  );
}
