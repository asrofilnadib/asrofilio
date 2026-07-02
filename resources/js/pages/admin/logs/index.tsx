import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

import { AdminDataTable } from '@/components/admin/admin-data-table';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/layouts/admin-layout';

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

type ActivityLogRow = ActivityLog & {
    subject_label: string;
};

type AdminLogsIndexProps = {
    logs: ActivityLog[];
};

function formatSubjectLabel(log: ActivityLog): string {
    if (!log.subject_type) {
        return '';
    }

    const model = log.subject_type.split('\\').pop() ?? log.subject_type;

    return `${model} #${log.subject_id}`;
}

function AdminLogsIndex({ logs }: AdminLogsIndexProps) {
    const logRows = useMemo<ActivityLogRow[]>(
        () =>
            logs.map((log) => ({
                ...log,
                subject_label: formatSubjectLabel(log),
            })),
        [logs],
    );

    const columns = useMemo(
        () => [
            {
                id: 'time',
                header: 'Time',
                cell: (log: ActivityLogRow) => (
                    <span className="whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                    </span>
                ),
            },
            {
                id: 'user',
                header: 'User',
                cell: (log: ActivityLogRow) => (
                    <div className="text-sm">
                        <span className="block">
                            {log.user?.name ?? 'System'}
                        </span>
                        {log.user?.email ? (
                            <span className="block text-xs text-muted-foreground">
                                {log.user.email}
                            </span>
                        ) : null}
                    </div>
                ),
            },
            {
                id: 'action',
                header: 'Action',
                cell: (log: ActivityLogRow) => (
                    <Badge variant="outline">{log.action}</Badge>
                ),
            },
            {
                id: 'subject',
                header: 'Subject',
                cell: (log: ActivityLogRow) => (
                    <span className="text-sm text-muted-foreground">
                        {log.subject_label || '—'}
                    </span>
                ),
            },
            {
                id: 'ip',
                header: 'IP',
                cell: (log: ActivityLogRow) => (
                    <span className="font-mono text-xs text-muted-foreground">
                        {log.ip_address ?? '—'}
                    </span>
                ),
            },
        ],
        [],
    );

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

                <AdminDataTable
                    items={logRows}
                    searchKeys={[
                        'action',
                        'user.name',
                        'user.email',
                        'subject_label',
                        'ip_address',
                    ]}
                    searchPlaceholder="Search logs by action, user, subject…"
                    emptyMessage="No activity logs yet"
                    initialPerPage={25}
                    columns={columns}
                    rowKey={(log) => log.id}
                />
            </div>
        </>
    );
}

AdminLogsIndex.layout = (page: ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default AdminLogsIndex;
