import { Form } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { BookApiSearchPanel } from '@/components/modals/book-api-search-panel';
import { BookFilePondUpload } from '@/components/admin/book-file-pond-upload';
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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
    bookToFormValues,
    emptyFormValues,
    searchResultToFormValues,
    type BookFormValues,
} from '@/lib/book-form';
import { paths } from '@/lib/paths';
import type { Book, BookSearchResult, Genre, Language } from '@/types/book';

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
    const [values, setValues] = useState<BookFormValues>(emptyFormValues);

    useEffect(() => {
        if (!open) {
            return;
        }

        setValues(book ? bookToFormValues(book) : emptyFormValues);
    }, [open, book]);

    const action = isEditing
        ? paths.admin.book(book!.uuid)
        : paths.admin.books;
    const method = isEditing ? 'put' : 'post';

    function updateField<K extends keyof BookFormValues>(
        key: K,
        value: BookFormValues[K],
    ) {
        setValues((current) => ({ ...current, [key]: value }));
    }

    function applySearchResult(result: BookSearchResult) {
        setValues(searchResultToFormValues(result, languages));
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="font-serif">
                        {isEditing ? 'Edit Book' : 'Add Book'}
                    </DialogTitle>
                </DialogHeader>

                {!isEditing && (
                    <>
                        <BookApiSearchPanel onSelect={applySearchResult} />
                        <Separator />
                    </>
                )}

                <Form
                    key={book?.id ?? 'new'}
                    action={action}
                    method={method}
                    encType="multipart/form-data"
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
                            {values.google_books_id && (
                                <input
                                    type="hidden"
                                    name="google_books_id"
                                    value={values.google_books_id}
                                />
                            )}
                            {values.open_library_key && (
                                <input
                                    type="hidden"
                                    name="open_library_key"
                                    value={values.open_library_key}
                                />
                            )}
                            {values.cover_url && (
                                <input
                                    type="hidden"
                                    name="metadata[cover_url]"
                                    value={values.cover_url}
                                />
                            )}

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={values.title}
                                        onChange={(e) =>
                                            updateField('title', e.target.value)
                                        }
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
                                        value={values.subtitle}
                                        onChange={(e) =>
                                            updateField(
                                                'subtitle',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="author">Author</Label>
                                    <Input
                                        id="author"
                                        name="author"
                                        value={values.author}
                                        onChange={(e) =>
                                            updateField('author', e.target.value)
                                        }
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
                                        value={values.isbn}
                                        onChange={(e) =>
                                            updateField('isbn', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="language_id">
                                        Language
                                    </Label>
                                    <Select
                                        name="language_id"
                                        value={values.language_id || undefined}
                                        onValueChange={(value) =>
                                            updateField('language_id', value)
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
                                        value={values.page_count}
                                        onChange={(e) =>
                                            updateField(
                                                'page_count',
                                                e.target.value,
                                            )
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
                                    value={values.description}
                                    onChange={(e) =>
                                        updateField(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>

                            {values.cover_url && (
                                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                                    <img
                                        src={values.cover_url}
                                        alt=""
                                        className="size-16 rounded object-cover"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Cover from API — saved when you create
                                        the book. Upload a file below if you
                                        have one.
                                    </p>
                                </div>
                            )}

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
                                    checked={values.is_public}
                                    onCheckedChange={(checked) =>
                                        updateField(
                                            'is_public',
                                            checked === true,
                                        )
                                    }
                                />
                                <Label htmlFor="is_public">
                                    Public library
                                </Label>
                            </div>

                            <BookFilePondUpload
                                key={book?.id ?? 'new-file'}
                                existingFileType={book?.file_type}
                                existingFilePath={book?.file_path}
                                error={errors.file}
                            />

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
