import { Head } from '@inertiajs/react';
import { BookOpen, FileText, Users } from 'lucide-react';
import type { ReactNode } from 'react';

import { AdminActivityChart } from '@/components/charts/admin-activity-chart';
import { AdminColumnChart } from '@/components/charts/admin-column-chart';
import { ContentOverviewChart } from '@/components/charts/content-overview-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';

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
};

function Dashboard({
    stats,
    booksAddedChart,
    usersRegisteredChart,
    activityChart,
    contentOverviewChart,
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
            </div>
        </>
    );
}

Dashboard.layout = (page: ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default Dashboard;
