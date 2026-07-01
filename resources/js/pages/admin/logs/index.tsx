import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import type { Paginated } from '@/types/book';

type ActivityLog = {
    id: number;
    user_id: number | null;
    action: string;
    subject_type: string | null;
    subject_id: number | null;
    properties: Record<string, unknown> | null;
    ip_address: string | null;
    created_at: string;
    user?: { name: string; email: string } | null;
};

type AdminLogsIndexProps = {
    logs: Paginated<ActivityLog>;
};

function AdminLogsIndex({ logs }: AdminLogsIndexProps) {
    return (
        <>
            <Head title="Admin — Activity Logs" />

            <div className="space-y-6">
                <div>
                    <h1 className="font-serif text-3xl font-bold">
                        Activity Logs
                    </h1>
                    <p className="text-muted-foreground">
                        System audit trail
                    </p>
                </div>

                <div className="rounded-lg border border-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>IP</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-12 text-center text-muted-foreground"
                                    >
                                        No activity logs yet
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.data.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                            {new Date(
                                                log.created_at,
                                            ).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {log.user?.name ?? 'System'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {log.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {log.subject_type
                                                ? `${log.subject_type.split('\\').pop()} #${log.subject_id}`
                                                : '—'}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {log.ip_address ?? '—'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}

AdminLogsIndex.layout = (page: ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default AdminLogsIndex;
