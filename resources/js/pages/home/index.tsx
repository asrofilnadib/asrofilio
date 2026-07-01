import { Deferred, Head, Link } from '@inertiajs/react';
import { BookOpen, Plus, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { BookCard } from '@/components/asrofilio/book-card';
import { BookGrid } from '@/components/asrofilio/book-grid';
import { LoadingAsrofilio } from '@/components/asrofilio/loading-asrofilio';
import { AddBookModal } from '@/components/modals/add-book-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { paths } from '@/lib/paths';
import { login } from '@/routes';
import type { Auth } from '@/types/auth';
import type { Book, UserBook } from '@/types/book';

type HomeProps = {
    auth: Auth;
    recentlyAdded?: Book[];
    currentlyReading?: Array<{ book: Book; user_book: UserBook }>;
    stats?: {
        total_books: number;
        books_completed: number;
        reading_streak: number;
    };
};

function Home({ auth, recentlyAdded, currentlyReading, stats }: HomeProps) {
    const [addBookOpen, setAddBookOpen] = useState(false);
    const isGuest = !auth.user;

    return (
        <>
            <Head title="Home" />

            <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
                <section className="mb-10 rounded-2xl border border-border bg-card p-8 lg:p-12">
                    <div className="max-w-2xl">
                        <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
                            Your personal reading sanctuary
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Track your library, highlight passages, build
                            vocabulary, and dive into EPUB & PDF readers — all
                            in one place.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            {isGuest ? (
                                <>
                                    <Button size="lg" asChild>
                                        <Link href={login.url()}>
                                            Get started
                                        </Link>
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        asChild
                                    >
                                        <Link href={paths.library}>
                                            Browse public library
                                        </Link>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        size="lg"
                                        onClick={() => setAddBookOpen(true)}
                                    >
                                        <Plus className="size-4" />
                                        Add a book
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        asChild
                                    >
                                        <Link href={paths.library}>
                                            My library
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {!isGuest && stats && (
                    <div className="mb-10 grid gap-4 sm:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Library
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">
                                    {stats.total_books}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    books saved
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Completed
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">
                                    {stats.books_completed}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    books finished
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Streak
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="flex items-center gap-2 text-3xl font-bold">
                                    <TrendingUp className="size-6 text-primary" />
                                    {stats.reading_streak}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    day reading streak
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {!isGuest && (
                    <section className="mb-10">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-serif text-2xl font-semibold">
                                Currently reading
                            </h2>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={paths.library}>View all</Link>
                            </Button>
                        </div>
                        <Deferred
                            data="currentlyReading"
                            fallback={<LoadingAsrofilio variant="grid" />}
                        >
                            <BookGrid
                                isEmpty={!currentlyReading?.length}
                                empty={
                                    <div className="space-y-2">
                                        <BookOpen className="mx-auto size-10 text-muted-foreground/40" />
                                        <p className="text-muted-foreground">
                                            No books in progress. Add one to
                                            get started!
                                        </p>
                                    </div>
                                }
                            >
                                {currentlyReading?.map(({ book, user_book }) => (
                                    <BookCard
                                        key={book.id}
                                        book={book}
                                        userBook={user_book}
                                    />
                                ))}
                            </BookGrid>
                        </Deferred>
                    </section>
                )}

                <section>
                    <h2 className="mb-4 font-serif text-2xl font-semibold">
                        {isGuest ? 'Public library' : 'Recently added'}
                    </h2>
                    <Deferred
                        data="recentlyAdded"
                        fallback={<LoadingAsrofilio variant="grid" />}
                    >
                        <BookGrid
                            isEmpty={!recentlyAdded?.length}
                            empty={
                                <p className="text-muted-foreground">
                                    No books to show yet.
                                </p>
                            }
                        >
                            {recentlyAdded?.map((book) => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </BookGrid>
                    </Deferred>
                </section>
            </div>

            <AddBookModal
                open={addBookOpen}
                onOpenChange={setAddBookOpen}
            />
        </>
    );
}

Home.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default Home;
