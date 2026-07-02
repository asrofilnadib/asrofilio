import { Bookmark } from 'lucide-react';
import { useState } from 'react';

import {
    readerBorderColor,
    readerForeground,
    readerMutedForeground,
    readerSidebarBackground,
} from '@/lib/reader-theme';
import { cn } from '@/lib/utils';
import type { BookChapter } from '@/types/book';
import type { ReaderTheme } from '@/types/reader';

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
    theme?: ReaderTheme;
    className?: string;
};

function chapterStyle(
    level: number,
    active: boolean,
    theme: ReaderTheme,
): { fontWeight: number; color: string; fontSize?: string } {
    if (active) {
        return {
            fontWeight: 500,
            color: '#c4a882',
        };
    }

    if (level <= 1) {
        return {
            fontWeight: 600,
            color: readerForeground(theme),
        };
    }

    if (level === 2) {
        return {
            fontWeight: 500,
            color: readerForeground(theme),
            fontSize: '0.875rem',
        };
    }

    return {
        fontWeight: 400,
        color: readerMutedForeground(theme),
        fontSize: '13px',
    };
}

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
    theme = 'sepia',
    className,
}: TocSidebarProps) {
    const [tab, setTab] = useState<'contents' | 'bookmarks'>('contents');
    const foreground = readerForeground(theme);
    const muted = readerMutedForeground(theme);
    const borderColor = readerBorderColor(theme);

    function renderChapter(chapter: BookChapter) {
        const active = isChapterActive(chapter, activeHref, activePage);
        const typography = chapterStyle(chapter.level, active, theme);

        return (
            <div key={chapter.id}>
                <button
                    type="button"
                    onClick={() => onSelect?.(chapter)}
                    className={cn(
                        'w-full rounded-md py-2 pr-3 text-left text-sm transition-colors',
                        active ? 'bg-primary/15' : 'hover:bg-black/5',
                    )}
                    style={{
                        paddingLeft: `${(chapter.level - 1) * 14 + 12}px`,
                        ...typography,
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
            className={cn('flex w-72 shrink-0 flex-col', className)}
            style={{
                backgroundColor: readerSidebarBackground(theme),
                borderRight: `1px solid ${borderColor}`,
            }}
        >
            <div
                className="flex"
                style={{ borderBottom: `1px solid ${borderColor}` }}
            >
                <button
                    type="button"
                    onClick={() => setTab('contents')}
                    className="flex-1 px-4 py-3 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors"
                    style={{
                        color: tab === 'contents' ? foreground : muted,
                        borderBottom:
                            tab === 'contents'
                                ? '2px solid #c4a882'
                                : '2px solid transparent',
                    }}
                >
                    Contents
                </button>
                <button
                    type="button"
                    onClick={() => setTab('bookmarks')}
                    className="flex-1 px-4 py-3 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors"
                    style={{
                        color: tab === 'bookmarks' ? foreground : muted,
                        borderBottom:
                            tab === 'bookmarks'
                                ? '2px solid #c4a882'
                                : '2px solid transparent',
                    }}
                >
                    Bookmarks
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {tab === 'contents' ? (
                    chapters.length > 0 ? (
                        chapters.map(renderChapter)
                    ) : (
                        <p
                            className="px-3 py-8 text-center text-sm"
                            style={{ color: muted }}
                        >
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
                                className="flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-black/5"
                                style={{ color: muted }}
                            >
                                <Bookmark
                                    className="mt-0.5 size-3.5 shrink-0"
                                    style={{ color: muted }}
                                />
                                <span style={{ color: foreground }}>
                                    {bookmark.label ||
                                        bookmark.chapter_title ||
                                        bookmark.cfi_location}
                                </span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <p
                        className="px-3 py-8 text-center text-sm"
                        style={{ color: muted }}
                    >
                        No bookmarks yet
                    </p>
                )}
            </div>
        </aside>
    );
}

export { TocSidebar };
export type { ReaderBookmark, TocSidebarProps };
