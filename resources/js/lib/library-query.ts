import type { LibraryFilters } from '@/components/asrofilio/library-sidebar';

export function buildLibraryQuery(
    filters: LibraryFilters & { scope: 'mine' | 'public' },
    overrides: Partial<
        LibraryFilters & { scope?: 'mine' | 'public'; page?: number }
    > = {},
): Record<string, string | string[] | undefined> {
    const scope = overrides.scope ?? filters.scope;
    const genres =
        overrides.genres !== undefined ? overrides.genres : filters.genres;
    const status =
        overrides.status !== undefined ? overrides.status : filters.status;
    const search =
        overrides.search !== undefined ? overrides.search : filters.search;
    const sort = overrides.sort !== undefined ? overrides.sort : filters.sort;
    const page = overrides.page;

    return {
        scope,
        genres: genres && genres.length > 0 ? genres : undefined,
        status: status ?? undefined,
        search: search ?? undefined,
        sort: sort && sort !== 'newest' ? sort : undefined,
        page: page && page > 1 ? String(page) : undefined,
    };
}
