import { Form } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { paths } from '@/lib/paths';
import type { Book, Genre, Language } from '@/types/book';

type BookFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    book?: Book | null;
    genres: Genre[];
    languages: Language[];
    onSuccess?: () => void;
};

function BookFormModal({
    open,
    onOpenChange,
    book,
    genres,
    languages,
    onSuccess,
}: BookFormModalProps) {
    const isEditing = Boolean(book);

    useEffect(() => {
        if (!open) {
            return;
        }
    }, [open, book]);

    const action = isEditing
        ? paths.admin.book(book!.id)
        : paths.admin.books;
    const method = isEditing ? 'put' : 'post';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-serif">
                        {isEditing ? 'Edit Book' : 'Add Book'}
                    </DialogTitle>
                </DialogHeader>

                <Form
                    key={book?.id ?? 'new'}
                    action={action}
                    method={method}
                    resetOnSuccess={!isEditing}
                    onSuccess={() => {
                        toast.success(
                            isEditing ? 'Book updated' : 'Book created',
                        );
                        onOpenChange(false);
                        onSuccess?.();
                    }}
                    className="space-y-4"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        defaultValue={book?.title}
                                        required
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-destructive">
                                            {errors.title}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="subtitle">Subtitle</Label>
                                    <Input
                                        id="subtitle"
                                        name="subtitle"
                                        defaultValue={
                                            book?.subtitle ?? undefined
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="author">Author</Label>
                                    <Input
                                        id="author"
                                        name="author"
                                        defaultValue={book?.author}
                                        required
                                    />
                                    {errors.author && (
                                        <p className="text-sm text-destructive">
                                            {errors.author}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="isbn">ISBN</Label>
                                    <Input
                                        id="isbn"
                                        name="isbn"
                                        defaultValue={book?.isbn ?? undefined}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="language_id">
                                        Language
                                    </Label>
                                    <Select
                                        name="language_id"
                                        defaultValue={
                                            book?.language_id?.toString() ??
                                            undefined
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {languages.map((lang) => (
                                                <SelectItem
                                                    key={lang.id}
                                                    value={lang.id.toString()}
                                                >
                                                    {lang.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="page_count">Pages</Label>
                                    <Input
                                        id="page_count"
                                        name="page_count"
                                        type="number"
                                        defaultValue={
                                            book?.page_count ?? undefined
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    defaultValue={
                                        book?.description ?? undefined
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Genres</Label>
                                <div className="flex flex-wrap gap-3">
                                    {genres.map((genre) => (
                                        <label
                                            key={genre.id}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            <Checkbox
                                                name="genre_ids[]"
                                                value={genre.id}
                                                defaultChecked={book?.genres?.some(
                                                    (g) => g.id === genre.id,
                                                )}
                                            />
                                            {genre.name}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="is_public"
                                    name="is_public"
                                    value="1"
                                    defaultChecked={book?.is_public ?? false}
                                />
                                <Label htmlFor="is_public">
                                    Public library
                                </Label>
                            </div>

                            {!isEditing && (
                                <div className="space-y-2">
                                    <Label htmlFor="file">Book file</Label>
                                    <Input
                                        id="file"
                                        name="file"
                                        type="file"
                                        accept=".epub,.pdf"
                                    />
                                    {errors.file && (
                                        <p className="text-sm text-destructive">
                                            {errors.file}
                                        </p>
                                    )}
                                </div>
                            )}

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Saving…'
                                        : isEditing
                                          ? 'Update'
                                          : 'Create'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export { BookFormModal };
