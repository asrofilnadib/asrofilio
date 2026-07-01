import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Bookmark,
    Highlighter,
    List,
    Settings2,
    StickyNote,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { paths } from '@/lib/paths';
import type { Book } from '@/types/book';

type ReaderToolbarProps = {
    book: Book;
    onToggleToc?: () => void;
    onToggleSettings?: () => void;
    onAddNote?: () => void;
    onAddHighlight?: () => void;
    onAddBookmark?: () => void;
    showToc?: boolean;
};

function ReaderToolbar({
    book,
    onToggleToc,
    onToggleSettings,
    onAddNote,
    onAddHighlight,
    onAddBookmark,
    showToc,
}: ReaderToolbarProps) {
    return (
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={paths.libraryShow(book.id)}>
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <div className="hidden min-w-0 sm:block">
                    <h1 className="font-serif text-sm font-semibold line-clamp-1">
                        {book.title}
                    </h1>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                        {book.author}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-1">
                <Button
                    variant={showToc ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={onToggleToc}
                    title="Table of contents"
                >
                    <List className="size-4" />
                </Button>
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
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleSettings}
                    title="Reading settings"
                >
                    <Settings2 className="size-4" />
                </Button>
            </div>
        </header>
    );
}

export { ReaderToolbar };
