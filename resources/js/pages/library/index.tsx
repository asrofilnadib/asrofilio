import { Head, router, usePage } from '@inertiajs/react';
import { BookOpen, Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { BookCard } from '@/components/asrofilio/book-card';
import { BookGrid } from '@/components/asrofilio/book-grid';
import { LibrarySidebar } from '@/components/asrofilio/library-sidebar';
import { StatusFilters } from '@/components/asrofilio/status-filters';
import { AddBookModal } from '@/components/modals/add-book-modal';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { Auth } from '@/types/auth';
import type {
    Book,
    Genre,
    Paginated,
    ReadingStatus,
    UserBook,
} from '@/types/book';

type LibraryIndexProps = {
    books: Paginated<Book & { user_book?: UserBook | null }>;
    genres: Genre[];
    filters: {
        scope: 'mine' | 'public';
        status?: ReadingStatus | null;
        genre?: string | null;
    };
};

function LibraryIndex({ books, genres, filters }: LibraryIndexProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [addBookOpen, setAddBookOpen] = useState(false);
    const activeStatus = filters.status ?? 'all';

    return (
        <>
            <Head title="Library" />

            <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 lg:px-8">
                <LibrarySidebar
                    scope={filters.scope}
                    genres={genres}
                    selectedGenre={filters.genre}
                />

                <div className="min-w-0 flex-1 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="font-serif text-3xl font-bold">
                                {filters.scope === 'mine'
                                    ? 'My Library'
                                    : 'Public Library'}
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {books.total} book{books.total !== 1 ? 's' : ''}
                            </p>
                        </div>
                        {auth.user && filters.scope === 'mine' && (
                            <Button onClick={() => setAddBookOpen(true)}>
                                <Plus className="size-4" />
                                Add book
                            </Button>
                        )}
                    </div>

                    {filters.scope === 'mine' && auth.user && (
                        <StatusFilters active={activeStatus} />
                    )}

                    <BookGrid
                        isEmpty={books.data.length === 0}
                        empty={
                            <div className="space-y-3">
                                <BookOpen className="mx-auto size-12 text-muted-foreground/30" />
                                <p className="text-muted-foreground">
                                    {filters.scope === 'mine'
                                        ? 'Your library is empty. Add your first book!'
                                        : 'No public books found.'}
                                </p>
                                {auth.user && filters.scope === 'mine' && (
                                    <Button
                                        onClick={() => setAddBookOpen(true)}
                                    >
                                        <Plus className="size-4" />
                                        Add book
                                    </Button>
                                )}
                            </div>
                        }
                    >
                        {books.data.map((book) => (
                            <BookCard
                                key={book.id}
                                book={book}
                                userBook={book.user_book}
                            />
                        ))}
                    </BookGrid>

                    {books.last_page > 1 && (
                        <div className="flex justify-center gap-2 pt-4">
                            {books.links.map((link, i) => (
                                <Button
                                    key={i}
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    size="sm"
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
