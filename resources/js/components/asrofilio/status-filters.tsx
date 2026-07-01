import { router } from '@inertiajs/react';

import type { LibraryFilters } from '@/components/asrofilio/library-sidebar';
import { Button } from '@/components/ui/button';
import { buildLibraryQuery } from '@/lib/library-query';
import { cn } from '@/lib/utils';
import type { ReadingStatus } from '@/types/book';

const filters: Array<{ value: ReadingStatus | 'all'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'in_progress', label: 'Reading' },
    { value: 'unread', label: 'Unread' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
];

type StatusFiltersProps = {
    active: ReadingStatus | 'all';
    libraryFilters: LibraryFilters & { scope: 'mine' | 'public' };
    basePath: string;
    className?: string;
};

function StatusFilters({
    active,
    libraryFilters,
    basePath,
    className,
}: StatusFiltersProps) {
    function handleChange(status: ReadingStatus | 'all') {
        router.get(
            basePath,
            buildLibraryQuery(libraryFilters, {
                status: status === 'all' ? null : status,
            }),
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
