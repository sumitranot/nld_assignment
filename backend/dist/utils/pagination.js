"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPaginationMeta = exports.parsePagination = void 0;
const parsePagination = (query, defaultLimit = 10, maxLimit = 100) => {
    const parsedPage = typeof query.page === 'string' || typeof query.page === 'number'
        ? parseInt(String(query.page), 10)
        : 1;
    const parsedLimit = typeof query.limit === 'string' || typeof query.limit === 'number'
        ? parseInt(String(query.limit), 10)
        : defaultLimit;
    const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const limit = Number.isInteger(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, maxLimit)
        : defaultLimit;
    const offset = (page - 1) * limit;
    return { page, limit, offset };
};
exports.parsePagination = parsePagination;
const buildPaginationMeta = (total, page, limit) => {
    const safeTotal = Math.max(0, total);
    const totalPages = limit > 0 ? Math.ceil(safeTotal / limit) : 0;
    return {
        page,
        limit,
        total: safeTotal,
        totalPages,
    };
};
exports.buildPaginationMeta = buildPaginationMeta;
//# sourceMappingURL=pagination.js.map