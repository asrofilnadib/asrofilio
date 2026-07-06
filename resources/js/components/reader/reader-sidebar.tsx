import { Bookmark, MoreVertical, StickyNote } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    readerBorderColor,
    readerForeground,
    readerMutedForeground,
    readerSidebarBackground,
} from '@/lib/reader-theme';
import { parsePageFromCfi } from '@/lib/pdf-highlight';
import { cn } from '@/lib/utils';
import type { BookChapter, Highlight, Note } from '@/types/book';
import type { ReaderTheme } from '@/types/reader';

type ReaderBookmark = {
    id: number;
    label?: string | null;
    chapter_title?: string | null;
    cfi_location: string;
};

type AnnotationFilter = 'bookmarks' | 'highlights' | 'notes';

type ReaderSidebarProps = {
    chapters: BookChapter[];
    bookmarks?: ReaderBookmark[];
    highlights?: Highlight[];
    notes?: Note[];
    activeHref?: string | null;
    activePage?: number;
    onSelect?: (chapter: BookChapter) => void;
    onBookmarkSelect?: (bookmark: ReaderBookmark) => void;
    onHighlightSelect?: (highlight: Highlight) => void;
    onNoteSelect?: (note: Note) => void;
    onNoteEdit?: (note: Note) => void;
    onNoteDelete?: (noteId: number) => void;
    onNoteHover?: (noteId: number | null) => void;
    activeNoteId?: number | null;
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

function pageLabelFromCfi(cfi?: string | null): string | null {
    const page = parsePageFromCfi(cfi ?? '');

    return page ? `Page ${page}` : null;
}

function ReaderSidebar({
    chapters,
    bookmarks = [],
    highlights = [],
    notes = [],
    activeHref,
    activePage,
    onSelect,
    onBookmarkSelect,
    onHighlightSelect,
    onNoteSelect,
    onNoteEdit,
    onNoteDelete,
    onNoteHover,
    activeNoteId = null,
    theme = 'sepia',
    className,
}: ReaderSidebarProps) {
    const [tab, setTab] = useState<'contents' | 'annotations'>('contents');
    const [annotationFilter, setAnnotationFilter] =
        useState<AnnotationFilter>('bookmarks');
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

    function renderAnnotationList() {
        if (annotationFilter === 'bookmarks') {
            if (bookmarks.length === 0) {
                return (
                    <p
                        className="px-3 py-8 text-center text-sm"
                        style={{ color: muted }}
                    >
                        No bookmarks yet
                    </p>
                );
            }

            return (
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
            );
        }

        if (annotationFilter === 'highlights') {
            if (highlights.length === 0) {
                return (
                    <p
                        className="px-3 py-8 text-center text-sm"
                        style={{ color: muted }}
                    >
                        No highlights yet
                    </p>
                );
            }

            return (
                <div className="space-y-1">
                    {highlights.map((highlight) => (
                        <button
                            key={highlight.id}
                            type="button"
                            onClick={() => onHighlightSelect?.(highlight)}
                            className="flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-black/5"
                        >
                            <span
                                className="mt-1.5 size-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: highlight.color }}
                            />
                            <span className="min-w-0">
                                <span
                                    className="block line-clamp-2"
                                    style={{ color: foreground }}
                                >
                                    &ldquo;{highlight.text}&rdquo;
                                </span>
                                <span
                                    className="mt-0.5 block text-xs"
                                    style={{ color: muted }}
                                >
                                    {pageLabelFromCfi(highlight.cfi_start) ??
                                        highlight.chapter_title ??
                                        'Highlight'}
                                </span>
                            </span>
                        </button>
                    ))}
                </div>
            );
        }

        if (notes.length === 0) {
            return (
                <p
                    className="px-3 py-8 text-center text-sm"
                    style={{ color: muted }}
                >
                    No notes yet
                </p>
            );
        }

        return (
            <div className="space-y-1">
                {notes.map((note) => {
                    const isActive = activeNoteId === note.id;

                    return (
                        <div
                            key={note.id}
                            className={cn(
                                'group flex items-start gap-1 rounded-md pr-1 transition-colors',
                                isActive ? 'bg-primary/10' : 'hover:bg-black/5',
                            )}
                            onMouseEnter={() => onNoteHover?.(note.id)}
                            onMouseLeave={() => onNoteHover?.(null)}
                        >
                            <button
                                type="button"
                                onClick={() => onNoteSelect?.(note)}
                                className="flex min-w-0 flex-1 items-start gap-2 rounded-md px-3 py-2 text-left text-sm"
                            >
                                <StickyNote
                                    className="mt-0.5 size-3.5 shrink-0"
                                    style={{ color: muted }}
                                />
                                <span className="min-w-0">
                                    <span
                                        className="block line-clamp-2"
                                        style={{ color: foreground }}
                                    >
                                        {note.content}
                                    </span>
                                    <span
                                        className="mt-0.5 block text-xs"
                                        style={{ color: muted }}
                                    >
                                        {pageLabelFromCfi(note.cfi_location) ??
                                            note.chapter_title ??
                                            'Note'}
                                    </span>
                                    {note.quoted_text ? (
                                        <span
                                            className="mt-1 block line-clamp-1 text-xs italic"
                                            style={{ color: muted }}
                                        >
                                            &ldquo;{note.quoted_text}&rdquo;
                                        </span>
                                    ) : null}
                                </span>
                            </button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="mt-1 size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                                        onClick={(event) =>
                                            event.stopPropagation()
                                        }
                                    >
                                        <MoreVertical className="size-3.5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() => onNoteEdit?.(note)}
                                    >
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => onNoteDelete?.(note.id)}
                                    >
                                        Hapus
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    );
                })}
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
                    onClick={() => setTab('annotations')}
                    className="flex-1 px-4 py-3 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors"
                    style={{
                        color: tab === 'annotations' ? foreground : muted,
                        borderBottom:
                            tab === 'annotations'
                                ? '2px solid #c4a882'
                                : '2px solid transparent',
                    }}
                >
                    Annotations
                </button>
            </div>

            {tab === 'annotations' ? (
                <div
                    className="grid grid-cols-3"
                    style={{ borderBottom: `1px solid ${borderColor}` }}
                >
                    {(
                        [
                            ['bookmarks', 'Bookmarks'],
                            ['highlights', 'Highlights'],
                            ['notes', 'Notes'],
                        ] as const
                    ).map(([filter, label]) => (
                        <button
                            key={filter}
                            type="button"
                            onClick={() => setAnnotationFilter(filter)}
                            className="px-2 py-2.5 text-[10px] font-semibold tracking-[0.08em] uppercase transition-colors"
                            style={{
                                color:
                                    annotationFilter === filter
                                        ? foreground
                                        : muted,
                                borderBottom:
                                    annotationFilter === filter
                                        ? '2px solid #c4a882'
                                        : '2px solid transparent',
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            ) : null}

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
                ) : (
                    renderAnnotationList()
                )}
            </div>
        </aside>
    );
}

export { ReaderSidebar };
export type { ReaderBookmark, ReaderSidebarProps };
