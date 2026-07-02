import { useEffect, useMemo, useState } from 'react';

import { filterWithFuse } from '@/lib/fuse-search';

export type AdminTablePerPage = 10 | 15 | 25 | 50 | 100;

export const ADMIN_TABLE_PER_PAGE_OPTIONS: AdminTablePerPage[] = [
    10, 15, 25, 50, 100,
];

type UseAdminDataTableOptions<T> = {
    items: T[];
    searchKeys: string[];
    initialPerPage?: AdminTablePerPage;
};

export function useAdminDataTable<T>({
    items,
    searchKeys,
    initialPerPage = 15,
}: UseAdminDataTableOptions<T>) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState<AdminTablePerPage>(initialPerPage);

    const filteredItems = useMemo(
        () => filterWithFuse(items, searchKeys, search),
        [items, search, searchKeys],
    );

    const total = filteredItems.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage) || 1);
    const safePage = Math.min(page, lastPage);

    const paginatedItems = useMemo(() => {
        const start = (safePage - 1) * perPage;

        return filteredItems.slice(start, start + perPage);
    }, [filteredItems, perPage, safePage]);

    const from = total === 0 ? 0 : (safePage - 1) * perPage + 1;
    const to = total === 0 ? 0 : Math.min(safePage * perPage, total);

    useEffect(() => {
        setPage(1);
    }, [search, perPage]);

    useEffect(() => {
        if (page > lastPage) {
            setPage(lastPage);
        }
    }, [lastPage, page]);

    function goToPage(nextPage: number) {
        setPage(Math.min(Math.max(1, nextPage), lastPage));
    }

    return {
        search,
        setSearch,
        perPage,
        setPerPage,
        page: safePage,
        lastPage,
        total,
        from,
        to,
        filteredItems,
        paginatedItems,
        goToPage,
        goToPreviousPage: () => goToPage(safePage - 1),
        goToNextPage: () => goToPage(safePage + 1),
    };
}
