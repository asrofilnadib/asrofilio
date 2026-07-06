import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Bookmark,
    ChevronLeft,
    ChevronRight,
    Highlighter,
    Settings2,
    StickyNote,
} from 'lucide-react';

import { ReaderSettingsPanel } from '@/components/reader/reader-settings-panel';
import { Button } from '@/components/ui/button';
import {
    readerBorderColor,
    readerForeground,
    readerMutedForeground,
    readerToolbarBackground,
} from '@/lib/reader-theme';
import { cn } from '@/lib/utils';
import { paths } from '@/lib/paths';
import type { Book } from '@/types/book';
import type { PdfReaderSettings } from '@/types/reader';

type ReaderToolbarProps = {
    book: Book;
    activeSection?: string | null;
    progressPercent?: number;
    currentPage?: number;
    totalPages?: number;
    settings: PdfReaderSettings;
    onSettingsChange: (settings: PdfReaderSettings) => void;
    onAddNote?: () => void;
    onAddHighlight?: () => void;
    onToggleBookmark?: () => void;
    isBookmarked?: boolean;
    onPrevPage?: () => void;
    onNextPage?: () => void;
    isPdf?: boolean;
};

function ReaderToolbar({
    book,
    activeSection,
    progressPercent = 0,
    currentPage,
    totalPages,
    settings,
    onSettingsChange,
    onAddNote,
    onAddHighlight,
    onToggleBookmark,
    isBookmarked = false,
    onPrevPage,
    onNextPage,
    isPdf = false,
}: ReaderToolbarProps) {
    const showPageNumbers =
        isPdf && settings.showPageNumbers && currentPage && totalPages;
    const foreground = readerForeground(settings.theme);
    const muted = readerMutedForeground(settings.theme);

    return (
        <header
            className="flex h-14 shrink-0 items-center justify-between px-3 backdrop-blur-sm lg:px-4"
            style={{
                backgroundColor: readerToolbarBackground(settings.theme),
                borderBottom: `1px solid ${readerBorderColor(settings.theme)}`,
                color: foreground,
            }}
        >
            <div className="flex min-w-0 flex-1 items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    style={{ color: foreground }}
                    asChild
                >
                    <Link href={paths.libraryShow(book.uuid)}>
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <div className="min-w-0">
                    <h1
                        className="font-serif text-sm font-semibold line-clamp-1"
                        style={{ color: foreground }}
                    >
                        {book.title}
                    </h1>
                    <p
                        className="text-xs line-clamp-1"
                        style={{ color: muted }}
                    >
                        {activeSection ?? book.author}
                    </p>
                </div>
            </div>

            <div className="hidden items-center gap-3 px-4 md:flex">
                {showPageNumbers ? (
                    <span
                        className="text-xs tabular-nums"
                        style={{ color: muted }}
                    >
                        Page {currentPage} / {totalPages}
                    </span>
                ) : null}
                <span
                    className="text-xs font-medium tabular-nums"
                    style={{ color: '#c4a882' }}
                >
                    {progressPercent}%
                </span>
            </div>

            <div className="flex shrink-0 items-center gap-1">
                {isPdf && onPrevPage && onNextPage ? (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            style={{ color: foreground }}
                            onClick={onPrevPage}
                            title="Previous page"
                        >
                            <ChevronLeft className="size-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            style={{ color: foreground }}
                            onClick={onNextPage}
                            title="Next page"
                        >
                            <ChevronRight className="size-4" />
                        </Button>
                    </>
                ) : null}
                <Button
                    variant="ghost"
                    size="icon"
                    style={{ color: foreground }}
                    onClick={onAddHighlight}
                    title="Highlight"
                >
                    <Highlighter className="size-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    style={{ color: foreground }}
                    onClick={onAddNote}
                    title="Add note"
                >
                    <StickyNote className="size-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    style={{ color: foreground }}
                    onClick={onToggleBookmark}
                    title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                >
                    <Bookmark
                        className={cn(
                            'size-4',
                            isBookmarked && 'fill-current',
                        )}
                    />
                </Button>
                <ReaderSettingsPanel
                    settings={settings}
                    onChange={onSettingsChange}
                    isPdf={isPdf}
                    trigger={
                        <Button
                            variant="ghost"
                            size="icon"
                            style={{ color: foreground }}
                            title="Reading settings"
                        >
                            <Settings2 className="size-4" />
                        </Button>
                    }
                />
            </div>
        </header>
    );
}

export { ReaderToolbar };
