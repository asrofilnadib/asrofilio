import { Link } from '@inertiajs/react';
import { BookOpen, Star } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';
import type { Book, ReadingStatus, UserBook } from '@/types/book';

const statusLabels: Record<ReadingStatus, string> = {
    unread: 'Unread',
    in_progress: 'Reading',
    scheduled: 'Scheduled',
    completed: 'Completed',
};

const statusVariants: Record<
    ReadingStatus,
    'default' | 'secondary' | 'outline' | 'destructive'
> = {
    unread: 'outline',
    in_progress: 'default',
    scheduled: 'secondary',
    completed: 'default',
};

type BookCardProps = {
    book: Book;
    userBook?: UserBook | null;
    showProgress?: boolean;
    className?: string;
};

function BookCard({
    book,
    userBook,
    showProgress = true,
    className,
}: BookCardProps) {
    const coverUrl = book.cover_url;
    const status = userBook?.status;
    const progress = userBook?.progress_percent ?? 0;

    return (
        <Card
            className={cn(
                'group overflow-hidden border-border/60 bg-card transition-shadow hover:shadow-md',
                className,
            )}
        >
            <Link href={paths.libraryShow(book.id)} className="block">
                <div className="relative aspect-[2/3] overflow-hidden bg-muted">
                    {coverUrl ? (
                        <img
                            src={coverUrl}
                            alt=""
                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center bg-secondary">
                            <BookOpen className="size-12 text-muted-foreground/40" />
                        </div>
                    )}
                    {status && (
                        <Badge
                            variant={statusVariants[status]}
                            className="absolute top-2 right-2 text-xs"
                        >
                            {statusLabels[status]}
                        </Badge>
                    )}
                </div>
                <CardContent className="space-y-2 p-4">
                    <h3 className="font-serif text-base leading-snug font-semibold text-foreground line-clamp-2">
                        {book.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                        {book.author}
                    </p>
                    {showProgress && userBook && status === 'in_progress' && (
                        <div className="space-y-1">
                            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                                <div
                                    className="h-full rounded-full bg-primary transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {progress}% complete
                            </p>
                        </div>
                    )}
                    {userBook?.rating && (
                        <div className="flex items-center gap-1 text-amber-600">
                            <Star className="size-3.5 fill-current" />
                            <span className="text-xs font-medium">
                                {userBook.rating}/5
                            </span>
                        </div>
                    )}
                </CardContent>
            </Link>
        </Card>
    );
}

export { BookCard };
