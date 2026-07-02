import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';
import type { Book } from '@/types/book';

type PopularBooksCarouselProps = {
    books: Book[];
    className?: string;
};

function PopularBooksCarousel({ books, className }: PopularBooksCarouselProps) {
    const { t } = useI18n();
    const [activeIndex, setActiveIndex] = useState(0);

    const goTo = useCallback(
        (index: number) => {
            if (books.length === 0) {
                return;
            }

            const normalized =
                ((index % books.length) + books.length) % books.length;
            setActiveIndex(normalized);
        },
        [books.length],
    );

    useEffect(() => {
        if (books.length <= 1) {
            return;
        }

        const interval = window.setInterval(() => {
            setActiveIndex((current) => (current + 1) % books.length);
        }, 5000);

        return () => window.clearInterval(interval);
    }, [books.length]);

    if (books.length === 0) {
        return null;
    }

    return (
        <section
            className={cn(
                'overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm',
                className,
            )}
        >
            <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2.5">
                <div className="min-w-0">
                    <h2 className="font-serif text-sm font-semibold">
                        {t('library_popular_picks')}
                    </h2>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {t('library_popular_picks_desc')}
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-full"
                        onClick={() => goTo(activeIndex - 1)}
                        aria-label={t('library_carousel_prev')}
                    >
                        <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-full"
                        onClick={() => goTo(activeIndex + 1)}
                        aria-label={t('library_carousel_next')}
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>

            <div className="relative h-32 sm:h-36">
                {books.map((book, index) => (
                    <Link
                        key={book.id}
                        href={paths.libraryShow(book.uuid)}
                        className={cn(
                            'absolute inset-0 transition-opacity duration-500',
                            index === activeIndex
                                ? 'z-10 opacity-100'
                                : 'pointer-events-none opacity-0',
                        )}
                    >
                        {book.cover_url ? (
                            <img
                                src={book.cover_url}
                                alt=""
                                className="size-full object-cover object-top"
                            />
                        ) : (
                            <div className="size-full bg-muted" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 px-4 py-3">
                            <p className="font-serif text-sm font-semibold text-white line-clamp-1">
                                {book.title}
                            </p>
                            <p className="text-xs text-white/80 line-clamp-1">
                                {book.author}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="flex items-center justify-center gap-1.5 px-4 py-2">
                {books.map((book, index) => (
                    <button
                        key={book.id}
                        type="button"
                        aria-label={`${book.title} slide`}
                        onClick={() => goTo(index)}
                        className={cn(
                            'h-1.5 rounded-full transition-all',
                            index === activeIndex
                                ? 'w-5 bg-primary'
                                : 'w-1.5 bg-primary/25 hover:bg-primary/40',
                        )}
                    />
                ))}
            </div>
        </section>
    );
}

export { PopularBooksCarousel };
