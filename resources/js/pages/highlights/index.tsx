import { Head, router } from '@inertiajs/react';
import { Highlighter, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDeleteDialog } from '@/components/modals/confirm-delete-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { paths } from '@/lib/paths';
import type { Highlight, Paginated } from '@/types/book';

type HighlightsIndexProps = {
    highlights: Paginated<Highlight>;
    filters: { search?: string | null };
};

function HighlightsIndex({ highlights, filters }: HighlightsIndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get(
            paths.highlights,
            { search: search || undefined },
            { preserveState: true },
        );
    }

    function confirmDelete() {
        if (!deleteId) {
            return;
        }
        setDeleting(true);
        router.delete(`/highlights/${deleteId}`, {
            onSuccess: () => {
                toast.success('Highlight deleted');
                setDeleteId(null);
            },
            onFinish: () => setDeleting(false),
        });
    }

    return (
        <>
            <Head title="Highlights" />

            <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
                <div className="mb-8">
                    <h1 className="flex items-center gap-2 font-serif text-3xl font-bold">
                        <Highlighter className="size-7 text-primary" />
                        Highlights
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Your saved passages across all books
                    </p>
                </div>

                <form onSubmit={handleSearch} className="mb-6 flex gap-2">
                    <Input
                        placeholder="Search highlights…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                    <Button type="submit" variant="secondary">
                        Search
                    </Button>
                </form>

                <div className="space-y-4">
                    {highlights.data.length === 0 ? (
                        <p className="py-16 text-center text-muted-foreground">
                            No highlights yet. Start reading and highlight
                            passages you love.
                        </p>
                    ) : (
                        highlights.data.map((highlight) => (
                            <Card key={highlight.id}>
                                <CardContent className="p-5">
                                    <div className="mb-3 flex items-start justify-between gap-4">
                                        <div>
                                            {highlight.book && (
                                                <p className="font-serif font-medium">
                                                    {highlight.book.title}
                                                </p>
                                            )}
                                            {highlight.chapter_title && (
                                                <p className="text-xs text-muted-foreground">
                                                    {highlight.chapter_title}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                style={{
                                                    borderColor:
                                                        highlight.color,
                                                    color: highlight.color,
                                                }}
                                            >
                                                {highlight.color}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setDeleteId(highlight.id)
                                                }
                                            >
                                                <Trash2 className="size-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                    <blockquote
                                        className="border-l-4 pl-4 text-foreground italic"
                                        style={{
                                            borderColor: highlight.color,
                                        }}
                                    >
                                        "{highlight.text}"
                                    </blockquote>
                                    {highlight.note && (
                                        <p className="mt-3 text-sm text-muted-foreground">
                                            {highlight.note}
                                        </p>
                                    )}
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {new Date(
                                            highlight.created_at,
                                        ).toLocaleDateString()}
                                    </p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            <ConfirmDeleteDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete highlight?"
                description="This highlight will be permanently removed."
                isLoading={deleting}
            />
        </>
    );
}

HighlightsIndex.layout = (page: ReactNode) => (
    <AppLayout>{page}</AppLayout>
);

export default HighlightsIndex;
