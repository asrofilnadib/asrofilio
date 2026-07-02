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
import type { Language } from '@/types/book';

type AdminLanguagesIndexProps = {
    languages: Language[];
};

function AdminLanguagesIndex({ languages }: AdminLanguagesIndexProps) {
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Language | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const columns = useMemo(
        () => [
            {
                id: 'code',
                header: 'Code',
                cell: (language: Language) => (
                    <span className="font-mono text-sm">{language.code}</span>
                ),
            },
            {
                id: 'name',
                header: 'Name',
                cell: (language: Language) => language.name,
            },
            {
                id: 'actions',
                header: '',
                headerClassName: 'w-24',
                cellClassName: 'w-24',
                cell: (language: Language) => (
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setEditing(language);
                                setFormOpen(true);
                            }}
                        >
                            <Pencil className="size-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(language.id)}
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
        router.delete(paths.admin.language(deleteId), {
            onSuccess: () => {
                toast.success('Language deleted');
                setDeleteId(null);
            },
            onFinish: () => setDeleting(false),
        });
    }

    return (
        <>
            <Head title="Admin — Languages" />

            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="font-serif text-3xl font-bold">
                            Languages
                        </h1>
                        <p className="text-muted-foreground">
                            Supported book languages
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
                        Add language
                    </Button>
                </div>

                <AdminDataTable
                    items={languages}
                    searchKeys={['code', 'name']}
                    searchPlaceholder="Search languages…"
                    emptyMessage="No languages found"
                    columns={columns}
                    rowKey={(language) => language.id}
                />
            </div>

            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-serif">
                            {editing ? 'Edit Language' : 'Add Language'}
                        </DialogTitle>
                    </DialogHeader>
                    <Form
                        key={editing?.id ?? 'new'}
                        action={
                            editing
                                ? paths.admin.language(editing.id)
                                : paths.admin.languages
                        }
                        method={editing ? 'put' : 'post'}
                        onSuccess={() => {
                            toast.success(
                                editing
                                    ? 'Language updated'
                                    : 'Language created',
                            );
                            setFormOpen(false);
                        }}
                        className="space-y-4"
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="code">Code</Label>
                                    <Input
                                        id="code"
                                        name="code"
                                        placeholder="en"
                                        defaultValue={editing?.code}
                                        required
                                    />
                                    {errors.code && (
                                        <p className="text-sm text-destructive">
                                            {errors.code}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={editing?.name}
                                        required
                                    />
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
                title="Delete language?"
                isLoading={deleting}
            />
        </>
    );
}

AdminLanguagesIndex.layout = (page: ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default AdminLanguagesIndex;
