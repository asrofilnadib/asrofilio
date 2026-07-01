import { Head, router } from '@inertiajs/react';
import { BookOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDeleteDialog } from '@/components/modals/confirm-delete-dialog';
import { VocabularyFormModal } from '@/components/modals/vocabulary-form-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { paths } from '@/lib/paths';
import type { Paginated, VocabularyItem } from '@/types/book';

type VocabularyIndexProps = {
    items: Paginated<VocabularyItem>;
    filters: { search?: string | null };
};

function VocabularyIndex({ items, filters }: VocabularyIndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [formOpen, setFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<VocabularyItem | null>(
        null,
    );
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get(
            paths.vocabulary,
            { search: search || undefined },
            { preserveState: true },
        );
    }

    function openEdit(item: VocabularyItem) {
        setEditingItem(item);
        setFormOpen(true);
    }

    function openCreate() {
        setEditingItem(null);
        setFormOpen(true);
    }

    function confirmDelete() {
        if (!deleteId) {
            return;
        }
        setDeleting(true);
        router.delete(paths.vocabularyItem(deleteId), {
            onSuccess: () => {
                toast.success('Word deleted');
                setDeleteId(null);
            },
            onFinish: () => setDeleting(false),
        });
    }

    return (
        <>
            <Head title="Vocabulary" />

            <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="font-serif text-3xl font-bold">
                            Vocabulary
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Words you've saved while reading
                        </p>
                    </div>
                    <Button onClick={openCreate}>
                        <Plus className="size-4" />
                        Add word
                    </Button>
                </div>

                <form onSubmit={handleSearch} className="mb-6 flex gap-2">
                    <Input
                        placeholder="Search words…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                    <Button type="submit" variant="secondary">
                        Search
                    </Button>
                </form>

                <div className="space-y-3">
                    {items.data.length === 0 ? (
                        <p className="py-16 text-center text-muted-foreground">
                            No vocabulary saved yet.
                        </p>
                    ) : (
                        items.data.map((item) => (
                            <Card key={item.id}>
                                <CardContent className="flex items-start justify-between gap-4 p-5">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-serif text-lg font-semibold">
                                            {item.word}
                                        </p>
                                        {item.definition && (
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {item.definition}
                                            </p>
                                        )}
                                        {item.context && (
                                            <p className="mt-2 text-sm italic text-muted-foreground">
                                                "{item.context}"
                                            </p>
                                        )}
                                        {item.book && (
                                            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                                <BookOpen className="size-3" />
                                                {item.book.title}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex shrink-0 gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEdit(item)}
                                        >
                                            <Pencil className="size-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                setDeleteId(item.id)
                                            }
                                        >
                                            <Trash2 className="size-4 text-destructive" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            <VocabularyFormModal
                open={formOpen}
                onOpenChange={setFormOpen}
                item={editingItem}
            />

            <ConfirmDeleteDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete word?"
                description="This vocabulary entry will be permanently removed."
                isLoading={deleting}
            />
        </>
    );
}

VocabularyIndex.layout = (page: ReactNode) => (
    <AppLayout>{page}</AppLayout>
);

export default VocabularyIndex;
