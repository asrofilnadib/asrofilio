import { router } from '@inertiajs/react';
import { Book, BookOpen, ChevronDown } from 'lucide-react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Genre, ReadingStatus } from '@/types/book';

type LibraryFilters = {
    scope: 'mine' | 'public';
    genre?: string | null;
    status?: ReadingStatus | null;
    search?: string | null;
};

type LibrarySidebarProps = {
    scope: 'mine' | 'public';
    genres: Genre[];
    counts: { mine: number; public: number };
    totalBooks: number;
    filters: LibraryFilters;
};

function LibrarySidebar({
    scope,
    genres,
    counts,
    totalBooks,
    filters,
}: LibrarySidebarProps) {
    function navigate(overrides: Partial<LibraryFilters>) {
        const nextScope = overrides.scope ?? scope;
        const nextGenre = overrides.genre !== undefined ? overrides.genre : filters.genre;
        const nextStatus = overrides.status !== undefined ? overrides.status : filters.status;
        const nextSearch = overrides.search !== undefined ? overrides.search : filters.search;

        router.get(
            window.location.pathname,
            {
                scope: nextScope,
                genre: nextGenre ?? undefined,
                status: nextStatus ?? undefined,
                search: nextSearch ?? undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    const genreList = Array.isArray(genres) ? genres : [];

    return (
        <aside className="flex w-full shrink-0 flex-col lg:sticky lg:top-24 lg:w-60 lg:self-start">
            <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
                <p className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    Library
                </p>
                <div className="space-y-1.5">
                    <button
                        type="button"
                        onClick={() => navigate({ scope: 'mine' })}
                        className={cn(
                            'flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all',
                            scope === 'mine'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-foreground hover:bg-accent/80',
                        )}
                    >
                        <span className="flex items-center gap-2">
                            <BookOpen className="size-4" />
                            My Library
                        </span>
                        <span
                            className={cn(
                                'rounded-full px-2 py-0.5 text-xs tabular-nums',
                                scope === 'mine'
                                    ? 'bg-primary-foreground/20 text-primary-foreground'
                                    : 'bg-secondary text-muted-foreground',
                            )}
                        >
                            {counts.mine}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate({ scope: 'public' })}
                        className={cn(
                            'flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all',
                            scope === 'public'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-foreground hover:bg-accent/80',
                        )}
                    >
                        <span className="flex items-center gap-2">
                            <Book className="size-4" />
                            Public Library
                        </span>
                        <span
                            className={cn(
                                'rounded-full px-2 py-0.5 text-xs tabular-nums',
                                scope === 'public'
                                    ? 'bg-primary-foreground/20 text-primary-foreground'
                                    : 'bg-secondary text-muted-foreground',
                            )}
                        >
                            {counts.public}
                        </span>
                    </button>
                </div>
            </div>

            <div className="mt-4 rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                        Genre
                    </p>
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                </div>
                <ScrollArea className="max-h-[min(24rem,calc(100vh-22rem))] pr-2">
                    <div className="space-y-0.5">
                        <button
                            type="button"
                            onClick={() => navigate({ genre: null })}
                            className={cn(
                                'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                                !filters.genre
                                    ? 'bg-primary/10 font-medium text-primary'
                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                            )}
                        >
                            All
                        </button>
                        {genreList.map((genre) => (
                            <button
                                key={genre.id}
                                type="button"
                                onClick={() => navigate({ genre: genre.slug })}
                                className={cn(
                                    'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                                    filters.genre === genre.slug
                                        ? 'bg-primary/10 font-medium text-primary'
                                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                                )}
                            >
                                {genre.name}
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            <div className="mt-4 rounded-2xl border border-border/70 bg-secondary/60 p-5 text-center shadow-sm">
                <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Book className="size-4" />
                </div>
                <p className="text-2xl font-bold tabular-nums">{totalBooks}</p>
                <p className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Total books
                </p>
            </div>
        </aside>
    );
}

export { LibrarySidebar };
export type { LibraryFilters };
