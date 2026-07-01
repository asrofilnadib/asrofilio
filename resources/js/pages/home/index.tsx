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

import { LibraryBrowse } from '@/components/asrofilio/library-browse';
import type { LibraryFilters } from '@/components/asrofilio/library-sidebar';
import { LoadingAsrofilio } from '@/components/asrofilio/loading-asrofilio';
import { AddBookModal } from '@/components/modals/add-book-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { paths } from '@/lib/paths';
import { home } from '@/routes';
import {
    formatReadingTime,
    formatRelativeDate,
    formatTodayDate,
    getGreeting,
} from '@/lib/time';
import type { Auth } from '@/types/auth';
import type {
    Book,
    Genre,
    Highlight,
    Paginated,
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

type InspirationalQuote = {
    text: string;
    author: string;
    theme: string;
};

type HomeProps = {
    auth: Auth;
    inspirationalQuote?: InspirationalQuote;
    books?: Paginated<Book & { user_book?: UserBook | null; userBooks?: UserBook[] }>;
    genres?: Genre[];
    counts?: { mine: number; public: number };
    filters?: LibraryFilters & { scope: 'mine' | 'public' };
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

function GuestHome({
    books,
    genres,
    counts,
    filters,
}: Required<Pick<HomeProps, 'books' | 'genres' | 'counts' | 'filters'>>) {
    return (
        <LibraryBrowse
            basePath={home.url()}
            books={books}
            genres={genres}
            counts={counts}
            filters={filters}
            isGuest
            showPublicBanner
        />
    );
}

function DashboardHome({
    auth,
    inspirationalQuote,
    stats,
    currentlyReading,
    recentHighlights,
    recentVocabulary,
}: HomeProps) {
    const [addBookOpen, setAddBookOpen] = useState(false);
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

            {inspirationalQuote && (
                <blockquote className="mb-10 border-l-2 border-primary/40 pl-5">
                    <p className="mb-2 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                        {inspirationalQuote.theme.charAt(0).toUpperCase() +
                            inspirationalQuote.theme.slice(1)}
                    </p>
                    <p className="font-serif text-lg leading-relaxed text-foreground/90 italic">
                        &ldquo;{inspirationalQuote.text}&rdquo;
                    </p>
                    <footer className="mt-2 text-xs font-semibold tracking-widest text-primary uppercase">
                        {inspirationalQuote.author}
                    </footer>
                    <p className="mt-3 text-[10px] text-muted-foreground">
                        Inspirational quotes provided by{' '}
                        <a
                            href="https://zenquotes.io/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-foreground"
                        >
                            ZenQuotes API
                        </a>
                    </p>
                </blockquote>
            )}

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
                                                        featured.book.uuid,
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
            {isGuest &&
            props.books &&
            props.genres &&
            props.counts &&
            props.filters ? (
                <GuestHome
                    books={props.books}
                    genres={props.genres}
                    counts={props.counts}
                    filters={props.filters}
                />
            ) : (
                <DashboardHome {...props} />
            )}
        </>
    );
}

Home.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default Home;
