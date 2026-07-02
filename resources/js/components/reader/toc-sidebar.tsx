import { Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { BookChapter } from '@/types/book';

type ReaderBookmark = {
    id: number;
    label?: string | null;
    chapter_title?: string | null;
    cfi_location: string;
};

type TocSidebarProps = {
    chapters: BookChapter[];
    bookmarks?: ReaderBookmark[];
    activeHref?: string | null;
    activePage?: number;
    onSelect?: (chapter: BookChapter) => void;
    onBookmarkSelect?: (bookmark: ReaderBookmark) => void;
    className?: string;
};

function parsePage(href?: string | null): number | null {
    const match = href?.match(/^page:(\d+)$/);

    return match ? Number.parseInt(match[1], 10) : null;
}

function isChapterActive(
    chapter: BookChapter,
    activeHref?: string | null,
    activePage?: number,
): boolean {
    if (activeHref && chapter.href === activeHref) {
        return true;
    }

    const page = parsePage(chapter.href);

    return page !== null && activePage === page;
}

function TocSidebar({
    chapters,
    bookmarks = [],
    activeHref,
    activePage,
    onSelect,
    onBookmarkSelect,
    className,
}: TocSidebarProps) {
    const [tab, setTab] = useState<'contents' | 'bookmarks'>('contents');

    function renderChapter(chapter: BookChapter) {
        const active = isChapterActive(chapter, activeHref, activePage);

        return (
            <div key={chapter.id}>
                <button
                    type="button"
                    onClick={() => onSelect?.(chapter)}
                    className={cn(
                        'w-full rounded-md py-2 pr-3 text-left text-sm transition-colors',
                        active
                            ? 'bg-primary/15 font-medium text-primary'
                            : 'text-muted-foreground hover:bg-accent/70 hover:text-foreground',
                    )}
                    style={{
                        paddingLeft: `${(chapter.level - 1) * 14 + 12}px`,
                    }}
                >
                    {chapter.title}
                </button>
                {chapter.children?.map(renderChapter)}
            </div>
        );
    }

    return (
        <aside
            className={cn(
                'flex w-72 shrink-0 flex-col border-r border-border/60 bg-[#ebe5d8]/90',
                className,
            )}
        >
            <div className="flex border-b border-border/60">
                <button
                    type="button"
                    onClick={() => setTab('contents')}
                    className={cn(
                        'flex-1 px-4 py-3 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors',
                        tab === 'contents'
                            ? 'border-b-2 border-primary text-foreground'
                            : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    Contents
                </button>
                <button
                    type="button"
                    onClick={() => setTab('bookmarks')}
                    className={cn(
                        'flex-1 px-4 py-3 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors',
                        tab === 'bookmarks'
                            ? 'border-b-2 border-primary text-foreground'
                            : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    Bookmarks
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {tab === 'contents' ? (
                    chapters.length > 0 ? (
                        chapters.map(renderChapter)
                    ) : (
                        <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                            No table of contents
                        </p>
                    )
                ) : bookmarks.length > 0 ? (
                    <div className="space-y-1">
                        {bookmarks.map((bookmark) => (
                            <button
                                key={bookmark.id}
                                type="button"
                                onClick={() => onBookmarkSelect?.(bookmark)}
                                className="flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground"
                            >
                                <Bookmark className="mt-0.5 size-3.5 shrink-0" />
                                <span>
                                    {bookmark.label ||
                                        bookmark.chapter_title ||
                                        bookmark.cfi_location}
                                </span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                        No bookmarks yet
                    </p>
                )}
            </div>
        </aside>
    );
}

export { TocSidebar };
export type { ReaderBookmark, TocSidebarProps };
