import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Bookmark,
    ChevronLeft,
    ChevronRight,
    Highlighter,
    StickyNote,
} from 'lucide-react';

import { ReaderSettingsPanel } from '@/components/reader/reader-settings-panel';
import { Button } from '@/components/ui/button';
import { readerToolbarBackground } from '@/lib/reader-theme';
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
    onAddBookmark?: () => void;
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
    onAddBookmark,
    onPrevPage,
    onNextPage,
    isPdf = false,
}: ReaderToolbarProps) {
    const showPageNumbers =
        isPdf && settings.showPageNumbers && currentPage && totalPages;

    return (
        <header
            className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 px-3 backdrop-blur-sm lg:px-4"
            style={{ backgroundColor: readerToolbarBackground(settings.theme) }}
        >
            <div className="flex min-w-0 flex-1 items-center gap-2">
                <Button variant="ghost" size="icon" className="shrink-0" asChild>
                    <Link href={paths.libraryShow(book.uuid)}>
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <div className="min-w-0">
                    <h1 className="font-serif text-sm font-semibold line-clamp-1">
                        {book.title}
                    </h1>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                        {activeSection ?? book.author}
                    </p>
                </div>
            </div>

            <div className="hidden items-center gap-3 px-4 md:flex">
                {showPageNumbers ? (
                    <span className="text-xs text-muted-foreground tabular-nums">
                        Page {currentPage} / {totalPages}
                    </span>
                ) : null}
                <span className="text-xs font-medium text-primary tabular-nums">
                    {progressPercent}%
                </span>
            </div>

            <div className="flex shrink-0 items-center gap-1">
                {isPdf && onPrevPage && onNextPage ? (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onPrevPage}
                            title="Previous page"
                        >
                            <ChevronLeft className="size-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
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
                    onClick={onAddHighlight}
                    title="Highlight"
                >
                    <Highlighter className="size-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onAddNote}
                    title="Add note"
                >
                    <StickyNote className="size-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onAddBookmark}
                    title="Bookmark"
                >
                    <Bookmark className="size-4" />
                </Button>
                <ReaderSettingsPanel
                    settings={settings}
                    onChange={onSettingsChange}
                    isPdf={isPdf}
                />
            </div>
        </header>
    );
}

export { ReaderToolbar };
