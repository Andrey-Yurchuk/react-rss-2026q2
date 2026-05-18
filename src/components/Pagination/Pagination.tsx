type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <nav className="pagination" aria-label="Results pagination">
      <button
        type="button"
        className="pagination__button"
        disabled={!canGoPrev}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>
      <span className="pagination__status">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        className="pagination__button"
        disabled={!canGoNext}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
