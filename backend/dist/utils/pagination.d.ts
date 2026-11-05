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
export declare const parsePagination: (query: {
    page?: unknown;
    limit?: unknown;
}, defaultLimit?: number, maxLimit?: number) => PaginationOptions;
export declare const buildPaginationMeta: (total: number, page: number, limit: number) => PaginationMeta;
