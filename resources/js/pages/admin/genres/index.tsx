import { Form, Head, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDeleteDialog } from '@/components/modals/confirm-delete-dialog';
import { Badge } from '@/components/ui/badge';
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
import { Switch } from '@/components/ui/switch';
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
import type { Genre, Paginated } from '@/types/book';

type AdminGenresIndexProps = {
    genres: Paginated<Genre>;
};

function AdminGenresIndex({ genres }: AdminGenresIndexProps) {
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Genre | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    function openCreate() {
        setEditing(null);
        setFormOpen(true);
    }

    function openEdit(genre: Genre) {
        setEditing(genre);
        setFormOpen(true);
    }

    function confirmDelete() {
        if (!deleteId) {
            return;
        }
        setDeleting(true);
        router.delete(paths.admin.genre(deleteId), {
            onSuccess: () => {
                toast.success('Genre deleted');
                setDeleteId(null);
            },
            onFinish: () => setDeleting(false),
        });
    }

    return (
        <>
            <Head title="Admin — Genres" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-serif text-3xl font-bold">
                            Genres
                        </h1>
                    </div>
                    <Button onClick={openCreate}>
                        <Plus className="size-4" />
                        Add genre
                    </Button>
                </div>

                <div className="rounded-lg border border-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead>Active</TableHead>
                                <TableHead className="w-24" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {genres.data.map((genre) => (
                                <TableRow key={genre.id}>
                                    <TableCell className="font-medium">
                                        {genre.name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {genre.slug}
                                    </TableCell>
                                    <TableCell>
                                        {genre.sort_order ?? 0}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                genre.is_active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                        >
                                            {genre.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEdit(genre)}
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setDeleteId(genre.id)
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

            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-serif">
                            {editing ? 'Edit Genre' : 'Add Genre'}
                        </DialogTitle>
                    </DialogHeader>
                    <Form
                        key={editing?.id ?? 'new'}
                        action={
                            editing
                                ? paths.admin.genre(editing.id)
                                : paths.admin.genres
                        }
                        method={editing ? 'put' : 'post'}
                        onSuccess={() => {
                            toast.success(
                                editing ? 'Genre updated' : 'Genre created',
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
                                <div className="space-y-2">
                                    <Label htmlFor="sort_order">Sort order</Label>
                                    <Input
                                        id="sort_order"
                                        name="sort_order"
                                        type="number"
                                        defaultValue={
                                            editing?.sort_order ?? 0
                                        }
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="is_active"
                                        name="is_active"
                                        defaultChecked={
                                            editing?.is_active ?? true
                                        }
                                    />
                                    <Label htmlFor="is_active">Active</Label>
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
                title="Delete genre?"
                isLoading={deleting}
            />
        </>
    );
}

AdminGenresIndex.layout = (page: ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default AdminGenresIndex;
