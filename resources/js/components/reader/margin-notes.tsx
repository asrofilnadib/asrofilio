import { MarginNoteCard } from '@/components/reader/margin-note-card';
import { MarginNoteComposer } from '@/components/reader/margin-note-composer';
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
    onEditNote?: (noteId: number) => void;
    onSaveNote?: (noteId: number, content: string) => void;
    onCancelEditNote?: () => void;
    onDeleteNote?: (noteId: number) => void;
};

function MarginNotes({
    notes,
    currentPage,
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
    onEditNote,
    onSaveNote,
    onCancelEditNote,
    onDeleteNote,
}: MarginNotesProps) {
    const pageNotes = notes.filter(
        (note) => parsePageFromCfi(note.cfi_location ?? '') === currentPage,
    );

    if (pageNotes.length === 0 && !draftNote) {
        return null;
    }

    const borderColor = readerBorderColor(theme);

    return (
        <div
            className={cn(
                'pointer-events-none absolute inset-y-0 right-0 z-10 w-72 border-l bg-background/40',
                className,
            )}
            style={{ borderColor }}
            aria-label="Page notes"
        >
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
