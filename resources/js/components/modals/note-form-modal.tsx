import { Form } from '@inertiajs/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { paths } from '@/lib/paths';
import type { Note } from '@/types/book';

type NoteFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    note?: Note | null;
    bookId: number;
    userBookId?: number;
    cfiLocation?: string;
    chapterTitle?: string;
    quotedText?: string;
    anchorPercent?: number;
    onSuccess?: () => void;
};

function NoteFormModal({
    open,
    onOpenChange,
    note,
    bookId,
    userBookId,
    cfiLocation,
    chapterTitle,
    quotedText,
    anchorPercent,
    onSuccess,
}: NoteFormModalProps) {
    const isEditing = Boolean(note);
    const action = isEditing
        ? paths.note(note!.id)
        : paths.notes;
    const method = isEditing ? 'put' : 'post';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-serif">
                        {isEditing ? 'Edit Note' : 'Add Note'}
                    </DialogTitle>
                </DialogHeader>

                <Form
                    key={note?.id ?? 'new'}
                    action={action}
                    method={method}
                    resetOnSuccess={!isEditing}
                    onSuccess={() => {
                        toast.success(
                            isEditing ? 'Note updated' : 'Note saved',
                        );
                        onOpenChange(false);
                        onSuccess?.();
                    }}
                    className="space-y-4"
                >
                    {({ errors, processing }) => (
                        <>
                            <input type="hidden" name="book_id" value={bookId} />
                            {userBookId && (
                                <input
                                    type="hidden"
                                    name="user_book_id"
                                    value={userBookId}
                                />
                            )}
                            {cfiLocation && (
                                <input
                                    type="hidden"
                                    name="cfi_location"
                                    value={cfiLocation}
                                />
                            )}
                            {chapterTitle && (
                                <input
                                    type="hidden"
                                    name="chapter_title"
                                    value={chapterTitle}
                                />
                            )}
                            {quotedText && (
                                <input
                                    type="hidden"
                                    name="quoted_text"
                                    value={quotedText}
                                />
                            )}
                            {anchorPercent !== undefined && (
                                <input
                                    type="hidden"
                                    name="anchor_percent"
                                    value={anchorPercent}
                                />
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="content">Note</Label>
                                <Textarea
                                    id="content"
                                    name="content"
                                    rows={5}
                                    defaultValue={note?.content}
                                    placeholder="Write your thoughts…"
                                    required
                                />
                                {errors.content && (
                                    <p className="text-sm text-destructive">
                                        {errors.content}
                                    </p>
                                )}
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving…' : 'Save Note'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export { NoteFormModal };
