import { useHttp } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { paths } from '@/lib/paths';
import type { BookSearchResult, BookSearchSource } from '@/types/book';

const sourceLabels: Record<BookSearchSource, string> = {
    google_books: 'Google Books',
    open_library: 'Open Library',
};

function resultKey(result: BookSearchResult, index: number): string {
    return (
        result.google_books_id ??
        result.open_library_key ??
        result.isbn ??
        `${result.title}-${result.author}-${index}`
    );
}

type BookApiSearchPanelProps = {
    onSelect: (result: BookSearchResult) => void;
    className?: string;
};

function BookApiSearchPanel({ onSelect, className }: BookApiSearchPanelProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const { setData, get: searchBooks, processing: searching } = useHttp({
        q: '',
    });

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!searchQuery.trim()) {
            return;
        }

        setData('q', searchQuery);
        setHasSearched(true);
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
        <div className={className}>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Fetch from API
            </Label>
            <p className="mb-3 text-sm text-muted-foreground">
                Search Google Books & Open Library, then pick a result to
                pre-fill the form.
            </p>
            <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                    placeholder="Search by title or author…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" disabled={searching} variant="secondary">
                    <Search className="size-4" />
                    {searching ? '…' : 'Search'}
                </Button>
            </form>
            {hasSearched && searchResults.length > 0 && (
                <p className="mt-3 text-sm text-muted-foreground">
                    {searchResults.length} result
                    {searchResults.length !== 1 ? 's' : ''} — click to use
                </p>
            )}
            <div className="mt-2 max-h-48 space-y-2 overflow-y-auto">
                {searchResults.map((result, index) => (
                    <button
                        key={resultKey(result, index)}
                        type="button"
                        onClick={() => {
                            onSelect(result);
                            toast.success('Form pre-filled from API');
                        }}
                        className="flex w-full items-start gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent"
                    >
                        {result.cover_url ? (
                            <img
                                src={result.cover_url}
                                alt=""
                                className="size-12 shrink-0 rounded object-cover"
                            />
                        ) : (
                            <div className="flex size-12 shrink-0 items-center justify-center rounded bg-muted text-[10px] text-muted-foreground">
                                No cover
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="font-serif text-sm font-medium line-clamp-2">
                                    {result.title}
                                </p>
                                {result.source && (
                                    <Badge
                                        variant="secondary"
                                        className="shrink-0 text-[10px]"
                                    >
                                        {sourceLabels[result.source]}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {result.author}
                            </p>
                        </div>
                    </button>
                ))}
                {hasSearched && searchResults.length === 0 && !searching && (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                        No results found.
                    </p>
                )}
            </div>
        </div>
    );
}

export { BookApiSearchPanel };
