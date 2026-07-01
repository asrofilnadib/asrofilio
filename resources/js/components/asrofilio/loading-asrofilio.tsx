import { BookOpen } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type LoadingAsrofilioProps = {
    message?: string;
    className?: string;
    variant?: 'page' | 'grid' | 'inline';
};

function LoadingAsrofilio({
    message = 'Loading your library…',
    className,
    variant = 'page',
}: LoadingAsrofilioProps) {
    if (variant === 'inline') {
        return (
            <div
                className={cn(
                    'flex items-center gap-2 text-sm text-muted-foreground',
                    className,
                )}
            >
                <BookOpen className="size-4 animate-pulse text-primary" />
                <span>{message}</span>
            </div>
        );
    }

    if (variant === 'grid') {
        return (
            <div
                className={cn(
                    'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
                    className,
                )}
            >
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div
            className={cn(
                'flex min-h-[40vh] flex-col items-center justify-center gap-4',
                className,
            )}
        >
            <div className="relative">
                <BookOpen className="size-12 text-primary/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            </div>
            <p className="font-serif text-lg text-muted-foreground">
                {message}
            </p>
        </div>
    );
}

export { LoadingAsrofilio };
