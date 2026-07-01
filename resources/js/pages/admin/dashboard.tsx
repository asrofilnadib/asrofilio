import { Head } from '@inertiajs/react';
import { BookOpen, FileText, Users } from 'lucide-react';
import type { ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';

type DashboardProps = {
    stats: {
        total_books: number;
        total_users: number;
        total_highlights: number;
        recent_activity_count: number;
    };
};

function Dashboard({ stats }: DashboardProps) {
    const cards = [
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
                    {cards.map(({ label, value, icon: Icon }) => (
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
            </div>
        </>
    );
}

Dashboard.layout = (page: ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default Dashboard;
