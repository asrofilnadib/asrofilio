import { useEffect, useState } from 'react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { fetchBookAnnotations } from '@/lib/library-annotations';
import { useI18n } from '@/lib/i18n';
import type { Book, Highlight } from '@/types/book';

type BookHighlightsModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    book: Book;
    initialHighlights?: Highlight[];
};

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function BookHighlightsModal({
    open,
    onOpenChange,
    book,
    initialHighlights,
}: BookHighlightsModalProps) {
    const { t } = useI18n();
    const [highlights, setHighlights] = useState<Highlight[]>(
        initialHighlights ?? [],
    );
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (initialHighlights) {
            setHighlights(initialHighlights);

            return;
        }

        setLoading(true);
        fetchBookAnnotations(book.uuid)
            .then((data) => setHighlights(data.highlights))
            .catch(() => setHighlights([]))
            .finally(() => setLoading(false));
    }, [book.uuid, initialHighlights, open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[80vh] overflow-hidden sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-serif">
                        {t('library_highlights')}
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
                    ) : highlights.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            {t('library_no_highlights')}
                        </p>
                    ) : (
                        highlights.map((highlight) => (
                            <div
                                key={highlight.id}
                                className="rounded-lg border border-border/60 bg-secondary/30 p-3"
                            >
                                <p
                                    className="border-l-4 py-0.5 pl-3 text-sm leading-relaxed italic"
                                    style={{
                                        borderColor: highlight.color,
                                        backgroundColor: `${highlight.color}22`,
                                    }}
                                >
                                    &ldquo;{highlight.text}&rdquo;
                                </p>
                                {highlight.chapter_title && (
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {highlight.chapter_title}
                                    </p>
                                )}
                                <p className="mt-1 text-[10px] text-muted-foreground">
                                    {formatDate(highlight.created_at)}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export { BookHighlightsModal };
