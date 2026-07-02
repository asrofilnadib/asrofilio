import { Head, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AdminDataTable } from '@/components/admin/admin-data-table';
import { BookFormModal } from '@/components/modals/book-form-modal';
import { ConfirmDeleteDialog } from '@/components/modals/confirm-delete-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import { paths } from '@/lib/paths';
import type { Book, Genre, Language } from '@/types/book';

type AdminBooksIndexProps = {
    books: Book[];
    genres: Genre[];
    languages: Language[];
};

function AdminBooksIndex({
    books,
    genres,
    languages,
}: AdminBooksIndexProps) {
    const [formOpen, setFormOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [deleteUuid, setDeleteUuid] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const columns = useMemo(
        () => [
            {
                id: 'title',
                header: 'Title',
                cell: (book: Book) => (
                    <div>
                        <p className="font-serif font-medium">{book.title}</p>
                        {book.language?.name ? (
                            <p className="text-xs text-muted-foreground">
                                {book.language.name}
                            </p>
                        ) : null}
                    </div>
                ),
            },
            {
                id: 'author',
                header: 'Author',
                cell: (book: Book) => book.author,
            },
            {
                id: 'type',
                header: 'Type',
                cellClassName: 'uppercase text-xs',
                cell: (book: Book) => book.file_type ?? '—',
            },
            {
                id: 'genres',
                header: 'Genres',
                cell: (book: Book) =>
                    book.genres?.length ? (
                        <div className="flex flex-wrap gap-1">
                            {book.genres.slice(0, 2).map((genre) => (
                                <Badge key={genre.id} variant="outline">
                                    {genre.name}
                                </Badge>
                            ))}
                            {book.genres.length > 2 ? (
                                <span className="text-xs text-muted-foreground">
                                    +{book.genres.length - 2}
                                </span>
                            ) : null}
                        </div>
                    ) : (
                        '—'
                    ),
            },
            {
                id: 'status',
                header: 'Status',
                cell: (book: Book) => (
                    <Badge variant={book.is_public ? 'default' : 'outline'}>
                        {book.is_public ? 'Public' : 'Private'}
                    </Badge>
                ),
            },
            {
                id: 'actions',
                header: '',
                headerClassName: 'w-24',
                cellClassName: 'w-24',
                cell: (book: Book) => (
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setEditingBook(book);
                                setFormOpen(true);
                            }}
                        >
                            <Pencil className="size-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteUuid(book.uuid)}
                        >
                            <Trash2 className="size-4 text-destructive" />
                        </Button>
                    </div>
                ),
            },
        ],
        [],
    );

    function openCreate() {
        setEditingBook(null);
        setFormOpen(true);
    }

    function confirmDelete() {
        if (!deleteUuid) {
            return;
        }
        setDeleting(true);
        router.delete(paths.admin.book(deleteUuid), {
            onSuccess: () => {
                toast.success('Book deleted');
                setDeleteUuid(null);
            },
            onFinish: () => setDeleting(false),
        });
    }

    return (
        <>
            <Head title="Admin — Books" />

            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="font-serif text-3xl font-bold">Books</h1>
                        <p className="text-muted-foreground">
                            Manage catalog and uploads
                        </p>
                    </div>
                    <Button onClick={openCreate} className="shrink-0">
                        <Plus className="size-4" />
                        Add book
                    </Button>
                </div>

                <AdminDataTable
                    items={books}
                    searchKeys={[
                        'title',
                        'author',
                        'isbn',
                        'file_type',
                        'language.name',
                        'genres.name',
                    ]}
                    searchPlaceholder="Search books by title, author, ISBN…"
                    emptyMessage="No books found"
                    columns={columns}
                    rowKey={(book) => book.id}
                    toolbar={
                        <span className="text-xs text-muted-foreground">
                            {books.length} total
                        </span>
                    }
                />
            </div>

            <BookFormModal
                open={formOpen}
                onOpenChange={setFormOpen}
                book={editingBook}
                genres={genres}
                languages={languages}
            />

            <ConfirmDeleteDialog
                open={deleteUuid !== null}
                onOpenChange={(open) => !open && setDeleteUuid(null)}
                onConfirm={confirmDelete}
                title="Delete book?"
                description="This will permanently delete the book and all associated data."
                isLoading={deleting}
            />
        </>
    );
}

AdminBooksIndex.layout = (page: ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default AdminBooksIndex;
