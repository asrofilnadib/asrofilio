import { router } from '@inertiajs/react';
import { Book, BookOpen } from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import { useI18n } from '@/lib/i18n';
import { buildLibraryQuery } from '@/lib/library-query';
import { cn } from '@/lib/utils';
import { login } from '@/routes';
import type { Genre, ReadingStatus } from '@/types/book';

type LibrarySort =
    | 'newest'
    | 'oldest'
    | 'title_asc'
    | 'title_desc'
    | 'author_asc'
    | 'author_desc';

type LibraryFilters = {
    scope: 'mine' | 'public';
    genres?: string[] | null;
    status?: ReadingStatus | null;
    search?: string | null;
    sort?: LibrarySort | null;
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
    const { t } = useI18n();
    const genreList = Array.isArray(genres) ? genres : [];

    function isGenreChecked(slug: string): boolean {
        return filters.genres?.includes(slug) ?? false;
    }

    function navigate(
        overrides: Partial<LibraryFilters> & { scope?: 'mine' | 'public' },
    ) {
        router.get(
            basePath,
            buildLibraryQuery(
                { ...filters, scope },
                overrides,
            ),
            { preserveState: true, preserveScroll: true },
        );
    }

    function toggleGenre(slug: string) {
        const current = filters.genres ?? [];
        const nextChecked = current.includes(slug)
            ? current.filter((item) => item !== slug)
            : [...current, slug];

        const genresParam =
            nextChecked.length === 0 ||
            nextChecked.length >= genreList.length
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
                            {t('library_my')}
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
                            {t('library_public')}
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
                    {t('library_genre')}
                </p>
                <div className="space-y-0.5">
                    {genreList.map((genre) => (
                        <label
                            key={genre.id}
                            className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent/60"
                        >
                            <Checkbox
                                className="shrink-0"
                                checked={isGenreChecked(genre.slug)}
                                onCheckedChange={() =>
                                    toggleGenre(genre.slug)
                                }
                            />
                            <span className="leading-snug text-foreground">
                                {genre.name}
                            </span>
                        </label>
                    ))}
                    {genreList.length === 0 && (
                        <p className="px-2 py-2 text-xs text-muted-foreground">
                            {t('library_no_genres')}
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-4 rounded-2xl border border-border/70 bg-secondary/60 p-5 text-center shadow-sm">
                <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Book className="size-4" />
                </div>
                <p className="text-2xl font-bold tabular-nums">{totalBooks}</p>
                <p className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    {t('library_total_books')}
                </p>
            </div>
        </aside>
    );
}

export { LibrarySidebar };
export type { LibraryFilters, LibrarySort };
