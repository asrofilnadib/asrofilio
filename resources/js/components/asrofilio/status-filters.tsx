import { router } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ReadingStatus } from '@/types/book';

import type { LibraryFilters } from '@/components/asrofilio/library-sidebar';

const filters: Array<{ value: ReadingStatus | 'all'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'in_progress', label: 'Reading' },
    { value: 'unread', label: 'Unread' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
];

type StatusFiltersProps = {
    active: ReadingStatus | 'all';
    libraryFilters: LibraryFilters;
    className?: string;
};

function StatusFilters({
    active,
    libraryFilters,
    className,
}: StatusFiltersProps) {
    function handleChange(status: ReadingStatus | 'all') {
        router.get(
            window.location.pathname,
            {
                scope: libraryFilters.scope,
                genre: libraryFilters.genre ?? undefined,
                search: libraryFilters.search ?? undefined,
                status: status === 'all' ? undefined : status,
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <div className={cn('flex flex-wrap gap-2', className)}>
            {filters.map(({ value, label }) => (
                <Button
                    key={value}
                    type="button"
                    size="sm"
                    variant={active === value ? 'default' : 'outline'}
                    className="rounded-full"
                    onClick={() => handleChange(value)}
                >
                    {label}
                </Button>
            ))}
        </div>
    );
}

export { StatusFilters };
