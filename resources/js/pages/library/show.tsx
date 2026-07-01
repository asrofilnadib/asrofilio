import { Form, Head, Link } from '@inertiajs/react';
import {
    BookOpen,
    Highlighter,
    Play,
    Star,
    StickyNote,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { paths } from '@/lib/paths';
import type { Book, Highlight, Note, ReadingStatus, UserBook } from '@/types/book';

type LibraryShowProps = {
    book: Book;
    userBook?: UserBook | null;
    highlights: Highlight[];
    notes: Note[];
    inLibrary: boolean;
};

const statusOptions: Array<{ value: ReadingStatus; label: string }> = [
    { value: 'unread', label: 'Unread' },
    { value: 'in_progress', label: 'Reading' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
];

function LibraryShow({
    book,
    userBook,
    highlights,
    notes,
    inLibrary,
}: LibraryShowProps) {
    const [reviewOpen, setReviewOpen] = useState(false);
    const coverUrl = book.cover_url;

    return (
        <>
            <Head title={book.title} />

            <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
                    <div className="mx-auto w-full max-w-[240px] lg:mx-0">
                        <div className="aspect-[2/3] overflow-hidden rounded-lg border border-border bg-muted shadow-sm">
                            {coverUrl ? (
                                <img
                                    src={coverUrl}
                                    alt=""
                                    className="size-full object-cover"
                                />
                            ) : (
                                <div className="flex size-full items-center justify-center">
                                    <BookOpen className="size-16 text-muted-foreground/30" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h1 className="font-serif text-3xl font-bold lg:text-4xl">
                                {book.title}
                            </h1>
                            {book.subtitle && (
                                <p className="mt-1 text-lg text-muted-foreground">
                                    {book.subtitle}
                                </p>
                            )}
                            <p className="mt-2 text-lg text-muted-foreground">
                                by {book.author}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {book.genres?.map((genre) => (
                                    <Badge key={genre.id} variant="secondary">
                                        {genre.name}
                                    </Badge>
                                ))}
                                {book.is_public && (
                                    <Badge variant="outline">Public</Badge>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {inLibrary && userBook && book.file_type && (
                                <Button asChild>
                                    <Link href={paths.reader(book.id)}>
                                        <Play className="size-4" />
                                        {userBook.status === 'in_progress'
                                            ? 'Continue reading'
                                            : 'Start reading'}
                                    </Link>
                                </Button>
                            )}
                            {!inLibrary && (
                                <Form
                                    action={paths.userBooks}
                                    method="post"
                                    onSuccess={() =>
                                        toast.success('Added to library')
                                    }
                                >
                                    <input
                                        type="hidden"
                                        name="book_id"
                                        value={book.id}
                                    />
                                    <Button type="submit">
                                        Add to library
                                    </Button>
                                </Form>
                            )}
                        </div>

                        {userBook && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">
                                        Reading status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Form
                                        action={paths.userBook(userBook.id)}
                                        method="put"
                                        onSuccess={() =>
                                            toast.success('Status updated')
                                        }
                                    >
                                        <Select
                                            name="status"
                                            defaultValue={userBook.status}
                                        >
                                            <SelectTrigger className="w-48">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map((opt) => (
                                                    <SelectItem
                                                        key={opt.value}
                                                        value={opt.value}
                                                    >
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="submit"
                                            size="sm"
                                            className="mt-2"
                                        >
                                            Update status
                                        </Button>
                                    </Form>

                                    {userBook.progress_percent > 0 && (
                                        <div className="space-y-1">
                                            <div className="h-2 overflow-hidden rounded-full bg-secondary">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{
                                                        width: `${userBook.progress_percent}%`,
                                                    }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {userBook.progress_percent}%
                                                complete
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        {userBook.rating ? (
                                            <div className="flex items-center gap-1 text-amber-600">
                                                <Star className="size-4 fill-current" />
                                                <span className="text-sm font-medium">
                                                    {userBook.rating}/5
                                                </span>
                                            </div>
                                        ) : null}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setReviewOpen(!reviewOpen)
                                            }
                                        >
                                            {userBook.review
                                                ? 'Edit review'
                                                : 'Write review'}
                                        </Button>
                                    </div>

                                    {reviewOpen && (
                                        <Form
                                            action={paths.userBook(
                                                userBook.id,
                                            )}
                                            method="put"
                                            onSuccess={() => {
                                                toast.success('Review saved');
                                                setReviewOpen(false);
                                            }}
                                            className="space-y-3"
                                        >
                                            <Select
                                                name="rating"
                                                defaultValue={
                                                    userBook.rating?.toString() ??
                                                    undefined
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Rating" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[1, 2, 3, 4, 5].map(
                                                        (n) => (
                                                            <SelectItem
                                                                key={n}
                                                                value={n.toString()}
                                                            >
                                                                {n} star
                                                                {n > 1
                                                                    ? 's'
                                                                    : ''}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <Textarea
                                                name="review"
                                                rows={3}
                                                placeholder="Share your thoughts…"
                                                defaultValue={
                                                    userBook.review ??
                                                    undefined
                                                }
                                            />
                                            <Button type="submit" size="sm">
                                                Save review
                                            </Button>
                                        </Form>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {book.description && (
                            <div>
                                <h2 className="mb-2 font-serif text-xl font-semibold">
                                    About
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    {book.description}
                                </p>
                            </div>
                        )}

                        {book.page_count && (
                            <p className="text-sm text-muted-foreground">
                                {book.page_count} pages
                                {book.language &&
                                    ` · ${book.language.name}`}
                            </p>
                        )}

                        {inLibrary && (
                            <>
                                <Separator />
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <h3 className="mb-3 flex items-center gap-2 font-serif text-lg font-semibold">
                                            <Highlighter className="size-4" />
                                            Highlights
                                        </h3>
                                        {highlights.length > 0 ? (
                                            <ul className="space-y-3">
                                                {highlights
                                                    .slice(0, 5)
                                                    .map((h) => (
                                                        <li
                                                            key={h.id}
                                                            className="rounded-lg border-l-4 bg-secondary/50 p-3 text-sm"
                                                            style={{
                                                                borderColor:
                                                                    h.color,
                                                            }}
                                                        >
                                                            <p className="italic">
                                                                "{h.text}"
                                                            </p>
                                                            {h.note && (
                                                                <p className="mt-1 text-muted-foreground">
                                                                    {h.note}
                                                                </p>
                                                            )}
                                                        </li>
                                                    ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                No highlights yet
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="mb-3 flex items-center gap-2 font-serif text-lg font-semibold">
                                            <StickyNote className="size-4" />
                                            Notes
                                        </h3>
                                        {notes.length > 0 ? (
                                            <ul className="space-y-3">
                                                {notes
                                                    .slice(0, 5)
                                                    .map((n) => (
                                                        <li
                                                            key={n.id}
                                                            className="rounded-lg border border-border bg-card p-3 text-sm"
                                                        >
                                                            {n.content}
                                                        </li>
                                                    ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                No notes yet
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

LibraryShow.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default LibraryShow;
