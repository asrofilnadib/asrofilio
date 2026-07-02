import { Head, Link } from '@inertiajs/react';
import { BookOpen, FileText, Users } from 'lucide-react';
import type { ReactNode } from 'react';

import { DashboardScrollTable } from '@/components/admin/dashboard-scroll-table';
import type { DashboardTableLimit } from '@/components/admin/dashboard-scroll-table';
import { AdminActivityChart } from '@/components/charts/admin-activity-chart';
import { AdminColumnChart } from '@/components/charts/admin-column-chart';
import { ContentOverviewChart } from '@/components/charts/content-overview-chart';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableCell, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { paths } from '@/lib/paths';
import type {
    AdminRecentActivity,
    AdminRecentBook,
    AdminRecentUser,
} from '@/types/admin';

type DashboardProps = {
    stats: {
        total_books: number;
        total_users: number;
        total_highlights: number;
        total_user_books: number;
        recent_activity_count: number;
    };
    booksAddedChart: Array<{ month: string; count: number }>;
    usersRegisteredChart: Array<{ month: string; count: number }>;
    activityChart: Array<{ date: string; count: number }>;
    contentOverviewChart: Array<{ name: string; y: number }>;
    recentUsers: AdminRecentUser[];
    recentBooks: AdminRecentBook[];
    recentActivity: AdminRecentActivity[];
    tableLimits: {
        users_limit: DashboardTableLimit;
        books_limit: DashboardTableLimit;
        activity_limit: DashboardTableLimit;
    };
    tableTotals: {
        users: number;
        books: number;
        activity: number;
    };
};

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatAction(action: string): string {
    return action
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function Dashboard({
    stats,
    booksAddedChart,
    usersRegisteredChart,
    activityChart,
    contentOverviewChart,
    recentUsers,
    recentBooks,
    recentActivity,
    tableLimits,
    tableTotals,
}: DashboardProps) {
    const statCards = [
        {
            label: 'Total books',
            value: stats.total_books,
            icon: BookOpen,
        },
        {
            label: 'Users',
            value: stats.total_users,
            icon: Users,
        },
        {
            label: 'Highlights',
            value: stats.total_highlights,
            icon: FileText,
        },
        {
            label: 'Activity (7d)',
            value: stats.recent_activity_count,
            icon: FileText,
        },
    ];

    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="space-y-8">
                <div>
                    <h1 className="font-serif text-3xl font-bold">
                        Dashboard
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Asrofilio administration overview
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map(({ label, value, icon: Icon }) => (
                        <Card key={label}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {label}
                                </CardTitle>
                                <Icon className="size-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-serif">
                                Books added
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AdminColumnChart
                                data={booksAddedChart}
                                title="Books"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-serif">
                                User registrations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AdminColumnChart
                                data={usersRegisteredChart}
                                title="Users"
                                tone="secondary"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-serif">
                                Activity (last 7 days)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AdminActivityChart data={activityChart} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-serif">
                                Content overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ContentOverviewChart
                                data={contentOverviewChart}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <DashboardScrollTable
                        title="Recent users"
                        viewAllHref={paths.admin.users}
                        limitParam="users_limit"
                        currentLimit={tableLimits.users_limit}
                        tableLimits={tableLimits}
                        total={tableTotals.users}
                        loadedCount={recentUsers.length}
                        columns={['User', 'Library', 'Joined']}
                        emptyMessage="No users yet"
                    >
                        {recentUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <Link
                                        href={paths.admin.user(user.id)}
                                        className="block hover:underline"
                                    >
                                        <span className="font-medium">
                                            {user.name}
                                        </span>
                                        <span className="block text-xs text-muted-foreground">
                                            {user.email}
                                        </span>
                                    </Link>
                                </TableCell>
                                <TableCell className="tabular-nums">
                                    {user.library_count}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {formatDate(user.joined_at)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </DashboardScrollTable>

                    <DashboardScrollTable
                        title="Recent books"
                        viewAllHref={paths.admin.books}
                        limitParam="books_limit"
                        currentLimit={tableLimits.books_limit}
                        tableLimits={tableLimits}
                        total={tableTotals.books}
                        loadedCount={recentBooks.length}
                        columns={['Title', 'In libraries', 'Added']}
                        emptyMessage="No books yet"
                    >
                        {recentBooks.map((book) => (
                            <TableRow key={book.id}>
                                <TableCell>
                                    <Link
                                        href={paths.admin.book(book.uuid)}
                                        className="block hover:underline"
                                    >
                                        <span className="font-medium line-clamp-1">
                                            {book.title}
                                        </span>
                                        <span className="block text-xs text-muted-foreground line-clamp-1">
                                            {book.author}
                                        </span>
                                    </Link>
                                </TableCell>
                                <TableCell className="tabular-nums">
                                    {book.library_count}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {formatDate(book.added_at)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </DashboardScrollTable>
                </div>

                <DashboardScrollTable
                    title="Recent platform activity"
                    viewAllHref={paths.admin.logs}
                    viewAllLabel="View logs"
                    limitParam="activity_limit"
                    currentLimit={tableLimits.activity_limit}
                    tableLimits={tableLimits}
                    total={tableTotals.activity}
                    loadedCount={recentActivity.length}
                    columns={['Action', 'User', 'When']}
                    emptyMessage="No activity logged yet"
                >
                    {recentActivity.map((entry) => (
                        <TableRow key={entry.id}>
                            <TableCell>
                                <Badge variant="outline">
                                    {formatAction(entry.action)}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {entry.user_id ? (
                                    <Link
                                        href={paths.admin.user(entry.user_id)}
                                        className="hover:underline"
                                    >
                                        {entry.user_name ?? 'Unknown'}
                                    </Link>
                                ) : (
                                    <span className="text-muted-foreground">
                                        System
                                    </span>
                                )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {formatDate(entry.created_at)}
                            </TableCell>
                        </TableRow>
                    ))}
                </DashboardScrollTable>
            </div>
        </>
    );
}

Dashboard.layout = (page: ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default Dashboard;
