import { router, usePage } from '@inertiajs/react';
import { ArrowDownAZ, BookOpen, Plus, Search } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';

import { LibraryBookCard } from '@/components/asrofilio/library-book-card';
import {
    LibrarySidebar,
    type LibraryFilters,
    type LibrarySort,
} from '@/components/asrofilio/library-sidebar';
import { StatusFilters } from '@/components/asrofilio/status-filters';
import { AddBookModal } from '@/components/modals/add-book-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/lib/i18n';
import { buildLibraryQuery } from '@/lib/library-query';
import { paths } from '@/lib/paths';
import type { Auth } from '@/types/auth';
import type {
    Book,
    Genre,
    Paginated,
    ReadingStatus,
    UserBook,
} from '@/types/book';

type LibraryBrowseProps = {
    basePath?: string;
    books: Paginated<Book & { user_book?: UserBook | null; userBooks?: UserBook[] }>;
    genres: Genre[];
    counts: { mine: number; public: number };
    filters: LibraryFilters & { scope: 'mine' | 'public' };
    isGuest?: boolean;
    showPublicBanner?: boolean;
    header?: ReactNode;
};

const sortOptions: Array<{ value: LibrarySort; labelKey: Parameters<ReturnType<typeof useI18n>['t']>[0] }> = [
    { value: 'newest', labelKey: 'sort_newest' },
    { value: 'oldest', labelKey: 'sort_oldest' },
    { value: 'title_asc', labelKey: 'sort_title_asc' },
    { value: 'title_desc', labelKey: 'sort_title_desc' },
    { value: 'author_asc', labelKey: 'sort_author_asc' },
    { value: 'author_desc', labelKey: 'sort_author_desc' },
];

function resolveUserBook(
    book: Book & { user_book?: UserBook | null; userBooks?: UserBook[] },
): UserBook | null {
    if (book.user_book) {
        return book.user_book;
    }

    return book.userBooks?.[0] ?? null;
}

function LibraryBrowse({
    basePath = paths.library,
    books,
    genres,
    counts,
    filters,
    isGuest = false,
    showPublicBanner = false,
    header,
}: LibraryBrowseProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const { t } = useI18n();
    const [addBookOpen, setAddBookOpen] = useState(false);
    const [search, setSearch] = useState(filters.search ?? '');
    const activeStatus = filters.status ?? 'all';
    const activeSort = filters.sort ?? 'newest';

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get(
            basePath,
            buildLibraryQuery(filters, { search: search || null }),
            { preserveState: true },
        );
    }

    function handleSortChange(value: LibrarySort) {
        router.get(
            basePath,
            buildLibraryQuery(filters, { sort: value }),
            { preserveState: true, preserveScroll: true },
        );
    }

    function emptyMessage(): string {
        return filters.scope === 'mine'
            ? t('library_empty_mine')
            : t('library_empty_public');
    }

    return (
        <>
            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 lg:flex-row lg:gap-8 lg:px-8">
                <LibrarySidebar
                    basePath={basePath}
                    scope={filters.scope}
                    genres={genres}
                    counts={counts}
                    totalBooks={books.total}
                    filters={filters}
                    isGuest={isGuest}
                />

                <div className="min-w-0 flex-1 space-y-6">
                    {header}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <form
                            onSubmit={handleSearch}
                            className="relative min-w-0 flex-1"
                        >
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={
                                    filters.scope === 'public'
                                        ? t('library_search_public')
                                        : t('library_search_mine')
                                }
                                className="h-11 rounded-full border-border/70 bg-card pl-10 shadow-sm"
                            />
                        </form>

                        <Select
                            value={activeSort}
                            onValueChange={(value) =>
                                handleSortChange(value as LibrarySort)
                            }
                        >
                            <SelectTrigger className="h-11 w-full rounded-full border-border/70 bg-card shadow-sm sm:w-48">
                                <ArrowDownAZ className="mr-2 size-4 text-muted-foreground" />
                                <SelectValue placeholder={t('library_sort')} />
                            </SelectTrigger>
                            <SelectContent>
                                {sortOptions.map(({ value, labelKey }) => (
                                    <SelectItem key={value} value={value}>
                                        {t(labelKey)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {auth.user && filters.scope === 'mine' && (
                            <Button
                                type="button"
                                className="rounded-full"
                                onClick={() => setAddBookOpen(true)}
                            >
                                <Plus className="size-4" />
                                {t('library_add_book')}
                            </Button>
                        )}
                    </div>

                    {(showPublicBanner || filters.scope === 'public') && (
                        <div className="rounded-2xl border border-border/70 bg-card px-5 py-4 shadow-sm">
                            <h2 className="font-serif text-lg font-semibold">
                                {t('library_public_title')}
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {t('library_public_desc')}
                            </p>
                        </div>
                    )}

                    {filters.scope === 'mine' && auth.user && (
                        <StatusFilters
                            active={activeStatus}
                            libraryFilters={filters}
                            basePath={basePath}
                        />
                    )}

                    {books.data.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
                            <BookOpen className="mx-auto size-12 text-muted-foreground/30" />
                            <p className="mt-4 text-muted-foreground">
                                {emptyMessage()}
                            </p>
                            {auth.user && filters.scope === 'mine' && (
                                <Button
                                    className="mt-4"
                                    onClick={() => setAddBookOpen(true)}
                                >
                                    <Plus className="size-4" />
                                    {t('library_add_book')}
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                            {books.data.map((book) => (
                                <LibraryBookCard
                                    key={book.id}
                                    book={book}
                                    userBook={resolveUserBook(book)}
                                    scope={filters.scope}
                                    showAddToLibrary={
                                        filters.scope === 'public' &&
                                        Boolean(auth.user)
                                    }
                                />
                            ))}
                        </div>
                    )}

                    {books.last_page > 1 && (
                        <div className="flex justify-center gap-2 pt-2">
                            {books.links.map((link, i) => (
                                <Button
                                    key={i}
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    size="sm"
                                    className="rounded-full"
                                    disabled={!link.url}
                                    onClick={() =>
                                        link.url && router.get(link.url)
                                    }
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <AddBookModal
                open={addBookOpen}
                onOpenChange={setAddBookOpen}
            />
        </>
    );
}

export { LibraryBrowse };
export type { LibraryBrowseProps };
