import { Head, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

import { BookFormModal } from '@/components/modals/book-form-modal';
import { ConfirmDeleteDialog } from '@/components/modals/confirm-delete-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { paths } from '@/lib/paths';
import type { Book, Genre, Language, Paginated } from '@/types/book';

type AdminBooksIndexProps = {
    books: Paginated<Book>;
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

    function openCreate() {
        setEditingBook(null);
        setFormOpen(true);
    }

    function openEdit(book: Book) {
        setEditingBook(book);
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-serif text-3xl font-bold">Books</h1>
                        <p className="text-muted-foreground">
                            Manage catalog and uploads
                        </p>
                    </div>
                    <Button onClick={openCreate}>
                        <Plus className="size-4" />
                        Add book
                    </Button>
                </div>

                <div className="rounded-lg border border-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-24" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {books.data.map((book) => (
                                <TableRow key={book.id}>
                                    <TableCell className="font-serif font-medium">
                                        {book.title}
                                    </TableCell>
                                    <TableCell>{book.author}</TableCell>
                                    <TableCell className="uppercase text-xs">
                                        {book.file_type ?? '—'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                book.is_public
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                        >
                                            {book.is_public
                                                ? 'Public'
                                                : 'Private'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEdit(book)}
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setDeleteUuid(book.uuid)
                                                }
                                            >
                                                <Trash2 className="size-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
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
