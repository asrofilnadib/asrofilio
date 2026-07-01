import { Form, useHttp } from '@inertiajs/react';
import { Barcode, BookPlus, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { paths } from '@/lib/paths';
import type { BookSearchResult } from '@/types/book';

type AddBookModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
};

function AddBookModal({ open, onOpenChange, onSuccess }: AddBookModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);

    const { setData, get: searchBooks, processing: searching } = useHttp({
        q: '',
    });

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!searchQuery.trim()) {
            return;
        }

        setData('q', searchQuery);
        searchBooks(paths.bookSearch, {
            onSuccess: (response) => {
                const results =
                    (response as { results?: BookSearchResult[] }).results ??
                    [];
                setSearchResults(results);
            },
            onError: () => toast.error('Search failed. Please try again.'),
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="font-serif">
                        Add to Library
                    </DialogTitle>
                    <DialogDescription>
                        Search online catalogs, enter an ISBN, or add book
                        details manually.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="search" className="mt-2">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="search" className="gap-1.5">
                            <Search className="size-3.5" />
                            Search API
                        </TabsTrigger>
                        <TabsTrigger value="isbn" className="gap-1.5">
                            <Barcode className="size-3.5" />
                            ISBN
                        </TabsTrigger>
                        <TabsTrigger value="manual" className="gap-1.5">
                            <BookPlus className="size-3.5" />
                            Manual
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="search" className="mt-4 space-y-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                placeholder="Search by title or author…"
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                }
                            />
                            <Button type="submit" disabled={searching}>
                                {searching ? 'Searching…' : 'Search'}
                            </Button>
                        </form>
                        <div className="max-h-64 space-y-2 overflow-y-auto">
                            {searchResults.map((result, index) => (
                                <Form
                                    key={`${result.google_books_id ?? result.isbn ?? index}`}
                                    action={paths.userBooks}
                                    method="post"
                                    resetOnSuccess
                                    onSuccess={() => {
                                        toast.success('Book added to library');
                                        onOpenChange(false);
                                        onSuccess?.();
                                    }}
                                >
                                    <input
                                        type="hidden"
                                        name="title"
                                        value={result.title}
                                    />
                                    <input
                                        type="hidden"
                                        name="author"
                                        value={result.author}
                                    />
                                    {result.isbn && (
                                        <input
                                            type="hidden"
                                            name="isbn"
                                            value={result.isbn}
                                        />
                                    )}
                                    {result.google_books_id && (
                                        <input
                                            type="hidden"
                                            name="google_books_id"
                                            value={result.google_books_id}
                                        />
                                    )}
                                    <button
                                        type="submit"
                                        className="flex w-full items-start gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent"
                                    >
                                        {result.cover_url && (
                                            <img
                                                src={result.cover_url}
                                                alt=""
                                                className="size-14 rounded object-cover"
                                            />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="font-serif font-medium line-clamp-1">
                                                {result.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {result.author}
                                            </p>
                                        </div>
                                    </button>
                                </Form>
                            ))}
                            {searchResults.length === 0 && searchQuery && !searching && (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    No results yet. Try a different search.
                                </p>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="isbn" className="mt-4">
                        <Form
                            action={paths.userBooks}
                            method="post"
                            resetOnSuccess
                            onSuccess={() => {
                                toast.success('Book added from ISBN');
                                onOpenChange(false);
                                onSuccess?.();
                            }}
                            className="space-y-4"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="isbn">ISBN</Label>
                                        <Input
                                            id="isbn"
                                            name="isbn"
                                            placeholder="978-0-123456-78-9"
                                            required
                                        />
                                        {errors.isbn && (
                                            <p className="text-sm text-destructive">
                                                {errors.isbn}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full"
                                    >
                                        {processing
                                            ? 'Looking up…'
                                            : 'Add by ISBN'}
                                    </Button>
                                </>
                            )}
                        </Form>
                    </TabsContent>

                    <TabsContent value="manual" className="mt-4">
                        <Form
                            action={paths.userBooks}
                            method="post"
                            resetOnSuccess
                            onSuccess={() => {
                                toast.success('Book added');
                                onOpenChange(false);
                                onSuccess?.();
                            }}
                            className="space-y-4"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            required
                                        />
                                        {errors.title && (
                                            <p className="text-sm text-destructive">
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="author">Author</Label>
                                        <Input
                                            id="author"
                                            name="author"
                                            required
                                        />
                                        {errors.author && (
                                            <p className="text-sm text-destructive">
                                                {errors.author}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            rows={3}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full"
                                    >
                                        {processing ? 'Adding…' : 'Add Book'}
                                    </Button>
                                </>
                            )}
                        </Form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

export { AddBookModal };
