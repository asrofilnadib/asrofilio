import { Head, Link } from '@inertiajs/react';
import {
    BookMarked,
    BookOpen,
    FileText,
    Highlighter,
    StickyNote,
    Users,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { AdminActivityChart } from '@/components/charts/admin-activity-chart';
import { AdminColumnChart } from '@/components/charts/admin-column-chart';
import { ContentOverviewChart } from '@/components/charts/content-overview-chart';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="font-serif">
                                Recent users
                            </CardTitle>
                            <Link
                                href={paths.admin.users}
                                className="text-sm text-primary hover:underline"
                            >
                                View all
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Library</TableHead>
                                        <TableHead>Joined</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No users yet
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        recentUsers.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <Link
                                                        href={paths.admin.user(
                                                            user.id,
                                                        )}
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
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="font-serif">
                                Recent books
                            </CardTitle>
                            <Link
                                href={paths.admin.books}
                                className="text-sm text-primary hover:underline"
                            >
                                View all
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>In libraries</TableHead>
                                        <TableHead>Added</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentBooks.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No books yet
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        recentBooks.map((book) => (
                                            <TableRow key={book.id}>
                                                <TableCell>
                                                    <Link
                                                        href={paths.admin.book(
                                                            book.uuid,
                                                        )}
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
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="font-serif">
                            Recent platform activity
                        </CardTitle>
                        <Link
                            href={paths.admin.logs}
                            className="text-sm text-primary hover:underline"
                        >
                            View logs
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Action</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>When</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentActivity.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            No activity logged yet
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentActivity.map((entry) => (
                                        <TableRow key={entry.id}>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {formatAction(entry.action)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {entry.user_id ? (
                                                    <Link
                                                        href={paths.admin.user(
                                                            entry.user_id,
                                                        )}
                                                        className="hover:underline"
                                                    >
                                                        {entry.user_name ??
                                                            'Unknown'}
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
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = (page: ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default Dashboard;
