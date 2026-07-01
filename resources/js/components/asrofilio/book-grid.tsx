import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type BookGridProps = {
    children: ReactNode;
    className?: string;
    empty?: ReactNode;
    isEmpty?: boolean;
};

function BookGrid({
    children,
    className,
    empty,
    isEmpty = false,
}: BookGridProps) {
    if (isEmpty && empty) {
        return <div className="py-16 text-center">{empty}</div>;
    }

    return (
        <div
            className={cn(
                'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
                className,
            )}
        >
            {children}
        </div>
    );
}

export { BookGrid };
