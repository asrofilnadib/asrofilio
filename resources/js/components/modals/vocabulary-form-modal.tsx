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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { paths } from '@/lib/paths';
import type { VocabularyItem } from '@/types/book';

type VocabularyFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item?: VocabularyItem | null;
    bookId?: number;
    word?: string;
    context?: string;
    cfiLocation?: string;
    onSuccess?: () => void;
};

function VocabularyFormModal({
    open,
    onOpenChange,
    item,
    bookId,
    word,
    context,
    cfiLocation,
    onSuccess,
}: VocabularyFormModalProps) {
    const isEditing = Boolean(item);
    const action = isEditing
        ? paths.vocabularyItem(item!.id)
        : paths.vocabularyItems;
    const method = isEditing ? 'put' : 'post';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-serif">
                        {isEditing ? 'Edit Vocabulary' : 'Save Word'}
                    </DialogTitle>
                </DialogHeader>

                <Form
                    key={item?.id ?? 'new'}
                    action={action}
                    method={method}
                    resetOnSuccess={!isEditing}
                    onSuccess={() => {
                        toast.success(
                            isEditing ? 'Word updated' : 'Word saved',
                        );
                        onOpenChange(false);
                        onSuccess?.();
                    }}
                    className="space-y-4"
                >
                    {({ errors, processing }) => (
                        <>
                            {bookId && (
                                <input
                                    type="hidden"
                                    name="book_id"
                                    value={bookId}
                                />
                            )}
                            {cfiLocation && (
                                <input
                                    type="hidden"
                                    name="cfi_location"
                                    value={cfiLocation}
                                />
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="word">Word</Label>
                                <Input
                                    id="word"
                                    name="word"
                                    defaultValue={item?.word ?? word}
                                    required
                                />
                                {errors.word && (
                                    <p className="text-sm text-destructive">
                                        {errors.word}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="definition">Definition</Label>
                                <Textarea
                                    id="definition"
                                    name="definition"
                                    rows={3}
                                    defaultValue={
                                        item?.definition ?? undefined
                                    }
                                    placeholder="What does it mean?"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="context">Context</Label>
                                <Textarea
                                    id="context"
                                    name="context"
                                    rows={2}
                                    defaultValue={
                                        item?.context ?? context ?? undefined
                                    }
                                    placeholder="Sentence where you found it…"
                                />
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
                                    {processing ? 'Saving…' : 'Save'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export { VocabularyFormModal };
