import { parsePageFromCfi } from '@/lib/pdf-highlight';
import { readerBorderColor, readerForeground, readerMutedForeground } from '@/lib/reader-theme';
import { cn } from '@/lib/utils';
import type { Note } from '@/types/book';
import type { ReaderTheme } from '@/types/reader';

type MarginNotesProps = {
    notes: Note[];
    currentPage: number;
    theme?: ReaderTheme;
    className?: string;
};

function MarginNotes({
    notes,
    currentPage,
    theme = 'sepia',
    className,
}: MarginNotesProps) {
    const pageNotes = notes.filter(
        (note) => parsePageFromCfi(note.cfi_location ?? '') === currentPage,
    );

    if (pageNotes.length === 0) {
        return null;
    }

    const foreground = readerForeground(theme);
    const muted = readerMutedForeground(theme);
    const borderColor = readerBorderColor(theme);

    return (
        <div
            className={cn(
                'pointer-events-none absolute inset-y-0 right-0 z-10 w-44 md:w-52',
                className,
            )}
            aria-label="Page notes"
        >
            {pageNotes.map((note) => (
                <div
                    key={note.id}
                    className="pointer-events-auto absolute right-2 max-w-[calc(100%-0.5rem)] rounded-md border bg-card/95 p-2 text-xs shadow-sm backdrop-blur-sm"
                    style={{
                        top: `${note.anchor_percent ?? 10}%`,
                        borderColor,
                        color: foreground,
                    }}
                >
                    {note.quoted_text ? (
                        <p
                            className="mb-1 line-clamp-2 italic"
                            style={{ color: muted }}
                        >
                            &ldquo;{note.quoted_text}&rdquo;
                        </p>
                    ) : null}
                    <p className="line-clamp-4 leading-relaxed">
                        {note.content}
                    </p>
                </div>
            ))}
        </div>
    );
}

export { MarginNotes };
