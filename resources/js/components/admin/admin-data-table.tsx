import { Search } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
    ADMIN_TABLE_PER_PAGE_OPTIONS,
    useAdminDataTable,
    type AdminTablePerPage,
} from '@/hooks/use-admin-data-table';

export type AdminDataTableColumn<T> = {
    id: string;
    header: ReactNode;
    headerClassName?: string;
    cellClassName?: string;
    cell: (item: T) => ReactNode;
};

type AdminDataTableProps<T> = {
    items: T[];
    searchKeys: string[];
    columns: AdminDataTableColumn<T>[];
    rowKey: (item: T) => string | number;
    searchPlaceholder?: string;
    emptyMessage?: string;
    initialPerPage?: AdminTablePerPage;
    toolbar?: ReactNode;
};

function AdminDataTable<T>({
    items,
    searchKeys,
    columns,
    rowKey,
    searchPlaceholder = 'Search…',
    emptyMessage = 'No results found',
    initialPerPage = 15,
    toolbar,
}: AdminDataTableProps<T>) {
    const table = useAdminDataTable({
        items,
        searchKeys,
        initialPerPage,
    });

    const isEmpty = table.paginatedItems.length === 0;

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-sm">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={table.search}
                        onChange={(event) => table.setSearch(event.target.value)}
                        placeholder={searchPlaceholder}
                        className="pl-9"
                        aria-label="Search table"
                    />
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                    {toolbar}
                    <span className="text-xs text-muted-foreground">Rows</span>
                    <Select
                        value={String(table.perPage)}
                        onValueChange={(value) =>
                            table.setPerPage(Number(value) as AdminTablePerPage)
                        }
                    >
                        <SelectTrigger className="h-9 w-[76px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="end">
                            {ADMIN_TABLE_PER_PAGE_OPTIONS.map((option) => (
                                <SelectItem key={option} value={String(option)}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            {columns.map((column) => (
                                <TableHead
                                    key={column.id}
                                    className={column.headerClassName}
                                >
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isEmpty ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell
                                    colSpan={columns.length}
                                    className="py-12 text-center text-muted-foreground"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.paginatedItems.map((item) => (
                                <TableRow key={rowKey(item)}>
                                    {columns.map((column) => (
                                        <TableCell
                                            key={column.id}
                                            className={column.cellClassName}
                                        >
                                            {column.cell(item)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                    {table.total === 0
                        ? 'No entries'
                        : `Showing ${table.from}–${table.to} of ${table.total}`}
                    {table.search.trim() && items.length !== table.total
                        ? ` (filtered from ${items.length})`
                        : null}
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={table.goToPreviousPage}
                        disabled={table.page <= 1}
                    >
                        Previous
                    </Button>
                    <span className="min-w-[88px] text-center text-sm text-muted-foreground">
                        Page {table.page} of {table.lastPage}
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={table.goToNextPage}
                        disabled={table.page >= table.lastPage}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}

export { AdminDataTable };
