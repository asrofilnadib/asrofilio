import { Head, router, usePage } from '@inertiajs/react';
import { BookOpen, Plus, Search } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';

import { LibraryBookCard } from '@/components/asrofilio/library-book-card';
import { LibrarySidebar } from '@/components/asrofilio/library-sidebar';
import { StatusFilters } from '@/components/asrofilio/status-filters';
import { AddBookModal } from '@/components/modals/add-book-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { paths } from '@/lib/paths';
import type { Auth } from '@/types/auth';
import type {
    Book,
    Genre,
    Paginated,
    ReadingStatus,
    UserBook,
} from '@/types/book';

type LibraryIndexProps = {
    books: Paginated<Book & { user_book?: UserBook | null; userBooks?: UserBook[] }>;
    genres: Genre[];
    counts: { mine: number; public: number };
    filters: {
        scope: 'mine' | 'public';
        status?: ReadingStatus | null;
        genre?: string | null;
        search?: string | null;
    };
};

function resolveUserBook(
    book: Book & { user_book?: UserBook | null; userBooks?: UserBook[] },
): UserBook | null {
    if (book.user_book) {
        return book.user_book;
    }

    return book.userBooks?.[0] ?? null;
}

function LibraryIndex({ books, genres, counts, filters }: LibraryIndexProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [addBookOpen, setAddBookOpen] = useState(false);
    const [search, setSearch] = useState(filters.search ?? '');
    const activeStatus = filters.status ?? 'all';

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get(
            paths.library,
            {
                scope: filters.scope,
                genre: filters.genre ?? undefined,
                status: filters.status ?? undefined,
                search: search || undefined,
            },
            { preserveState: true },
        );
    }

    return (
        <>
            <Head title="Library" />

            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 lg:flex-row lg:gap-8 lg:px-8">
                <LibrarySidebar
                    scope={filters.scope}
                    genres={genres}
                    counts={counts}
                    totalBooks={books.total}
                    filters={filters}
                />

                <div className="min-w-0 flex-1 space-y-6">
                    <form
                        onSubmit={handleSearch}
                        className="flex flex-col gap-3 sm:flex-row sm:items-center"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={
                                    filters.scope === 'public'
                                        ? 'Search public library…'
                                        : 'Search my library…'
                                }
                                className="h-11 rounded-full border-border/70 bg-card pl-10 shadow-sm"
                            />
                        </div>
                        {auth.user && filters.scope === 'mine' && (
                            <Button
                                type="button"
                                className="rounded-full"
                                onClick={() => setAddBookOpen(true)}
                            >
                                <Plus className="size-4" />
                                Add book
                            </Button>
                        )}
                    </form>

                    {filters.scope === 'public' && (
                        <div className="rounded-2xl border border-border/70 bg-card px-5 py-4 shadow-sm">
                            <h2 className="font-serif text-lg font-semibold">
                                Experimental Public Library
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                Discover books shared by the community. Add
                                titles to your personal library to read,
                                highlight, and track progress. Please only
                                upload content you have the right to use.
                            </p>
                        </div>
                    )}

                    {filters.scope === 'mine' && auth.user && (
                        <StatusFilters
                            active={activeStatus}
                            libraryFilters={filters}
                        />
                    )}

                    {books.data.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
                            <BookOpen className="mx-auto size-12 text-muted-foreground/30" />
                            <p className="mt-4 text-muted-foreground">
                                {filters.scope === 'mine'
                                    ? 'Your library is empty. Add your first book!'
                                    : 'No public books found.'}
                            </p>
                            {auth.user && filters.scope === 'mine' && (
                                <Button
                                    className="mt-4"
                                    onClick={() => setAddBookOpen(true)}
                                >
                                    <Plus className="size-4" />
                                    Add book
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

LibraryIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default LibraryIndex;
