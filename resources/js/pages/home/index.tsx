import { Deferred, Head, Link } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    Clock,
    Library,
    Plus,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { LoadingAsrofilio } from '@/components/asrofilio/loading-asrofilio';
import { AddBookModal } from '@/components/modals/add-book-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { getDailyQuote } from '@/lib/quotes';
import { paths } from '@/lib/paths';
import {
    formatReadingTime,
    formatRelativeDate,
    formatTodayDate,
    getGreeting,
} from '@/lib/time';
import { login } from '@/routes';
import type { Auth } from '@/types/auth';
import type {
    Book,
    Highlight,
    UserBook,
    VocabularyItem,
} from '@/types/book';

type DashboardStats = {
    library_total: number;
    books_completed: number;
    total_reading_seconds: number;
    books_this_month: number;
    books_this_year: number;
    books_all_time: number;
    average_session_minutes: number;
};

type HomeProps = {
    auth: Auth;
    recentlyAdded?: Book[];
    currentlyReading?: Array<{ book: Book; user_book: UserBook }>;
    recentHighlights?: Highlight[];
    recentVocabulary?: VocabularyItem[];
    stats?: DashboardStats;
};

function SectionLabel({ children }: { children: ReactNode }) {
    return (
        <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            {children}
        </p>
    );
}

