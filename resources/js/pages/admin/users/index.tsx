import { Form, Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import type { AdminUserListRow } from '@/types/admin';
import type { Paginated, UserRole } from '@/types';

type AdminUsersIndexProps = {
    users: Paginated<AdminUserListRow>;
    filters?: { search?: string | null };
};

function AdminUsersIndex({ users, filters }: AdminUsersIndexProps) {
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<AdminUserListRow | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    function confirmDelete() {
        if (!deleteId) {
            return;
        }
        setDeleting(true);
        router.delete(paths.admin.user(deleteId), {
            onSuccess: () => {
                toast.success('User deleted');
                setDeleteId(null);
            },
            onFinish: () => setDeleting(false),
        });
    }

    return (
        <>
            <Head title="Admin — Users" />

            <div className="space-y-6">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Users</h1>
                    <p className="text-muted-foreground">
                        Manage accounts and explore reading activity
                    </p>
                </div>

                <div className="rounded-lg border border-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">
                                    Library
                                </TableHead>
                                <TableHead className="text-right">
                                    Reading
                                </TableHead>
                                <TableHead className="text-right">
                                    Highlights
                                </TableHead>
                                <TableHead className="text-right">
                                    Notes
                                </TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="w-28" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No users found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.data.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <Link
                                                href={paths.admin.user(user.id)}
                                                className="block hover:underline"
                                            >
                                                <span className="font-medium">
                                                    {user.name}
                                                </span>
                                                <span className="block text-xs text-muted-foreground">
                                                    {user.email}
                                                </span>
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    user.role === 'admin'
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                            >
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {user.user_books_count}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {user.reading_count}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {user.highlights_count}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {user.notes_count}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(
                                                user.created_at,
                                            ).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                    title="View activity"
                                                >
                                                    <Link
                                                        href={paths.admin.user(
                                                            user.id,
                                                        )}
                                                    >
                                                        <Eye className="size-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setEditing(user);
                                                        setFormOpen(true);
                                                    }}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        setDeleteId(user.id)
                                                    }
                                                >
                                                    <Trash2 className="size-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-serif">
                            Edit User
                        </DialogTitle>
                    </DialogHeader>
                    {editing && (
                        <Form
                            action={paths.admin.user(editing.id)}
                            method="put"
                            onSuccess={() => {
                                toast.success('User updated');
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
                                            defaultValue={editing.name}
                                            required
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-destructive">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            defaultValue={editing.email}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Select
                                            name="role"
                                            defaultValue={editing.role}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(
                                                    ['user', 'admin'] as UserRole[]
                                                ).map((role) => (
                                                    <SelectItem
                                                        key={role}
                                                        value={role}
                                                    >
                                                        {role}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setFormOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing ? 'Saving…' : 'Save'}
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDeleteDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete user?"
                description="This will permanently delete the user account."
                isLoading={deleting}
            />
        </>
    );
}

AdminUsersIndex.layout = (page: ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default AdminUsersIndex;
