import { Form, Head, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AdminDataTable } from '@/components/admin/admin-data-table';
import { ConfirmDeleteDialog } from '@/components/modals/confirm-delete-dialog';
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
import AdminLayout from '@/layouts/admin-layout';
import { paths } from '@/lib/paths';
import type { Tag } from '@/types/book';

type AdminTagRow = Tag & {
    books_count?: number;
};

type AdminTagsIndexProps = {
    tags: AdminTagRow[];
};

function AdminTagsIndex({ tags }: AdminTagsIndexProps) {
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<AdminTagRow | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const columns = useMemo(
        () => [
            {
                id: 'name',
                header: 'Name',
                cell: (tag: AdminTagRow) => (
                    <span className="font-medium">{tag.name}</span>
                ),
            },
            {
                id: 'slug',
                header: 'Slug',
                cell: (tag: AdminTagRow) => (
                    <span className="text-muted-foreground">{tag.slug}</span>
                ),
            },
            {
                id: 'books',
                header: 'Books',
                headerClassName: 'text-right',
                cellClassName: 'text-right tabular-nums',
                cell: (tag: AdminTagRow) => tag.books_count ?? 0,
            },
            {
                id: 'actions',
                header: '',
                headerClassName: 'w-24',
                cellClassName: 'w-24',
                cell: (tag: AdminTagRow) => (
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setEditing(tag);
                                setFormOpen(true);
                            }}
                        >
                            <Pencil className="size-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(tag.id)}
                        >
                            <Trash2 className="size-4 text-destructive" />
                        </Button>
                    </div>
                ),
            },
        ],
        [],
    );

    function confirmDelete() {
        if (!deleteId) {
            return;
        }
        setDeleting(true);
        router.delete(paths.admin.tag(deleteId), {
            onSuccess: () => {
                toast.success('Tag deleted');
                setDeleteId(null);
            },
            onFinish: () => setDeleting(false),
        });
    }

    return (
        <>
            <Head title="Admin — Tags" />

            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="font-serif text-3xl font-bold">Tags</h1>
                        <p className="text-muted-foreground">
                            Flexible labels for books
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditing(null);
                            setFormOpen(true);
                        }}
                        className="shrink-0"
                    >
                        <Plus className="size-4" />
                        Add tag
                    </Button>
                </div>

                <AdminDataTable
                    items={tags}
                    searchKeys={['name', 'slug']}
                    searchPlaceholder="Search tags…"
                    emptyMessage="No tags found"
                    columns={columns}
                    rowKey={(tag) => tag.id}
                />
            </div>

            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-serif">
                            {editing ? 'Edit Tag' : 'Add Tag'}
                        </DialogTitle>
                    </DialogHeader>
                    <Form
                        key={editing?.id ?? 'new'}
                        action={
                            editing
                                ? paths.admin.tag(editing.id)
                                : paths.admin.tags
                        }
                        method={editing ? 'put' : 'post'}
                        onSuccess={() => {
                            toast.success(
                                editing ? 'Tag updated' : 'Tag created',
                            );
                            setFormOpen(false);
                        }}
                        className="space-y-4"
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={editing?.name}
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setFormOpen(false)}
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

            <ConfirmDeleteDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete tag?"
                isLoading={deleting}
            />
        </>
    );
}

AdminTagsIndex.layout = (page: ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default AdminTagsIndex;
