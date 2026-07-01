import { Head, router } from '@inertiajs/react';
import { StickyNote, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDeleteDialog } from '@/components/modals/confirm-delete-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { paths } from '@/lib/paths';
import type { Note, Paginated } from '@/types/book';

type NotesIndexProps = {
    notes: Paginated<Note>;
    filters: { book_id?: number | null };
};

function NotesIndex({ notes }: NotesIndexProps) {
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    function confirmDelete() {
        if (!deleteId) {
            return;
        }
        setDeleting(true);
        router.delete(paths.note(deleteId), {
            onSuccess: () => {
                toast.success('Note deleted');
                setDeleteId(null);
            },
            onFinish: () => setDeleting(false),
        });
    }

    return (
        <>
            <Head title="Notes" />

            <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
                <h1 className="mb-6 font-serif text-3xl font-bold">Notes</h1>

                <div className="space-y-4">
                    {notes.data.length === 0 ? (
                        <p className="text-muted-foreground">
                            No notes yet. Add notes while reading a book.
                        </p>
                    ) : (
                        notes.data.map((note) => (
                            <Card key={note.id}>
                                <CardContent className="flex items-start justify-between gap-4 pt-6">
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                                            <StickyNote className="size-4" />
                                            {note.book?.title}
                                        </div>
                                        {note.title && (
                                            <h3 className="font-semibold">
                                                {note.title}
                                            </h3>
                                        )}
                                        <p className="mt-1 whitespace-pre-wrap text-sm">
                                            {note.content}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeleteId(note.id)}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            <ConfirmDeleteDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={confirmDelete}
                loading={deleting}
                title="Delete note?"
                description="This note will be permanently removed."
            />
        </>
    );
}

NotesIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default NotesIndex;
