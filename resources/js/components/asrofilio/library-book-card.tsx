import { Form, Link } from '@inertiajs/react';
import { BookOpen, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';
import type { Book, UserBook } from '@/types/book';

type LibraryBookCardProps = {
    book: Book;
    userBook?: UserBook | null;
    scope: 'mine' | 'public';
    showAddToLibrary?: boolean;
    className?: string;
};

function LibraryBookCard({
    book,
    userBook,
    scope,
    showAddToLibrary = false,
    className,
}: LibraryBookCardProps) {
    const coverUrl = book.cover_url;
    const progress = userBook?.progress_percent ?? 0;
    const inLibrary = Boolean(userBook);

    return (
        <article
            className={cn(
                'group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md',
                className,
            )}
        >
            <Link
                href={paths.libraryShow(book.uuid)}
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
                    <div className="absolute top-2.5 left-2.5 flex max-w-[85%] flex-wrap gap-1">
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

                <div className="absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm">
                    <MoreVertical className="size-3.5" />
                </div>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-3 pt-10 pb-3">
                    <h3 className="font-serif text-sm leading-tight font-bold tracking-wide text-white uppercase line-clamp-2">
                        {book.title}
                    </h3>
                    <p className="mt-1 text-xs text-white/80 line-clamp-1">
                        {book.author}
                    </p>
                </div>
            </Link>

            <div className="flex flex-1 flex-col gap-2 p-3">
                <div className="min-h-0">
                    <h4 className="font-serif text-sm font-semibold leading-snug line-clamp-2">
                        {book.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                        {book.author}
                    </p>
                </div>

                {scope === 'mine' &&
                    userBook &&
                    userBook.status === 'in_progress' && (
                        <div className="space-y-1">
                            <div className="h-1 overflow-hidden rounded-full bg-secondary">
                                <div
                                    className="h-full rounded-full bg-primary"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                {progress}% complete
                            </p>
                        </div>
                    )}

                {showAddToLibrary && !inLibrary && (
                    <Form
                        action={paths.addToLibrary(book.uuid)}
                        method="post"
                        className="mt-auto"
                        onSuccess={() =>
                            toast.success('Added to your library')
                        }
                    >
                        <Button
                            type="submit"
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                        >
                            Add to My Library
                        </Button>
                    </Form>
                )}

                {inLibrary && scope === 'public' && (
                    <p className="mt-auto text-[10px] font-medium text-primary">
                        In your library
                    </p>
                )}
            </div>
        </article>
    );
}

export { LibraryBookCard };
export type { LibraryBookCardProps };
