import { parsePagination, buildPaginationMeta } from './pagination';

describe('Pagination Utilities', () => {
  describe('parsePagination', () => {
    it('defaults to page 1 and limit 10 when empty', () => {
      const res = parsePagination({});
      expect(res).toEqual({ page: 1, limit: 10, offset: 0 });
    });

    it('parses valid numeric strings', () => {
      const res = parsePagination({ page: '3', limit: '20' });
      expect(res).toEqual({ page: 3, limit: 20, offset: 40 });
    });

    it('caps limit at maxLimit', () => {
      const res = parsePagination({ page: '1', limit: '500' }, 10, 100);
      expect(res.limit).toBe(100);
    });

    it('sanitizes invalid/negative inputs to safe defaults', () => {
      const res = parsePagination({ page: '-5', limit: 'abc' });
      expect(res).toEqual({ page: 1, limit: 10, offset: 0 });
    });
  });

  describe('buildPaginationMeta', () => {
    it('calculates total pages accurately', () => {
      expect(buildPaginationMeta(45, 1, 10)).toEqual({
        page: 1,
        limit: 10,
        total: 45,
        totalPages: 5,
      });

      expect(buildPaginationMeta(0, 1, 10)).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });

      expect(buildPaginationMeta(20, 2, 10)).toEqual({
        page: 2,
        limit: 10,
        total: 20,
        totalPages: 2,
      });
    });
  });
});

