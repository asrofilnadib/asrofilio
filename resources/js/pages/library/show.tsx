import { Form, Head, Link, router } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    Download,
    Highlighter,
    Play,
    Star,
    StickyNote,
    Trash2,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

import { ReadingProgressBar } from '@/components/asrofilio/reading-progress-bar';
import { PageBreadcrumb } from '@/components/asrofilio/page-breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookHighlightsModal } from '@/components/modals/book-highlights-modal';
import { BookNotesModal } from '@/components/modals/book-notes-modal';
import { ConfirmDeleteDialog } from '@/components/modals/confirm-delete-dialog';
import { ScheduleBookModal } from '@/components/modals/schedule-book-modal';
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
import { useI18n } from '@/lib/i18n';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';
import type { Book, Highlight, Note, ReadingStatus, UserBook } from '@/types/book';

type LibraryShowProps = {
    book: Book;
    userBook?: UserBook | null;
    highlights?: Highlight[];
    notes?: Note[];
    libraryScope?: 'mine' | 'public';
};

const statusOptions: Array<{
    value: ReadingStatus;
    labelKey: 'library_status_unread' | 'library_status_reading' | 'library_status_scheduled' | 'library_status_completed';
}> = [
    { value: 'unread', labelKey: 'library_status_unread' },
    { value: 'in_progress', labelKey: 'library_status_reading' },
    { value: 'scheduled', labelKey: 'library_status_scheduled' },
    { value: 'completed', labelKey: 'library_status_completed' },
];

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function LibraryShow({
    book,
    userBook,
    highlights = [],
    notes = [],
    libraryScope = 'public',
}: LibraryShowProps) {
    const { t } = useI18n();
    const [reviewOpen, setReviewOpen] = useState(false);
    const [scheduleOpen, setScheduleOpen] = useState(false);
    const [highlightsOpen, setHighlightsOpen] = useState(false);
    const [notesOpen, setNotesOpen] = useState(false);
    const [removeOpen, setRemoveOpen] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [status, setStatus] = useState<ReadingStatus>(
        userBook?.status ?? 'unread',
    );
    const inLibrary = Boolean(userBook);
    const coverUrl = book.cover_url;
    const canDownload = Boolean(book.file_type);

    function updateStatus(next: ReadingStatus) {
        if (!userBook) {
            return;
        }

        setStatus(next);
        router.patch(
            paths.userBook(userBook.id),
            { status: next },
            {
                preserveScroll: true,
                onSuccess: () => toast.success(t('library_status_updated')),
            },
        );
    }

    function confirmRemove() {
        if (!userBook) {
            return;
        }

        setRemoving(true);
        router.delete(paths.userBook(userBook.id), {
            onSuccess: () => toast.success(t('library_removed')),
            onFinish: () => {
                setRemoving(false);
                setRemoveOpen(false);
            },
        });
    }

    return (
        <>
            <Head title={book.title} />

            <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
                <PageBreadcrumb
                    items={[
                        {
                            label:
                                libraryScope === 'mine'
                                    ? t('library_my')
                                    : t('library_public'),
                            href: `${paths.library}?scope=${libraryScope}`,
                        },
                        { label: book.title },
                    ]}
                />

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

                        <div className="flex flex-wrap gap-2">
                            {inLibrary && userBook && book.file_type && (
                                <Button asChild>
                                    <Link href={paths.reader(book.uuid)}>
                                        <Play className="size-4" />
                                        {userBook.status === 'in_progress'
                                            ? t('library_continue_reading')
                                            : t('library_start_reading')}
                                    </Link>
                                </Button>
                            )}
                            {inLibrary && canDownload && (
                                <Button variant="outline" asChild>
                                    <a
                                        href={paths.readerFile(book.uuid)}
                                        download
                                    >
                                        <Download className="size-4" />
                                        {t('library_download')}
                                    </a>
                                </Button>
                            )}
                            {!inLibrary && (
                                <Form
                                    action={paths.userBooks}
                                    method="post"
                                    onSuccess={() => {
                                        toast.success('Added to library');
                                        if (book.file_type === 'pdf') {
                                            router.visit(
                                                paths.reader(book.uuid),
                                            );
                                        }
                                    }}
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
                            {inLibrary && userBook && (
                                <Button
                                    variant="outline"
                                    onClick={() => setRemoveOpen(true)}
                                >
                                    <Trash2 className="size-4" />
                                    {t('library_remove')}
                                </Button>
                            )}
                        </div>

                        {userBook && (
                            <div className="space-y-4 rounded-xl border border-border/70 bg-secondary/30 p-4">
                                <div className="flex flex-wrap gap-2">
                                    {statusOptions.map(({ value, labelKey }) => (
                                        <Button
                                            key={value}
                                            type="button"
                                            size="sm"
                                            variant={
                                                status === value
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            className={cn(
                                                'rounded-full',
                                                status === value &&
                                                    'shadow-sm',
                                            )}
                                            onClick={() => updateStatus(value)}
                                        >
                                            {t(labelKey)}
                                        </Button>
                                    ))}
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                    {userBook.progress_percent > 0 && (
                                        <ReadingProgressBar
                                            value={userBook.progress_percent}
                                            labelPosition="inline"
                                            size="md"
                                            className="min-w-[140px] flex-1"
                                        />
                                    )}
                                    {userBook.current_page > 0 && (
                                        <span>
                                            Page {userBook.current_page}
                                        </span>
                                    )}
                                    {userBook.rating ? (
                                        <span className="flex items-center gap-1 text-amber-600">
                                            <Star className="size-3.5 fill-current" />
                                            {userBook.rating}/5
                                        </span>
                                    ) : null}
                                </div>

                                {status === 'scheduled' && (
                                    <div className="flex flex-wrap items-center gap-2 text-sm">
                                        <Calendar className="size-4 text-muted-foreground" />
                                        <span>
                                            {t('library_scheduled_for')}:{' '}
                                            {userBook.scheduled_at
                                                ? formatDate(
                                                      userBook.scheduled_at,
                                                  )
                                                : '—'}
                                        </span>
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="h-auto p-0"
                                            onClick={() => setScheduleOpen(true)}
                                        >
                                            {t('library_reschedule')}
                                        </Button>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setScheduleOpen(true)}
                                    >
                                        <Calendar className="size-4" />
                                        {t('library_schedule')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setReviewOpen(!reviewOpen)
                                        }
                                    >
                                        {userBook.review
                                            ? t('library_edit_review')
                                            : t('library_write_review')}
                                    </Button>
                                </div>

                                {reviewOpen && (
                                    <Form
                                        action={paths.userBook(userBook.id)}
                                        method="patch"
                                        onSuccess={() => {
                                            toast.success('Review saved');
                                            setReviewOpen(false);
                                        }}
                                        className="space-y-3 rounded-lg border border-border/60 bg-background/60 p-3"
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
                                                {[1, 2, 3, 4, 5].map((n) => (
                                                    <SelectItem
                                                        key={n}
                                                        value={n.toString()}
                                                    >
                                                        {n} star
                                                        {n > 1 ? 's' : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Textarea
                                            name="review"
                                            rows={3}
                                            placeholder="Share your thoughts…"
                                            defaultValue={
                                                userBook.review ?? undefined
                                            }
                                        />
                                        <Button type="submit" size="sm">
                                            Save review
                                        </Button>
                                    </Form>
                                )}
                            </div>
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
                                    <div className="rounded-xl border border-border/70 bg-card p-4">
                                        <div className="mb-3 flex items-center justify-between">
                                            <h3 className="flex items-center gap-2 font-serif text-lg font-semibold">
                                                <Highlighter className="size-4" />
                                                {t('library_highlights')}
                                                <Badge variant="secondary">
                                                    {highlights.length}
                                                </Badge>
                                            </h3>
                                            {highlights.length > 0 && (
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="h-auto p-0"
                                                    onClick={() =>
                                                        setHighlightsOpen(true)
                                                    }
                                                >
                                                    {t('library_view_all')}
                                                </Button>
                                            )}
                                        </div>
                                        {highlights.length > 0 ? (
                                            <ul className="space-y-3">
                                                {highlights
                                                    .slice(0, 3)
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
                                                                &ldquo;{h.text}
                                                                &rdquo;
                                                            </p>
                                                        </li>
                                                    ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                {t('library_no_highlights')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="rounded-xl border border-border/70 bg-card p-4">
                                        <div className="mb-3 flex items-center justify-between">
                                            <h3 className="flex items-center gap-2 font-serif text-lg font-semibold">
                                                <StickyNote className="size-4" />
                                                {t('library_notes')}
                                                <Badge variant="secondary">
                                                    {notes.length}
                                                </Badge>
                                            </h3>
                                            {notes.length > 0 && (
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="h-auto p-0"
                                                    onClick={() =>
                                                        setNotesOpen(true)
                                                    }
                                                >
                                                    {t('library_view_all')}
                                                </Button>
                                            )}
                                        </div>
                                        {notes.length > 0 ? (
                                            <ul className="space-y-3">
                                                {notes.slice(0, 3).map((n) => (
                                                    <li
                                                        key={n.id}
                                                        className="rounded-lg border border-border bg-secondary/30 p-3 text-sm"
                                                    >
                                                        {n.content}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                {t('library_no_notes')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {userBook && (
                <>
                    <ScheduleBookModal
                        open={scheduleOpen}
                        onOpenChange={setScheduleOpen}
                        book={book}
                        userBookId={userBook.id}
                        defaultDate={userBook.scheduled_at}
                    />
                    <BookHighlightsModal
                        open={highlightsOpen}
                        onOpenChange={setHighlightsOpen}
                        book={book}
                        initialHighlights={highlights}
                    />
                    <BookNotesModal
                        open={notesOpen}
                        onOpenChange={setNotesOpen}
                        book={book}
                        initialNotes={notes}
                    />
                </>
            )}

            <ConfirmDeleteDialog
                open={removeOpen}
                onOpenChange={setRemoveOpen}
                onConfirm={confirmRemove}
                title={t('library_remove_confirm_title')}
                description={t('library_remove_confirm_desc')}
                confirmLabel={t('library_remove')}
                isLoading={removing}
            />
        </>
    );
}

LibraryShow.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default LibraryShow;
