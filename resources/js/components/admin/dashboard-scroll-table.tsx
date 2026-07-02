import { Link, router } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { paths } from '@/lib/paths';

export type DashboardTableLimit = '5' | '10' | '25' | '50' | '100' | 'all';

const LIMIT_OPTIONS: DashboardTableLimit[] = [
    '5',
    '10',
    '25',
    '50',
    '100',
    'all',
];

/** Visible body height for five table rows. */
const SCROLL_BODY_HEIGHT_PX = 260;

type DashboardTableLimits = {
    users_limit: DashboardTableLimit;
    books_limit: DashboardTableLimit;
    activity_limit: DashboardTableLimit;
};

type DashboardScrollTableProps = {
    title: string;
    viewAllHref?: string;
    viewAllLabel?: string;
    limitParam: keyof DashboardTableLimits;
    currentLimit: DashboardTableLimit;
    tableLimits: DashboardTableLimits;
    total: number;
    loadedCount: number;
    columns: string[];
    emptyMessage: string;
    children: ReactNode;
};

function DashboardScrollTable({
    title,
    viewAllHref,
    viewAllLabel = 'View all',
    limitParam,
    currentLimit,
    tableLimits,
    total,
    loadedCount,
    columns,
    emptyMessage,
    children,
}: DashboardScrollTableProps) {
    function handleLimitChange(value: DashboardTableLimit) {
        router.get(
            paths.admin.dashboard,
            {
                ...tableLimits,
                [limitParam]: value,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: [
                    'recentUsers',
                    'recentBooks',
                    'recentActivity',
                    'tableLimits',
                    'tableTotals',
                ],
            },
        );
    }

    const isEmpty = loadedCount === 0;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="font-serif">{title}</CardTitle>
                {viewAllHref ? (
                    <Link
                        href={viewAllHref}
                        className="text-sm text-primary hover:underline"
                    >
                        {viewAllLabel}
                    </Link>
                ) : null}
            </CardHeader>
            <CardContent className="p-0">
                <div
                    className="overflow-y-auto"
                    style={{ maxHeight: `${SCROLL_BODY_HEIGHT_PX}px` }}
                >
                    <Table>
                        <TableHeader className="sticky top-0 z-10 bg-card">
                            <TableRow>
                                {columns.map((column) => (
                                    <TableHead key={column}>{column}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isEmpty ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        {emptyMessage}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                children
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
                    <p className="text-xs text-muted-foreground">
                        Showing {loadedCount} of {total}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                            Load
                        </span>
                        <Select
                            value={currentLimit}
                            onValueChange={(value) =>
                                handleLimitChange(value as DashboardTableLimit)
                            }
                        >
                            <SelectTrigger className="h-8 w-[88px] text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="end">
                                {LIMIT_OPTIONS.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option === 'all' ? 'All' : option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export { DashboardScrollTable, LIMIT_OPTIONS };