function GuestHome({ recentlyAdded }: Pick<HomeProps, 'recentlyAdded'>) {
    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
            <section className="mb-10 rounded-2xl border border-border bg-card p-8 lg:p-12">
                <div className="max-w-2xl">
                    <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
                        Your personal reading sanctuary
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Track your library, highlight passages, build
                        vocabulary, and dive into EPUB & PDF readers — all in
                        one place.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Button size="lg" asChild>
                            <Link href={login.url()}>Get started</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href={paths.library}>
                                Browse public library
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="mb-4 font-serif text-2xl font-semibold">
                    Public library
                </h2>
                <Deferred
                    data="recentlyAdded"
                    fallback={<LoadingAsrofilio variant="grid" />}
                >
                    {!recentlyAdded?.length ? (
                        <p className="text-muted-foreground">
                            No books to show yet.
                        </p>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {recentlyAdded.map((book) => (
                                <Link
                                    key={book.id}
                                    href={paths.libraryShow(book.id)}
                                    className="rounded-xl border border-border/70 bg-card p-4 transition-shadow hover:shadow-md"
                                >
                                    <p className="font-serif font-semibold">
                                        {book.title}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {book.author}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    )}
                </Deferred>
            </section>
        </div>
    );
}

function DashboardHome({
    auth,
    stats,
    currentlyReading,
    recentHighlights,
    recentVocabulary,
}: HomeProps) {
    const [addBookOpen, setAddBookOpen] = useState(false);
    const quote = getDailyQuote();
    const featured = currentlyReading?.find((item) => item.book != null);

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
            <header className="mb-8">
                <h1 className="font-serif text-3xl font-bold tracking-tight lg:text-4xl">
                    {getGreeting()}, {auth.user?.name?.split(' ')[0]}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {formatTodayDate()}
                </p>
            </header>

            <blockquote className="mb-10 border-l-2 border-primary/40 pl-5">
                <p className="font-serif text-lg leading-relaxed text-foreground/90 italic">
                    &ldquo;{quote.text}&rdquo;
                </p>
                <footer className="mt-2 text-xs font-semibold tracking-widest text-primary uppercase">
                    {quote.author}
                </footer>
            </blockquote>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
                        <CardContent className="p-6">
                            <SectionLabel>Currently reading</SectionLabel>

                            <Deferred
                                data="currentlyReading"
                                fallback={
                                    <div className="mt-4">
                                        <LoadingAsrofilio variant="card" />
                                    </div>
                                }
                            >
                                {featured ? (
                                    <div className="mt-4 space-y-5">
                                        <div className="flex gap-5">
                                            <div className="h-36 w-24 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted shadow-sm">
                                                {featured.book.cover_url ? (
                                                    <img
                                                        src={
                                                            featured.book
                                                                .cover_url
                                                        }
                                                        alt=""
                                                        className="size-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex size-full items-center justify-center">
                                                        <BookOpen className="size-8 text-muted-foreground/30" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h2 className="font-serif text-xl font-semibold leading-snug">
                                                    {featured.book.title}
                                                </h2>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {featured.book.author}
                                                </p>
                                                <div className="mt-4 space-y-2">
                                                    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                                                        <div
                                                            className="h-full rounded-full bg-primary transition-all"
                                                            style={{
                                                                width: `${featured.user_book.progress_percent}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                        <span>
                                                            {
                                                                featured
                                                                    .user_book
                                                                    .progress_percent
                                                            }
                                                            % complete
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="size-3" />
                                                            {formatRelativeDate(
                                                                featured
                                                                    .user_book
                                                                    .updated_at,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {featured.book.file_type && (
                                            <Button
                                                className="w-full"
                                                size="lg"
                                                asChild
                                            >
                                                <Link
                                                    href={paths.reader(
                                                        featured.book.id,
                                                    )}
                                                >
                                                    Continue reading
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mt-4 rounded-xl border border-dashed border-border bg-secondary/30 px-6 py-10 text-center">
                                        <BookOpen className="mx-auto size-10 text-muted-foreground/30" />
                                        <p className="mt-3 text-muted-foreground">
                                            No books in progress yet.
                                        </p>
                                        <Button
                                            className="mt-4"
                                            onClick={() =>
                                                setAddBookOpen(true)
                                            }
                                        >
                                            <Plus className="size-4" />
                                            Add a book
                                        </Button>
                                    </div>
                                )}
                            </Deferred>
                        </CardContent>
                    </Card>

                    <Card className="border-border/70 bg-card shadow-sm">
                        <CardContent className="p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <SectionLabel>Recent highlights</SectionLabel>
                                <Link
                                    href={paths.highlights}
                                    className="text-xs font-medium text-primary hover:underline"
                                >
                                    View all →
                                </Link>
                            </div>

                            <Deferred
                                data="recentHighlights"
                                fallback={<LoadingAsrofilio variant="list" />}
                            >
                                {!recentHighlights?.length ? (
                                    <p className="text-sm text-muted-foreground">
                                        No highlights yet. Start reading and
                                        save passages you love.
                                    </p>
                                ) : (
                                    <ul className="space-y-4">
                                        {recentHighlights.map((highlight) => (
                                            <li
                                                key={highlight.id}
                                                className="border-l-[3px] border-primary/50 pl-4"
                                            >
                                                <p className="font-serif text-sm leading-relaxed italic">
                                                    &ldquo;{highlight.text}
                                                    &rdquo;
                                                </p>
                                                {highlight.book && (
                                                    <p className="mt-2 text-xs text-muted-foreground">
                                                        {highlight.book.title}
                                                        {highlight.chapter_title &&
                                                            ` · ${highlight.chapter_title}`}
                                                    </p>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Deferred>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {stats && (
                        <Card className="border-border/70 bg-card shadow-sm">
                            <CardContent className="p-6">
                                <SectionLabel>Reading stats</SectionLabel>
                                <ul className="mt-4 space-y-3">
                                    <li className="flex items-center justify-between gap-3 text-sm">
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <Clock className="size-4 text-primary/70" />
                                            Total reading time
                                        </span>
                                        <span className="font-semibold tabular-nums">
                                            {formatReadingTime(
                                                stats.total_reading_seconds,
                                            )}
                                        </span>
                                    </li>
                                    <li className="flex items-center justify-between gap-3 text-sm">
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <Library className="size-4 text-primary/70" />
                                            This month
                                        </span>
                                        <span className="font-semibold tabular-nums">
                                            {stats.books_this_month}{' '}
                                            {stats.books_this_month === 1
                                                ? 'book'
                                                : 'books'}
                                        </span>
                                    </li>
                                    <li className="flex items-center justify-between gap-3 text-sm">
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <BookOpen className="size-4 text-primary/70" />
                                            This year
                                        </span>
                                        <span className="font-semibold tabular-nums">
                                            {stats.books_this_year}{' '}
                                            {stats.books_this_year === 1
                                                ? 'book'
                                                : 'books'}
                                        </span>
                                    </li>
                                    <li className="flex items-center justify-between gap-3 text-sm">
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <BarChart3 className="size-4 text-primary/70" />
                                            All time
                                        </span>
                                        <span className="font-semibold tabular-nums">
                                            {stats.books_all_time}{' '}
                                            {stats.books_all_time === 1
                                                ? 'book'
                                                : 'books'}
                                        </span>
                                    </li>
                                </ul>
                                <p className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                                    {stats.library_total} in library ·{' '}
                                    {stats.books_completed} completed
                                    {stats.average_session_minutes > 0 && (
                                        <>
                                            {' '}
                                            · Avg. session:{' '}
                                            {stats.average_session_minutes}m
                                        </>
                                    )}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="border-border/70 bg-card shadow-sm">
                        <CardContent className="p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <SectionLabel>Saved vocabulary</SectionLabel>
                                <Link
                                    href={paths.vocabulary}
                                    className="text-xs font-medium text-primary hover:underline"
                                >
                                    View all →
                                </Link>
                            </div>

                            <Deferred
                                data="recentVocabulary"
                                fallback={<LoadingAsrofilio variant="list" />}
                            >
                                {!recentVocabulary?.length ? (
                                    <p className="text-sm text-muted-foreground">
                                        No vocabulary saved yet.
                                    </p>
                                ) : (
                                    <ul className="space-y-4">
                                        {recentVocabulary.map((item) => (
                                            <li key={item.id}>
                                                <p className="font-serif text-base font-semibold">
                                                    {item.word}
                                                </p>
                                                {item.definition && (
                                                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                                        {item.definition}
                                                    </p>
                                                )}
                                                {item.book && (
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        from {item.book.title}
                                                    </p>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Deferred>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AddBookModal
                open={addBookOpen}
                onOpenChange={setAddBookOpen}
            />
        </div>
    );
}

function Home(props: HomeProps) {
    const isGuest = !props.auth.user;

    return (
        <>
            <Head title="Home" />
            {isGuest ? (
                <GuestHome recentlyAdded={props.recentlyAdded} />
            ) : (
                <DashboardHome {...props} />
            )}
        </>
    );
}

Home.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default Home;
