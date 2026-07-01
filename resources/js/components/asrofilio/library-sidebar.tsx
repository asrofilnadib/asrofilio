import { router } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Genre } from '@/types/book';

type LibrarySidebarProps = {
    scope: 'mine' | 'public';
    genres: Genre[];
    selectedGenre?: string | null;
    onScopeChange?: (scope: 'mine' | 'public') => void;
};

function LibrarySidebar({
    scope,
    genres,
    selectedGenre,
    onScopeChange,
}: LibrarySidebarProps) {
    function setScope(next: 'mine' | 'public') {
        if (onScopeChange) {
            onScopeChange(next);
            return;
        }

        router.get(
            window.location.pathname,
            { scope: next, genre: selectedGenre ?? undefined },
            { preserveState: true, preserveScroll: true },
        );
    }

    function setGenre(slug: string | null) {
        router.get(
            window.location.pathname,
            { scope, genre: slug ?? undefined },
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <aside className="w-full shrink-0 space-y-6 lg:w-56">
            <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Library
                </Label>
                <div className="flex rounded-lg border border-border p-1">
                    <Button
                        type="button"
                        variant={scope === 'mine' ? 'default' : 'ghost'}
                        size="sm"
                        className="flex-1"
                        onClick={() => setScope('mine')}
                    >
                        My Library
                    </Button>
                    <Button
                        type="button"
                        variant={scope === 'public' ? 'default' : 'ghost'}
                        size="sm"
                        className="flex-1"
                        onClick={() => setScope('public')}
                    >
                        Public
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Genres
                </Label>
                <ScrollArea className="h-[calc(100vh-16rem)] pr-3">
                    <div className="space-y-1">
                        <button
                            type="button"
                            onClick={() => setGenre(null)}
                            className={cn(
                                'w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                                !selectedGenre
                                    ? 'bg-primary/10 font-medium text-primary'
                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                            )}
                        >
                            All genres
                        </button>
                        {(Array.isArray(genres) ? genres : []).map((genre) => (
                            <button
                                key={genre.id}
                                type="button"
                                onClick={() => setGenre(genre.slug)}
                                className={cn(
                                    'w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                                    selectedGenre === genre.slug
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
        </aside>
    );
}

export { LibrarySidebar };
