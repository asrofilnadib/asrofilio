import { ChevronLeft, ChevronRight, MessageSquareText } from 'lucide-react';

import { MarginNoteCard } from '@/components/reader/margin-note-card';
import { MarginNoteComposer } from '@/components/reader/margin-note-composer';
import { Button } from '@/components/ui/button';
import { parsePageFromCfi } from '@/lib/pdf-highlight';
import { readerBorderColor } from '@/lib/reader-theme';
import { cn } from '@/lib/utils';
import type { User } from '@/types/auth';
import type { Note } from '@/types/book';
import type { ReaderTheme } from '@/types/reader';

export type DraftNote = {
    quotedText?: string;
    anchorPercent: number;
    cfiLocation: string;
};

type MarginNotesProps = {
    notes: Note[];
    currentPage: number;
    expanded?: boolean;
    onExpandedChange?: (expanded: boolean) => void;
    draftNote?: DraftNote | null;
    draftContent?: string;
    editingNoteId?: number | null;
    activeNoteId?: number | null;
    processingNoteId?: number | null;
    user: User;
    theme?: ReaderTheme;
    className?: string;
    onDraftContentChange?: (content: string) => void;
    onSaveDraft?: () => void;
    onCancelDraft?: () => void;
    onNoteClick?: (note: Note) => void;
    onNoteHover?: (noteId: number | null) => void;
    onEditNote?: (noteId: number) => void;
    onSaveNote?: (noteId: number, content: string) => void;
    onCancelEditNote?: () => void;
    onDeleteNote?: (noteId: number) => void;
};

function MarginNotes({
    notes,
    currentPage,
    expanded = true,
    onExpandedChange,
    draftNote = null,
    draftContent = '',
    editingNoteId = null,
    activeNoteId = null,
    processingNoteId = null,
    user,
    theme = 'sepia',
    className,
    onDraftContentChange,
    onSaveDraft,
    onCancelDraft,
    onNoteClick,
    onNoteHover,
    onEditNote,
    onSaveNote,
    onCancelEditNote,
    onDeleteNote,
}: MarginNotesProps) {
    const pageNotes = notes.filter(
        (note) => parsePageFromCfi(note.cfi_location ?? '') === currentPage,
    );

    const hasContent = pageNotes.length > 0 || draftNote !== null;
    const borderColor = readerBorderColor(theme);

    if (!expanded) {
        return (
            <div
                className={cn(
                    'pointer-events-auto absolute inset-y-0 right-0 z-10 flex items-center',
                    className,
                )}
            >
                <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-10 w-8 rounded-l-lg rounded-r-none border border-r-0 shadow-md"
                    style={{ borderColor }}
                    aria-label="Buka komentar"
                    onClick={() => onExpandedChange?.(true)}
                >
                    <MessageSquareText className="size-4" />
                </Button>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'pointer-events-none absolute inset-y-0 right-0 z-10 w-72 border-l bg-background/60 backdrop-blur-sm',
                className,
            )}
            style={{ borderColor }}
            aria-label="Page notes"
        >
            <Button
                type="button"
                variant="secondary"
                size="icon"
                className="pointer-events-auto absolute top-1/2 -left-4 z-20 size-8 -translate-y-1/2 rounded-full border shadow-md"
                style={{ borderColor }}
                aria-label="Tutup komentar"
                onClick={() => onExpandedChange?.(false)}
            >
                <ChevronRight className="size-4" />
            </Button>

            {pageNotes.length === 0 && !draftNote ? (
                <div className="pointer-events-auto flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
                    <MessageSquareText className="size-5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                        Belum ada komentar di halaman ini
                    </p>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 text-xs"
                        onClick={() => onExpandedChange?.(false)}
                    >
                        <ChevronLeft className="size-3.5" />
                        Sembunyikan
                    </Button>
                </div>
            ) : null}

            {draftNote && onDraftContentChange && onSaveDraft && onCancelDraft ? (
                <MarginNoteComposer
                    user={user}
                    content={draftContent}
                    quotedText={draftNote.quotedText}
                    anchorPercent={draftNote.anchorPercent}
                    processing={processingNoteId === -1}
                    theme={theme}
                    onContentChange={onDraftContentChange}
                    onSubmit={onSaveDraft}
                    onCancel={onCancelDraft}
                />
            ) : null}

            {pageNotes.map((note) => (
                <MarginNoteCard
                    key={note.id}
                    note={note}
                    user={user}
                    isEditing={editingNoteId === note.id}
                    isActive={activeNoteId === note.id}
                    processing={processingNoteId === note.id}
                    theme={theme}
                    onClick={() => onNoteClick?.(note)}
                    onMouseEnter={() => onNoteHover?.(note.id)}
                    onMouseLeave={() => onNoteHover?.(null)}
                    onEdit={() => onEditNote?.(note.id)}
                    onSave={(content) => onSaveNote?.(note.id, content)}
                    onCancelEdit={() => onCancelEditNote?.()}
                    onDelete={() => onDeleteNote?.(note.id)}
                />
            ))}
        </div>
    );
}

export { MarginNotes };
