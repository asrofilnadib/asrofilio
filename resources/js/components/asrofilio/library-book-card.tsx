import { Form, Link, router, usePage } from '@inertiajs/react';
import { BookOpen, BookPlus, Calendar, Download } from 'lucide-react';
import { useState, type MouseEvent } from 'react';
import { toast } from 'sonner';

import { LibraryBookQuickMenu } from '@/components/asrofilio/library-book-quick-menu';
import { ReadingProgressBar } from '@/components/asrofilio/reading-progress-bar';
import { BookHighlightsModal } from '@/components/modals/book-highlights-modal';
import { BookNotesModal } from '@/components/modals/book-notes-modal';
import { ConfirmDeleteDialog } from '@/components/modals/confirm-delete-dialog';
import { ScheduleBookModal } from '@/components/modals/schedule-book-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';
import type { Auth } from '@/types/auth';
import type { Book, UserBook } from '@/types/book';

type LibraryBookCardProps = {
    book: Book;
    userBook?: UserBook | null;
    scope: 'mine' | 'public';
    className?: string;
};

function LibraryBookCard({
    book,
    userBook,
    scope,
    className,
}: LibraryBookCardProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const { t } = useI18n();
    const [scheduleOpen, setScheduleOpen] = useState(false);
    const [highlightsOpen, setHighlightsOpen] = useState(false);
    const [notesOpen, setNotesOpen] = useState(false);
    const [removeOpen, setRemoveOpen] = useState(false);
    const [removing, setRemoving] = useState(false);

    const coverUrl = book.cover_url;
    const progress = userBook?.progress_percent ?? 0;
    const inLibrary = Boolean(userBook);
    const isMine = scope === 'mine' && inLibrary && userBook;
    const isPublic = scope === 'public';
    const showAddButton = isPublic && !inLibrary;
    const cardHref =
        inLibrary && book.file_type
            ? paths.reader(book.uuid)
            : paths.libraryShow(book.uuid);
    const canDownload = Boolean(book.file_type);
    const showProgress = isMine && userBook.status === 'in_progress';

    function confirmRemove() {
        if (!userBook) {
            return;
        }

        setRemoving(true);
        router.delete(paths.userBook(userBook.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('library_removed'));
                setRemoveOpen(false);
            },
            onFinish: () => setRemoving(false),
        });
    }

    function stopCardNavigation(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
    }

    return (
        <>
            <article
                className={cn(
                    'group flex flex-col rounded-2xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md',
                    className,
                )}
            >
                <div className="relative overflow-hidden rounded-t-2xl">
                    <Link
                        href={cardHref}
                        className="relative block aspect-[3/4] overflow-hidden bg-muted"
                    >
                        {coverUrl ? (
                            <img
                                src={coverUrl}
                                alt=""
                                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex size-full items-center justify-center bg-secondary">
                                <BookOpen className="size-12 text-muted-foreground/30" />
                            </div>
                        )}

                        {book.genres && book.genres.length > 0 && (
                            <div className="absolute top-2.5 left-2.5 z-10 flex max-w-[70%] flex-wrap gap-1">
                                {book.genres.slice(0, 2).map((genre) => (
                                    <Badge
                                        key={genre.id}
                                        variant="secondary"
                                        className="border-0 bg-black/45 text-[10px] text-white backdrop-blur-sm"
                                    >
                                        {genre.name}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-3 pt-10 pb-3">
                            <h3 className="font-serif text-sm leading-tight font-bold tracking-wide text-white uppercase line-clamp-2">
                                {book.title}
                            </h3>
                            <p className="mt-1 text-xs text-white/80 line-clamp-1">
                                {book.author}
                            </p>
                        </div>
                    </Link>

                    {isMine && (
                        <div
                            className="absolute top-2.5 right-2.5 z-20"
                            onClick={stopCardNavigation}
                        >
                            <LibraryBookQuickMenu
                                book={book}
                                userBook={userBook}
                                onOpenHighlights={() =>
                                    setHighlightsOpen(true)
                                }
                                onOpenNotes={() => setNotesOpen(true)}
                                onRemove={() => setRemoveOpen(true)}
                            />
                        </div>
                    )}
                </div>

                <div className="flex flex-1 flex-col gap-2.5 p-3">
                    <Link href={cardHref} className="min-h-0">
                        <h4 className="font-serif text-sm font-semibold leading-snug line-clamp-2 hover:underline">
                            {book.title}
                        </h4>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                            {book.author}
                        </p>
                    </Link>

                    {showProgress && (
                        <ReadingProgressBar value={progress} size="sm" />
                    )}

                    {isMine && (
                        <div
                            className="mt-auto grid grid-cols-2 divide-x divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-secondary/50"
                            onClick={stopCardNavigation}
                        >
                            <Button
                                type="button"
                                variant="ghost"
                                className="flex h-auto flex-col items-center gap-1 rounded-none px-2 py-2.5 hover:bg-background/60"
                                onClick={() => setScheduleOpen(true)}
                            >
                                <Calendar className="size-4 shrink-0" />
                                <span className="text-[10px] font-medium leading-none">
                                    {t('library_schedule')}
                                </span>
                            </Button>
                            {canDownload ? (
                                <Button
                                    variant="ghost"
                                    className="flex h-auto flex-col items-center gap-1 rounded-none px-2 py-2.5 hover:bg-background/60"
                                    asChild
                                >
                                    <a
                                        href={paths.readerFile(book.uuid)}
                                        download
                                        onClick={stopCardNavigation}
                                    >
                                        <Download className="size-4 shrink-0" />
                                        <span className="text-[10px] font-medium leading-none">
                                            {t('library_download')}
                                        </span>
                                    </a>
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="flex h-auto flex-col items-center gap-1 rounded-none px-2 py-2.5"
                                    disabled
                                >
                                    <Download className="size-4 shrink-0" />
                                    <span className="text-[10px] font-medium leading-none">
                                        {t('library_download')}
                                    </span>
                                </Button>
                            )}
                        </div>
                    )}

                    {showAddButton && auth.user && (
                        <Form
                            action={paths.addToLibrary(book.uuid)}
                            method="post"
                            className="mt-auto"
                            onSuccess={() =>
                                toast.success(t('library_added_to_library'))
                            }
                        >
                            <Button
                                type="submit"
                                variant="outline"
                                size="sm"
                                className="h-9 w-full gap-1.5 text-xs font-medium"
                            >
                                <BookPlus className="size-3.5 shrink-0" />
                                {t('library_add_to_my_library')}
                            </Button>
                        </Form>
                    )}

                    {showAddButton && !auth.user && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-auto h-9 w-full gap-1.5 text-xs font-medium"
                            asChild
                        >
                            <Link href="/login">
                                <BookPlus className="size-3.5 shrink-0" />
                                {t('library_add_to_my_library')}
                            </Link>
                        </Button>
                    )}

                    {isPublic && inLibrary && (
                        <p className="mt-auto rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-center text-[11px] font-medium text-primary">
                            {t('library_in_your_library')}
                        </p>
                    )}
                </div>
            </article>

            {isMine && (
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
                    />
                    <BookNotesModal
                        open={notesOpen}
                        onOpenChange={setNotesOpen}
                        book={book}
                    />
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
            )}
        </>
    );
}

export { LibraryBookCard };
export type { LibraryBookCardProps };
