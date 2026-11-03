export interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export const parsePagination = (
  query: { page?: unknown; limit?: unknown },
  defaultLimit = 10,
  maxLimit = 100,
): PaginationOptions => {
  const parsedPage = typeof query.page === 'string' || typeof query.page === 'number'
    ? parseInt(String(query.page), 10)
    : 1;

  const parsedLimit = typeof query.limit === 'string' || typeof query.limit === 'number'
    ? parseInt(String(query.limit), 10)
    : defaultLimit;

  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit =
    Number.isInteger(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, maxLimit)
      : defaultLimit;

  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

export const buildPaginationMeta = (total: number, page: number, limit: number): PaginationMeta => {
  const safeTotal = Math.max(0, total);
  const totalPages = limit > 0 ? Math.ceil(safeTotal / limit) : 0;

  return {
    page,
    limit,
    total: safeTotal,
    totalPages,
  };
};

