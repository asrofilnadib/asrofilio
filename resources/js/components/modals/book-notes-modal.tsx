import { useEffect, useState } from 'react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { fetchBookAnnotations } from '@/lib/library-annotations';
import { useI18n } from '@/lib/i18n';
import type { Book, Note } from '@/types/book';

type BookNotesModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    book: Book;
    initialNotes?: Note[];
};

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function BookNotesModal({
    open,
    onOpenChange,
    book,
    initialNotes,
}: BookNotesModalProps) {
    const { t } = useI18n();
    const [notes, setNotes] = useState<Note[]>(initialNotes ?? []);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (initialNotes) {
            setNotes(initialNotes);

            return;
        }

        setLoading(true);
        fetchBookAnnotations(book.uuid)
            .then((data) => setNotes(data.notes))
            .catch(() => setNotes([]))
            .finally(() => setLoading(false));
    }, [book.uuid, initialNotes, open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[80vh] overflow-hidden sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-serif">
                        {t('library_notes')}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                        {book.title}
                    </p>
                </DialogHeader>
                <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
                    {loading ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            Loading…
                        </p>
                    ) : notes.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            {t('library_no_notes')}
                        </p>
                    ) : (
                        notes.map((note) => (
                            <div
                                key={note.id}
                                className="rounded-lg border border-border/60 bg-card p-3"
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {note.content}
                                </p>
                                {note.chapter_title && (
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {note.chapter_title}
                                    </p>
                                )}
                                <p className="mt-1 text-[10px] text-muted-foreground">
                                    {formatDate(note.created_at)}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export { BookNotesModal };
