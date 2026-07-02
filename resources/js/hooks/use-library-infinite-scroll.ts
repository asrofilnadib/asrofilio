import { router } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { LibraryFilters } from '@/components/asrofilio/library-sidebar';
import { buildLibraryQuery } from '@/lib/library-query';
import type { Book, Paginated, UserBook } from '@/types/book';

type LibraryBook = Book & {
    user_book?: UserBook | null;
    userBooks?: UserBook[];
    user_books?: UserBook[];
};

type UseLibraryInfiniteScrollOptions = {
    basePath: string;
    filters: LibraryFilters & { scope: 'mine' | 'public' };
    books: Paginated<LibraryBook>;
};

function useLibraryInfiniteScroll({
    basePath,
    filters,
    books,
}: UseLibraryInfiniteScrollOptions) {
    const filterKey = useMemo(
        () =>
            JSON.stringify({
                scope: filters.scope,
                search: filters.search ?? null,
                genres: filters.genres ?? null,
                status: filters.status ?? null,
                sort: filters.sort ?? 'newest',
            }),
        [filters],
    );

    const filterKeyRef = useRef('');
    const [items, setItems] = useState(books.data);
    const [currentPage, setCurrentPage] = useState(books.current_page);
    const [lastPage, setLastPage] = useState(books.last_page);
    const [loading, setLoading] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (filterKeyRef.current === filterKey) {
            return;
        }

        filterKeyRef.current = filterKey;
        setItems(books.data);
        setCurrentPage(books.current_page);
        setLastPage(books.last_page);
    }, [filterKey, books]);

    const hasMore = currentPage < lastPage;

    const loadMore = useCallback(() => {
        if (loading || !hasMore) {
            return;
        }

        const nextPage = currentPage + 1;

        setLoading(true);

        router.get(
            basePath,
            buildLibraryQuery(filters, { page: nextPage }),
            {
                only: ['books'],
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    const paginated = page.props.books as Paginated<LibraryBook>;

                    setItems((previous) => [...previous, ...paginated.data]);
                    setCurrentPage(paginated.current_page);
                    setLastPage(paginated.last_page);
                },
                onFinish: () => setLoading(false),
            },
        );
    }, [basePath, currentPage, filters, hasMore, loading]);

    useEffect(() => {
        const element = sentinelRef.current;

        if (!element || !hasMore) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    loadMore();
                }
            },
            { rootMargin: '240px 0px' },
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [hasMore, loadMore]);

    return {
        items,
        loading,
        hasMore,
        sentinelRef,
    };
}

export { useLibraryInfiniteScroll };
export type { LibraryBook };
