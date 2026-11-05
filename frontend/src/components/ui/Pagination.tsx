import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.css';

/**
 * Accessible Pagination controls with page navigation and optional page size selector.
 */
export interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit?: number;
  onPageChange: (newPage: number) => void;
  onLimitChange?: (newLimit: number) => void;
  limitOptions?: number[];
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = [10, 20, 50],
  className = '',
}) => {
  if (total === 0) return null;

  const startItem = limit ? (page - 1) * limit + 1 : (page - 1) * 10 + 1;
  const endItem = limit ? Math.min(page * limit, total) : Math.min(page * 10, total);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <nav aria-label="Pagination Navigation" className={`${styles.pagination} ${className}`}>
      <div className={styles.left}>
        <span>
          Showing <strong>{startItem}</strong>–<strong>{endItem}</strong> of <strong>{total}</strong> items
        </span>

        {onLimitChange && limit && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Per page:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              aria-label="Items per page"
              className={styles.pageSizeSelect}
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Go to previous page"
          className={styles.btn}
        >
          <ChevronLeft size={16} />
        </button>

        {getPageNumbers().map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`ellipsis-${idx}`} className={styles.ellipsis} aria-hidden="true">
                &hellip;
              </span>
            );
          }
          const isCurrent = p === page;
          return (
            <button
              key={`page-${p}`}
              type="button"
              onClick={() => onPageChange(Number(p))}
              aria-current={isCurrent ? 'page' : undefined}
              aria-label={`Page ${p}`}
              className={`${styles.btn} ${isCurrent ? styles.active : ''}`}
            >
              {p}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Go to next page"
          className={styles.btn}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
};
