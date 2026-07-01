import { router } from '@inertiajs/react';
import { Book, BookOpen } from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { login } from '@/routes';
import type { Genre, ReadingStatus } from '@/types/book';

type LibraryFilters = {
    scope: 'mine' | 'public';
    genres?: string[] | null;
    status?: ReadingStatus | null;
    search?: string | null;
};

type LibrarySidebarProps = {
    basePath: string;
    scope: 'mine' | 'public';
    genres: Genre[];
    counts: { mine: number; public: number };
    totalBooks: number;
    filters: LibraryFilters;
    isGuest?: boolean;
};

function LibrarySidebar({
    basePath,
    scope,
    genres,
    counts,
    totalBooks,
    filters,
    isGuest = false,
}: LibrarySidebarProps) {
    const genreList = Array.isArray(genres) ? genres : [];
    const allSlugs = genreList.map((genre) => genre.slug);

    function isGenreChecked(slug: string): boolean {
        if (!filters.genres || filters.genres.length === 0) {
            return true;
        }

        if (filters.genres.length >= allSlugs.length) {
            return true;
        }

        return filters.genres.includes(slug);
    }

    function navigate(overrides: Partial<LibraryFilters> & { scope?: 'mine' | 'public' }) {
        const nextScope = overrides.scope ?? scope;
        const nextGenres = overrides.genres !== undefined ? overrides.genres : filters.genres;
        const nextStatus = overrides.status !== undefined ? overrides.status : filters.status;
        const nextSearch = overrides.search !== undefined ? overrides.search : filters.search;

        router.get(
            basePath,
            {
                scope: nextScope,
                genres: nextGenres && nextGenres.length > 0 ? nextGenres : undefined,
                status: nextStatus ?? undefined,
                search: nextSearch ?? undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    function toggleGenre(slug: string) {
        const checkedSlugs = genreList
            .filter((genre) => isGenreChecked(genre.slug))
            .map((genre) => genre.slug);

        let nextChecked: string[];
        if (checkedSlugs.includes(slug)) {
            nextChecked = checkedSlugs.filter((item) => item !== slug);
        } else {
            nextChecked = [...checkedSlugs, slug];
        }

        const genresParam =
            nextChecked.length === 0 || nextChecked.length === allSlugs.length
                ? null
                : nextChecked;

        navigate({ genres: genresParam });
    }

    function handleScopeChange(next: 'mine' | 'public') {
        if (isGuest && next === 'mine') {
            router.get(login.url());
            return;
        }

        navigate({ scope: next });
    }

    return (
        <aside className="flex w-full shrink-0 flex-col lg:sticky lg:top-24 lg:w-60 lg:self-start">
            <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
                <p className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    Library
                </p>
                <div className="space-y-1.5">
                    <button
                        type="button"
                        onClick={() => handleScopeChange('mine')}
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
                        onClick={() => handleScopeChange('public')}
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
                <p className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    Genre
                </p>
                <ScrollArea className="max-h-[min(28rem,calc(100vh-22rem))] pr-2">
                    <div className="space-y-2">
                        {genreList.map((genre) => (
                            <label
                                key={genre.id}
                                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-accent/60"
                            >
                                <Checkbox
                                    checked={isGenreChecked(genre.slug)}
                                    onCheckedChange={() =>
                                        toggleGenre(genre.slug)
                                    }
                                />
                                <span className="text-foreground">
                                    {genre.name}
                                </span>
                            </label>
                        ))}
                        {genreList.length === 0 && (
                            <p className="px-2 text-xs text-muted-foreground">
                                No genres available
                            </p>
                        )}
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
