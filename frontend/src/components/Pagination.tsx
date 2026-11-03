import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (newPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  total,
  onPageChange,
}) => {
  if (totalPages <= 1 && total === 0) {
    return null;
  }

  // Generate page numbers array (with ellipsis if large)
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxButtons = 5;
    let start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav className="pagination" aria-label="Pagination">
      <div className="pagination__info">
        Showing page <strong>{page}</strong> of <strong>{Math.max(totalPages, 1)}</strong> (
        {total} total {total === 1 ? 'item' : 'items'})
      </div>

      <div className="pagination__controls">
        <button
          type="button"
          className="pagination__btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          &larr; Prev
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`pagination__btn ${p === page ? 'pagination__btn--active' : ''}`}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          className="pagination__btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next &rarr;
        </button>
      </div>
    </nav>
  );
};

